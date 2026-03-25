import { sql } from "./client";

async function seed() {
	console.log("Seeding database...");

	// Create test org
	const [org] = await sql`
		INSERT INTO orgs (name, slug, plan)
		VALUES ('Glie AI', 'glie', 'pro')
		ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
		RETURNING id
	`;

	// Create test user (password: "pulse-dev-2026")
	const passwordHash = await Bun.password.hash("pulse-dev-2026", {
		algorithm: "bcrypt",
		cost: 10,
	});

	const [user] = await sql`
		INSERT INTO users (org_id, name, email, password_hash, role)
		VALUES (${org.id}, 'Dev User', 'dev@glie.ai', ${passwordHash}, 'owner')
		ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash
		RETURNING id
	`;

	// Create sample insights
	const insights = [
		{
			kind: "decision",
			title: "PostgreSQL como single database para tudo",
			body: "Usamos PostgreSQL 17 com pgvector para relacional, FTS, e vector search. Uma única base de dados em vez de sistemas separados.",
			structured: {
				why: "Sem sincronização entre sistemas, sem infra extra, sem vendor lock-in.",
				alternatives: [
					{ what: "Pinecone + PostgreSQL", why_rejected: "Dois sistemas para sincronizar" },
					{
						what: "Elasticsearch + PostgreSQL",
						why_rejected: "Infra extra desnecessária para o nosso volume",
					},
				],
			},
			repo: "glieai/pulse",
			trigger_type: "manual",
		},
		{
			kind: "dead_end",
			title: "Extensões experimentais de PostgreSQL descartadas",
			body: "Avaliámos pgvectorscale, VectorChord, pg_textsearch mas todas são de empresas pequenas com poucos meses de vida. Risco demasiado alto.",
			structured: {
				why_failed: "Extensões recentes de empresas pequenas. Risco de desaparecerem.",
				time_spent: "~2h de research",
			},
			repo: "glieai/pulse",
			trigger_type: "manual",
		},
	];

	for (const insight of insights) {
		const contentHash = new Bun.CryptoHasher("sha256")
			.update(`${org.id}:${insight.repo}:${insight.kind}:${insight.title}:${insight.body}`)
			.digest("hex");

		await sql`
			INSERT INTO insights (org_id, kind, title, body, structured, repo, trigger_type, content_hash, author_id, author_name)
			VALUES (
				${org.id}, ${insight.kind}, ${insight.title}, ${insight.body},
				${sql.json(insight.structured)}, ${insight.repo},
				${insight.trigger_type}, ${contentHash}, ${user.id}, 'Dev User'
			)
			ON CONFLICT (org_id, content_hash) DO NOTHING
		`;
	}

	console.log(`Seeded: org=${org.id}, user=${user.id}, insights=${insights.length}`);
	await sql.end();
}

seed().catch((err) => {
	console.error("Seed failed:", err);
	process.exit(1);
});
