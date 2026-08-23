import { NextResponse } from "next/server";
import { desc} from "drizzle-orm";

import { getDb } from "@/shared/db";
import {
  gamePlatforms,
  games,
  processingHistory,
} from "@/shared/db/schema";

export async function GET() {
  try {
    const gameRows = await getDb()
      .select()
      .from(games)
      .orderBy(desc(games.updatedAt));

    const platformRows = await getDb()
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

export async function DELETE() {
  try {
    await getDb().delete(gamePlatforms);
    await getDb().delete(games);
    await getDb().delete(processingHistory);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Failed to reset database:", error);

    return NextResponse.json(
      {
        error: "Failed to reset database",
      },
      {
        status: 500,
      },
    );
  }
}