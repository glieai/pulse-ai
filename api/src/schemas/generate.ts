import { z } from "zod";

export const generateSchema = z.object({
	raw_data: z.string().min(1).max(500_000),
	source_type: z.string().min(1).max(100),
	source_name: z.string().max(500).optional(),
	repo: z.string().min(1),
	branch: z.string().optional(),
	auto_approve: z.boolean().default(false),
});

export type GenerateInput = z.infer<typeof generateSchema>;
