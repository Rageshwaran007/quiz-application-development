import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { decode } from "he"
import { quizCategories, type CategoryId, type DifficultyLevel, type QuizQuestion } from "@/lib/questions"
import { makePictureQuestions } from "@/lib/picture-questions"
import { makeTnpscTamilQuestions } from "@/lib/tnpsc-tamil-questions"
import { sealQuizAttempt } from "@/lib/quiz-token"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

type OpenTdbResult = {
  response_code: number
  results: Array<{
    type: string
    difficulty: string
    category: string
    question: string
    correct_answer: string
    incorrect_answers: string[]
  }>
}

export async function GET(request: NextRequest) {
  const categoryId = request.nextUrl.searchParams.get("category") as CategoryId | null
  const difficulty = request.nextUrl.searchParams.get("difficulty") as DifficultyLevel | null
  const selectedCategory = quizCategories.find((category) => category.id === categoryId)
  if (!selectedCategory || !selectedCategory.apiCategoryId) return NextResponse.json({ error: "Choose a valid trivia category." }, { status: 400 })
  if (!difficulty || !["easy", "medium", "hard"].includes(difficulty)) {
    return NextResponse.json({ error: "Choose an easy, medium, or hard level." }, { status: 400 })
  }

  try {
    const url = new URL("https://opentdb.com/api.php")
    const triviaAmount = categoryId === "tnpsc" ? 5 : 10
    url.searchParams.set("amount", String(triviaAmount))
    url.searchParams.set("category", String(selectedCategory.apiCategoryId))
    url.searchParams.set("difficulty", difficulty)
    url.searchParams.set("encode", "url3986")
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15_000) })
    if (!response.ok) throw new Error("The trivia service is unavailable right now.")

    const data = (await response.json()) as OpenTdbResult
    if (data.response_code !== 0 || data.results?.length !== triviaAmount) {
      const message = data.response_code === 5
        ? "The trivia service is busy. Wait a few seconds and try again."
        : `Open Trivia DB could not find enough ${difficulty} questions in this category. Try another level or category.`
      return NextResponse.json({ error: message }, { status: data.response_code === 5 ? 429 : 502 })
    }

    const triviaQuestions: QuizQuestion[] = data.results.map((result) => {
      const correct = decode(decodeURIComponent(result.correct_answer))
      return {
        id: randomUUID(),
        prompt: decode(decodeURIComponent(result.question)),
        options: shuffle([correct, ...result.incorrect_answers.map((answer) => decode(decodeURIComponent(answer)))]),
        answer: correct,
        explanation: `Open Trivia Database category: ${decode(decodeURIComponent(result.category))}.`,
        sourceCategory: decode(decodeURIComponent(result.category)),
        difficulty: result.difficulty,
      }
    })

    const pictureQuestions: QuizQuestion[] = shuffle(makePictureQuestions(categoryId!, difficulty)).map((question) => ({
      id: `${question.id}-${randomUUID()}`,
      prompt: question.prompt,
      options: shuffle(question.options),
      answer: question.answer,
      explanation: question.explanation,
      sourceCategory: question.sourceCategory,
      difficulty,
      image: question.image,
      visualId: question.visualId,
      alt: question.alt,
    }))

    const tamilQuestions = categoryId === "tnpsc" ? makeTnpscTamilQuestions(difficulty) : []
    const trivia = shuffle(triviaQuestions)
    let pictureIndex = 0
    let tamilIndex = 0
    let triviaIndex = 0
    const questions = Array.from({ length: 15 }, (_, index) => {
      if (index % 3 === 0) return pictureQuestions[pictureIndex++]
      if (categoryId === "tnpsc" && index % 3 === 1) return tamilQuestions[tamilIndex++]
      return trivia[triviaIndex++]
    })
    const attempt = { id: randomUUID(), category: categoryId!, expiresAt: Date.now() + 30 * 60 * 1000, questions }
    const attemptToken = sealQuizAttempt(attempt)
    return NextResponse.json({
      category: categoryId,
      difficulty,
      source: selectedCategory.sourceLabel,
      attemptToken,
      questions: questions.map(({ id, prompt, options, sourceCategory, difficulty: level, image, visualId, alt }) => ({
        id, prompt, options, sourceCategory, difficulty: level, image, visualId, alt,
      })),
    })
  } catch {
    return NextResponse.json({ error: "Could not reach the trivia service. Check your connection and try again." }, { status: 502 })
  }
}
