import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import pool from '../db';

/**
 * The migration runner.
 *
 * What it replaced ran exactly one hardcoded file, 002, and reported success --
 * so `npm run migrate` applied one migration out of ten and said nothing about
 * the other nine.
 *
 * Every file in this directory is applied once, in filename order, each inside
 * its own transaction, and recorded in schema_migrations. A file that fails
 * rolls back alone and stops the run: the migrations after it are not attempted,
 * because the one that failed is very likely what they depend on.
 *
 * --baseline records every pending file as applied WITHOUT running it. That is
 * for exactly one situation, the one this repository was in: a database whose
 * schema was built by hand and has no schema_migrations to prove it. These
 * migrations are not replayable -- CREATE TRIGGER in 004, 006 and 007 has no
 * IF NOT EXISTS, and 005 and 009 seed subscription_plans without ON CONFLICT --
 * so running them against a database that already has the schema fails partway
 * through. Baseline it once, then every later migration flows normally.
 */

const MIGRATIONS_DIR = __dirname;

const TRACKING_TABLE = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    filename TEXT PRIMARY KEY,
    applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
  )
`;

function migrationFiles(): string[] {
  // Lexicographic, which is why the files are zero-padded: 000 before 001
  // before 010. Nothing else defines the order.
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();
}

async function migrate(baseline: boolean) {
  const client = await pool.connect();

  try {
    await client.query(TRACKING_TABLE);

    const applied = new Set<string>(
      (await client.query<{ filename: string }>('SELECT filename FROM schema_migrations'))
        .rows.map((r) => r.filename),
    );

    const pending = migrationFiles().filter((f) => !applied.has(f));

    if (pending.length === 0) {
      console.log(`Nothing to do: all ${applied.size} migrations are applied.`);
      return;
    }

    if (baseline) {
      for (const filename of pending) {
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        console.log(`baseline  ${filename}`);
      }
      console.log(`\nMarked ${pending.length} migrations as applied without running them.`);
      return;
    }

    for (const filename of pending) {
      const sql = readFileSync(join(MIGRATIONS_DIR, filename), 'utf-8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [filename]);
        await client.query('COMMIT');
        console.log(`applied   ${filename}`);
      } catch (error) {
        await client.query('ROLLBACK');
        const { message } = error as { message?: string };
        console.error(`\nFAILED    ${filename}\n          ${message ?? String(error)}`);
        console.error(`\n${filename} was rolled back. The migrations after it were not attempted.`);
        process.exitCode = 1;
        return;
      }
    }

    console.log(`\nApplied ${pending.length} migrations.`);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate(process.argv.includes('--baseline')).catch((error) => {
  console.error('Migration run failed:', error);
  process.exit(1);
});
