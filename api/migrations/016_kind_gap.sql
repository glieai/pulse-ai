-- Add 'gap' to the insights kind check constraint.
-- The 'gap' kind is for insights that capture a moment of asymmetric-information
-- transfer between a human and an AI during a vibecoding session — the substance
-- of what the human had to intervene with, abstracted away from tone.
-- See shared/src/llm/prompt.ts → GAP_INSIGHT_SYSTEM_PROMPT.
ALTER TABLE insights DROP CONSTRAINT IF EXISTS insights_kind_check;
ALTER TABLE insights ADD CONSTRAINT insights_kind_check
  CHECK (kind = ANY (ARRAY['decision', 'dead_end', 'pattern', 'context', 'progress', 'business', 'gap']));
