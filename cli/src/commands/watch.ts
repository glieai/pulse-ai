import { loadConfig } from "../config";
import { banner } from "../output";
import { startWatcher } from "../watcher/watcher";
import { ensureLocalMcp } from "./setup-mcp";

export async function watchCommand(_args: string[]): Promise<void> {
	const config = loadConfig();
	const cwd = process.cwd();

	// Ensure local .mcp.json exists in this project folder
	if (config.token) {
		ensureLocalMcp(cwd, config.apiUrl, config.token);
	}

	banner(`Watch (threshold: ${config.watcher.sizeThresholdKb} KB)`);
	await startWatcher({ config, cwd });
}
