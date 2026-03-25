import { generateURI, generateSecret as otplibGenerateSecret, verifySync } from "otplib";
import QRCode from "qrcode";

const SERVICE_NAME = "Pulse";

export function generateSecret(email: string): { secret: string; otpauthUrl: string } {
	const secret = otplibGenerateSecret();
	const otpauthUrl = generateURI({
		issuer: SERVICE_NAME,
		label: email,
		secret,
		strategy: "totp",
	});
	return { secret, otpauthUrl };
}

export async function generateQRCode(otpauthUrl: string): Promise<string> {
	return QRCode.toDataURL(otpauthUrl, {
		width: 256,
		margin: 2,
		color: { dark: "#000000", light: "#ffffff" },
	});
}

export function verifyTOTP(secret: string, token: string): boolean {
	try {
		const result = verifySync({ secret, token, strategy: "totp" });
		return result.valid;
	} catch {
		return false;
	}
}

export function generateBackupCodes(): string[] {
	const codes: string[] = [];
	for (let i = 0; i < 10; i++) {
		const hex = Array.from(crypto.getRandomValues(new Uint8Array(4)), (b) =>
			b.toString(16).padStart(2, "0"),
		)
			.join("")
			.toUpperCase();
		codes.push(`${hex.slice(0, 4)}-${hex.slice(4)}`);
	}
	return codes;
}

// SHA-256 hash of normalized code (no dash, uppercase)
function hashCode(code: string): string {
	const normalized = code.replace("-", "").toUpperCase();
	return new Bun.CryptoHasher("sha256").update(normalized).digest("hex");
}

export function hashBackupCodes(codes: string[]): string[] {
	return codes.map(hashCode);
}

export function verifyBackupCode(
	hashedCodes: string[],
	inputCode: string,
): { valid: boolean; remainingCodes: string[] | null } {
	const inputHash = hashCode(inputCode);

	for (let i = 0; i < hashedCodes.length; i++) {
		if (hashedCodes[i] === inputHash) {
			const remainingCodes = [...hashedCodes.slice(0, i), ...hashedCodes.slice(i + 1)];
			return { valid: true, remainingCodes };
		}
	}

	return { valid: false, remainingCodes: null };
}
