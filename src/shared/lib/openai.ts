import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

import OpenAI from "openai";

let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "OPENAI_API_KEY is not configured.",
      );
    }

    openai = new OpenAI({
      apiKey,
    });
  }

  return openai;
}

type SummaryType = "critic" | "user";

export async function generateSummary(
  reviews: string[],
  type: SummaryType = "critic",
): Promise<string> {
  if (reviews.length === 0) {
    return "";
  }

  const reviewText = reviews
    .map(
      (review, index) =>
        `${index + 1}. ${review}`,
    )
    .join("\n\n");

  const prompt =
    type === "critic"
      ? `
Summarize the following video game critic reviews.

Requirements:
- Write a concise summary of the overall critical sentiment.
- Mention the main things critics liked.
- Mention the main criticisms or weaknesses.
- Focus on professional critical analysis.
- Do not confuse critic opinions with player opinions.
- Do not invent information.
- Do not mention that you are an AI.
- Keep the summary under 100 words.

Critic Reviews:

${reviewText}
`
      : `
Summarize the following video game user reviews.

Requirements:
- Write a concise summary of the overall player sentiment.
- Mention the things players commonly liked.
- Mention the main complaints or weaknesses players reported.
- Focus on actual player experiences, opinions, bugs, gameplay issues, and enjoyment.
- Do not call the reviewers "critics".
- Do not invent information.
- Do not mention that you are an AI.
- Keep the summary under 100 words.

User Reviews:

${reviewText}
`;

  const response = await getOpenAI().responses.create({
    model: "gpt-5-mini",
    input: prompt,
  });

  return (
    response.output_text.trim() ||
    "No summary available"
  );
}