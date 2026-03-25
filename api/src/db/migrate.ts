import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import { sql } from "./client";

const MIGRATIONS_DIR = join(import.meta.dir, "../../migrations");

async function migrate() {
	// Ensure migrations tracking table exists
	await sql`
		CREATE TABLE IF NOT EXISTS _migrations (
			id SERIAL PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			applied_at TIMESTAMPTZ DEFAULT now()
		)
	`;

	// Get already applied migrations
	const applied = await sql<{ name: string }[]>`
		SELECT name FROM _migrations ORDER BY id
	`;
	const appliedSet = new Set(applied.map((m) => m.name));

	// Read migration files
	const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();

	if (files.length === 0) {
		console.log("No migration files found.");
		await sql.end();
		return;
	}

	let count = 0;

	for (const file of files) {
		if (appliedSet.has(file)) {
			continue;
		}

		const content = await readFile(join(MIGRATIONS_DIR, file), "utf-8");

		console.log(`Applying: ${file}`);
		await sql.begin(async (tx) => {
			await tx.unsafe(content);
			await tx.unsafe("INSERT INTO _migrations (name) VALUES ($1)", [file]);
		});
		count++;
	}

	if (count === 0) {
		console.log("All migrations already applied.");
	} else {
		console.log(`Applied ${count} migration(s).`);
	}

	await sql.end();
}

migrate().catch((err) => {
	console.error("Migration failed:", err);
	process.exit(1);
});
