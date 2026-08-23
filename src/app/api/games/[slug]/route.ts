import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/shared/db";
import { games } from "@/shared/db/schema";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const { slug } = await params;

    const result = await db
      .select()
      .from(games)
      .where(eq(games.slug, slug))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        {
          error: "Game not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Failed to fetch game:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch game",
      },
      {
        status: 500,
      },
    );
  }
}