-- Add 'business' to the insights kind check constraint.
-- Idempotent: drop old constraint, create new one with full kind list.
ALTER TABLE insights DROP CONSTRAINT IF EXISTS insights_kind_check;
ALTER TABLE insights ADD CONSTRAINT insights_kind_check
  CHECK (kind = ANY (ARRAY['decision', 'dead_end', 'pattern', 'context', 'progress', 'business']));
