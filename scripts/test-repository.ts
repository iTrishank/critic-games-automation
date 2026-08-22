import {
  scrapeGame,
  createMetacriticBrowser,
} from "@/entities/game/api/metacritic.scraper";

import { saveScrapedGame } from "@/entities/game/api/game.repository";

async function main() {
  const browser = await createMetacriticBrowser();

  try {
    const scraped = await scrapeGame(
      browser,
      "https://www.metacritic.com/game/mortal-shell-ii/",
    );

    const saved = await saveScrapedGame({
      name: scraped.name,
      slug: scraped.slug,
      coverImage: scraped.coverImage,
      developer: scraped.developer,
      description: scraped.description,
      videoUrl: scraped.videoUrl,
      platforms: scraped.platforms,
    });

    console.log("\nSaved game:");
    console.dir(saved, { depth: null });

    console.log(
      `\nCritic reviews available: ${scraped.criticReviews.length}`,
    );

    console.log(
      `User reviews available: ${scraped.userReviews.length}`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});