import { index, integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const quizScores = pgTable("quiz_scores", {
  id: uuid("id").defaultRandom().primaryKey(),
  playerName: text("player_name").notNull(),
  category: text("category").notNull(),
  score: integer("score").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [index("quiz_scores_score_created_idx").on(table.score, table.createdAt)])
