import {
	SOLO_ORG_ID,
	SOLO_ORG_NAME,
	SOLO_ORG_SLUG,
	SOLO_USER_EMAIL,
	SOLO_USER_ID,
	SOLO_USER_NAME,
} from "@pulse/shared";
import { sql } from "./db/client";
import { env } from "./env";

/** Ensure default solo org and user exist. Idempotent — safe to call on every startup. */
export async function bootstrapSoloMode(): Promise<void> {
	if (env.PULSE_MODE !== "solo") return;

	// Ensure solo org and user exist (bcrypt only on first boot)
	const [existing] = await sql`SELECT id FROM users WHERE id = ${SOLO_USER_ID}`;
	if (!existing) {
		const passwordHash = await Bun.password.hash(crypto.randomUUID(), {
			algorithm: "bcrypt",
			cost: 4,
		});

		await sql`
			INSERT INTO orgs (id, name, slug, plan)
			VALUES (${SOLO_ORG_ID}, ${SOLO_ORG_NAME}, ${SOLO_ORG_SLUG}, 'free')
			ON CONFLICT (id) DO NOTHING
		`;

		await sql`
			INSERT INTO users (id, org_id, name, email, password_hash, role)
			VALUES (${SOLO_USER_ID}, ${SOLO_ORG_ID}, ${SOLO_USER_NAME}, ${SOLO_USER_EMAIL}, ${passwordHash}, 'owner')
			ON CONFLICT (id) DO NOTHING
		`;

		console.log("Solo mode: default org and user created");
	}

	// Adopt orphaned data from other orgs (idempotent, cheap EXISTS check per boot)
	const [orphaned] = await sql`
		SELECT EXISTS(SELECT 1 FROM insights WHERE org_id != ${SOLO_ORG_ID}) AS found
	`;
	if (orphaned.found) {
		const migrated = await sql`
			UPDATE insights SET org_id = ${SOLO_ORG_ID}, author_id = ${SOLO_USER_ID}
			WHERE org_id != ${SOLO_ORG_ID}
		`;
		const tokens = await sql`
			UPDATE api_tokens SET org_id = ${SOLO_ORG_ID}, user_id = ${SOLO_USER_ID}
			WHERE org_id != ${SOLO_ORG_ID}
		`;
		console.log(`Solo mode: adopted ${migrated.count} insights, ${tokens.count} API tokens`);
	}
}
