-- Row-Level Security: defense-in-depth for multi-tenant isolation.
-- Policies restrict access by org_id. The application user (table owner)
-- bypasses RLS by default — these policies protect against non-owner roles
-- (e.g. read-only analytics, future microservices, pg_dump with restricted user).

-- insights
ALTER TABLE insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY insights_org_isolation ON insights
  USING (org_id = COALESCE(current_setting('app.current_org_id', true), '')::uuid);

-- api_tokens
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY api_tokens_org_isolation ON api_tokens
  USING (org_id = COALESCE(current_setting('app.current_org_id', true), '')::uuid);

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_org_isolation ON users
  USING (org_id = COALESCE(current_setting('app.current_org_id', true), '')::uuid);

-- invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY invitations_org_isolation ON invitations
  USING (org_id = COALESCE(current_setting('app.current_org_id', true), '')::uuid);

-- audit_log
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_org_isolation ON audit_log
  USING (org_id = COALESCE(current_setting('app.current_org_id', true), '')::uuid);
