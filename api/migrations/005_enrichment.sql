-- ============================================
-- 005: Insight enrichment infrastructure
-- ============================================
-- Adds enrichment metadata (quality signals, related insights, LLM analysis)
-- and supersession chains for temporal evolution of insights.

-- Enrichment JSONB — stores quality signals, related insights, LLM analysis
ALTER TABLE insights ADD COLUMN IF NOT EXISTS enrichment JSONB DEFAULT NULL;

-- Supersession: first-class FK for insight evolution chains
ALTER TABLE insights ADD COLUMN IF NOT EXISTS supersedes_id UUID REFERENCES insights(id) DEFAULT NULL;

-- Index for finding what an insight supersedes, and what supersedes it
CREATE INDEX IF NOT EXISTS idx_insights_supersedes ON insights(supersedes_id) WHERE supersedes_id IS NOT NULL;

-- Index for efficient backfill queries (find unenriched insights)
CREATE INDEX IF NOT EXISTS idx_insights_enrichment_null ON insights(org_id, created_at DESC) WHERE enrichment IS NULL;
