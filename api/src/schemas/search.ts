import { z } from "zod";

export const searchSchema = z.object({
	q: z.string().min(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	offset: z.coerce.number().int().min(0).default(0),
});

export const contextGetSchema = z.object({
	query: z.string().min(1),
	repo: z.string().optional(),
	kind: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	strategy: z.enum(["hybrid", "vector", "fts"]).default("fts"),
});

export const contextPostSchema = z.object({
	query: z.string().min(1),
	embedding: z.array(z.number()).length(1536).optional(),
	repo: z.string().optional(),
	kind: z.string().optional(),
	limit: z.coerce.number().int().min(1).max(100).default(20),
	strategy: z.enum(["hybrid", "vector", "fts"]).default("hybrid"),
});

export const fileContextSchema = z.object({
	repo: z.string().min(1),
});

export type SearchInput = z.infer<typeof searchSchema>;
export type ContextGetInput = z.infer<typeof contextGetSchema>;
export type ContextPostInput = z.infer<typeof contextPostSchema>;
