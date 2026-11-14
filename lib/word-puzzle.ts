import { randomUUID } from "node:crypto"
import type { DifficultyLevel } from "@/lib/questions"

const WORD_BANK = [
  "KNOWLEDGE", "CURIOSITY", "LANGUAGE", "HISTORY", "PUZZLE", "MEMORY", "SCIENCE", "MATHS",
  "TAMIL", "CIVICS", "GALAXY", "NATURE", "RIDDLE", "POETRY", "LOGIC", "ANSWER", "IDEA",
  "STUDY", "WISDOM", "STORY", "LEARN", "PLANET", "CULTURE", "BRIGHT", "QUEST", "NUMBER",
  "HERITAGE", "DISCOVER", "THINK", "REASON", "WORD", "BOOK", "FOCUS", "INSIGHT", "EXPLORE",
]
const DIRECTIONS: Record<DifficultyLevel, readonly (readonly [number, number])[]> = {
  easy: [[0, 1], [1, 0]],
  medium: [[0, 1], [1, 0], [1, -1], [1, 1]],
  hard: [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]],
}
const GRID_SIZES: Record<DifficultyLevel, number> = { easy: 14, medium: 16, hard: 18 }

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

function placeWord(grid: string[][], word: string, gridSize: number, directions: readonly (readonly [number, number])[]) {
  for (let attempt = 0; attempt < 500; attempt++) {
    const [rowStep, columnStep] = directions[Math.floor(Math.random() * directions.length)]
    const row = Math.floor(Math.random() * gridSize)
    const column = Math.floor(Math.random() * gridSize)
    const endRow = row + (word.length - 1) * rowStep
    const endColumn = column + (word.length - 1) * columnStep
    if (endRow < 0 || endRow >= gridSize || endColumn < 0 || endColumn >= gridSize) continue

    const path = Array.from({ length: word.length }, (_, index) => {
      const nextRow = row + index * rowStep
      const nextColumn = column + index * columnStep
      return nextRow * gridSize + nextColumn
    })
    const fits = path.every((cellIndex, index) => {
      const current = grid[Math.floor(cellIndex / gridSize)][cellIndex % gridSize]
      return current === "" || current === word[index]
    })
    if (!fits) continue

    path.forEach((cellIndex, index) => {
      grid[Math.floor(cellIndex / gridSize)][cellIndex % gridSize] = word[index]
    })
    return path
  }
  return null
}

export function createWordPuzzle(level: DifficultyLevel) {
  const gridSize = GRID_SIZES[level]
  const directions = DIRECTIONS[level]
  const words = shuffle(WORD_BANK).slice(0, 15).map((word) => ({ id: randomUUID(), word }))

  for (let restart = 0; restart < 30; restart++) {
    const grid = Array.from({ length: gridSize }, () => Array<string>(gridSize).fill(""))
    const paths = new Map<string, number[]>()
    let placedAllWords = true

    for (const { word } of [...words].sort((first, second) => second.word.length - first.word.length)) {
      const path = placeWord(grid, word, gridSize, directions)
      if (!path) {
        placedAllWords = false
        break
      }
      paths.set(word, path)
    }

    if (!placedAllWords) continue
    for (const row of grid) {
      for (let column = 0; column < row.length; column++) {
        if (!row[column]) row[column] = String.fromCharCode(65 + Math.floor(Math.random() * 26))
      }
    }

    return {
      grid,
      words: words.map(({ id, word }) => ({ id, word, path: paths.get(word)! })),
    }
  }

  throw new Error("Could not create a word puzzle. Please try again.")
}
