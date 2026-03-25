-- Google OAuth: link Google accounts to existing users
ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE;
