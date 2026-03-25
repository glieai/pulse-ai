import { Marked } from "marked";

const md = new Marked({
	renderer: {
		// Strip raw HTML blocks — security: prevents XSS via {@html}
		html: () => "",
	},
});

export function renderMarkdown(src: string): string {
	return md.parse(src) as string;
}

/** Strip markdown syntax → plain text (for truncated previews) */
export function stripMarkdown(src: string): string {
	return src
		.replace(/```[\s\S]*?```/g, "") // fenced code blocks
		.replace(/^#{1,6}\s+/gm, "") // headings
		.replace(/\*\*(.+?)\*\*/g, "$1") // bold
		.replace(/\*(.+?)\*/g, "$1") // italic
		.replace(/`(.+?)`/g, "$1") // inline code
		.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
		.replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
		.replace(/^\s*[-*+]\s+/gm, "") // unordered lists
		.replace(/^\s*\d+\.\s+/gm, "") // ordered lists
		.replace(/^\s*>\s+/gm, "") // blockquotes
		.replace(/---+/g, "") // horizontal rules
		.replace(/\n{2,}/g, " ") // collapse multi-newlines
		.trim();
}
