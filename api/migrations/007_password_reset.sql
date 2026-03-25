-- Password reset tokens for self-service account recovery
ALTER TABLE users
    ADD COLUMN password_reset_token TEXT,
    ADD COLUMN password_reset_expires TIMESTAMPTZ;

-- Partial index: only index rows that actually have a reset token
CREATE INDEX idx_users_reset_token ON users (password_reset_token)
    WHERE password_reset_token IS NOT NULL;
