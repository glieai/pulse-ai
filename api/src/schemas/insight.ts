import { z } from "zod";

const insightKind = z.enum(["decision", "dead_end", "pattern", "context", "progress", "business"]);
const insightStatus = z.enum(["draft", "published"]);
const triggerType = z.enum(["commit", "size", "manual", "push", "api"]);

export const insightCreateSchema = z.object({
	kind: insightKind,
	title: z.string().min(1).max(500),
	body: z.string().min(1).max(100_000),
	structured: z.record(z.unknown()).optional().default({}),
	embedding: z.array(z.number()).length(1536).optional(),
	repo: z.string().min(1),
	branch: z.string().optional(),
	source_files: z.array(z.string()).optional(),
	commit_hashes: z.array(z.string()).optional(),
	session_refs: z.array(z.record(z.unknown())).optional(),
	trigger_type: triggerType,
	status: insightStatus.optional().default("draft"),
});

export const insightListSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
	cursor: z.string().datetime({ offset: true }).optional(),
	kind: insightKind.optional(),
	repo: z.string().optional(),
	branch: z.string().optional(),
	author_id: z.string().uuid().optional(),
	status: insightStatus.optional(),
	session_id: z.string().optional(),
});

export const insightNeighborSchema = z.object({
	kind: insightKind.optional(),
	repo: z.string().optional(),
});

export const publishSchema = z.object({
	repo: z.string().min(1).optional(),
});

export type InsightCreateInput = z.infer<typeof insightCreateSchema>;
export type InsightListInput = z.infer<typeof insightListSchema>;
