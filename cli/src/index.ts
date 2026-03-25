import { error } from "./output";

type CommandFn = (args: string[]) => Promise<void>;

const commands: Record<
	string,
	() => Promise<{ default: CommandFn } | { [key: string]: CommandFn }>
> = {
	init: () => import("./commands/init"),
	ask: () => import("./commands/ask"),
	search: () => import("./commands/search"),
	context: () => import("./commands/context"),
	insight: () => import("./commands/insight"),
	generate: () => import("./commands/insight"), // backward compat (git hooks)
	reflect: () => import("./commands/reflect"),
	push: () => import("./commands/push"),
	watch: () => import("./commands/watch"),
	config: () => import("./commands/config"),
	"setup-mcp": () => import("./commands/setup-mcp"),
	help: () => import("./commands/help"),
};

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || command === "--help" || command === "-h") {
		const { helpCommand } = await import("./commands/help");
		return helpCommand();
	}

	if (command === "--version" || command === "-v") {
		console.log("pulse 0.1.0");
		return;
	}

	const loader = commands[command];
	if (!loader) {
		error(`Unknown command: ${command}`);
		console.log('Run "pulse help" for usage.');
		process.exit(1);
	}

	const mod = await loader();
	const fn =
		"default" in mod
			? (mod.default as CommandFn)
			: (mod[`${command}Command`] as CommandFn | undefined);

	if (!fn) {
		error(`Command module for "${command}" has no handler.`);
		process.exit(1);
	}

	await fn(args.slice(1));
}

main().catch((err: Error) => {
	error(err.message);
	process.exit(1);
});
