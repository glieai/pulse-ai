import { c } from "../output";

export async function helpCommand(): Promise<void> {
	console.log(`
${c.bold(c.magenta("pulse"))} — operational memory for vibe coding teams

${c.bold("Usage:")} pulse <command> [options]

${c.bold("Commands:")}
  ${c.cyan("init")}                 Setup Pulse (API URL, login, git hooks)
  ${c.cyan("ask")} ${c.dim("<question>")}        Ask the knowledge base a question
  ${c.cyan("search")} ${c.dim("<query>")}       Search the knowledge base
  ${c.cyan("context")} ${c.dim("<file>")}       Get insights about a file
  ${c.cyan("insight")} ${c.dim("[--trigger]")}  Create insight draft from current session
  ${c.cyan("reflect")} ${c.dim("[session]")}   Reflect on a session — generate insights (256KB context)
  ${c.cyan("push")}                 Publish drafts + git push
  ${c.cyan("watch")}                Watch coding session for auto-insights
  ${c.cyan("config")} ${c.dim("[llm]")}         View or modify configuration
  ${c.cyan("help")}                 Show this help message

${c.bold("Auto-detected:")}
  Claude Code          OAuth from ~/.claude/.credentials.json
  Codex                OAuth from ~/.codex/auth.json

${c.bold("Environment:")}
  ANTHROPIC_API_KEY    API key for Claude (overrides OAuth)
  OPENAI_API_KEY       API key for OpenAI (overrides OAuth)
  PULSE_API_URL        Override API URL from config
  PULSE_TOKEN          Override API token from config

${c.bold("Config:")} ~/.pulse/config.json
`);
}
