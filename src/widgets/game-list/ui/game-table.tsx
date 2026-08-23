"use client";

import Link from "next/link";
//import type { ReactNode } from "react";

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
  createdAt: string | Date;
  updatedAt: string | Date;

  platforms: {
    platform: string;
    metascore: number | null;
    userscore: string | null;
  }[];
};

type GameTableProps = {
  games: Game[];
};

function formatDate(value: string | Date) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// function Status({ children }: { children: ReactNode }) {
//   return <span className="inline-flex items-center rounded border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-300">{children}</span>;
// }

function formatMetascores(platforms: Game["platforms"]) {
  return platforms
    .filter((item) => item.metascore !== null)
    .map((item) => `${item.platform} ${item.metascore}`)
    .join(" · ");
}

function formatUserscores(platforms: Game["platforms"]) {
  return platforms
    .filter((item) => item.userscore !== null)
    .map((item) => `${item.platform} ${item.userscore}`)
    .join(" · ");
}

export function GameTable({ games }: GameTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800 bg-[#09090b]">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-zinc-800 bg-zinc-900 text-left text-xs uppercase tracking-wide text-zinc-500">
            <th className="w-16 px-4 py-3 font-medium">ID</th>
            <th className="px-4 py-3 font-medium">Game</th>
            <th className="px-4 py-3 font-medium">Developer</th>
            <th className="px-4 py-3 font-medium">Critics</th>
            <th className="px-4 py-3 font-medium">Players</th>
            <th className="px-4 py-3 font-medium">Added</th>
            <th className="px-4 py-3 font-medium">Updated</th>
          </tr>
        </thead>

        <tbody>
          {games.map((game) => (
            <tr key={game.id} className="border-b border-zinc-900 last:border-0 hover:bg-zinc-900/60">
              <td className="px-4 py-3 font-mono text-xs text-zinc-600">#{game.id}</td>

              <td className="px-4 py-3">
                <Link href={`/games/${game.slug}`} className="flex items-center gap-3">
                  <div className="h-10 w-8 shrink-0 overflow-hidden rounded border border-zinc-800 bg-zinc-900">
                    {game.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={game.coverImage} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[9px] text-zinc-600">—</div>
                    )}
                  </div>

                  <span className="font-medium text-zinc-200 hover:text-white hover:underline">{game.name}</span>
                </Link>
              </td>

              <td className="px-4 py-3 text-zinc-400">{game.developer ?? "—"}</td>

              <td className="px-4 py-3 font-mono text-xs text-zinc-400">{formatMetascores(game.platforms) || <span className="text-zinc-700">—</span>}</td>

              <td className="px-4 py-3 font-mono text-xs text-zinc-400">{formatUserscores(game.platforms) || <span className="text-zinc-700">—</span>}</td>

              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-500">{formatDate(game.createdAt)}</td>

              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-zinc-500">{formatDate(game.updatedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
