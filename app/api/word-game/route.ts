import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import type { DifficultyLevel } from "@/lib/questions"
import { createWordPuzzle } from "@/lib/word-puzzle"
import { sealQuizAttempt } from "@/lib/quiz-token"
import type { QuizQuestion } from "@/lib/questions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const level = request.nextUrl.searchParams.get("level") as DifficultyLevel | null
  if (!level || !["easy", "medium", "hard"].includes(level)) {
    return NextResponse.json({ error: "Choose an easy, medium, or hard word-game level." }, { status: 400 })
  }

  try {
    const puzzle = createWordPuzzle(level)
    const questions: QuizQuestion[] = puzzle.words.map(({ id, word, path }) => ({
      id,
      prompt: `Find ${word} in the letter grid.`,
      options: [word],
      answer: word,
      explanation: `${word} was hidden in the word grid.`,
      sourceCategory: "Word game",
      difficulty: "60 seconds",
      wordPath: path,
    }))
    const attemptToken = sealQuizAttempt({
      id: randomUUID(),
      category: "wordgame",
      expiresAt: Date.now() + 10 * 60 * 1000,
      questions,
    })

    return NextResponse.json({
      grid: puzzle.grid,
      words: puzzle.words.map(({ id, word }) => ({ id, word })),
      attemptToken,
      seconds: 60,
      level,
    })
  } catch {
    return NextResponse.json({ error: "Could not create a word puzzle. Try again." }, { status: 503 })
  }
}
