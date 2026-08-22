import {
  createMetacriticBrowser,
  scrapeGame,
} from "@/entities/game/api/metacritic.scraper";

import { getNewReleaseGames } from "@/entities/game/api/metacritic.releases";

import { saveScrapedGame } from "@/entities/game/api/game.repository";

import { generateSummary } from "@/shared/lib/openai";

import {
  startProcessing,
  finishProcessing,
} from "./processing.repository";

async function withRetry<T>(
  fn: () => Promise<T>,
  {
    retries = 3,
    delayMs = 2000,
    onError,
  }: {
    retries?: number;
    delayMs?: number;
    onError?: (
      error: unknown,
      attempt: number,
    ) => void;
  } = {},
): Promise<T> {
  const attempt = async (
    n: number,
  ): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      onError?.(error, n);

      if (n >= retries) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, n * delayMs),
      );

      return attempt(n + 1);
    }
  };

  return attempt(1);
}

export async function processGames() {
  const processingId = await startProcessing();

  const browser =
    await createMetacriticBrowser();

  try {
    // Process the 20 latest releases.
    const releases =
      await getNewReleaseGames(20);

    let gamesProcessed = 0;

    for (const release of releases) {
      try {
        console.log(
          `\nProcessing: ${release.name}`,
        );

        console.log(release.url);

        const game = await withRetry(
          () =>
            scrapeGame(
              browser,
              release.url,
            ),
          {
            retries: 3,
            delayMs: 2000,
            onError: (
              error,
              attempt,
            ) => {
              console.error(
                `Attempt ${attempt}/3 failed for ${release.name}`,
                error,
              );
            },
          },
        );

        const criticSummary =
          game.criticReviews.length > 0
            ? await generateSummary(
                game.criticReviews.map(
                  (review) => review.text,
                ),
                "critic",
              )
            : null;

        const userSummary =
          game.userReviews.length > 0
            ? await generateSummary(
                game.userReviews.map(
                  (review) => review.text,
                ),
                "user",
              )
            : null;

        await saveScrapedGame({
          name: game.name,
          slug: game.slug,
          coverImage: game.coverImage,
          developer: game.developer,
          description: game.description,
          videoUrl: game.videoUrl,
          criticSummary,
          userSummary,
          platforms: game.platforms,
        });

        gamesProcessed++;

        console.log(
          `✓ Saved: ${game.name}`,
        );
      } catch (error) {
        console.error(
          `✗ Failed: ${release.name}`,
          error,
        );
      }
    }

    await finishProcessing(
      processingId,
      {
        status: "completed",
        gamesFound: releases.length,
        gamesProcessed,
      },
    );

    return {
      gamesFound: releases.length,
      gamesProcessed,
    };
  } catch (error) {
    await finishProcessing(
      processingId,
      {
        status: "failed",
        gamesFound: 0,
        gamesProcessed: 0,
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
    );

    throw error;
  } finally {
    await browser.close();
  }
}