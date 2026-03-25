import { createInterface } from "node:readline/promises";
import { c } from "./output";

let rl: ReturnType<typeof createInterface> | null = null;

function getRL(): ReturnType<typeof createInterface> {
	if (!rl) {
		rl = createInterface({ input: process.stdin, output: process.stdout });
	}
	return rl;
}

export function closePrompt(): void {
	rl?.close();
	rl = null;
}

export async function ask(question: string, defaultValue?: string): Promise<string> {
	const suffix = defaultValue ? ` ${c.dim(`(${defaultValue})`)}` : "";
	const answer = await getRL().question(`  ${c.cyan("?")} ${question}${suffix}: `);
	return answer.trim() || defaultValue || "";
}

export async function askPassword(question: string): Promise<string> {
	// Disable echo for password input
	process.stdout.write(`  ${c.cyan("?")} ${question}: `);

	return new Promise((resolve) => {
		const input = process.stdin;
		const wasRaw = input.isRaw;
		if (input.isTTY) {
			input.setRawMode(true);
		}

		let password = "";
		const onData = (key: Buffer) => {
			const ch = key.toString("utf8");
			if (ch === "\r" || ch === "\n") {
				if (input.isTTY) {
					input.setRawMode(wasRaw ?? false);
				}
				input.removeListener("data", onData);
				process.stdout.write("\n");
				resolve(password);
			} else if (ch === "\x7f" || ch === "\b") {
				// Backspace
				if (password.length > 0) {
					password = password.slice(0, -1);
					process.stdout.write("\b \b");
				}
			} else if (ch === "\x03") {
				// Ctrl+C
				process.stdout.write("\n");
				process.exit(0);
			} else {
				password += ch;
				process.stdout.write("*");
			}
		};
		input.on("data", onData);
	});
}

export async function confirm(question: string, defaultYes = true): Promise<boolean> {
	const hint = defaultYes ? "Y/n" : "y/N";
	const answer = await ask(`${question} ${c.dim(`[${hint}]`)}`);
	if (answer === "") return defaultYes;
	return answer.toLowerCase().startsWith("y");
}

export async function choose(
	question: string,
	options: { label: string; value: string }[],
): Promise<string> {
	console.log(`  ${c.cyan("?")} ${question}`);
	for (let i = 0; i < options.length; i++) {
		console.log(`    ${c.bold(String(i + 1))}. ${options[i].label}`);
	}
	const answer = await ask("Choice");
	const idx = Number.parseInt(answer, 10) - 1;
	if (idx >= 0 && idx < options.length) {
		return options[idx].value;
	}
	// Default to first
	return options[0].value;
}
