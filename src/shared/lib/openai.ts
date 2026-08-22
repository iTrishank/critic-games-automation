import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error("OPENAI_API_KEY is not configured.");
}

const openai = new OpenAI({
  apiKey,
});

export async function generateSummary(
  reviews: string[],
): Promise<string> {
  if (reviews.length === 0) {
    return "";
  }

  const reviewText = reviews
    .map((review, index) => `${index + 1}. ${review}`)
    .join("\n\n");

  const prompt = `
Summarize the following video game critic reviews.

Requirements:
- Write a concise summary of the overall critical sentiment.
- Mention the main things critics liked.
- Mention the main criticisms or weaknesses.
- Do not invent information.
- Do not mention that you are an AI.
- Keep the summary under 100 words.

Reviews:

${reviewText}
`;

  const response = await openai.responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  return response.output_text.trim() || "No summary available";
}