-- ============================================
-- 004: Add 'api' to trigger_type enum
-- ============================================
-- The generate service (POST /insights/generate) uses trigger_type = 'api'
-- for server-side LLM-generated insights. The original CHECK constraint
-- only allowed: commit, size, manual, push.

ALTER TABLE insights DROP CONSTRAINT IF EXISTS insights_trigger_type_check;
ALTER TABLE insights ADD CONSTRAINT insights_trigger_type_check
    CHECK (trigger_type IN ('commit', 'size', 'manual', 'push', 'api'));
