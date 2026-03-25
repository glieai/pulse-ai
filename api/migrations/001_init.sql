-- ============================================
-- Extensions
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- ORGS — o tenant
-- ============================================
CREATE TABLE orgs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free'
        CHECK (plan IN ('free', 'pro', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USERS — pertencem a uma org
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_users_org ON users(org_id);

-- ============================================
-- INSIGHTS — o produto inteiro
-- ============================================
CREATE TABLE insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES orgs(id),

    -- Tipo de conhecimento
    kind TEXT NOT NULL CHECK (kind IN (
        'decision', 'dead_end', 'pattern', 'context', 'progress'
    )),

    -- Conteúdo
    title TEXT NOT NULL,
    body TEXT NOT NULL,

    -- Campos estruturados por kind (JSONB flexível)
    structured JSONB DEFAULT '{}',

    -- Embedding para vector search
    embedding VECTOR(1536),

    -- Full-text search (gerado automaticamente)
    search_vector tsvector GENERATED ALWAYS AS (
        setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(body, '')), 'B')
    ) STORED,

    -- Onde (repo = git remote, não entidade)
    repo TEXT NOT NULL,
    branch TEXT,
    source_files TEXT[],

    -- Trace (referências, não entidades)
    commit_hashes TEXT[],
    session_refs JSONB DEFAULT '[]',

    -- Quem e como
    author_id UUID NOT NULL REFERENCES users(id),
    author_name TEXT,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN (
        'commit', 'size', 'manual', 'push'
    )),

    -- Idempotência
    content_hash TEXT NOT NULL,

    -- Quando
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Constraint de unicidade para dedup
    CONSTRAINT uq_insight_content UNIQUE (org_id, content_hash)
);

-- ============================================
-- Índices
-- ============================================

-- Vector search (HNSW — pgvector)
CREATE INDEX idx_insights_embedding ON insights
    USING hnsw (embedding vector_cosine_ops);

-- Full-text search
CREATE INDEX idx_insights_fts ON insights USING gin(search_vector);

-- Filtros rápidos (todos org-scoped)
CREATE INDEX idx_insights_org ON insights(org_id);
CREATE INDEX idx_insights_org_repo ON insights(org_id, repo);
CREATE INDEX idx_insights_org_kind ON insights(org_id, kind);
CREATE INDEX idx_insights_org_created ON insights(org_id, created_at DESC);
CREATE INDEX idx_insights_org_branch ON insights(org_id, repo, branch);
CREATE INDEX idx_insights_files ON insights USING gin(source_files);
