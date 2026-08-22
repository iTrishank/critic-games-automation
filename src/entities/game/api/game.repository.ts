import { eq } from "drizzle-orm";

import { db } from "@/shared/db";
import {
  gamePlatforms,
  games,
} from "@/shared/db/schema";

export type SaveGameData = {
  name: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
  description: string | null;
  videoUrl: string | null;
  criticSummary?: string | null;
  userSummary?: string | null;
  platforms: Array<{
    platform: string;
    metascore: number | null;
    userscore: number | null;
  }>;
};

export async function saveScrapedGame(
  data: SaveGameData,
) {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(games)
      .where(eq(games.slug, data.slug))
      .limit(1);

    let gameId: number;

    if (existing.length > 0) {
      gameId = existing[0].id;

      await tx
        .update(games)
        .set({
          name: data.name,
          coverImage: data.coverImage,
          developer: data.developer,
          description: data.description,
          videoUrl: data.videoUrl,
          criticSummary:
            data.criticSummary ?? existing[0].criticSummary,
          userSummary:
            data.userSummary ?? existing[0].userSummary,
        })
        .where(eq(games.id, gameId));
    } else {
      const result = await tx
        .insert(games)
        .values({
          name: data.name,
          slug: data.slug,
          coverImage: data.coverImage,
          developer: data.developer,
          description: data.description,
          videoUrl: data.videoUrl,
          criticSummary: data.criticSummary ?? null,
          userSummary: data.userSummary ?? null,
        });

      gameId = Number(result[0].insertId);
    }

    await tx
      .delete(gamePlatforms)
      .where(eq(gamePlatforms.gameId, gameId));

    if (data.platforms.length > 0) {
      await tx.insert(gamePlatforms).values(
        data.platforms.map((platform) => ({
          gameId,
          platform: platform.platform,
          metascore: platform.metascore,
          userscore:
            platform.userscore !== null
              ? String(platform.userscore)
              : null,
        })),
      );
    }

    const [savedGame] = await tx
      .select()
      .from(games)
      .where(eq(games.id, gameId))
      .limit(1);

    return savedGame;
  });
}