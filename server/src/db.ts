import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool, types } = pg;

// A DATE column is a calendar date, not an instant.
//
// node-postgres parses OID 1082 into a JS Date at midnight in the *server's*
// timezone, which then serialises to JSON as a UTC instant -- so a birth date of
// 1990-05-15 left this process as "1990-05-14T21:00:00.000Z" and any client that
// read .getDate() off it in a UTC-or-earlier zone got the 14th, and a different
// profile from the same input. Handing the string through untouched keeps the
// column's own meaning all the way to the client.
types.setTypeParser(types.builtins.DATE, (value) => value);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://victorsafta@localhost:5433/numerology_compass',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

export default pool;

