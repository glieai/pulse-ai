import { afterEach, describe, expect, it } from "bun:test";
import { resetCliCache, runSubprocess, whichBinary } from "./subprocess";

afterEach(() => resetCliCache());

describe("whichBinary", () => {
	it("returns path for known binary", () => {
		const result = whichBinary("node");
		expect(result).not.toBeNull();
		expect(result).toContain("node");
	});

	it("returns null for nonexistent binary", () => {
		expect(whichBinary("__nonexistent_binary_pulse_test__")).toBeNull();
	});
});

describe("runSubprocess", () => {
	it("captures stdout from a simple command", async () => {
		const result = await runSubprocess({ command: "echo", args: ["hello"] });
		expect(result.stdout.trim()).toBe("hello");
		expect(result.exitCode).toBe(0);
	});

	it("pipes stdin to the process", async () => {
		const result = await runSubprocess({
			command: "cat",
			args: [],
			stdin: "piped content",
		});
		expect(result.stdout).toBe("piped content");
	});

	it("rejects on nonexistent binary (ENOENT)", async () => {
		await expect(
			runSubprocess({ command: "__nonexistent_binary_pulse_test__", args: [] }),
		).rejects.toThrow("not found");
	});

	it("rejects on non-zero exit code", async () => {
		await expect(runSubprocess({ command: "false", args: [] })).rejects.toThrow("exited with code");
	});

	it("rejects on timeout", async () => {
		await expect(runSubprocess({ command: "sleep", args: ["10"], timeoutMs: 100 })).rejects.toThrow(
			"timed out",
		);
	});

	it("captures stderr in error message on failure", async () => {
		await expect(
			runSubprocess({ command: "sh", args: ["-c", "echo err >&2 && exit 1"] }),
		).rejects.toThrow("err");
	});
});
