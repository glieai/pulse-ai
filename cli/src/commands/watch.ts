import { loadConfig } from "../config";
import { banner } from "../output";
import { startWatcher } from "../watcher/watcher";

export async function watchCommand(_args: string[]): Promise<void> {
	const config = loadConfig();
	banner(`Watch (threshold: ${config.watcher.sizeThresholdKb} KB)`);
	await startWatcher({ config, cwd: process.cwd() });
}
