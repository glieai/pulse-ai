/**
 * Email service — SMTP via Google Workspace relay.
 *
 * Uses smtp-relay.gmail.com:587 with STARTTLS (IP-based auth, no credentials needed).
 * Falls back to console logging if SMTP is unavailable or EMAIL_FROM is not configured.
 *
 * Sending is inline/synchronous within the request. Failures are logged
 * but do NOT block the primary operation (invitation is still created
 * even if email delivery fails — the link is logged to console).
 */

import * as net from "node:net";
import * as tls from "node:tls";
import { env } from "../env";

interface EmailPayload {
	to: string;
	subject: string;
	html: string;
}

// ─── SMTP Client (minimal, no dependencies) ─────────────────────────────────

const SMTP_HOST = env.SMTP_HOST || "smtp-relay.gmail.com";
const SMTP_PORT = Number(env.SMTP_PORT) || 587;
const SMTP_TIMEOUT = 10_000;

async function readLine(socket: net.Socket | tls.TLSSocket): Promise<string> {
	return new Promise((resolve, reject) => {
		let data = "";
		const timeout = setTimeout(() => reject(new Error("SMTP timeout")), SMTP_TIMEOUT);
		const onData = (chunk: Buffer) => {
			data += chunk.toString();
			// SMTP responses end with \r\n and multi-line responses have - after code
			if (/^\d{3} /m.test(data)) {
				clearTimeout(timeout);
				socket.removeListener("data", onData);
				resolve(data.trim());
			}
		};
		socket.on("data", onData);
		socket.once("error", (err) => {
			clearTimeout(timeout);
			reject(err);
		});
	});
}

async function sendCommand(socket: net.Socket | tls.TLSSocket, command: string): Promise<string> {
	socket.write(`${command}\r\n`);
	return readLine(socket);
}

async function sendViaSMTP(payload: EmailPayload): Promise<void> {
	const from = env.EMAIL_FROM;

	return new Promise((resolve, reject) => {
		const socket = net.createConnection(SMTP_PORT, SMTP_HOST);
		socket.setTimeout(SMTP_TIMEOUT);

		socket.once("error", reject);
		socket.once("timeout", () => reject(new Error("SMTP connection timeout")));

		socket.once("connect", async () => {
			try {
				// Read greeting
				await readLine(socket);

				// EHLO
				const ehlo = await sendCommand(socket, `EHLO ${env.SMTP_HELO || "pulse.glie.ai"}`);
				if (!ehlo.startsWith("250")) throw new Error(`EHLO failed: ${ehlo}`);

				// STARTTLS
				if (ehlo.includes("STARTTLS")) {
					const starttls = await sendCommand(socket, "STARTTLS");
					if (!starttls.startsWith("220")) throw new Error(`STARTTLS failed: ${starttls}`);

					// Upgrade to TLS
					const tlsSocket = tls.connect({ socket, servername: SMTP_HOST });
					await new Promise<void>((res, rej) => {
						tlsSocket.once("secureConnect", res);
						tlsSocket.once("error", rej);
					});

					// Re-EHLO after TLS
					const ehlo2 = await sendCommand(tlsSocket, `EHLO ${env.SMTP_HELO || "pulse.glie.ai"}`);
					if (!ehlo2.startsWith("250")) throw new Error(`EHLO after TLS failed: ${ehlo2}`);

					// Send email over TLS
					await smtpSendMessage(tlsSocket, from, payload);
					tlsSocket.end();
				} else {
					// No TLS available — send plain
					await smtpSendMessage(socket, from, payload);
					socket.end();
				}

				resolve();
			} catch (err) {
				socket.destroy();
				reject(err);
			}
		});
	});
}

async function smtpSendMessage(
	socket: net.Socket | tls.TLSSocket,
	from: string,
	payload: EmailPayload,
): Promise<void> {
	const mailFrom = await sendCommand(socket, `MAIL FROM:<${from}>`);
	if (!mailFrom.startsWith("250")) throw new Error(`MAIL FROM failed: ${mailFrom}`);

	const rcptTo = await sendCommand(socket, `RCPT TO:<${payload.to}>`);
	if (!rcptTo.startsWith("250")) throw new Error(`RCPT TO failed: ${rcptTo}`);

	const data = await sendCommand(socket, "DATA");
	if (!data.startsWith("354")) throw new Error(`DATA failed: ${data}`);

	// Build RFC 2822 message with base64 encoding (safe for all charsets/HTML)
	const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).slice(2)}`;
	const plainText = payload.html
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/&lt;/g, "<")
		.replace(/&gt;/g, ">")
		.replace(/&rarr;/g, "→")
		.trim();
	// RFC 2045: base64 lines must be ≤76 chars
	const toB64Lines = (s: string) =>
		Buffer.from(s, "utf-8")
			.toString("base64")
			.match(/.{1,76}/g)
			?.join("\r\n") ?? "";
	const textB64 = toB64Lines(plainText);
	const htmlB64 = toB64Lines(payload.html);

	const message = [
		`From: Pulse <${from}>`,
		`To: ${payload.to}`,
		`Subject: ${payload.subject}`,
		"MIME-Version: 1.0",
		`Content-Type: multipart/alternative; boundary="${boundary}"`,
		"",
		`--${boundary}`,
		"Content-Type: text/plain; charset=utf-8",
		"Content-Transfer-Encoding: base64",
		"",
		textB64,
		"",
		`--${boundary}`,
		"Content-Type: text/html; charset=utf-8",
		"Content-Transfer-Encoding: base64",
		"",
		htmlB64,
		"",
		`--${boundary}--`,
		".",
	].join("\r\n");

	socket.write(`${message}\r\n`);
	const result = await readLine(socket);
	if (!result.startsWith("250")) throw new Error(`Message send failed: ${result}`);

	await sendCommand(socket, "QUIT");
}

// ─── Console fallback ────────────────────────────────────────────────────────

function sendViaConsole(payload: EmailPayload): void {
	console.log("\n[EMAIL — not sent, SMTP not configured]");
	console.log(`  To:      ${payload.to}`);
	console.log(`  Subject: ${payload.subject}`);
	const text = payload.html
		.replace(/<[^>]+>/g, " ")
		.replace(/\s+/g, " ")
		.trim();
	console.log(`  Body:    ${text.slice(0, 500)}${text.length > 500 ? "..." : ""}`);
	console.log();
}

/**
 * Send an email. Never throws — logs errors and falls back gracefully.
 * Returns true if sent via SMTP, false if logged to console.
 */
export async function sendEmail(payload: EmailPayload): Promise<boolean> {
	try {
		if (env.EMAIL_FROM && env.EMAIL_FROM !== "noreply@pulse.local") {
			await sendViaSMTP(payload);
			return true;
		}
		sendViaConsole(payload);
		return false;
	} catch (err) {
		console.error(
			"[email] SMTP delivery failed, falling back to console:",
			err instanceof Error ? err.message : err,
		);
		sendViaConsole(payload);
		return false;
	}
}

// ─── Shared Layout ───────────────────────────────────────────────────────────

function emailLayout(content: string): string {
	return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#0a0a0c;font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0c;padding:32px 16px">
  <tr><td align="center">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
      <!-- Header -->
      <tr><td style="padding:24px 32px;text-align:center">
        <img src="${process.env.FRONTEND_URL || "https://pulse.glie.ai"}/logo-white.png" alt="Pulse" width="140" style="display:inline-block;height:auto;margin-bottom:4px" />
        <p style="margin:4px 0 0;font-size:13px;color:#8b8b94">Operational memory for dev teams</p>
      </td></tr>
      <!-- Body -->
      <tr><td style="background:#111114;border-radius:12px;padding:32px;border:1px solid #232329">
        ${content}
      </td></tr>
      <!-- Footer -->
      <tr><td style="padding:24px 32px;text-align:center">
        <p style="margin:0;font-size:12px;color:#8b8b94">
          Pulse by <a href="https://glie.ai" style="color:#0891b2;text-decoration:none">Glie</a>
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

const btnStyle =
	"display:inline-block;background:#0891b2;color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px";
const secondaryBtnStyle =
	"display:inline-block;background:transparent;color:#0891b2;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;font-size:13px;border:1px solid #232329";
const headingStyle = "color:#ebebef;margin:0 0 8px;font-size:20px;font-weight:700";
const textStyle = "color:#8b8b94;font-size:14px;line-height:1.6;margin:0 0 16px";
const smallTextStyle = "color:#8b8b94;font-size:12px;line-height:1.5;margin:0";
const stepStyle =
	"background:#0a0a0c;border-radius:8px;padding:16px;margin:12px 0;border:1px solid #232329";
const stepNumberStyle =
	"display:inline-block;background:#0891b2;color:#ffffff;width:24px;height:24px;border-radius:50%;text-align:center;line-height:24px;font-weight:700;font-size:13px;margin-right:8px";
const stepTitleStyle = "color:#ebebef;font-weight:600;font-size:14px";
const codeStyle =
	"background:#0a0a0c;color:#06b6d4;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:13px";

// ─── Email Templates ─────────────────────────────────────────────────────────

export function invitationEmail(
	to: string,
	inviterName: string,
	orgName: string,
	inviteUrl: string,
): EmailPayload {
	const frontendUrl = env.FRONTEND_URL;

	return {
		to,
		subject: `${inviterName} invited you to ${orgName} on Pulse`,
		html: emailLayout(`
        <h2 style="${headingStyle}">You've been invited to ${orgName}</h2>
        <p style="${textStyle}">
          <strong style="color:#ebebef">${inviterName}</strong> invited you to join
          <strong style="color:#ebebef">${orgName}</strong> on Pulse — the operational knowledge base
          that automatically captures decisions, dead-ends and patterns from AI coding sessions.
        </p>

        <!-- CTA -->
        <div style="text-align:center;margin:24px 0">
          <a href="${inviteUrl}" style="${btnStyle}">Accept invitation</a>
        </div>

        <p style="${smallTextStyle};text-align:center;margin-bottom:24px">
          You can create a password or use <strong>Sign in with Google</strong>.
        </p>

        <!-- Divider -->
        <div style="border-top:1px solid #232329;margin:24px 0"></div>

        <h3 style="color:#ebebef;margin:0 0 16px;font-size:16px;font-weight:600">
          Setup Guide
        </h3>

        <!-- Step 1 -->
        <div style="${stepStyle}">
          <span style="${stepNumberStyle}">1</span>
          <span style="${stepTitleStyle}">Accept the invitation</span>
          <p style="${smallTextStyle};margin-top:8px">
            Click the button above, choose a name and password. You can then use Google SSO for future logins.
          </p>
        </div>

        <!-- Step 2 -->
        <div style="${stepStyle}">
          <span style="${stepNumberStyle}">2</span>
          <span style="${stepTitleStyle}">Install the VS Code extension</span>
          <p style="${smallTextStyle};margin-top:8px">
            Open VS Code, go to <strong style="color:#ebebef">Extensions</strong>
            (<span style="${codeStyle}">Ctrl+Shift+X</span>) and search for
            <strong style="color:#ebebef">Pulse AI</strong> by <em>Glie</em>. Click <strong style="color:#ebebef">Install</strong>.
          </p>
        </div>

        <!-- Step 3 -->
        <div style="${stepStyle}">
          <span style="${stepNumberStyle}">3</span>
          <span style="${stepTitleStyle}">Generate an API Token</span>
          <p style="${smallTextStyle};margin-top:8px">
            Log in at <a href="${frontendUrl}" style="color:#06b6d4;text-decoration:none">${frontendUrl}</a>
            &rarr; <strong style="color:#ebebef">Account</strong> &rarr; <strong style="color:#ebebef">API Tokens</strong>
            &rarr; <strong style="color:#ebebef">Generate</strong>.
          </p>
        </div>

        <!-- Step 4 -->
        <div style="${stepStyle}">
          <span style="${stepNumberStyle}">4</span>
          <span style="${stepTitleStyle}">Configure the extension</span>
          <p style="${smallTextStyle};margin-top:8px">
            In VS Code, open Settings (<span style="${codeStyle}">Ctrl+,</span>) and search for "Pulse":
          </p>
          <div style="background:#0a0a0c;border-radius:6px;padding:12px;margin-top:8px">
            <code style="color:#8b8b94;font-size:12px;font-family:monospace;white-space:pre"><span style="color:#ebebef">Pulse: Api Url</span>  &rarr;  <span style="color:#06b6d4">${frontendUrl}</span>
<span style="color:#ebebef">Pulse: Token</span>    &rarr;  <span style="color:#8b8b94">(token from step 3)</span></code>
          </div>
        </div>

        <!-- Divider -->
        <div style="border-top:1px solid #232329;margin:24px 0"></div>

        <h3 style="color:#ebebef;margin:0 0 12px;font-size:16px;font-weight:600">
          Quick Reference
        </h3>
        <table cellpadding="0" cellspacing="0" style="width:100%">
          <tr>
            <td style="padding:6px 0"><span style="${codeStyle}">Ctrl+Shift+K</span></td>
            <td style="${smallTextStyle};padding:6px 0">Search the knowledge base</td>
          </tr>
          <tr>
            <td style="padding:6px 0"><span style="${codeStyle}">Pulse: Create Insight</span></td>
            <td style="${smallTextStyle};padding:6px 0">Document a decision or pattern</td>
          </tr>
          <tr>
            <td style="padding:6px 0"><span style="${codeStyle}">Watcher</span></td>
            <td style="${smallTextStyle};padding:6px 0">Auto-generates drafts as you code</td>
          </tr>
        </table>

        <div style="text-align:center;margin-top:24px">
          <a href="${frontendUrl}" style="${secondaryBtnStyle}">Open Pulse</a>
        </div>

        <p style="${smallTextStyle};margin-top:24px;text-align:center">
          This invitation expires in <strong>7 days</strong>. If you weren't expecting this, ignore this email.
        </p>
        <p style="color:#8b8b94;font-size:11px;margin-top:8px;text-align:center">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color:#8b8b94;font-size:11px;margin-top:4px;text-align:center;word-break:break-all">
          <a href="${inviteUrl}" style="color:#0891b2;text-decoration:none">${inviteUrl}</a>
        </p>
    `),
	};
}

export function passwordResetEmail(to: string, resetUrl: string): EmailPayload {
	return {
		to,
		subject: "Reset your password — Pulse",
		html: emailLayout(`
        <h2 style="${headingStyle}">Reset your password</h2>
        <p style="${textStyle}">
          Click the button below to reset your Pulse password.
          This link expires in <strong style="color:#ebebef">1 hour</strong>.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetUrl}" style="${btnStyle}">Reset password</a>
        </div>
        <p style="${smallTextStyle};text-align:center">
          If you didn't request this, just ignore this email.
        </p>
        <p style="color:#8b8b94;font-size:11px;margin-top:16px;text-align:center">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color:#8b8b94;font-size:11px;margin-top:4px;text-align:center;word-break:break-all">
          <a href="${resetUrl}" style="color:#0891b2;text-decoration:none">${resetUrl}</a>
        </p>
    `),
	};
}

export function orgDeletionScheduledEmail(
	to: string,
	orgName: string,
	scheduledAt: Date,
	cancelUrl: string,
): EmailPayload {
	const dateStr = scheduledAt.toLocaleDateString("en-GB", { dateStyle: "long" });
	return {
		to,
		subject: `[Action required] ${orgName} scheduled for deletion`,
		html: emailLayout(`
        <h2 style="color:#ef4444;margin:0 0 8px;font-size:20px;font-weight:700">
          Organization scheduled for deletion
        </h2>
        <p style="${textStyle}">
          Your organization <strong style="color:#ebebef">${orgName}</strong> has been scheduled for
          permanent deletion on <strong style="color:#ebebef">${dateStr}</strong>.
        </p>
        <p style="${textStyle}">
          All insights, members and settings will be permanently removed.
        </p>
        <div style="text-align:center;margin:24px 0">
          <a href="${cancelUrl}" style="${btnStyle}">Cancel deletion</a>
        </div>
        <p style="${smallTextStyle};text-align:center">
          If you didn't request this, cancel immediately and change your password.
        </p>
    `),
	};
}
