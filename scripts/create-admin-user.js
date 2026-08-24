#!/usr/bin/env node

/**
 * Script to create admin user: victor@victor.ro / victor
 * 
 * Usage:
 *   npm run create-admin-user
 *   or
 *   node scripts/create-admin-user.js
 * 
 * Requirements:
 *   - PostgreSQL database running
 *   - Set DATABASE_URL in .env.local or environment variables
 *   - Format: postgresql://user:password@host:port/database
 */

import pg from 'pg';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, existsSync } from 'fs';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const envPath = join(__dirname, '..', '.env.local');
if (existsSync(envPath)) {
  try {
    const envFile = readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
  } catch (e) {
    // Ignore errors
  }
}

const DATABASE_URL = process.env.DATABASE_URL || 
  process.env.POSTGRES_URL ||
  'postgresql://postgres:postgres@localhost:5432/numerology_compass';

if (!DATABASE_URL) {
  console.error('❌ Error: DATABASE_URL not set');
  console.log('\nPlease set it in .env.local:');
  console.log('DATABASE_URL=postgresql://user:password@host:port/database');
  process.exit(1);
}

// Credentials come from the environment. A hardcoded password here ends up in
// git history permanently, which is exactly what happened to the previous
// default and is why it had to be rotated. Run as:
//   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npm run create-admin-user
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_NAME = process.env.ADMIN_NAME || 'Admin';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
  console.error("   Example: ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' npm run create-admin-user");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 12) {
  console.error('❌ ADMIN_PASSWORD must be at least 12 characters.');
  process.exit(1);
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function createAdminUser() {
  console.log('🚀 Creating admin user...\n');
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Name: ${ADMIN_NAME}\n`);

  const client = await pool.connect();

  try {
    // Step 1: Check if users table exists, if not create it
    console.log('📝 Step 1: Checking/creating users table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        name TEXT,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✅ Users table ready\n');

    // Step 2: Check if user already exists
    console.log('📝 Step 2: Checking if user exists...');
    const existingUser = await client.query(
      'SELECT id, email, role FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existingUser.rows.length > 0) {
      console.log(`ℹ️  User already exists: ${existingUser.rows[0].email}`);
      
      // Update existing user to admin
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await client.query(
        `UPDATE users 
         SET password_hash = $1, name = $2, role = 'admin', updated_at = NOW()
         WHERE email = $3`,
        [passwordHash, ADMIN_NAME, ADMIN_EMAIL]
      );
      console.log('✅ User updated to admin role\n');
    } else {
      // Step 3: Create new admin user
      console.log('📝 Step 3: Creating new admin user...');
      const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      
      const result = await client.query(
        `INSERT INTO users (email, password_hash, name, role)
         VALUES ($1, $2, $3, 'admin')
         RETURNING id, email, name, role, created_at`,
        [ADMIN_EMAIL, passwordHash, ADMIN_NAME]
      );

      console.log(`✅ Admin user created: ${result.rows[0].email}\n`);
    }

    // Step 4: Verify
    console.log('📝 Step 4: Verifying admin user...');
    const verifyResult = await client.query(
      'SELECT id, email, name, role, created_at FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (verifyResult.rows.length === 0) {
      throw new Error('User not found after creation');
    }

    const user = verifyResult.rows[0];

    console.log('\n✅ Admin user created successfully!\n');
    console.log('User Details:');
    console.log(`  ID: ${user.id}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Role: ${user.role} ${user.role === 'admin' ? '✅' : '❌'}`);
    console.log(`  Created: ${user.created_at}\n`);

    console.log('🎉 You can now login with:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}\n`);

  } catch (error) {
    console.error('\n❌ Error creating admin user:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('⚠️  Cannot connect to PostgreSQL database.');
      console.error('\nPlease ensure:');
      console.error('1. PostgreSQL is running');
      console.error('2. DATABASE_URL is set correctly in .env.local');
      console.error('   Format: postgresql://user:password@host:port/database');
      console.error('\nExample:');
      console.error('   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/numerology_compass');
      console.error('\nTo start PostgreSQL (macOS with Homebrew):');
      console.error('   brew services start postgresql@14');
      console.error('\nTo create database:');
      console.error('   createdb numerology_compass');
    } else {
      console.error(error.message);
      if (error.detail) {
        console.error('Details:', error.detail);
      }
      if (error.hint) {
        console.error('Hint:', error.hint);
      }
    }
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

createAdminUser();

