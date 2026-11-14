"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { KeyboardEvent, PointerEvent } from "react"
import { ArrowLeft, Check, Clock3, RotateCcw, Sparkles, Star } from "lucide-react"
import type { DifficultyLevel } from "@/lib/questions"

export type WordGamePuzzle = {
  grid: string[][]
  words: { id: string; word: string }[]
  attemptToken: string
  seconds: number
  level: DifficultyLevel
}

type WordGameResult = {
  score: number
  total: number
  review: { id: string; question: string; correct: boolean; answer: string; selectedAnswer: string; explanation: string }[]
}

type FoundPaths = Record<string, number[]>

export function WordGameView({ puzzle, playerName, onExit, onDone }: {
  puzzle: WordGamePuzzle
  playerName: string
  onExit: () => void
  onDone: (result: WordGameResult) => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(puzzle.seconds)
  const [selection, setSelection] = useState<number[]>([])
  const [activeCell, setActiveCell] = useState(0)
  const [foundPaths, setFoundPaths] = useState<FoundPaths>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const gridRef = useRef<HTMLDivElement>(null)
  const selectionRef = useRef<number[]>([])
  const foundPathsRef = useRef<FoundPaths>({})
  const pointerRef = useRef<{ start: number; moved: boolean } | null>(null)
  const suppressClickRef = useRef(false)
  const submittedRef = useRef(false)
  const submitRef = useRef<(paths: FoundPaths) => Promise<void>>(async () => {})
  const rowLength = puzzle.grid.length
  const cells = puzzle.grid.flat()
  const foundIds = new Set(Object.keys(foundPaths))
  const foundCells = new Set(Object.values(foundPaths).flat())
  const selectedCells = new Set(selection)

  const submitAttempt = useCallback(async (paths: FoundPaths) => {
    if (submittedRef.current) return
    submittedRef.current = true
    setBusy(true)
    setError("")
    try {
      const answers = puzzle.words.map(({ id, word }) => ({
        id,
        answer: paths[id] ? word : "",
        path: paths[id] ?? [],
      }))
      const response = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: playerName, category: "wordgame", attemptToken: puzzle.attemptToken, answers }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Could not save your word-game score.")
      onDone(data as WordGameResult)
    } catch (reason) {
      submittedRef.current = false
      setError(reason instanceof Error ? reason.message : "Could not save your word-game score.")
    } finally {
      setBusy(false)
    }
  }, [onDone, playerName, puzzle.attemptToken, puzzle.words])

  useEffect(() => {
    submitRef.current = submitAttempt
  }, [submitAttempt])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((remaining) => {
        if (remaining <= 1) {
          window.clearInterval(timer)
          window.setTimeout(() => void submitRef.current(foundPathsRef.current), 0)
          return 0
        }
        return remaining - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  function updateSelection(next: number[]) {
    selectionRef.current = next
    setSelection(next)
  }

  function connectPath(path: number[]) {
    const text = path.map((cell) => cells[cell]).join("")
    const reverse = [...text].reverse().join("")
    const match = puzzle.words.find(({ word }) => word === text || word === reverse)
    if (!match || foundPathsRef.current[match.id]) return false

    const next = { ...foundPathsRef.current, [match.id]: path }
    foundPathsRef.current = next
    setFoundPaths(next)
    updateSelection([])
    if (Object.keys(next).length === puzzle.words.length) {
      window.setTimeout(() => void submitRef.current(next), 0)
    }
    return true
  }

  function isAdjacent(first: number, second: number) {
    const rowGap = Math.abs(Math.floor(first / rowLength) - Math.floor(second / rowLength))
    const columnGap = Math.abs((first % rowLength) - (second % rowLength))
    return Math.max(rowGap, columnGap) === 1
  }

  function addCellToPath(cell: number, dragging: boolean) {
    const current = selectionRef.current
    if (current[current.length - 1] === cell || current.includes(cell)) return
    const last = current[current.length - 1]
    if (last !== undefined && !isAdjacent(last, cell)) {
      if (dragging) return
      updateSelection([cell])
      return
    }
    const next = [...current, cell]
    updateSelection(next)
    connectPath(next)
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-cell-index]")
    const index = Number(cell?.dataset.cellIndex)
    if (!cell || !Number.isInteger(index) || busy || secondsLeft === 0) return
    event.preventDefault()
    setActiveCell(index)
    pointerRef.current = { start: index, moved: false }
    gridRef.current?.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (!pointer || busy || secondsLeft === 0) return
    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-cell-index]")
    const index = Number(cell?.dataset.cellIndex)
    if (!cell || !Number.isInteger(index) || index === pointer.start && !pointer.moved) return
    if (!pointer.moved) {
      pointer.moved = true
      updateSelection([pointer.start])
    }
    addCellToPath(index, true)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const pointer = pointerRef.current
    if (!pointer) return
    pointerRef.current = null
    suppressClickRef.current = true
    window.setTimeout(() => { suppressClickRef.current = false }, 0)
    if (pointer.moved) updateSelection([])
    else addCellToPath(pointer.start, false)
    if (gridRef.current?.hasPointerCapture(event.pointerId)) gridRef.current.releasePointerCapture(event.pointerId)
  }

  function handleCellClick(index: number) {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }
    addCellToPath(index, false)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const row = Math.floor(activeCell / rowLength)
    const column = activeCell % rowLength
    const nextCell = {
      ArrowUp: Math.max(0, row - 1) * rowLength + column,
      ArrowDown: Math.min(rowLength - 1, row + 1) * rowLength + column,
      ArrowLeft: row * rowLength + Math.max(0, column - 1),
      ArrowRight: row * rowLength + Math.min(rowLength - 1, column + 1),
    }[event.key]
    if (nextCell !== undefined) {
      event.preventDefault()
      setActiveCell(nextCell)
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      addCellToPath(activeCell, false)
    } else if (event.key === "Backspace") {
      event.preventDefault()
      updateSelection(selectionRef.current.slice(0, -1))
    } else if (event.key === "Escape") {
      updateSelection([])
    }
  }

  function clearSelection() {
    updateSelection([])
  }

  return (
    <main className="word-game-shell">
      <header className="quiz-topbar">
        <button className="back-link" type="button" onClick={onExit}><ArrowLeft aria-hidden="true" /> Exit game</button>
        <span className="quiz-category-pill">WORD GAME <span>{puzzle.level}</span></span>
        <span className={`word-timer ${secondsLeft <= 10 ? "word-timer-urgent" : ""}`} role="timer" aria-label={`${secondsLeft} seconds remaining`}><Clock3 aria-hidden="true" /> {secondsLeft}s</span>
      </header>
      <section className="word-game-content">
        <div className="word-game-heading">
          <span className="eyebrow"><Sparkles aria-hidden="true" /> QUICK THINKING CHALLENGE</span>
          <h1>Connect the words</h1>
          <p>Drag through letters in order to connect each word. Find all 15 before time runs out; each is worth 1 mark.</p>
        </div>
        <div className="word-game-progress" aria-live="polite"><span style={{ width: `${(Object.keys(foundPaths).length / puzzle.words.length) * 100}%` }} /><strong>{Object.keys(foundPaths).length} / 15 found</strong></div>
        <div className="word-game-layout">
          <section className="word-board-panel" aria-label="Word puzzle board">
            <div
              className="word-grid"
              role="grid"
              tabIndex={0}
              aria-label={`${rowLength} by ${rowLength} letter grid. Drag across adjacent letters, or use arrow keys and Enter to connect a word.`}
              aria-activedescendant={`word-cell-${activeCell}`}
              ref={gridRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => { pointerRef.current = null; updateSelection([]) }}
              onKeyDown={handleKeyDown}
            >
              {puzzle.grid.map((row, rowIndex) => (
                <div className="word-grid-row" role="row" key={rowIndex} style={{ gridTemplateColumns: `repeat(${rowLength}, minmax(0, 1fr))` }}>
                  {row.map((letter, columnIndex) => {
                    const index = rowIndex * rowLength + columnIndex
                    return (
                      <button
                        type="button"
                        role="gridcell"
                        tabIndex={-1}
                        id={`word-cell-${index}`}
                        data-cell-index={index}
                        aria-label={`${letter}, row ${rowIndex + 1}, column ${columnIndex + 1}`}
                        key={index}
                        className={`word-grid-cell ${selectedCells.has(index) ? "word-grid-cell-selected" : ""} ${foundCells.has(index) ? "word-grid-cell-found" : ""} ${activeCell === index ? "word-grid-cell-active" : ""}`}
                        onClick={() => handleCellClick(index)}
                      >{letter}</button>
                    )
                  })}
                </div>
              ))}
            </div>
            <div className="word-board-actions">
              <p>{selection.length > 0 ? selection.map((cell) => cells[cell]).join("") : "Drag through neighboring letters to connect a word."}</p>
              <button type="button" className="word-clear-button" onClick={clearSelection} disabled={selection.length === 0}><RotateCcw aria-hidden="true" /> Clear path</button>
            </div>
          </section>
          <aside className="word-list-panel" aria-labelledby="word-list-title">
            <div className="word-list-heading"><div><span className="eyebrow">WORD BANK</span><h2 id="word-list-title">Find these 15</h2></div><span className="word-found-count">{Object.keys(foundPaths).length}<span>/15</span></span></div>
            <ul className="word-target-list">
              {puzzle.words.map(({ id, word }, index) => {
                const isFound = foundIds.has(id)
                return                   <li key={id} className={`word-target ${isFound ? "word-target-found" : ""}`}><span className="word-target-number">{String(index + 1).padStart(2, "0")}</span><span>{word}</span><span className="word-target-points"><Star aria-hidden="true" />1</span>{isFound && <Check aria-label="Found" />}</li>
              })}
            </ul>
            <p className="word-game-hint">{puzzle.level === "easy" ? "Words run left to right or top to bottom." : puzzle.level === "medium" ? "Words may also run diagonally." : "Words may run in all directions, including backwards."}</p>
          </aside>
        </div>
        {error && <div className="word-game-error" role="alert">{error}<button type="button" className="button-primary" onClick={() => void submitRef.current(foundPathsRef.current)} disabled={busy}>Retry saving score</button></div>}
        {busy && <p className="word-game-saving" role="status">Saving your score…</p>}
      </section>
    </main>
  )
}
