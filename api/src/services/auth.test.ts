import { describe, expect, test } from "bun:test";
import { generateSlug, signJwt, verifyJwt } from "./auth";

describe("auth service", () => {
	test("generateSlug converts name to kebab-case", () => {
		expect(generateSlug("Glie AI")).toBe("glie-ai");
		expect(generateSlug("My Company")).toBe("my-company");
		expect(generateSlug("  Spaces  ")).toBe("spaces");
		expect(generateSlug("UPPERCASE")).toBe("uppercase");
	});

	test("generateSlug handles accented characters", () => {
		expect(generateSlug("Café Résumé")).toBe("cafe-resume");
		expect(generateSlug("São Paulo")).toBe("sao-paulo");
	});

	test("generateSlug handles special characters", () => {
		expect(generateSlug("foo@bar!baz")).toBe("foo-bar-baz");
		expect(generateSlug("test---slug")).toBe("test-slug");
	});

	test("JWT round-trip: sign then verify", async () => {
		const payload = {
			user_id: "u1",
			org_id: "o1",
			role: "owner",
			name: "Test User",
			email: "test@example.com",
		};
		const token = await signJwt(payload);

		expect(token).toBeString();
		expect(token.split(".")).toHaveLength(3);

		const decoded = await verifyJwt(token);
		expect(decoded.user_id).toBe("u1");
		expect(decoded.org_id).toBe("o1");
		expect(decoded.role).toBe("owner");
		expect(decoded.name).toBe("Test User");
		expect(decoded.exp).toBeGreaterThan(decoded.iat);
	});

	test("verifyJwt rejects tampered token", async () => {
		const token = await signJwt({
			user_id: "u1",
			org_id: "o1",
			role: "owner",
			name: "Test",
			email: "test@example.com",
		});
		const tampered = `${token}x`;

		expect(verifyJwt(tampered)).rejects.toThrow();
	});

	test("verifyJwt rejects expired token", async () => {
		const { sign } = await import("hono/jwt");
		const { env } = await import("../env");
		const now = Math.floor(Date.now() / 1000);
		const expired = await sign(
			{ user_id: "u1", org_id: "o1", role: "owner", iat: now - 200, exp: now - 100 },
			env.JWT_SECRET,
			"HS256",
		);

		expect(verifyJwt(expired)).rejects.toThrow();
	});
});
