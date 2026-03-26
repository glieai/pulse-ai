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

### 1. Start the server

```bash
curl -fsSL https://raw.githubusercontent.com/glieai/pulse-ai/main/docker-compose.yml -o docker-compose.yml
docker compose up -d
```

Pulse is running at `http://localhost:5173` — no login required in solo mode.

Optionally copy `.env.example` to `.env` to customize settings (default values work out of the box).

### 2. Connect your tools

```bash
npx @glie/pulse-cli init       # one-time setup: config + MCP registration
npx @glie/pulse-cli setup-mcp  # run in each project folder to enable MCP there
```

The `init` creates your config (`~/.pulse/config.json`) and registers the MCP server globally. Then run `setup-mcp` in each project folder where you want MCP available — or just run `pulse watch` which does both.

**Optional:** Install the [Pulse AI](https://marketplace.visualstudio.com/items?itemName=glie.pulse-ai) VS Code extension for a sidebar with drafts, search, watcher controls, and CodeLens annotations. The extension reads the config created by the CLI — no extra setup needed.

### 3. Code as usual

Open Claude Code or Codex in any configured project. Your AI agents query the knowledge base automatically via MCP. Run `pulse watch` to auto-generate insights from commits and AI sessions.

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
docker compose -f docker-compose.dev.yml up -d

# Setup
cp .env.example .env

# Run migrations
bun run db:migrate

# Start API (terminal 1)
cd api && bun run dev

# Start Web (terminal 2)
cd web && bun run dev
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
