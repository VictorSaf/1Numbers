-- Migration: shared trigger functions
--
-- update_updated_at_column() is referenced by the triggers created in 004, 006
-- and 007, but was never defined by any migration -- it only ever existed as a
-- manual statement on the original database. Recreating the schema from scratch
-- therefore failed. Defining it here makes the migration set self-contained.
-- Numbered 000 so it is applied before any migration that depends on it.

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
