import { NextResponse } from "next/server";

import {
  getSchedulerStatus,
  startScheduler,
  stopScheduler,
} from "@/features/run-processing/api/scheduler";

export async function GET() {
  return NextResponse.json(getSchedulerStatus());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: "start" | "stop";
      hours?: number;
    };

    if (body.action === "stop") {
      return NextResponse.json(stopScheduler());
    }

    if (body.action === "start") {
      return NextResponse.json(
        startScheduler(Number(body.hours)),
      );
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Scheduler error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update scheduler",
      },
      { status: 500 },
    );
  }
}