import { getDb } from "@/shared/db";
import { games, gamePlatforms } from "@/shared/db/schema";
import { eq, ne } from "drizzle-orm";

export async function getSimilarGames(gameId: number) {
  const currentPlatforms = await getDb()
    .select()
    .from(gamePlatforms)
    .where(eq(gamePlatforms.gameId, gameId));

  const platformNames = currentPlatforms.map((item) => item.platform);

  if (platformNames.length === 0) {
    return [];
  }

  const allGames = await getDb()
    .select()
    .from(games)
    .where(ne(games.id, gameId));

  const allPlatforms = await getDb()
    .select()
    .from(gamePlatforms);

  const scored = allGames.map((game) => {
    const gamePlatformNames = allPlatforms
      .filter((item) => item.gameId === game.id)
      .map((item) => item.platform);

    const matchingPlatforms = gamePlatformNames.filter((platform) =>
      platformNames.includes(platform),
    ).length;

    return {
      ...game,
      score: matchingPlatforms,
    };
  });

  return scored
    .filter((game) => game.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}