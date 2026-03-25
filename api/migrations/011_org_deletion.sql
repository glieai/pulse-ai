-- Soft deletion for orgs (GDPR right to be forgotten)
-- 7-day grace period before hard delete so owner can cancel
ALTER TABLE orgs
    ADD COLUMN deletion_requested_at TIMESTAMPTZ,
    ADD COLUMN deletion_scheduled_at TIMESTAMPTZ,
    ADD COLUMN deletion_requested_by UUID REFERENCES users(id);

-- Background job needs to find orgs scheduled for deletion
CREATE INDEX idx_orgs_deletion_scheduled ON orgs (deletion_scheduled_at)
    WHERE deletion_scheduled_at IS NOT NULL;
