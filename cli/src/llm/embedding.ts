import OpenAI from "openai";
import { getOpenAIKey } from "../credentials";

let client: OpenAI | null = null;

function getClient(): OpenAI | null {
	if (client) return client;
	const apiKey = getOpenAIKey();
	if (!apiKey) return null;
	client = new OpenAI({ apiKey });
	return client;
}

export async function generateEmbedding(text: string): Promise<number[] | undefined> {
	const openai = getClient();
	if (!openai) return undefined;

	const response = await openai.embeddings.create({
		model: "text-embedding-3-small",
		input: text,
	});

	return response.data[0]?.embedding;
}
