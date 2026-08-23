import { NextResponse } from "next/server";

import { db } from "@/shared/db";
import { gamePlatforms, games } from "@/shared/db/schema";
import { eq, ne } from "drizzle-orm";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const currentGame = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (!currentGame[0]) {
      return NextResponse.json(
        { error: "Game not found" },
        { status: 404 },
      );
    }

    const currentPlatforms = await db
      .select()
      .from(gamePlatforms)
      .where(eq(gamePlatforms.gameId, currentGame[0].id));

    const platformNames = currentPlatforms.map(
      (platform) => platform.platform,
    );

    if (platformNames.length === 0) {
      return NextResponse.json([]);
    }

    const otherGames = await db
      .select()
      .from(games)
      .where(ne(games.id, currentGame[0].id));

    const otherPlatforms = await db
      .select()
      .from(gamePlatforms);

    const similar = otherGames
      .map((game) => {
        const matchingPlatforms = otherPlatforms.filter(
          (platform) =>
            platform.gameId === game.id &&
            platformNames.includes(platform.platform),
        ).length;

        return {
          id: game.id,
          name: game.name,
          slug: game.slug,
          coverImage: game.coverImage,
          score: matchingPlatforms,
        };
      })
      .filter((game) => game.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((game) => ({
  id: game.id,
  name: game.name,
  slug: game.slug,
  coverImage: game.coverImage,
}));

    return NextResponse.json(similar);
  } catch (error) {
    console.error("Failed to fetch similar games:", error);

    return NextResponse.json(
      { error: "Failed to fetch similar games" },
      { status: 500 },
    );
  }
}