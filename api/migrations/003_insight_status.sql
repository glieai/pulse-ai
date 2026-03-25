-- 003: Add status column to insights (draft/published flow)
-- New insights default to 'draft'. Existing insights set to 'published'.

ALTER TABLE insights ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft'
  CHECK (status IN ('draft', 'published'));

-- Mark all existing insights as published (backward compat)
UPDATE insights SET status = 'published' WHERE status = 'draft';

-- Index for filtered queries by status
CREATE INDEX IF NOT EXISTS idx_insights_org_status ON insights(org_id, status, created_at DESC);
