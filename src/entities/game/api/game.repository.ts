import { eq } from "drizzle-orm";

import { db } from "@/shared/db";
import { games } from "@/shared/db/schema";

export async function createGame(data: {
  name: string;
  slug: string;
  coverImage?: string;
  developer?: string;
  description?: string;
  videoUrl?: string;
}) {
  const [result] = await db.insert(games).values(data);

  return result;
}

export async function getGameBySlug(slug: string) {
  const result = await db
    .select()
    .from(games)
    .where(eq(games.slug, slug))
    .limit(1);

  return result[0] ?? null;
}