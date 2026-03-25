<div align="center">

# Pulse

**Operational memory for AI coding.**

Your codebase tells the *what*. Pulse remembers the *why*.

[![CI](https://github.com/glieai/pulse-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/glieai/pulse-ai/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![VS Code](https://img.shields.io/visual-studio-marketplace/v/glie.pulse-ai?label=VS%20Code)](https://marketplace.visualstudio.com/items?itemName=glie.pulse-ai)
[![npm](https://img.shields.io/npm/v/@glie/pulse-mcp?label=MCP)](https://www.npmjs.com/package/@glie/pulse-mcp)

[Install Extension](https://marketplace.visualstudio.com/items?itemName=glie.pulse-ai) · [Self-Host](#quick-start) · [Documentation](#how-it-works)

</div>

---

Pulse is a self-hosted knowledge base that fills itself. It watches your AI coding sessions, captures decisions, dead-ends, and patterns — then makes them searchable for you and your AI agents.

**Why?** Every day, developers make dozens of important decisions during AI coding sessions. Why you chose this approach over that one. What you tried that didn't work. The business constraint that drove a technical choice. All of this disappears when the chat window closes. Pulse captures it automatically.

## Features

- **Auto-capture** — Watcher monitors commits and AI sessions, generates structured insights via LLM
- **MCP integration** — Claude Code and Codex query your knowledge base before making decisions
- **Hybrid search** — Full-text + vector search with sub-10ms response times
- **VS Code extension** — Sidebar with drafts, search, and CodeLens annotations
- **CLI** — `pulse watch`, `pulse search`, `pulse reflect` — works without VS Code
- **Privacy first** — Drafts stay local. Only published insights reach the server. Self-hosted = your data.

## Quick Start

### Docker (recommended)

```bash
git clone https://github.com/glieai/pulse-ai && cd pulse-ai
docker compose up -d
```

That's it. Pulse is running at `http://localhost:5173`.

### VS Code Extension

Install [Pulse AI](https://marketplace.visualstudio.com/items?itemName=glie.pulse-ai) from the VS Code Marketplace:

1. Open Extensions (`Ctrl+Shift+X`) → search **Pulse AI**
2. Set API URL → `http://localhost:3000`
3. Click **▶ Pulse** in the status bar to start the watcher

### CLI

```bash
npx @glie/pulse-cli init
pulse watch
```

### MCP (Claude Code / Codex)

The VS Code extension auto-configures MCP. For terminal-only setups:

```bash
npx @glie/pulse-cli init  # configures ~/.claude/.mcp.json and ~/.codex/config.toml
```

Your AI agent now has access to `pulse_search`, `pulse_context`, `pulse_create`, and more.

## How It Works

```
You code with AI → Pulse watches → LLM generates insight → Draft saved locally
                                                              ↓
                                                    You review & publish
                                                              ↓
                                                    Searchable by you + AI agents
```

### Insight Kinds

| Kind | What it captures |
|------|-----------------|
| `decision` | Technical choices with alternatives considered |
| `dead_end` | Approaches that failed and why |
| `pattern` | Reusable knowledge and conventions |
| `context` | Background information |
| `progress` | Milestones and deliverables |
| `business` | Domain constraints that drove technical decisions |

### Architecture

```
/api        — Hono + Bun (TypeScript, sub-10ms)
/web        — SvelteKit + Tailwind
/cli        — CLI tool (Bun)
/extension  — VS Code extension
/mcp        — MCP server (Model Context Protocol)
/shared     — Shared types and utils
```

**Stack:** PostgreSQL 17 + pgvector (HNSW) · Hono · Bun · SvelteKit · Tailwind

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Random 32+ character string |
| `ANTHROPIC_API_KEY` | No | For AI-powered insight generation |
| `OPENAI_API_KEY` | No | Alternative LLM provider |

## Development

```bash
# Install dependencies
bun install

# Start database
docker compose up db -d

# Run migrations
cd api && bun run migrate

# Start API + Web
bun run --filter './api' dev &
bun run --filter './web' dev
```

## MCP Tools

When connected via MCP, your AI agent has access to:

| Tool | Description |
|------|-------------|
| `pulse_search` | Search the knowledge base |
| `pulse_context` | Get relevant context for a topic |
| `pulse_file_context` | Get insights related to a file |
| `pulse_create` | Record a new insight |
| `pulse_publish` | Publish draft insights |
| `pulse_summary` | Get knowledge base overview |
| `pulse_generate` | Generate insight from raw data |

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

```bash
# Fork the repo, create a branch
git checkout -b feature/your-feature

# Make changes, run checks
bun run lint
bun run format

# Open a PR
```

## License

Apache 2.0 — see [LICENSE](LICENSE).

Built by [Glie](https://glie.ai).
