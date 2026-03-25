import { statSync } from "node:fs";
import { insightCommand } from "../commands/insight";
import type { PulseConfig } from "../config";
import { c, info, success, warn } from "../output";
import { checkSessionSwitch, initMonitor } from "./monitor";

interface WatcherOptions {
	config: PulseConfig;
	cwd: string;
}

function formatKb(bytes: number): string {
	return `${Math.round(bytes / 1024)} KB`;
}

/**
 * Main watcher loop. Monitors session file growth and triggers
 * insight generation when size threshold is reached.
 *
 * Hot path: single statSync() per poll cycle — zero file I/O.
 */
export async function startWatcher(options: WatcherOptions): Promise<void> {
	const { config, cwd } = options;
	const { sizeThresholdKb, pollInterval } = config.watcher;
	const thresholdBytes = sizeThresholdKb * 1024;

	let state = initMonitor(cwd);
	if (!state) {
		warn("No active Claude Code session found.");
		info("Start a coding session and try again.");
		return;
	}

	info(`Session: ${c.bold(state.sessionId)}`);
	info(`Threshold: ${c.bold(`${sizeThresholdKb} KB`)} file growth`);
	info(`Poll: ${c.bold(String(pollInterval / 1000))}s`);
	console.log("");
	info(c.dim("Watching for activity... (Ctrl+C to stop)"));

	let running = true;
	let lastPollSize = state.bytesAtLastTrigger;

	const shutdown = () => {
		if (running) {
			running = false;
			console.log("");
			info("Stopping watcher...");
		}
	};

	process.on("SIGINT", shutdown);
	process.on("SIGTERM", shutdown);

	while (running) {
		try {
			// Check for session switch
			const newState = checkSessionSwitch(cwd, state);
			if (newState) {
				state = newState;
				lastPollSize = state.bytesAtLastTrigger;
				info(`New session detected: ${c.bold(state.sessionId)}`);
			}

			// Single statSync — the only I/O per poll cycle
			const currentSize = statSync(state.filePath).size;
			const pollDelta = currentSize - lastPollSize;
			const totalGrowth = currentSize - state.bytesAtLastTrigger;

			if (pollDelta > 0) {
				lastPollSize = currentSize;
				info(`+${formatKb(pollDelta)} (${formatKb(totalGrowth)} / ${sizeThresholdKb} KB)`);
			}

			// Trigger if threshold reached
			if (totalGrowth >= thresholdBytes) {
				console.log("");
				success(`Threshold reached (${formatKb(totalGrowth)} growth)`);
				info("Generating insight...");

				await triggerGeneration();

				// Reset baseline to post-generation size
				state.bytesAtLastTrigger = statSync(state.filePath).size;
				lastPollSize = state.bytesAtLastTrigger;

				console.log("");
				info(c.dim("Resuming watch..."));
			}
		} catch (err) {
			warn(`Poll error: ${err instanceof Error ? err.message : "unknown"}`);
		}

		await sleep(pollInterval);
	}

	process.removeListener("SIGINT", shutdown);
	process.removeListener("SIGTERM", shutdown);
}

/**
 * Trigger insight generation with retry and backoff.
 * 3 attempts: 1s, 5s, 15s delays between retries.
 */
async function triggerGeneration(): Promise<void> {
	const maxRetries = 3;
	const backoffMs = [1000, 5000, 15000];

	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			await insightCommand(["--trigger=size", "--non-interactive"]);
			return;
		} catch (err) {
			const isLast = attempt === maxRetries - 1;
			if (isLast) {
				warn(
					`Insight not saved — failed after ${maxRetries} attempts. Try \`pulse insight\` later.`,
				);
			} else {
				const delay = backoffMs[attempt];
				warn(
					`Attempt ${attempt + 1} failed: ${err instanceof Error ? err.message : "unknown"}. Retrying in ${delay / 1000}s...`,
				);
				await sleep(delay);
			}
		}
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
