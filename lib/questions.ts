export const quizCategories = [
  { id: "general", name: "General knowledge", short: "General", icon: "globe", color: "mint", description: "Mixed Open Trivia questions", apiCategoryId: 9, sourceLabel: "General Knowledge" },
  { id: "reasoning", name: "Logical reasoning", short: "Reasoning", icon: "brain", color: "lilac", description: "Math & pattern challenges", apiCategoryId: 19, sourceLabel: "Math-based reasoning" },
  { id: "math", name: "Mathematics", short: "Mathematics", icon: "calculator", color: "peach", description: "Fresh questions from the API", apiCategoryId: 19, sourceLabel: "Science: Mathematics" },
  { id: "tnpsc", name: "TNPSC preparation", short: "TNPSC", icon: "landmark", color: "blue", description: "Past-paper Tamil & history practice", apiCategoryId: 23, sourceLabel: "History" },
  { id: "upsc", name: "UPSC preparation", short: "UPSC", icon: "book", color: "yellow", description: "Politics & civics practice", apiCategoryId: 24, sourceLabel: "Politics" },
  { id: "wordgame", name: "Word game", short: "Word game", icon: "brain", color: "rose", description: "Connect 15 words in 60 seconds", apiCategoryId: null, sourceLabel: "Word search" },
] as const

export type CategoryId = (typeof quizCategories)[number]["id"]
export type DifficultyLevel = "easy" | "medium" | "hard"
export type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  answer: string
  explanation: string
  sourceCategory: string
  difficulty: string
  image?: string
  visualId?: string
  alt?: string
  wordPath?: number[]
}

export type QuizAttempt = {
  id: string
  category: CategoryId
  expiresAt: number
  questions: QuizQuestion[]
}
