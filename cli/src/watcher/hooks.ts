import { execSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { warn } from "../output";

const POST_COMMIT_HOOK = `#!/bin/sh
# Pulse — auto-create insight draft on commit
pulse insight --trigger=commit --non-interactive || true
`;

const PRE_PUSH_HOOK = `#!/bin/sh
# Pulse — auto-create insight draft on push
pulse insight --trigger=push --non-interactive || true
`;

/**
 * Install git hooks for post-commit and pre-push triggers.
 * Returns true if in a git repo (hooks may or may not be installed).
 */
export function installGitHooks(): boolean {
	try {
		const gitDir = execSync("git rev-parse --git-dir", {
			encoding: "utf-8",
		}).trim();
		const hooksDir = `${gitDir}/hooks`;
		const postCommitPath = `${hooksDir}/post-commit`;
		const prePushPath = `${hooksDir}/pre-push`;

		if (!existsSync(hooksDir)) {
			mkdirSync(hooksDir, { recursive: true });
		}

		if (!existsSync(postCommitPath)) {
			writeFileSync(postCommitPath, POST_COMMIT_HOOK);
			chmodSync(postCommitPath, "755");
		} else {
			warn("post-commit hook already exists — skipping (add pulse manually if needed)");
		}

		if (!existsSync(prePushPath)) {
			writeFileSync(prePushPath, PRE_PUSH_HOOK);
			chmodSync(prePushPath, "755");
		} else {
			warn("pre-push hook already exists — skipping (add pulse manually if needed)");
		}

		return true;
	} catch {
		return false;
	}
}
