import { execSync } from "node:child_process";
import type { Insight } from "@pulse/shared";
import { loadConfig } from "../config";
import { apiPost } from "../http";
import { banner, c, error, info, success, warn } from "../output";
import { closePrompt } from "../prompt";

export async function pushCommand(_args: string[]): Promise<void> {
	banner("Push");
	const config = loadConfig();

	// Publish all drafts for this repo
	info("Publishing drafts...");
	try {
		const result = await apiPost<{ published: Insight[]; count: number }>(
			config.apiUrl,
			"/insights/publish",
			{ repo: config.repo },
			config.token,
		);

		if (result.count > 0) {
			success(`Published ${result.count} draft${result.count > 1 ? "s" : ""}`);
			for (const insight of result.published) {
				console.log(`  ${c.dim("·")} ${insight.title}`);
			}
		} else {
			info("No drafts to publish.");
		}
	} catch (err) {
		warn(`Draft publish failed: ${err instanceof Error ? err.message : "unknown"}`);
	}

	// Git push
	info("Running git push...");
	try {
		const output = execSync("git push", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		if (output.trim()) {
			console.log(c.dim(output.trim()));
		}
		success("Push complete");
	} catch (err) {
		const msg = err instanceof Error ? err.message : "unknown";
		error(`git push failed: ${msg}`);
		process.exit(1);
	}

	closePrompt();
}
