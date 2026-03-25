# Contributing to Pulse

Thanks for your interest in contributing to Pulse! This document covers the process for contributing to this project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/pulse-ai`
3. Install dependencies: `bun install`
4. Start the database: `docker compose up db -d`
5. Run migrations: `cd api && bun run migrate`
6. Start development: `bun run --filter './api' dev` and `bun run --filter './web' dev`

## Development Stack

- **Runtime:** Bun
- **API:** Hono (TypeScript)
- **Database:** PostgreSQL 17 + pgvector
- **Frontend:** SvelteKit + Tailwind
- **Linting:** Biome
- **Tests:** Bun test runner

## Code Style

We use [Biome](https://biomejs.dev/) for linting and formatting:

```bash
bun run lint    # Check for issues
bun run format  # Auto-format
```

### Conventions

- Files: `kebab-case` (e.g., `insight-routes.ts`)
- Types/Interfaces: `PascalCase` (e.g., `InsightCreate`)
- Variables/functions: `camelCase`
- DB columns: `snake_case`
- Tests: `*.test.ts` next to the file they test

## Making Changes

### Branch Naming

- `feat/description` — new feature
- `fix/description` — bug fix
- `docs/description` — documentation

### Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` new feature
- `fix:` bug fix
- `refactor:` refactoring without behavior change
- `test:` tests
- `docs:` documentation
- `chore:` tooling, config

### Pull Requests

1. Open an issue first to discuss significant changes
2. Create a branch from `main`
3. Make your changes
4. Run `bun run lint` and `bun run format`
5. Run tests: `bun test`
6. Open a PR with a clear description

### What Makes a Good PR

- Focused on a single concern
- Tests included for new behavior
- No unrelated changes
- Clear description of what and why

## Reporting Bugs

Use the [Bug Report](https://github.com/glieai/pulse-ai/issues/new?template=bug_report.yml) template.

## Requesting Features

Use the [Feature Request](https://github.com/glieai/pulse-ai/issues/new?template=feature_request.yml) template.

## Security

See [SECURITY.md](SECURITY.md) for reporting security vulnerabilities.

## License

By contributing, you agree that your contributions will be licensed under the Apache 2.0 License.
