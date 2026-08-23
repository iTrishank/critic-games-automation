import { NextResponse } from "next/server";
import { desc} from "drizzle-orm";

import { db } from "@/shared/db";
import { gamePlatforms, games } from "@/shared/db/schema";

export async function GET() {
  try {
    const gameRows = await db
      .select()
      .from(games)
      .orderBy(desc(games.updatedAt));

    const platformRows = await db
      .select()
      .from(gamePlatforms);

    const result = gameRows.map((game) => ({
      ...game,
      platforms: platformRows
        .filter((platform) => platform.gameId === game.id)
        .map((platform) => ({
          platform: platform.platform,
          metascore: platform.metascore,
          userscore: platform.userscore,
        })),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch games:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch games",
      },
      {
        status: 500,
      },
    );
  }
}