import { Hono } from "hono";
import { createMiddleware } from "hono/factory";
import { z } from "zod";
import { sql } from "../db/client";
import { env } from "../env";
import { auth } from "../middleware/auth";
import { checkLimit } from "../middleware/plan-limits";
import { audit, getIp } from "../services/audit";
import { sendEmail } from "../services/email";
import {
	buildLlmStatus,
	getOrgSettings,
	installCliTool,
	redactOrgSettings,
	removeProviderConfig,
	setActiveProvider,
	updateAiFeatures,
	updateCliProvider,
	upsertProviderConfig,
} from "../services/org";
import type { AppEnv } from "../types/app";

const providerParam = z.enum(["anthropic", "openai"]);

const upsertProviderSchema = z.object({
	api_key: z.string().optional(),
	model: z.string().optional(),
});

const setActiveSchema = z.object({
	active_provider: z.enum(["anthropic", "openai"]),
});

const aiFeatureSchema = z.object({
	enrichment_enabled: z.boolean(),
});

const cliProviderSchema = z.object({
	cli_provider: z.enum(["claude-cli", "codex-cli", "anthropic", "openai"]),
});

const org = new Hono<AppEnv>();
org.use("/*", auth);

// ─── Org Info (name, plan, deletion status) ─────

org.get("/org/info", async (c) => {
	const { org_id } = c.get("auth");
	const [orgRow] = await sql`
		SELECT id, name, slug, plan, deletion_scheduled_at, created_at
		FROM orgs WHERE id = ${org_id}
	`;
	if (!orgRow) {
		return c.json({ error: "Org not found" }, 404);
	}
	return c.json({ org: orgRow });
});

const orgNameSchema = z.object({
	name: z.string().min(2).max(100),
});

org.patch("/org/info", async (c) => {
	const { org_id, user_id, role } = c.get("auth");
	if (role !== "owner") {
		return c.json({ error: "Only the org owner can update org details" }, 403);
	}

	const body = await c.req.json();
	const { name } = orgNameSchema.parse(body);

	const [updated] = await sql`
		UPDATE orgs SET name = ${name} WHERE id = ${org_id}
		RETURNING id, name, slug, plan
	`;

	await audit({
		orgId: org_id,
		userId: user_id,
		action: "org.name_updated",
		resourceType: "org",
		resourceId: org_id,
		metadata: { new_name: name },
		ip: getIp(c),
	});

	return c.json({ org: updated });
});

// ─── GET Settings + LLM Status ──────────────────

org.get("/org/settings", async (c) => {
	const { org_id } = c.get("auth");
	const settings = await getOrgSettings(org_id);
	return c.json({
		settings: redactOrgSettings(settings),
		llm_status: buildLlmStatus(settings.llm, { cli_provider: settings.cli_provider }),
	});
});

// ─── Upsert Provider Config ────────────────────

org.put("/org/settings/llm/providers/:provider", async (c) => {
	const { org_id, role } = c.get("auth");
	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can update LLM settings" }, 403);
	}

	const provider = providerParam.parse(c.req.param("provider"));
	const body = await c.req.json();
	const config = upsertProviderSchema.parse(body);

	if (!config.api_key && !config.model) {
		return c.json({ error: "At least api_key or model is required" }, 400);
	}

	const settings = await upsertProviderConfig(org_id, provider, config);
	return c.json({
		settings: redactOrgSettings(settings),
		llm_status: buildLlmStatus(settings.llm, { cli_provider: settings.cli_provider }),
	});
});

// ─── Remove Provider Config ────────────────────

org.delete("/org/settings/llm/providers/:provider", async (c) => {
	const { org_id, role } = c.get("auth");
	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can update LLM settings" }, 403);
	}

	const provider = providerParam.parse(c.req.param("provider"));
	const settings = await removeProviderConfig(org_id, provider);
	return c.json({
		settings: redactOrgSettings(settings),
		llm_status: buildLlmStatus(settings.llm, { cli_provider: settings.cli_provider }),
	});
});

// ─── Set Active Provider ────────────────────────

org.patch("/org/settings/llm/active", async (c) => {
	const { org_id, role } = c.get("auth");
	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can update LLM settings" }, 403);
	}

	const body = await c.req.json();
	const { active_provider } = setActiveSchema.parse(body);
	const settings = await setActiveProvider(org_id, active_provider);
	return c.json({
		settings: redactOrgSettings(settings),
		llm_status: buildLlmStatus(settings.llm, { cli_provider: settings.cli_provider }),
	});
});

// ─── AI Features ────────────────────────────────

org.patch("/org/settings/ai", async (c) => {
	const { org_id, role } = c.get("auth");
	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can update AI settings" }, 403);
	}

	const body = await c.req.json();
	const aiFeatures = aiFeatureSchema.parse(body);
	const settings = await updateAiFeatures(org_id, aiFeatures);
	return c.json({
		settings: redactOrgSettings(settings),
		llm_status: buildLlmStatus(settings.llm, { cli_provider: settings.cli_provider }),
	});
});

// ─── CLI Provider Preference ─────────────────────

org.patch("/org/settings/cli-provider", async (c) => {
	const { org_id, role } = c.get("auth");
	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can update settings" }, 403);
	}

	const body = await c.req.json();
	const { cli_provider } = cliProviderSchema.parse(body);
	const settings = await updateCliProvider(org_id, cli_provider);
	return c.json({
		settings: redactOrgSettings(settings),
		llm_status: buildLlmStatus(settings.llm, { cli_provider }),
	});
});

// ─── Install CLI Tool (Solo Mode) ────────────────

const installToolSchema = z.object({
	tool: z.enum(["claude", "codex"]),
});

org.post("/org/cli-tools/install", async (c) => {
	if (env.PULSE_MODE !== "solo") {
		return c.json({ error: "Only available in Solo Mode" }, 403);
	}

	const { role } = c.get("auth");
	if (role !== "owner" && role !== "admin") {
		return c.json({ error: "Only owners and admins can install tools" }, 403);
	}

	const body = await c.req.json();
	const { tool } = installToolSchema.parse(body);
	const result = await installCliTool(tool);

	if (!result.success) {
		return c.json({ error: result.message }, 500);
	}
	return c.json({ message: result.message });
});

// ─── Team-mode guard ──────────────────────────────────────────────────────────
// Member management, invitations, and org deletion are only relevant in team mode.
// In solo mode there is only one user, so these endpoints serve no purpose.

const teamOnly = createMiddleware(async (c, next) => {
	if (env.PULSE_MODE === "solo") {
		return c.json({ error: "Not available in Solo Mode" }, 403);
	}
	await next();
});

org.use("/org/members", teamOnly);
org.use("/org/members/*", teamOnly);
org.use("/org/invite", teamOnly);
org.use("/org/invitations", teamOnly);
org.use("/org/invitations/*", teamOnly);
org.use("/org/delete-request", teamOnly);

export { org };
