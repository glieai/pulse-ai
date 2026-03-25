import { statSync } from "node:fs";
import { getActiveSessionInfo } from "../context/session";

export interface MonitorState {
	sessionId: string;
	filePath: string;
	bytesAtLastTrigger: number;
}

/**
 * Initialize monitoring state for the active session.
 * Starts from current file size (ignores existing content).
 */
export function initMonitor(cwd: string): MonitorState | null {
	const sessionInfo = getActiveSessionInfo(cwd);
	if (!sessionInfo) return null;

	return {
		sessionId: sessionInfo.sessionId,
		filePath: sessionInfo.filePath,
		bytesAtLastTrigger: statSync(sessionInfo.filePath).size,
	};
}

/**
 * Detect if the active session changed. Returns new state or null.
 */
export function checkSessionSwitch(cwd: string, current: MonitorState): MonitorState | null {
	const sessionInfo = getActiveSessionInfo(cwd);
	if (!sessionInfo || sessionInfo.filePath === current.filePath) return null;

	return {
		sessionId: sessionInfo.sessionId,
		filePath: sessionInfo.filePath,
		bytesAtLastTrigger: statSync(sessionInfo.filePath).size,
	};
}
