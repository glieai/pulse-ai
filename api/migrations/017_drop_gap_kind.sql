-- Revert migration 016: drop 'gap' from the insights.kind CHECK constraint.
-- Decision: gap is not a separate insight kind. The existing 6 kinds stay;
-- the gap-extraction approach is an internal property of how INSIGHT_SYSTEM_PROMPT
-- shapes generation, not a user-facing taxonomy.
ALTER TABLE insights DROP CONSTRAINT IF EXISTS insights_kind_check;
ALTER TABLE insights ADD CONSTRAINT insights_kind_check
  CHECK (kind = ANY (ARRAY['decision', 'dead_end', 'pattern', 'context', 'progress', 'business']));
