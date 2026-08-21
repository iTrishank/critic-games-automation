import {
  decimal,
  int,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const games = mysqlTable("games", {
  id: int("id").autoincrement().primaryKey(),

  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),

  coverImage: text("cover_image"),
  developer: varchar("developer", { length: 255 }),
  description: text("description"),
  videoUrl: text("video_url"),

  criticSummary: text("critic_summary"),
  userSummary: text("user_summary"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export const gamePlatforms = mysqlTable(
  "game_platforms",
  {
    id: int("id").autoincrement().primaryKey(),

    gameId: int("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),

    platform: varchar("platform", { length: 100 }).notNull(),

    metascore: int("metascore"),
    userscore: decimal("userscore", {
      precision: 3,
      scale: 1,
    }),
  },
  (table) => ({
    gamePlatformUnique: uniqueIndex("game_platform_unique").on(
      table.gameId,
      table.platform,
    ),
  }),
);

export const processingHistory = mysqlTable("processing_history", {
  id: int("id").autoincrement().primaryKey(),

  startedAt: timestamp("started_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),

  status: varchar("status", { length: 30 }).notNull(),

  gamesFound: int("games_found").default(0).notNull(),
  gamesProcessed: int("games_processed").default(0).notNull(),

  error: text("error"),
});