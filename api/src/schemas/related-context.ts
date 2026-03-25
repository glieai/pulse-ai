import { z } from "zod";

export const relatedContextSchema = z.object({
	repo: z.string().min(1),
	branch: z.string().optional(),
	source_files: z.array(z.string()).optional(),
	recent_commits: z.string().optional(),
	session_id: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(30).default(10),
});

export type RelatedContextSchemaInput = z.infer<typeof relatedContextSchema>;
