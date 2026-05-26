-- Add an archived_at timestamp to insights. NULL = not archived (default).
-- Used by the post-prompt-rewrite cleanup pass: insights whose original body
-- was pure AI narration (no salvageable human contribution per the new
-- INSIGHT_SYSTEM_PROMPT criteria) get archived_at = now() so they're
-- filtered out of the primary feed but kept for audit.
--
-- Reversible: drop the column to undo.

ALTER TABLE insights ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ NULL;

-- Partial index — keeps the common "active insights" query fast without
-- bloating the existing created_at index.
CREATE INDEX IF NOT EXISTS insights_active_created_at_idx
    ON insights (org_id, created_at DESC)
    WHERE archived_at IS NULL;

COMMENT ON COLUMN insights.archived_at IS
    'Set when the insight is marked as low-signal (e.g. archived by the post-prompt-rewrite cleanup). NULL = active.';
