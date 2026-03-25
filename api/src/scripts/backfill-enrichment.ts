/**
 * Backfill enrichment for existing insights.
 *
 * Processes insights with enrichment IS NULL in batches.
 * Idempotent — can be interrupted and re-run safely.
 *
 * Usage: DATABASE_URL=... JWT_SECRET=... bun run api/src/scripts/backfill-enrichment.ts
 */

import type { JSONValue } from "postgres";
import { sql } from "../db/client";
import {
	computeQualitySignals,
	detectSupersession,
	findRelatedInsights,
} from "../services/enrichment";

const BATCH_SIZE = 50;

async function backfill() {
	let processed = 0;
	let failed = 0;

	while (true) {
		const batch = await sql`
			SELECT id, org_id, kind, title, body, structured,
				repo, source_files, embedding
			FROM insights
			WHERE enrichment IS NULL
			ORDER BY created_at DESC
			LIMIT ${BATCH_SIZE}
		`;

		if (batch.length === 0) break;

		for (const row of batch) {
			try {
				const orgId = row.org_id as string;
				const insightId = row.id as string;

				const qualitySignals = computeQualitySignals({
					kind: row.kind as string,
					body: row.body as string,
					structured: (row.structured ?? {}) as Record<string, unknown>,
					source_files: row.source_files as string[] | undefined,
				});

				const [relatedIds, supersedesId] = await Promise.all([
					findRelatedInsights(orgId, row.embedding as number[] | undefined, insightId),
					detectSupersession(orgId, {
						kind: row.kind as string,
						repo: row.repo as string,
						title: row.title as string,
					}),
				]);

				const enrichment = {
					quality_signals: qualitySignals,
					related_ids: relatedIds.length > 0 ? relatedIds : undefined,
					supersedes_id: supersedesId ?? undefined,
					enriched_at: new Date().toISOString(),
				};

				await sql`
					UPDATE insights
					SET enrichment = ${sql.json(enrichment as unknown as JSONValue)},
						supersedes_id = ${supersedesId}
					WHERE id = ${insightId} AND org_id = ${orgId}
				`;

				if (supersedesId) {
					await sql`
						UPDATE insights
						SET enrichment = jsonb_set(
							COALESCE(enrichment, '{}'),
							'{superseded_by_id}',
							${JSON.stringify(insightId)}::jsonb
						)
						WHERE id = ${supersedesId} AND org_id = ${orgId}
					`;
				}

				processed++;
			} catch (err) {
				failed++;
				console.error(`Failed to enrich insight ${row.id}:`, err);
			}
		}

		console.log(`Processed ${processed} insights (${failed} failed)...`);
	}

	console.log(`Backfill complete. Enriched: ${processed}, Failed: ${failed}.`);
	await sql.end();
}

backfill().catch((err) => {
	console.error("Backfill failed:", err);
	process.exit(1);
});
