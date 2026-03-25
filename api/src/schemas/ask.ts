import { z } from "zod";

export const askSchema = z.object({
	query: z.string().min(3).max(1000),
	repo: z.string().optional(),
	kind: z.enum(["decision", "dead_end", "pattern", "context", "progress", "business"]).optional(),
});

export type AskInput = z.infer<typeof askSchema>;
