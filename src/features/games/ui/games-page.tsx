"use client";

import { useEffect, useState } from "react";

import { GameTable } from "@/widgets/game-list/ui/game-table";
import { ProcessingStatus } from "@/widgets/processing-status/ui/processing-status";
import { GameFilters } from "@/widgets/game-filters/ui/game-filters";

type Game = {
  id: number;
  name: string;
  slug: string;
  platforms: {
    platform: string;
    metascore: number | null;
    userscore: string | null;
  }[];
  coverImage: string | null;
  developer: string | null;
  description: string | null;
  videoUrl: string | null;
  criticSummary: string | null;
  userSummary: string | null;
  createdAt: string;
  updatedAt: string;
};

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [sort, setSort] = useState("updated");

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

  const availablePlatforms = Array.from(new Set(games.flatMap((game) => game.platforms.map((item) => item.platform)))).sort();

  const filteredGames = [...games]
    .filter((game) => game.name.toLowerCase().includes(search.toLowerCase()))
    .filter((game) => platform === "all" || game.platforms.some((item) => item.platform === platform))
    .sort((a, b) => {
      if (sort === "added") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }

      if (sort === "metascore-desc" || sort === "metascore-asc") {
        const aScore = Math.max(...a.platforms.map((item) => item.metascore ?? -1));

        const bScore = Math.max(...b.platforms.map((item) => item.metascore ?? -1));

        return sort === "metascore-desc" ? bScore - aScore : aScore - bScore;
      }

      if (sort === "userscore-desc" || sort === "userscore-asc") {
        const aScore = Math.max(...a.platforms.map((item) => Number(item.userscore) || -1));

        const bScore = Math.max(...b.platforms.map((item) => Number(item.userscore) || -1));

        return sort === "userscore-desc" ? bScore - aScore : aScore - bScore;
      }

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-widest text-zinc-400">Database by Trishank Singh</p>

              <h1 className="text-2xl font-semibold tracking-tight">Critic Games</h1>
            </div>

            <div className="font-mono text-sm text-zinc-500">{games.length} games</div>
          </div>
        </header>

        <ProcessingStatus />

        {loading && <div className="border border-zinc-800 bg-zinc-950 px-4 py-8 text-center font-mono text-sm text-zinc-500">Loading games...</div>}

        {error && <div className="border border-red-900 bg-red-950/30 px-4 py-4 text-sm text-red-400">{error}</div>}

        {!loading && !error && (
          <>
            <GameFilters search={search} platform={platform} sort={sort} platforms={availablePlatforms} onSearchChange={setSearch} onPlatformChange={setPlatform} onSortChange={setSort} />

            <GameTable games={filteredGames} />
          </>
        )}
      </div>
    </main>
  );
}
