-- Migration: create the users table.
--
-- Captured from the live database on 2026-08-30 (PostgreSQL 14.18), not
-- designed here. Every column, default, constraint and index below is what
-- production already has: `users(id)` is the foreign-key target of 002 and of
-- 004 through 009 -- twenty-two constraints across twenty-one tables -- yet no
-- migration ever created it. The table existed only on the one machine that had
-- been ALTERed by hand.
--
-- Two things are deliberately absent, because production does not have them:
--
--   * `current_subscription_id`. 005 adds it along with its foreign key to
--     subscriptions(id), and it could not live here anyway: the two tables
--     reference each other, so whichever is created first cannot carry the link.
--
--   * a trigger on `updated_at`. The column defaults to now() and is never
--     touched again. 004, 006 and 007 attach update_updated_at_column() to their
--     own tables; users was never given one. Adding it now would be a change to
--     behaviour, not a recovery of it.
--
-- gen_random_uuid() has been in core PostgreSQL since 13, which is why the live
-- database has no pgcrypto extension installed. On 12 or older this migration
-- needs one.

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
