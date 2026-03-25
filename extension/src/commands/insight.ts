import { saveDraft } from "@pulse/shared";
import type { InsightCreate } from "@pulse/shared";
import * as vscode from "vscode";
import type { PulseApiClient } from "../api/client";
import type { PulseExtensionConfig } from "../config";
import { gatherContext } from "../context/gather";
import { promptLlmSetup } from "../llm/auth-flow";
import { NoLlmError, generateInsight } from "../llm/generate";
import type { DraftsTreeProvider } from "../providers/drafts-tree";

export function registerInsightCommand(
	client: PulseApiClient,
	config: PulseExtensionConfig,
	draftsTree: DraftsTreeProvider,
): vscode.Disposable {
	return vscode.commands.registerCommand("pulse.insight", async () => {
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: "Pulse: Creating insight draft...",
				cancellable: false,
			},
			async (progress) => {
				try {
					progress.report({ message: "Gathering context..." });
					const context = await gatherContext(client, config.repo);

					if (!context.transcript && !context.diff) {
						vscode.window.showWarningMessage(
							"Pulse: No session transcript or git changes found. Nothing to generate from.",
						);
						return;
					}

					progress.report({ message: "Generating insight via LLM..." });
					const generated = await generateInsight(context).catch(async (err) => {
						if (!(err instanceof NoLlmError)) throw err;

						// Guide user through LLM setup instead of showing error
						const configured = await promptLlmSetup();
						if (!configured) return null;

						// Retry with freshly configured credentials
						progress.report({ message: "Generating insight via LLM..." });
						return generateInsight(context);
					});

					if (!generated) return;

					progress.report({ message: "Saving draft..." });
					const insightData: InsightCreate = {
						kind: generated.kind,
						title: generated.title,
						body: generated.body,
						structured: generated.structured,
						repo: context.repo,
						branch: context.branch,
						source_files: generated.sourceFiles,
						trigger_type: "manual",
						status: "draft",
					};

					saveDraft(insightData);
					vscode.window.showInformationMessage(`Pulse: Draft saved locally — "${generated.title}"`);
					draftsTree.refresh();
				} catch (err) {
					if (err instanceof vscode.LanguageModelError) {
						if (err.message.includes("consent")) {
							vscode.window.showWarningMessage(
								"Pulse: Language model access was denied. Please approve when prompted.",
							);
						} else {
							vscode.window.showErrorMessage(`Pulse: LLM error — ${err.message}`);
						}
					} else {
						const msg = err instanceof Error ? err.message : "unknown error";
						vscode.window.showErrorMessage(`Pulse: Generation failed — ${msg}`);
					}
				}
			},
		);
	});
}
