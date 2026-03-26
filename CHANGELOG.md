# Changelog

All notable changes to Pulse will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-03-26

### Fixed
- **CLI** — `setup-mcp` reads from `~/.pulse/config.json` when no args given
- **CLI** — Bundle changed from ESM to CJS (fixes "Dynamic require of stream" error)
- **CLI** — Git is now optional — `watch` and `setup-mcp` work in non-git folders
- **CLI** — Silent git stderr (no more "fatal: not a git repository" messages)
- **MCP** — npx scoped package resolution (bin wrapper + `--package` flag)
- **MCP** — Correct license (Apache-2.0) and homepage in npm metadata
- **Extension** — Reads config from `~/.pulse/config.json` (no more VS Code settings for API URL/token)
- **Extension** — Shows "Run `pulse init`" message with Open Terminal button when not configured
- **Extension** — New "Pulse: Setup MCP in this folder" command
- **Extension** — Watcher start (▶) auto-creates local `.mcp.json`

### Changed
- **Setup flow** — CLI-first: `pulse init` → `pulse setup-mcp` per folder → done
- **Extension** — Removed `pulse.apiUrl`, `pulse.token`, `pulse.repo` settings (single source: CLI config)

## [0.1.0] - 2026-03-25

### Added
- **API** — Hono + Bun REST API with PostgreSQL + pgvector
  - Insights CRUD with hybrid search (FTS + vector, RRF fusion)
  - Auto-enrichment pipeline (quality signals, embedding generation)
  - Solo mode (zero-config, no auth) and team mode (token auth)
- **Web Dashboard** — SvelteKit + Tailwind
  - Insight browser with filters (kind, repo, status)
  - Full-text + semantic search
  - Landing page with feature showcase
- **CLI** — `@glie/pulse-cli`
  - `pulse init` — interactive setup (config + MCP registration)
  - `pulse watch` — auto-generate insights from commits and AI sessions
  - `pulse search` / `pulse reflect` — search the knowledge base
  - `pulse setup-mcp` — configure MCP for Claude Code + Codex
- **VS Code Extension** — `glie.pulse-ai`
  - Watcher with status bar controls
  - Drafts sidebar (local-first, never sent to server until published)
  - Search panel and CodeLens annotations
  - "Setup MCP in this folder" command
- **MCP Server** — `@glie/pulse-mcp`
  - 7 tools: search, context, file_context, create, generate, publish, summary
  - Works with Claude Code and Codex via stdio transport
- **Docker** — Pre-built images on GHCR
  - `ghcr.io/glieai/pulse-api`
  - `ghcr.io/glieai/pulse-web`
  - `docker compose up -d` — zero-clone self-hosting
- **CI/CD** — GitHub Actions
  - Lint, typecheck, test on every PR
  - Auto-build and push Docker images on release
