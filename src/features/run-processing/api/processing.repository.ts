import { desc, eq } from "drizzle-orm";

import { db } from "@/shared/db";
import { processingHistory } from "@/shared/db/schema";

export async function startProcessing() {
  const result = await db.insert(processingHistory).values({
    status: "running",
    gamesFound: 0,
    gamesProcessed: 0,
  });

  return result[0].insertId;
}

export async function finishProcessing(
  id: number,
  data: {
    status: string;
    gamesFound: number;
    gamesProcessed: number;
    error?: string;
  },
) {
  await db
    .update(processingHistory)
    .set({
      status: data.status,
      gamesFound: data.gamesFound,
      gamesProcessed: data.gamesProcessed,
      error: data.error ?? null,
      finishedAt: new Date(),
    })
    .where(eq(processingHistory.id, id));
}

export async function getLatestProcessing() {
  const result = await db
    .select()
    .from(processingHistory)
    .orderBy(desc(processingHistory.id))
    .limit(1);

  return result[0] ?? null;
}