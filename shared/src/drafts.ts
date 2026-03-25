/**
 * Local draft storage — drafts NEVER leave the developer's machine.
 *
 * Storage: ~/.pulse/drafts/{repo}/{timestamp}-{slug}.json
 * Each file contains a full InsightCreate payload.
 * On publish, the file is POSTed to the API and deleted locally.
 */

import {
	existsSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	unlinkSync,
	writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import type { InsightCreate } from "./types/insight";

const DRAFTS_ROOT = join(homedir(), ".pulse", "drafts");

export interface LocalDraft {
	filePath: string;
	filename: string;
	data: InsightCreate;
	createdAt: string;
}

function ensureDir(dir: string): void {
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function slugify(title: string): string {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "")
		.slice(0, 60);
}

/** Save a draft locally. Returns the file path. */
export function saveDraft(draft: InsightCreate): string {
	const repo = draft.repo || "unknown";
	const dir = join(DRAFTS_ROOT, repo);
	ensureDir(dir);

	const ts = Date.now();
	const slug = slugify(draft.title);
	const filename = `${ts}-${slug}.json`;
	const filePath = join(dir, filename);

	writeFileSync(filePath, JSON.stringify(draft, null, 2));
	return filePath;
}

/** List all drafts, optionally filtered by repo. */
export function listDrafts(repo?: string): LocalDraft[] {
	if (!existsSync(DRAFTS_ROOT)) return [];

	const repos = repo ? [repo] : listAllDraftRepos();
	const drafts: LocalDraft[] = [];

	for (const r of repos) {
		const dir = join(DRAFTS_ROOT, r);
		if (!existsSync(dir)) continue;

		for (const filename of readdirSync(dir)) {
			if (!filename.endsWith(".json")) continue;
			const filePath = join(dir, filename);
			try {
				const data = JSON.parse(readFileSync(filePath, "utf-8")) as InsightCreate;
				const tsMatch = filename.match(/^(\d+)-/);
				const createdAt = tsMatch
					? new Date(Number(tsMatch[1])).toISOString()
					: new Date().toISOString();
				drafts.push({ filePath, filename, data, createdAt });
			} catch {
				// Skip corrupted files
			}
		}
	}

	return drafts.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Read a single draft by file path. */
export function readDraft(filePath: string): InsightCreate {
	return JSON.parse(readFileSync(filePath, "utf-8")) as InsightCreate;
}

/** Delete a single draft. */
export function deleteDraft(filePath: string): void {
	if (existsSync(filePath)) unlinkSync(filePath);
}

/** List all repo subdirectories in the drafts root. */
export function listAllDraftRepos(): string[] {
	if (!existsSync(DRAFTS_ROOT)) return [];
	return readdirSync(DRAFTS_ROOT, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);
}
