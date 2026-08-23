"use client";

type GameFiltersProps = {
  search: string;
  platform: string;
  sort: string;
  platforms: string[];
  onSearchChange: (value: string) => void;
  onPlatformChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function GameFilters({ search, platform, sort, platforms, onSearchChange, onPlatformChange, onSortChange }: GameFiltersProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 border border-zinc-800 bg-[#09090b] p-3">
      <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search game..." className="h-9 w-64 border border-zinc-800 bg-zinc-900 px-3 font-mono text-xs text-zinc-200 outline-none placeholder:text-zinc-600 focus:border-zinc-600" />

      <select value={platform} onChange={(event) => onPlatformChange(event.target.value)} className="h-9 border border-zinc-800 bg-zinc-900 px-3 font-mono text-xs text-zinc-300 outline-none">
        <option value="all">All platforms</option>

        {platforms.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>

      <select value={sort} onChange={(event) => onSortChange(event.target.value)} className="h-9 border border-zinc-800 bg-zinc-900 px-3 font-mono text-xs text-zinc-300 outline-none">
        <option value="updated">Updated</option>
        <option value="added">Added</option>
        <option value="metascore-desc">Metascore ↓</option>
        <option value="metascore-asc">Metascore ↑</option>
        <option value="userscore-desc">Userscore ↓</option>
        <option value="userscore-asc">Userscore ↑</option>
      </select>
    </div>
  );
}
