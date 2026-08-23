"use client";

import { useEffect, useState } from "react";

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
};

type GameDetailsPageProps = {
  slug: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function GameDetailsPage({ slug }: GameDetailsPageProps) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGame() {
      try {
        const response = await fetch(`/api/games/${slug}`);

        if (!response.ok) {
          throw new Error("Failed to load game");
        }

        const data = (await response.json()) as Game;

        setGame(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to load game");
      } finally {
        setLoading(false);
      }
    }

    loadGame();
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090a0b] px-8 py-10 text-zinc-300">
        <div className="mx-auto max-w-[1200px] font-mono text-sm text-zinc-500">Loading record...</div>
      </main>
    );
  }

  if (error || !game) {
    return (
      <main className="min-h-screen bg-[#090a0b] px-8 py-10 text-zinc-300">
        <div className="mx-auto max-w-[1200px]">
          <p className="font-mono text-sm text-red-400">{error ?? "Game not found"}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090a0b] text-zinc-300">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        <header className="mb-8 border-b border-zinc-800 pb-5">
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-zinc-600">Database / Games / Record</p>

          <div className="flex items-end justify-between">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">{game.name}</h1>

            <span className="font-mono text-xs text-zinc-600">#{game.id}</span>
          </div>
        </header>

        <section className="grid grid-cols-[180px_1fr] gap-8 border-b border-zinc-800 pb-8">
          <div className="h-[240px] w-[180px] overflow-hidden rounded border border-zinc-800 bg-zinc-900">
            {game.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={game.coverImage} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-xs text-zinc-600">No cover</div>
            )}
          </div>

          <div>
            <dl className="grid grid-cols-[120px_1fr] border-t border-zinc-800 text-sm">
              <dt className="border-b border-zinc-800 py-3 font-mono text-xs uppercase text-zinc-600">Developer</dt>

              <dd className="border-b border-zinc-800 py-3 text-zinc-300">{game.developer ?? "—"}</dd>

              <dt className="border-b border-zinc-800 py-3 font-mono text-xs uppercase text-zinc-600">Added</dt>

              <dd className="border-b border-zinc-800 py-3 font-mono text-xs text-zinc-400">{formatDate(game.createdAt)}</dd>

              <dt className="border-b border-zinc-800 py-3 font-mono text-xs uppercase text-zinc-600">Updated</dt>

              <dd className="border-b border-zinc-800 py-3 font-mono text-xs text-zinc-400">{formatDate(game.updatedAt)}</dd>

              <dt className="py-3 font-mono text-xs uppercase text-zinc-600">Slug</dt>

              <dd className="py-3 font-mono text-xs text-zinc-500">{game.slug}</dd>
            </dl>
          </div>
        </section>

        <section className="border-b border-zinc-800 py-8">
          <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">Description</h2>

          <p className="max-w-4xl text-sm leading-7 text-zinc-400">{game.description ?? "No description available."}</p>
        </section>

        <section className="grid gap-8 py-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">Critics</h2>

            <div className="border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm leading-7 text-zinc-400">{game.criticSummary ?? "No critic summary available."}</p>
            </div>
          </div>

          <div>
            <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">Players</h2>

            <div className="border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm leading-7 text-zinc-400">{game.userSummary ?? "No player summary available."}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
