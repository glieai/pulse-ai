-- Invite-first model: admins invite members by email, no open registration in team mode
CREATE TABLE invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    token TEXT UNIQUE NOT NULL,
    invited_by UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMPTZ NOT NULL,
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Fast token lookup (only pending invitations)
CREATE INDEX idx_invitations_token ON invitations (token)
    WHERE accepted_at IS NULL;

-- List pending invitations for an org
CREATE INDEX idx_invitations_org_pending ON invitations (org_id)
    WHERE accepted_at IS NULL;
