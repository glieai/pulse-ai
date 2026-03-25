import { z } from "zod";

export const registerSchema = z.object({
	org_name: z.string().min(1).max(100),
	name: z.string().min(1).max(100),
	email: z.string().email(),
	password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
