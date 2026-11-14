import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { quizScores } from "@/lib/db/schema"
import { quizCategories, type CategoryId } from "@/lib/questions"
import { openQuizAttempt } from "@/lib/quiz-token"

export const runtime = "nodejs"

function pathMatches(expected: number[] | undefined, submitted: number[] | undefined) {
  if (!expected || !submitted || expected.length !== submitted.length) return false
  const forward = expected.every((cell, index) => cell === submitted[index])
  const reverse = expected.every((cell, index) => cell === submitted[expected.length - index - 1])
  return forward || reverse
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const name = typeof body.name === "string" ? body.name.trim().replace(/\s+/g, " ") : ""
    if (name.length < 2 || name.length > 30 || !/^[\p{L}\p{M} .'-]+$/u.test(name)) {
      return NextResponse.json({ error: "Enter a name between 2 and 30 letters." }, { status: 400 })
    }
    if (typeof body.attemptToken !== "string" || typeof body.category !== "string" || !Array.isArray(body.answers) || body.answers.length !== 15) {
      return NextResponse.json({ error: "This quiz submission is invalid." }, { status: 400 })
    }

    let attempt
    try {
      attempt = openQuizAttempt(body.attemptToken)
    } catch {
      return NextResponse.json({ error: "This quiz attempt expired. Start a fresh quiz." }, { status: 400 })
    }
    const category = body.category as CategoryId
    if (attempt.category !== category || !quizCategories.some((item) => item.id === category)) {
      return NextResponse.json({ error: "This quiz submission does not match its attempt." }, { status: 400 })
    }

    const submitted = new Map<string, { answer: string; path?: number[] }>()
    for (const entry of body.answers) {
      const invalidPath = entry?.path !== undefined && (!Array.isArray(entry.path) || entry.path.length > 16 || entry.path.some((cell: unknown) => !Number.isInteger(cell) || Number(cell) < 0 || Number(cell) >= 324))
      if (!entry || typeof entry.id !== "string" || typeof entry.answer !== "string" || submitted.has(entry.id) || invalidPath) {
        return NextResponse.json({ error: "This quiz submission is invalid." }, { status: 400 })
      }
      submitted.set(entry.id, { answer: entry.answer, path: entry.path as number[] | undefined })
    }
    if (submitted.size !== attempt.questions.length || attempt.questions.some((question) => !submitted.has(question.id))) {
      return NextResponse.json({ error: "Answer all 15 questions before submitting." }, { status: 400 })
    }

    const review = attempt.questions.map((question) => {
      const entry = submitted.get(question.id) ?? { answer: "" }
      const selected = entry.answer
      if (selected && !question.options.includes(selected)) throw new Error("Invalid answer selection.")
      const correct = category === "wordgame"
        ? selected === question.answer && pathMatches(question.wordPath, entry.path)
        : selected === question.answer
      return {
        id: question.id,
        question: question.prompt,
        correct,
        answer: question.answer,
        selectedAnswer: category === "wordgame" && selected && !correct ? "Incorrect letter path" : selected,
        explanation: question.explanation,
        image: question.image,
        visualId: question.visualId,
        alt: question.alt,
      }
    })
    const score = review.filter((item) => item.correct).length

    await db.insert(quizScores).values({ playerName: name, category, score })
    return NextResponse.json({ score, total: 15, review })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save this score. Please try again."
    if (message.includes("expired") || message.includes("Invalid quiz token")) {
      return NextResponse.json({ error: "This quiz attempt expired. Start a fresh quiz." }, { status: 400 })
    }
    if (message.includes("Invalid answer")) return NextResponse.json({ error: message }, { status: 400 })
    return NextResponse.json({ error: "Could not save this score. Please try again." }, { status: 503 })
  }
}
