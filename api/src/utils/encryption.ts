/**
 * Encryption utility for sensitive data at rest (LLM API keys, OAuth secrets).
 * Uses AES-256-GCM: authenticated encryption with IV and auth tag.
 *
 * Stored format: base64(iv):base64(authTag):base64(ciphertext)
 *
 * In production, ENCRYPTION_KEY must be set (env.ts validates this).
 * In development, a fixed fallback key is used — never use in production.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const DEV_FALLBACK_KEY = "pulse-dev-key-not-for-production!";

function resolveKey(): Buffer {
	const raw = process.env.ENCRYPTION_KEY ?? DEV_FALLBACK_KEY;
	const buf = Buffer.from(raw, "utf8");
	// AES-256 needs exactly 32 bytes — hash if wrong length
	if (buf.length === 32) return buf;
	return createHash("sha256").update(raw).digest();
}

/**
 * Encrypt a string with AES-256-GCM.
 */
export function encrypt(plaintext: string): string {
	if (!plaintext) return plaintext;

	const key = resolveKey();
	const iv = randomBytes(12); // 96-bit IV recommended for GCM
	const cipher = createCipheriv("aes-256-gcm", key, iv);

	let encrypted = cipher.update(plaintext, "utf8", "base64");
	encrypted += cipher.final("base64");
	const authTag = cipher.getAuthTag();

	return `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted}`;
}

/**
 * Decrypt a string produced by `encrypt()`.
 * Returns null on any failure (wrong key, corrupted data, wrong format).
 */
export function decrypt(encryptedText: string): string | null {
	if (!encryptedText) return null;

	try {
		const parts = encryptedText.split(":");
		if (parts.length !== 3) return null;

		const [ivB64, authTagB64, ciphertext] = parts;
		const key = resolveKey();
		const iv = Buffer.from(ivB64, "base64");
		const authTag = Buffer.from(authTagB64, "base64");

		const decipher = createDecipheriv("aes-256-gcm", key, iv);
		decipher.setAuthTag(authTag);

		let decrypted = decipher.update(ciphertext, "base64", "utf8");
		decrypted += decipher.final("utf8");
		return decrypted;
	} catch {
		return null;
	}
}

/**
 * Check if a string looks like our encrypted format (iv:authTag:ciphertext, all base64).
 * Used for backward compatibility when reading keys that may still be plaintext.
 */
export function isEncrypted(text: string): boolean {
	if (!text || typeof text !== "string") return false;
	const parts = text.split(":");
	return parts.length === 3 && parts.every((p) => p.length > 0);
}

/**
 * Decrypt if encrypted, return as-is if plaintext.
 * Handles migration: keys stored before encryption was introduced.
 */
export function decryptIfNeeded(value: string): string {
	if (isEncrypted(value)) {
		return decrypt(value) ?? value;
	}
	return value;
}
