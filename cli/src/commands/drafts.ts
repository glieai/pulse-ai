import { deleteDraft, listDrafts } from "@pulse/shared";
import type { LocalDraft } from "@pulse/shared";
import { loadConfig } from "../config";
import { apiPost } from "../http";
import { banner, c, error, info, success, warn } from "../output";
import { ask, closePrompt, confirm } from "../prompt";

export async function draftsCommand(_args: string[]): Promise<void> {
	banner("Drafts");

	const config = loadConfig();
	const repo = config.repo || undefined;
	const drafts = listDrafts(repo);

	if (drafts.length === 0) {
		info("No local drafts.");
		info(`  Run ${c.cyan("pulse watch")} or ${c.cyan("pulse reflect")} to generate insights.`);
		closePrompt();
		return;
	}

	console.log(`  ${c.bold(`${drafts.length} draft${drafts.length === 1 ? "" : "s"} pending:`)}`);
	console.log("");

	for (let i = 0; i < drafts.length; i++) {
		const d = drafts[i];
		const kind = d.data.kind?.toUpperCase() ?? "?";
		const repo = d.data.repo || "?";
		console.log(`  ${c.dim(`${i + 1}.`)} [${c.cyan(kind)}] ${d.data.title}`);
		console.log(`     ${c.dim(`${repo} · ${d.createdAt.slice(0, 16)}`)}`);
	}

	console.log("");
	const action = await ask(
		`${c.dim("[p]")} Publish all  ${c.dim(`[1-${drafts.length}]`)} Review  ${c.dim("[d]")} Delete all  ${c.dim("[q]")} Quit`,
	);

	if (action === "q" || action === "") {
		closePrompt();
		return;
	}

	if (action === "p") {
		await publishAll(config, drafts);
		closePrompt();
		return;
	}

	if (action === "d") {
		const sure = await confirm("Delete ALL local drafts?", false);
		if (sure) {
			for (const d of drafts) deleteDraft(d.filePath);
			success(`Deleted ${drafts.length} drafts.`);
		}
		closePrompt();
		return;
	}

	const idx = Number.parseInt(action, 10) - 1;
	if (idx >= 0 && idx < drafts.length) {
		await reviewDraft(config, drafts[idx]);
	}

	closePrompt();
}

async function reviewDraft(
	config: { apiUrl: string; token?: string; repo: string },
	draft: LocalDraft,
): Promise<void> {
	console.log("");
	console.log(`  ${c.bold(`[${draft.data.kind?.toUpperCase()}] ${draft.data.title}`)}`);
	console.log("");
	console.log(`  ${draft.data.body?.slice(0, 500) ?? ""}`);
	if ((draft.data.body?.length ?? 0) > 500) console.log(`  ${c.dim("... (truncated)")}`);
	console.log("");

	const action = await ask(`${c.dim("[p]")} Publish  ${c.dim("[d]")} Delete  ${c.dim("[b]")} Back`);

	if (action === "p") {
		await publishOne(config, draft);
	} else if (action === "d") {
		deleteDraft(draft.filePath);
		success("Draft deleted.");
	}
}

async function publishOne(
	config: { apiUrl: string; token?: string; repo: string },
	draft: LocalDraft,
): Promise<void> {
	try {
		const payload = { ...draft.data, status: "published" };
		await apiPost(config.apiUrl, "/insights", payload, config.token);
		deleteDraft(draft.filePath);
		success(`Published: "${draft.data.title}"`);
	} catch (e) {
		error(`Publish failed: ${(e as Error).message}`);
	}
}

async function publishAll(
	config: { apiUrl: string; token?: string; repo: string },
	drafts: LocalDraft[],
): Promise<void> {
	let published = 0;
	for (const draft of drafts) {
		try {
			const payload = { ...draft.data, status: "published" };
			await apiPost(config.apiUrl, "/insights", payload, config.token);
			deleteDraft(draft.filePath);
			published++;
		} catch (e) {
			warn(`Failed: "${draft.data.title}" — ${(e as Error).message}`);
		}
	}
	success(`Published ${published}/${drafts.length} drafts.`);
}
