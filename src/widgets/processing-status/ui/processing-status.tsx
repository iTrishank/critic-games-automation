"use client";

import { useEffect, useState } from "react";

type ProcessingStatus = {
  active: boolean;
  intervalHours: number | null;
  running: boolean;
};

type LatestProcessing = {
  status: string;
  gamesFound: number;
  gamesProcessed: number;
};

export function ProcessingStatus() {
  const [status, setStatus] = useState<ProcessingStatus>({
    active: false,
    intervalHours: null,
    running: false,
  });

  const [latest, setLatest] = useState<LatestProcessing | null>(null);
  const [hours, setHours] = useState("1");
  const [loading, setLoading] = useState(false);

  async function loadStatus() {
    try {
      const [schedulerResponse, processingResponse] = await Promise.all([fetch("/api/scheduler"), fetch("/api/processing")]);

      if (schedulerResponse.ok) {
        const scheduler = (await schedulerResponse.json()) as ProcessingStatus;

        setStatus(scheduler);

        if (scheduler.intervalHours) {
          setHours(String(scheduler.intervalHours));
        }
      }

      if (processingResponse.ok) {
        const processing = (await processingResponse.json()) as LatestProcessing | null;

        setLatest(processing);
      }
    } catch (error) {
      console.error("Failed to load processing status:", error);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadStatus();
    }, 0);

    const interval = setInterval(loadStatus, 3000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  async function runNow() {
    setLoading(true);

    try {
      await fetch("/api/processing", {
        method: "POST",
      });

      await loadStatus();
    } catch (error) {
      console.error("Failed to start processing:", error);
    } finally {
      setLoading(false);
    }
  }

  async function startScheduler() {
    const value = Number(hours);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "start",
          hours: value,
        }),
      });

      await loadStatus();
    } catch (error) {
      console.error("Failed to start scheduler:", error);
    } finally {
      setLoading(false);
    }
  }

  async function stopScheduler() {
    setLoading(true);

    try {
      await fetch("/api/scheduler", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "stop",
        }),
      });

      await loadStatus();
    } catch (error) {
      console.error("Failed to stop scheduler:", error);
    } finally {
      setLoading(false);
    }
  }

  async function deleteAllData() {
    const confirmed = window.confirm("Delete all games? This cannot be undone.");

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/games", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete games");
      }

      window.location.reload();
    } catch (error) {
      console.error("Failed to delete games:", error);
    }
  }

  return (
    <div className="mb-6 border border-zinc-800 bg-[#09090b]">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-zinc-400">Processing</p>

          <div className="mt-1 flex items-center gap-2 font-mono text-xs text-zinc-600">
            <span className={status.running ? "text-amber-600" : status.active ? "text-green-600" : "text-zinc-500"}>{status.running ? "running" : status.active ? "scheduled" : latest?.status ?? "idle"}</span>

            {latest && (
              <>
                <span>
                  {latest.gamesProcessed} / {latest.gamesFound} processed
                </span>
              </>
            )}

            {status.active && status.intervalHours && <span>· every {status.intervalHours}h</span>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={runNow} disabled={loading || status.running} className="border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">
            {loading && !status.active ? "Running..." : "Run now"}
          </button>

          <button type="button" onClick={deleteAllData} className="border border-zinc-800 bg-red-900 px-4 py-2 font-mono text-xs text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">
            Delete all
          </button>

          <span className="font-mono text-xs text-zinc-400">every</span>

          <input type="number" min="1" step="1" value={hours} onChange={(event) => setHours(event.target.value)} className="h-9 w-16 border border-zinc-300 bg-white px-2 text-center font-mono text-sm text-zinc-900 outline-none focus:border-zinc-500" />

          <span className="font-mono text-xs text-zinc-400">hours</span>

          {!status.active ? (
            <button type="button" onClick={startScheduler} disabled={loading} className="border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">
              Start
            </button>
          ) : (
            <button type="button" onClick={stopScheduler} disabled={loading} className="border border-zinc-800 bg-zinc-900 px-4 py-2 font-mono text-xs text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50">
              Stop
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
