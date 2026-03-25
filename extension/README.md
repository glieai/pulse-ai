# Pulse AI

Operational memory for dev teams. Capture decisions, dead-ends and patterns from AI coding sessions — automatically.

> **This extension requires a Pulse server.** Pulse is currently in private beta. To get access, visit [pulse.glie.ai](https://pulse.glie.ai) and request an invite.

## What is Pulse?

Pulse is a knowledge base that fills itself from your AI coding sessions — decisions you made, approaches that failed, patterns worth reusing. Instead of losing context when a conversation ends, Pulse captures it for the whole team.

**This VS Code extension connects to your team's Pulse server.** It does not work standalone.

## Features

- **Watcher** — Auto-generates insight drafts as you code, monitoring session growth and summarising key decisions
- **Search** — Query your team's knowledge base directly from VS Code (`Ctrl+Shift+K`)
- **Create Insights** — Document decisions, dead-ends, patterns and context via the command palette
- **Drafts** — Review, edit and publish insight drafts before they go live
- **Recent** — Browse the latest insights from your team

## Getting Started

1. **Get access** — Visit [pulse.glie.ai](https://pulse.glie.ai) to request an invite
2. **Install the extension** from the VS Code Marketplace
3. **Configure** — Open Settings (`Ctrl+,`) → search "Pulse"
   - Set **Pulse: Api Url** to your team's Pulse server URL
   - Set **Pulse: Token** — generate one from your Pulse dashboard under Settings → API Tokens
4. **Start coding** — the Watcher captures insights automatically

## Commands

| Command | Shortcut | Description |
|---|---|---|
| `Pulse: Search Knowledge Base` | `Ctrl+Shift+K` | Search insights |
| `Pulse: Create Insight` | — | Create a new insight |
| `Pulse: Publish & Push` | — | Publish drafts to server |
| `Pulse: Start/Stop Watcher` | — | Toggle auto-capture |
| `Pulse: Configure` | — | Open extension settings |

## Configuration

| Setting | Default | Description |
|---|---|---|
| `pulse.apiUrl` | — | Pulse API URL |
| `pulse.token` | — | API token (required) |
| `pulse.repo` | auto-detected | Repository identifier |
| `pulse.llmProvider` | `auto` | LLM provider: `auto`, `anthropic`, or `openai` |
| `pulse.watcherSizeThresholdKb` | `256` | Session growth (KB) before auto-generating draft |
| `pulse.watcherPollInterval` | `5000` | Watcher poll interval (ms) |

## Links

- [Pulse Website](https://pulse.glie.ai)
- [Report Issues](https://github.com/glieai/pulse/issues)

---

Made by [Glie](https://glie.ai)
