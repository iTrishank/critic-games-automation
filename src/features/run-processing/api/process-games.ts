import {
  createMetacriticBrowser,
  scrapeGame,
} from "@/entities/game/api/metacritic.scraper";

import { getNewReleaseGames } from "@/entities/game/api/metacritic.releases";

import { saveScrapedGame } from "@/entities/game/api/game.repository";

import { withRetry } from "@/shared/lib/with-retry";

import {
  startProcessing,
  finishProcessing,
} from "./processing.repository";

export async function processGames() {
  const processingId = await startProcessing();

  const browser = await createMetacriticBrowser();

  try {
    // Process the 20 latest releases required by the test.
    const releases = await getNewReleaseGames(20);

    let gamesProcessed = 0;

    for (const release of releases) {
      try {
        console.log(`\nProcessing: ${release.name}`);
        console.log(release.url);

        const game = await withRetry(
          () => scrapeGame(browser, release.url),
          {
            retries: 3,
            delayMs: 2000,
            onError: (error, attempt) => {
              console.error(
                `Attempt ${attempt}/3 failed for ${release.name}`,
                error,
              );
            },
          },
        );

        await saveScrapedGame({
          name: game.name,
          slug: game.slug,
          coverImage: game.coverImage,
          developer: game.developer,
          description: game.description,
          videoUrl: game.videoUrl,
          platforms: game.platforms,
        });

        gamesProcessed++;

        console.log(`✓ Saved: ${game.name}`);
      } catch (error) {
        console.error(
          `✗ Failed: ${release.name}`,
          error,
        );
      }
    }

    await finishProcessing(processingId, {
      status: "completed",
      gamesFound: releases.length,
      gamesProcessed,
    });

    return {
      gamesFound: releases.length,
      gamesProcessed,
    };
  } catch (error) {
    await finishProcessing(processingId, {
      status: "failed",
      gamesFound: 0,
      gamesProcessed: 0,
      error:
        error instanceof Error
          ? error.message
          : String(error),
    });

    throw error;
  } finally {
    await browser.close();
  }
}