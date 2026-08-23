"use client";

import Link from "next/link";

type SimilarGame = {
  id: number;
  name: string;
  slug: string;
  coverImage: string | null;
};

type SimilarGamesProps = {
  games: SimilarGame[];
};

export function SimilarGames({ games }: SimilarGamesProps) {
  if (games.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-zinc-800 py-8">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-zinc-600">Similar Games</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {games.map((game) => (
          <Link key={game.id} href={`/games/${game.slug}`} className="flex items-center gap-3 border border-zinc-800 bg-zinc-950 p-3 transition hover:bg-zinc-900">
            <div className="h-16 w-12 shrink-0 overflow-hidden rounded border border-zinc-800 bg-zinc-900">
              {game.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.coverImage} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center font-mono text-xs text-zinc-600">—</div>
              )}
            </div>

            <span className="text-sm font-medium text-zinc-300 hover:text-white">{game.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
