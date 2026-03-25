-- Audit trail: who did what, when
-- Used for: logins, insight publish/delete, settings changes, invites
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,       -- 'user.login', 'insight.published', 'insight.deleted', etc.
    resource_type TEXT,         -- 'insight', 'org', 'user', 'invitation'
    resource_id UUID,
    metadata JSONB DEFAULT '{}',
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Most common query: recent activity for an org
CREATE INDEX idx_audit_log_org ON audit_log (org_id, created_at DESC);
-- Activity by user
CREATE INDEX idx_audit_log_user ON audit_log (user_id, created_at DESC)
    WHERE user_id IS NOT NULL;
