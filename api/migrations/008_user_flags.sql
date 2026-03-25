-- is_active: soft-delete for users (deactivated can't log in, data preserved)
-- is_super_admin: system-wide admin that can access any org (for ops)
-- notification_enabled: per-user opt-out of emails
ALTER TABLE users
    ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN notification_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- Fast lookup for active users per org
CREATE INDEX idx_users_org_active ON users (org_id) WHERE is_active = TRUE;
