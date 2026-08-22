import {
  scrapeGame,
  createMetacriticBrowser,
} from "@/entities/game/api/metacritic.scraper";

import { saveScrapedGame } from "@/entities/game/api/game.repository";

import { generateSummary } from "@/shared/lib/openai";

async function main() {
  const browser = await createMetacriticBrowser();

  try {
    const scraped = await scrapeGame(
      browser,
      "https://www.metacritic.com/game/mortal-shell-ii/",
    );

    console.log(
      `\nCritic reviews available: ${scraped.criticReviews.length}`,
    );

    console.log(
      `User reviews available: ${scraped.userReviews.length}`,
    );

    const criticSummary =
      scraped.criticReviews.length > 0
        ? await generateSummary(
            scraped.criticReviews.map(
              (review) => review.text,
            ),
            "critic",
          )
        : null;

    const userSummary =
      scraped.userReviews.length > 0
        ? await generateSummary(
            scraped.userReviews.map(
              (review) => review.text,
            ),
            "user",
          )
        : null;

    console.log("\nGenerated critic summary:");
    console.log(criticSummary);

    console.log("\nGenerated user summary:");
    console.log(userSummary);

    const saved = await saveScrapedGame({
      name: scraped.name,
      slug: scraped.slug,
      coverImage: scraped.coverImage,
      developer: scraped.developer,
      description: scraped.description,
      videoUrl: scraped.videoUrl,
      criticSummary,
      userSummary,
      platforms: scraped.platforms,
    });

    console.log("\nSaved game:");
    console.dir(saved, { depth: null });
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});