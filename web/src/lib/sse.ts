/**
 * SSE client for POST-based Server-Sent Events.
 *
 * Uses fetch() + ReadableStream instead of EventSource
 * because EventSource only supports GET and no custom headers.
 */

export interface AskSource {
	id: string;
	kind: string;
	title: string;
	repo: string;
}

interface SSECallbacks {
	onSources: (sources: AskSource[]) => void;
	onToken: (text: string) => void;
	onDone: () => void;
	onError: (error: string) => void;
}

export function fetchSSE(
	url: string,
	body: Record<string, unknown>,
	callbacks: SSECallbacks,
): AbortController {
	const controller = new AbortController();

	(async () => {
		try {
			const res = await fetch(url, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
				signal: controller.signal,
			});

			if (!res.ok) {
				const data = await res.json().catch(() => ({ error: res.statusText }));
				callbacks.onError(data.error || `HTTP ${res.status}`);
				return;
			}

			if (!res.body) {
				callbacks.onError("Response body is empty");
				return;
			}
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";
			let currentEvent: string | undefined;

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				buffer += decoder.decode(value, { stream: true });

				const lines = buffer.split("\n");
				buffer = lines.pop() ?? "";

				for (const line of lines) {
					if (line.startsWith("event: ")) {
						currentEvent = line.slice(7).trim();
					} else if (line.startsWith("data: ")) {
						const raw = line.slice(6);
						dispatch(currentEvent, raw, callbacks);
						currentEvent = undefined;
					} else if (line === "") {
						currentEvent = undefined;
					}
				}
			}

			callbacks.onDone();
		} catch (err) {
			if (err instanceof DOMException && err.name === "AbortError") return;
			callbacks.onError(err instanceof Error ? err.message : "Connection failed");
		}
	})();

	return controller;
}

function dispatch(event: string | undefined, raw: string, cb: SSECallbacks) {
	try {
		if (event === "sources") {
			cb.onSources(JSON.parse(raw).sources);
		} else if (event === "token") {
			cb.onToken(JSON.parse(raw).text);
		} else if (event === "done") {
			cb.onDone();
		} else if (event === "error") {
			cb.onError(JSON.parse(raw).error);
		}
	} catch {
		// Malformed SSE data — ignore
	}
}
