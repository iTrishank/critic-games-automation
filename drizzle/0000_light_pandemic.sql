CREATE TABLE `game_platforms` (
	`id` int AUTO_INCREMENT NOT NULL,
	`game_id` int NOT NULL,
	`platform` varchar(100) NOT NULL,
	`metascore` int,
	`userscore` decimal(3,1),
	CONSTRAINT `game_platforms_id` PRIMARY KEY(`id`),
	CONSTRAINT `game_platform_unique` UNIQUE(`game_id`,`platform`)
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`cover_image` text,
	`developer` varchar(255),
	`description` text,
	`video_url` text,
	`critic_summary` text,
	`user_summary` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `games_id` PRIMARY KEY(`id`),
	CONSTRAINT `games_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `processing_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`started_at` timestamp NOT NULL DEFAULT (now()),
	`finished_at` timestamp,
	`status` varchar(30) NOT NULL,
	`games_found` int NOT NULL DEFAULT 0,
	`games_processed` int NOT NULL DEFAULT 0,
	`error` text,
	CONSTRAINT `processing_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `game_platforms` ADD CONSTRAINT `game_platforms_game_id_games_id_fk` FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON DELETE cascade ON UPDATE no action;