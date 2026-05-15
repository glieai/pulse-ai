/**
 * Source-file Jaccard dedup helpers.
 *
 * Used by the watcher (extension + CLI) to skip insight generation when the
 * current changed files already match an existing insight's source_files.
 * Prevents the LLM from re-generating the same insight from the same files —
 * the fix is at the trigger, not at API/LLM/DB layer.
 */

export interface DuplicateCandidate {
	id: string;
	title: string;
	source_files: string[] | null;
}

export interface DuplicateMatch {
	id: string;
	title: string;
	score: number;
}

/** Jaccard similarity between two file path sets: |A∩B| / |A∪B|. Empty → 0. */
export function jaccardSimilarity(a: readonly string[], b: readonly string[]): number {
	if (a.length === 0 || b.length === 0) return 0;
	const setA = new Set(a);
	const setB = new Set(b);
	let intersection = 0;
	for (const x of setA) if (setB.has(x)) intersection++;
	const union = setA.size + setB.size - intersection;
	return union === 0 ? 0 : intersection / union;
}

/**
 * Find the highest-scoring candidate whose source_files overlap with
 * `currentFiles` at or above `threshold`. Returns null if none qualify.
 */
export function findDuplicateBySourceFiles(
	currentFiles: readonly string[],
	candidates: readonly DuplicateCandidate[],
	threshold = 0.5,
): DuplicateMatch | null {
	if (currentFiles.length === 0) return null;
	let best: DuplicateMatch | null = null;
	for (const c of candidates) {
		if (!c.source_files || c.source_files.length === 0) continue;
		const score = jaccardSimilarity(currentFiles, c.source_files);
		if (score >= threshold && (best === null || score > best.score)) {
			best = { id: c.id, title: c.title, score };
		}
	}
	return best;
}
