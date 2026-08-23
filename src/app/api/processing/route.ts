import { NextResponse } from "next/server";

import { processGames } from "@/features/run-processing/api/process-games";
import { getLatestProcessing } from "@/features/run-processing/api/processing.repository";

export async function GET() {
  try {
    const processing = await getLatestProcessing();

    return NextResponse.json(processing);
  } catch (error) {
    console.error("Failed to fetch processing status:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch processing status",
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST() {
  try {
    const result = await processGames();

    return NextResponse.json(result);
  } catch (error) {
    console.error("Processing failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Processing failed",
      },
      {
        status: 500,
      },
    );
  }
}