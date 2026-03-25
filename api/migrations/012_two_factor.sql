-- Two-factor authentication (TOTP)
-- Two-phase: setup (pending) then enabled after first successful verify
ALTER TABLE users
    ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN two_factor_secret TEXT,               -- base32 TOTP secret (encrypted in production)
    ADD COLUMN two_factor_backup_codes JSONB;        -- array of hashed backup codes

-- Temporary session created during login when 2FA is required
-- Token is single-use with short TTL; row deleted after use or expiry
CREATE TABLE two_factor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Simple index on token — WHERE expires_at > now() is disallowed (now() is not IMMUTABLE)
-- Expiry is enforced in the WHERE clause of the SELECT query
CREATE INDEX idx_2fa_sessions_token ON two_factor_sessions (token);

-- Cleanup old pending setup secrets (not yet confirmed) — app-level expiry
CREATE INDEX idx_users_2fa_pending ON users (id)
    WHERE two_factor_secret IS NOT NULL AND two_factor_enabled = FALSE;
