"use client";

import { useEffect, useState } from "react";

import { GameTable } from "@/widgets/game-list/ui/game-table";

type Game = {
  id: number;
  name: string;
  slug: string;
  coverImage: string | null;
  developer: string | null;
  description: string | null;
  videoUrl: string | null;
  criticSummary: string | null;
  userSummary: string | null;
  createdAt: string;
  updatedAt: string;

  platforms: {
    platform: string;
    metascore: number | null;
    userscore: string | null;
  }[];
};

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        const response = await fetch("/api/games");

        if (!response.ok) {
          throw new Error("Failed to load games");
        }

        const data = (await response.json()) as Game[];

        setGames(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load games");
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  return (
    <main className="min-h-screen bg-[#0b0d10] text-zinc-100">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <header className="mb-6">
          <div className="flex items-end justify-between border-b border-zinc-800 pb-4">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">Database</p>

              <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Critic Games</h1>
            </div>

            <div className="font-mono text-sm text-zinc-500">{games.length} games</div>
          </div>
        </header>

        {loading && <div className="border border-zinc-800 bg-[#111418] px-4 py-8 text-center font-mono text-sm text-zinc-500">Loading games...</div>}

        {error && <div className="border border-red-900/50 bg-red-950/30 px-4 py-4 text-sm text-red-400">{error}</div>}

        {!loading && !error && <GameTable games={games} />}
      </div>
    </main>
  );
}
