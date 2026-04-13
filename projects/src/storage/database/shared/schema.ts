import { pgTable, serial, timestamp, text, index, integer } from "drizzle-orm/pg-core"

export const users = pgTable(
	"users",
	{
		id: serial("id").primaryKey(),
		username: text("username").notNull().unique(),
		password: text("password").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("users_username_idx").on(table.username),
	]
);

export const gameRecords = pgTable(
	"game_records",
	{
		id: serial("id").primaryKey(),
		user_id: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		scenario: text("scenario").notNull(),
		final_score: integer("final_score").notNull(),
		result: text("result").notNull(), // "success" | "failure"
		played_at: timestamp("played_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("game_records_user_id_idx").on(table.user_id),
		index("game_records_played_at_idx").on(table.played_at),
	]
);

export const blogPosts = pgTable(
	"blog_posts",
	{
		id: serial("id").primaryKey(),
		title: text("title").notNull(),
		slug: text("slug").notNull().unique(),
		summary: text("summary").notNull(),
		content: text("content").notNull(),
		created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [
		index("blog_posts_slug_idx").on(table.slug),
		index("blog_posts_created_at_idx").on(table.created_at),
	]
);
