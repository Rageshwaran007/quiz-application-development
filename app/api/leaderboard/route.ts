import { NextResponse } from "next/server"
import { asc, desc, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { quizScores } from "@/lib/db/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const playerKey = sql`lower(btrim(${quizScores.playerName}))`
    const points = sql<number>`coalesce(sum(${quizScores.score}), 0)::int`
    const attempts = sql<number>`count(*)::int`
    const subjects = sql<number>`count(distinct ${quizScores.category})::int`
    const leaderboard = await db.select({
      name: sql<string>`min(${quizScores.playerName})`,
      points,
      attempts,
      subjects,
    }).from(quizScores)
      .groupBy(playerKey)
      .orderBy(desc(points), desc(attempts), asc(sql`min(${quizScores.playerName})`))
      .limit(10)

    return NextResponse.json({ leaderboard })
  } catch {
    return NextResponse.json({ error: "The scoreboard is temporarily unavailable." }, { status: 503 })
  }
}
