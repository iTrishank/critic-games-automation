import { processGames } from "./process-games";

let intervalId: NodeJS.Timeout | null = null;
let intervalHours: number | null = null;
let running = false;

export function getSchedulerStatus() {
  return {
    active: intervalId !== null,
    intervalHours,
    running,
  };
}

export function startScheduler(hours: number) {
  if (!Number.isFinite(hours) || hours <= 0) {
    throw new Error("Interval must be greater than 0 hours.");
  }

  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalHours = hours;

  intervalId = setInterval(
    async () => {
      if (running) {
        console.log("Scheduled processing skipped: previous run is still active.");
        return;
      }

      running = true;

      try {
        console.log(
          `Scheduled processing started (${intervalHours} hour interval).`,
        );

        await processGames();

        console.log("Scheduled processing completed.");
      } catch (error) {
        console.error("Scheduled processing failed:", error);
      } finally {
        running = false;
      }
    },
    hours * 60 * 60 * 1000,
  );

  return getSchedulerStatus();
}

export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
  }

  intervalId = null;
  intervalHours = null;

  return getSchedulerStatus();
}