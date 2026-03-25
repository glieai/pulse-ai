import { z } from "zod";

export const clientEnrichmentSchema = z.object({
	llm_enrichment: z.object({
		contradiction_analysis: z.string().nullable(),
		suggested_links: z.array(z.string()).default([]),
		quality_score: z.number().min(1).max(10).nullable(),
		enriched_at: z.string(),
	}),
});

export type ClientEnrichmentInput = z.infer<typeof clientEnrichmentSchema>;
