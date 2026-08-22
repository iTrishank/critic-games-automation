import {
  createMetacriticBrowser,
  scrapeGame,
} from "@/entities/game/api/metacritic.scraper";

async function main() {
  const browser = await createMetacriticBrowser();

  try {
    const game = await scrapeGame(
      browser,
      "https://www.metacritic.com/game/mortal-shell-ii/",
    );

    console.dir(game, {
      depth: null,
    });

    console.log(
      `\nCritic reviews scraped: ${game.criticReviews.length}`,
    );

    console.log(
      `User reviews scraped: ${game.userReviews.length}`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});