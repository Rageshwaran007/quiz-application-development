"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Award, BookOpen, Brain, Calculator, Check, CircleHelp, Clock3, Crown, ExternalLink, Flame, Globe2, Landmark, LoaderCircle, LogOut, Medal, Sparkles, Star, Timer, Trophy, X } from "lucide-react"
import { type CategoryId, type DifficultyLevel, quizCategories } from "@/lib/questions"
import { QuestionVisual } from "@/components/question-visual"
import { WelcomeLamp } from "@/components/welcome-lamp"
import { WordGameView, type WordGamePuzzle } from "@/components/word-game-view"

type Question = { id: string; prompt: string; options: string[]; sourceCategory: string; difficulty: string; image?: string; visualId?: string; alt?: string }
type ScoreRow = { name: string; points: number; attempts: number; subjects: number }
type QuizResult = { score: number; total: number; review: { id: string; question: string; correct: boolean; answer: string; selectedAnswer: string; explanation: string; image?: string; visualId?: string; alt?: string }[] }

const icons = { globe: Globe2, brain: Brain, calculator: Calculator, landmark: Landmark, book: BookOpen }
const categoryArtwork: Record<CategoryId, string> = {
  general: "/subjects/general-knowledge.png",
  reasoning: "/subjects/reasoning.png",
  math: "/subjects/mathematics.png",
  tnpsc: "/subjects/tnpsc.png",
  upsc: "/subjects/upsc.png",
  wordgame: "/subjects/word-game.png",
}
const categoryById = Object.fromEntries(quizCategories.map((category) => [category.id, category])) as Record<CategoryId, (typeof quizCategories)[number]>
const motivation = {
  home: ["Every question grows your world.", "Know more today than yesterday.", "Curiosity turns questions into knowledge.", "Think boldly. Learn brightly.", "One answer closer to your goals."],
  level: ["Challenge yourself at your own pace.", "Pick a level. Find your next spark.", "A new challenge is a new chance to grow."],
  quiz: ["Breathe in. You know more than you think.", "One question at a time. You’ve got this.", "Trust your thinking and enjoy the challenge."],
  result: ["Every attempt is progress.", "Take the win. Keep learning.", "You showed up. That matters."],
}
const pickMotivation = (quotes: string[]) => quotes[Math.floor(Math.random() * quotes.length)]
const levels: { id: DifficultyLevel; label: string; description: string; accent: string }[] = [
  { id: "easy", label: "Easy", description: "Warm up and build confidence", accent: "sage" },
  { id: "medium", label: "Medium", description: "A balanced brain workout", accent: "gold" },
  { id: "hard", label: "Hard", description: "Ready for the big challenge?", accent: "berry" },
]
const wordGameLevels: typeof levels = [
  { id: "easy", label: "Easy", description: "Straight rows and columns", accent: "sage" },
  { id: "medium", label: "Medium", description: "Add diagonal connections", accent: "gold" },
  { id: "hard", label: "Hard", description: "All directions, including backwards", accent: "berry" },
]

function CategoryCard({ category, onClick, disabled }: { category: (typeof quizCategories)[number]; onClick: () => void; disabled: boolean }) {
  const Icon = icons[category.icon]
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`category-card category-${category.color} group text-left`}>
      <span className="category-media">
        <Image src={categoryArtwork[category.id]} alt="" fill sizes="(max-width: 700px) 45vw, (max-width: 900px) 30vw, 32vw" className="category-thumbnail" />
        <span className="category-image-shade" aria-hidden="true" />
        <span className="category-icon"><Icon aria-hidden="true" /></span>
        <span className="category-arrow"><ArrowRight aria-hidden="true" /></span>
      </span>
      <span className="category-content">
        <span className="category-title">{category.name}</span>
        <span className="category-subtitle">{category.description}</span>
        <span className="category-meta">{category.id === "wordgame" ? <Clock3 aria-hidden="true" /> : <CircleHelp aria-hidden="true" />} {category.id === "wordgame" ? "15 target words" : "15 questions"} <span className="meta-dot">·</span> {category.id === "wordgame" ? "60 seconds" : "5 picture picks"}</span>
      </span>
    </button>
  )
}

function Leaderboard({ rows, loading, error }: { rows: ScoreRow[]; loading: boolean; error: string }) {
  return (
    <section className="leaderboard-panel" aria-labelledby="leaderboard-title">
      <div className="panel-heading">
        <div><span className="eyebrow">THE HALL OF FAME</span><h2 id="leaderboard-title">Leaderboard</h2></div>
        <span className="trophy-chip"><Trophy aria-hidden="true" /></span>
      </div>
      <p className="leaderboard-note">Every quiz adds star points to your total.</p>
      {loading ? <div className="loading-row"><LoaderCircle className="spin" /> Loading scores</div> : error ? <p className="error-note">{error}</p> : rows.length === 0 ? (
        <div className="leaderboard-empty"><Medal aria-hidden="true" /><strong>First place is wide open.</strong><span>Take a quiz and put your name up here.</span></div>
      ) : (
        <>
          <div className="leaderboard-podium" aria-label="Top three players">
            {[rows[1], rows[0], rows[2]].filter((row): row is ScoreRow => Boolean(row)).map((row, podiumIndex) => {
              const rank = rows.indexOf(row) + 1
              return (
                <div className={`podium-card podium-${rank}`} key={row.name} style={{ animationDelay: `${podiumIndex * 90}ms` }}>
                  <span className="podium-medal">{rank === 1 ? <Crown aria-hidden="true" /> : rank}</span>
                  <span className="podium-avatar">{row.name.trim().slice(0, 1).toUpperCase()}</span>
                  <strong className="podium-name">{row.name}</strong>
                  <span className="podium-score"><Star aria-hidden="true" />{row.points}<small>pts</small></span>
                  <span className="podium-category">{row.attempts} quizzes · {row.subjects} subjects</span>
                </div>
              )
            })}
          </div>
          {rows.length > 3 && <ol className="leaderboard-list" start={4}>
            {rows.slice(3).map((row, index) => (
              <li className="leaderboard-row" key={row.name} style={{ animationDelay: `${(index + 3) * 45}ms` }}>
                <span className="rank">{String(index + 4).padStart(2, "0")}</span>
                <span className="player-avatar" aria-hidden="true">{row.name.trim().slice(0, 1).toUpperCase()}</span>
                <span className="player-details"><strong>{row.name}</strong><small>{row.attempts} quizzes · {row.subjects} subjects</small></span>
                <span className="player-score"><Star aria-hidden="true" />{row.points}<small>pts</small></span>
              </li>
            ))}
          </ol>}
        </>
      )}
      <div className="leaderboard-foot"><span><Flame aria-hidden="true" /> Every attempt counts</span><span>Star points</span></div>
    </section>
  )
}

function ReferenceLinks() {
  const links = [
    { name: "TNPSC", href: "https://tnpsc.gov.in/english/answerkeys.aspx", description: "Answer keys & past papers" },
    { name: "UPSC", href: "https://upsc.gov.in/examinations/previous-question-papers", description: "Previous question papers" },
    { name: "General knowledge", href: "https://indiabix.com/general-knowledge/basic-general-knowledge/#google_vignette", description: "Topic-wise practice" },
  ]
  return (
    <section className="reference-panel" aria-labelledby="reference-title">
      <span className="eyebrow">KEEP PREPARING</span>
      <h2 id="reference-title">Reference keys</h2>
      <ul>{links.map((link) => <li key={link.name}><a href={link.href} target="_blank" rel="noopener noreferrer"><span><strong>{link.name}</strong><small>{link.description}</small></span><ExternalLink aria-hidden="true" /></a></li>)}</ul>
    </section>
  )
}

function NameGate({ onSignIn }: { onSignIn: (name: string) => Promise<void> }) {
  const [name, setName] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError("")
    try { await onSignIn(name) } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not continue.") } finally { setBusy(false) }
  }
  return (
    <form onSubmit={submit} className="name-gate">
      <span className="gate-icon"><Sparkles aria-hidden="true" /></span>
      <div className="gate-copy"><strong>Ready to play?</strong><span>Enter your name to join the scoreboard.</span></div>
      <label className="sr-only" htmlFor="player-name">Your name</label>
      <input id="player-name" name="name" autoComplete="nickname" maxLength={30} minLength={2} required value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
      <button className="button-primary gate-button" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : null} Let’s go <ArrowRight aria-hidden="true" /></button>
      {error && <span className="gate-error" role="alert">{error}</span>}
    </form>
  )
}

function LevelPicker({ category, quote, error, loading, player, onSignIn, onBack, onSelect }: { category: CategoryId; quote: string; error: string; loading: boolean; player: string | null; onSignIn: (name: string) => Promise<void>; onBack: () => void; onSelect: (level: DifficultyLevel) => void }) {
  const isWordGame = category === "wordgame"
  const Icon = icons[categoryById[category].icon]
  const choices = isWordGame ? wordGameLevels : levels
  return (
    <main className="level-shell">
      <header className="quiz-topbar"><button className="back-link" onClick={onBack}><ArrowLeft aria-hidden="true" /> All subjects</button><span className="quiz-category-pill">{categoryById[category].short}</span><span className="level-questions"><CircleHelp aria-hidden="true" /> {isWordGame ? "15 words" : "15 questions"}</span></header>
      <section className="level-content">
        <div className="level-subject-icon"><Icon aria-hidden="true" /></div>
        <span className="eyebrow">YOUR NEXT CHALLENGE</span>
        <h1>Choose your level</h1>
        <p>{quote}</p>
        {!player && <div className="level-login"><span className="level-login-copy">Enter your name to unlock and start a quiz.</span><NameGate onSignIn={onSignIn} /></div>}
        {error && <p className="level-error" role="alert">{error}</p>}
        {loading && <p className="level-loading"><LoaderCircle className="spin" /> {isWordGame ? "Building your word grid…" : "Finding fresh questions for you…"}</p>}
        <div className="level-cards">{choices.map((level, index) => <button key={level.id} type="button" className={`level-card level-${level.accent}`} style={{ animationDelay: `${index * 80}ms` }} onClick={() => onSelect(level.id)} disabled={!player || loading}><span className="level-number">0{index + 1}</span><span className="level-card-icon">{level.id === "easy" ? <Sparkles aria-hidden="true" /> : level.id === "medium" ? <Brain aria-hidden="true" /> : <Trophy aria-hidden="true" />}</span><strong>{level.label}</strong><small>{level.description}</small><span className="level-select"><span>Start level</span><ArrowRight aria-hidden="true" /></span></button>)}</div>
        <span className="level-footnote"><Timer aria-hidden="true" /> {isWordGame ? "60 seconds · 15 words · 1 point each" : "15 seconds per question · 5 picture questions + 10 trivia questions"}</span>
      </section>
    </main>
  )
}

function QuizView({ category, level, motivationQuote, questions, playerName, attemptToken, onExit, onDone }: { category: CategoryId; level: DifficultyLevel; motivationQuote: string; questions: Question[]; playerName: string; attemptToken: string; onExit: () => void; onDone: (result: QuizResult) => void }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsLeft, setSecondsLeft] = useState(15)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const submittedRef = useRef(false)
  const question = questions[index]
  const selected = answers[question.id]
  const currentCategory = categoryById[category]

  const submitQuiz = useCallback(async () => {
    if (submittedRef.current) return
    submittedRef.current = true
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/scores", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: playerName, category, attemptToken, answers: questions.map((item) => ({ id: item.id, answer: answers[item.id] ?? "" })) }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Could not save your score.")
      onDone(data as QuizResult)
    } catch (reason) {
      submittedRef.current = false
      setError(reason instanceof Error ? reason.message : "Could not save your score.")
    } finally { setBusy(false) }
  }, [answers, attemptToken, category, onDone, playerName, questions])
  const submitRef = useRef(submitQuiz)
  useEffect(() => { submitRef.current = submitQuiz }, [submitQuiz])

  useEffect(() => {
    const deadline = Date.now() + 15_000
    setSecondsLeft(15)
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000))
      setSecondsLeft(remaining)
      if (remaining === 0) {
        window.clearInterval(timer)
        if (index === 14) void submitRef.current()
        else setIndex((current) => current + 1)
      }
    }, 200)
    return () => window.clearInterval(timer)
  }, [index])

  const answeredCount = Object.values(answers).filter(Boolean).length
  const timerStyle = { background: `conic-gradient(${secondsLeft <= 5 ? "#c75b4d" : "#43805e"} ${(secondsLeft / 15) * 100}%, #e7ece6 0)` }

  return (
    <main className="quiz-shell">
      <header className="quiz-topbar"><button className="back-link" onClick={onExit}><ArrowLeft aria-hidden="true" /> Exit quiz</button><span className="quiz-category-pill">{currentCategory.short} <span>{level}</span></span><span className="quiz-top-count">Question {index + 1} of 15</span></header>
      <div className="quiz-progress"><span style={{ width: `${((index + 1) / 15) * 100}%` }} /></div>
      <p className="quiz-motivation">{motivationQuote}</p>
      <section className="question-card" aria-live="polite" key={question.id}>
        <div className="question-kicker"><span>QUESTION {String(index + 1).padStart(2, "0")}</span><div className="timer-wrap"><div className={`timer-ring ${secondsLeft <= 5 ? "timer-urgent" : ""}`} style={timerStyle} role="timer" aria-label={`${secondsLeft} seconds remaining`}><span>{secondsLeft}</span></div><span>SEC</span></div></div>
        <div className="question-source"><span>{question.sourceCategory}</span><span>{level}</span>{question.image || question.visualId ? <span className="picture-badge"><Sparkles aria-hidden="true" /> Picture</span> : null}</div>
        <h1>{question.prompt}</h1>
        {(question.image || question.visualId) && <div className="question-visual"><QuestionVisual image={question.image} visualId={question.visualId} alt={question.alt} /></div>}
        <p className="question-instruction">Choose one answer. The next question starts when your timer runs out.</p>
        <div className="answer-options" role="radiogroup" aria-label="Answer choices">
          {question.options.map((option, optionIndex) => (
            <button type="button" role="radio" aria-checked={selected === option} key={option} onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: option }))} className={`answer-option ${selected === option ? "answer-selected" : ""}`}>
              <span className="option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{selected === option && <Check aria-hidden="true" className="answer-check" />}
            </button>
          ))}
        </div>
        {error && <p className="submit-error" role="alert">{error}</p>}
        <div className="question-footer"><span>{answeredCount} of 15 answered</span><button className="button-primary" onClick={() => index < 14 ? setIndex(index + 1) : void submitQuiz()} disabled={(!selected && secondsLeft > 0) || busy}>{busy ? <LoaderCircle className="spin" /> : index === 14 ? "See my score" : "Next question"}{!busy && <ArrowRight aria-hidden="true" />}</button></div>
        {index > 0 && <button className="previous-question" onClick={() => setIndex(index - 1)}><ArrowLeft aria-hidden="true" /> Previous</button>}
      </section>
    </main>
  )
}

function ResultView({ result, category, motivationQuote, onHome }: { result: QuizResult; category: CategoryId; motivationQuote: string; onHome: () => void }) {
  const percentage = Math.round((result.score / result.total) * 100)
  const grade = result.score >= 13 ? "champion" : result.score >= 9 ? "great" : result.score >= 5 ? "growing" : "fresh-start"
  const title = result.score >= 13 ? "Brilliant work!" : result.score >= 9 ? "You’re on a roll!" : result.score >= 5 ? "Good effort!" : "Every try makes you stronger."
  const colors = ["#e9b950", "#62a47e", "#8295d1", "#e28b67", "#cf7291"]
  return (
    <main className={`result-shell result-${grade}`}>
      {result.score >= 9 && <div className="celebration-burst" aria-hidden="true">{Array.from({ length: result.score >= 13 ? 42 : 26 }, (_, index) => <span key={index} className="confetti-particle" style={{ left: `${(index * 37) % 100}%`, animationDelay: `${(index % 8) * 90}ms`, backgroundColor: colors[index % colors.length] }} />)}</div>}
      <div className="result-sparkle"><Award aria-hidden="true" /></div><span className="eyebrow">QUIZ COMPLETE · {categoryById[category].short.toUpperCase()}</span>
      <h1>{title}</h1><p className="result-subtitle">{motivationQuote}</p>
      <div className="score-orb"><strong>{result.score}<span>/{result.total}</span></strong><small>YOUR SCORE</small></div>
      <div className="result-stats"><div><strong>{percentage}%</strong><span>Accuracy</span></div><div><strong>{result.score}</strong><span>Correct answers</span></div><div><strong>{result.total - result.score}</strong><span>To explore</span></div></div>
      <section className="review-list" aria-labelledby="review-title"><div className="review-heading"><div><span className="eyebrow">LEARN FROM EVERY QUESTION</span><h2 id="review-title">Answer review</h2></div><span className="review-total">{result.total} questions</span></div>{result.review.map((item, i) => <article className={`review-item ${item.correct ? "review-correct" : "review-incorrect"}`} key={item.id}><span className={`review-mark ${item.correct ? "correct" : "incorrect"}`}>{item.correct ? <Check aria-hidden="true" /> : <X aria-hidden="true" />}</span><div className="review-content"><span className="review-question-number">QUESTION {String(i + 1).padStart(2, "0")}</span><h3>{item.question}</h3>{(item.image || item.visualId) && <div className="review-visual"><QuestionVisual image={item.image} visualId={item.visualId} alt={item.alt} /></div>}<div className="review-answers"><div className="review-correct-answer"><span>Correct answer</span><strong>{item.answer}</strong></div>{!item.correct && <div className="review-your-answer"><span>Your answer</span><strong>{item.selectedAnswer || "Not answered"}</strong></div>}</div><p>{item.explanation}</p></div></article>)}</section>
      <button className="button-primary result-home" onClick={onHome}>Back to dashboard <ArrowRight aria-hidden="true" /></button>
    </main>
  )
}

export function QuizDashboard() {
  const [introComplete, setIntroComplete] = useState(false)
  const [player, setPlayer] = useState<string | null>(null)
  const [nameLoading, setNameLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<ScoreRow[]>([])
  const [boardLoading, setBoardLoading] = useState(true)
  const [boardError, setBoardError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel>("medium")
  const [questions, setQuestions] = useState<Question[]>([])
  const [wordPuzzle, setWordPuzzle] = useState<WordGamePuzzle | null>(null)
  const [attemptToken, setAttemptToken] = useState("")
  const [result, setResult] = useState<QuizResult | null>(null)
  const [loadingQuiz, setLoadingQuiz] = useState(false)
  const [pageError, setPageError] = useState("")
  const [homeQuote, setHomeQuote] = useState(() => pickMotivation(motivation.home))
  const [levelQuote, setLevelQuote] = useState(() => pickMotivation(motivation.level))
  const [quizQuote, setQuizQuote] = useState(() => pickMotivation(motivation.quiz))
  const [resultQuote, setResultQuote] = useState(() => pickMotivation(motivation.result))

  const refreshBoard = useCallback(async () => {
    setBoardLoading(true)
    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setLeaderboard(data.leaderboard)
      setBoardError("")
    } catch (reason) { setBoardError(reason instanceof Error ? reason.message : "Could not load scores.") } finally { setBoardLoading(false) }
  }, [])

  useEffect(() => {
    fetch("/api/player").then((response) => response.json()).then((data) => setPlayer(data.name)).catch(() => {}).finally(() => setNameLoading(false))
    void refreshBoard()
  }, [refreshBoard])

  async function signIn(name: string) {
    const response = await fetch("/api/player", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    setPlayer(data.name)
  }

  async function signOut() {
    await fetch("/api/player", { method: "DELETE" })
    setPlayer(null)
  }

  async function startQuiz(category: CategoryId, difficulty: DifficultyLevel) {
    if (!player) return
    setLoadingQuiz(true)
    setPageError("")
    setQuizQuote(pickMotivation(motivation.quiz))
    try {
      const response = await fetch(`/api/quiz?category=${category}&difficulty=${difficulty}`, { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setQuestions(data.questions)
      setWordPuzzle(null)
      setAttemptToken(data.attemptToken)
      setSelectedLevel(difficulty)
      setActiveCategory(category)
      setSelectedCategory(null)
      setResult(null)
    } catch (reason) { setPageError(reason instanceof Error ? reason.message : "Could not start this quiz.") } finally { setLoadingQuiz(false) }
  }

  async function startWordGame(level: DifficultyLevel) {
    if (!player) {
      setPageError("Add your name before starting a word game.")
      return
    }
    setLoadingQuiz(true)
    setPageError("")
    try {
      const response = await fetch(`/api/word-game?level=${level}`, { cache: "no-store" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? "Could not start the word game.")
      setWordPuzzle(data as WordGamePuzzle)
      setQuestions([])
      setResult(null)
      setAttemptToken(data.attemptToken)
      setActiveCategory("wordgame")
      setSelectedCategory(null)
    } catch (reason) {
      setPageError(reason instanceof Error ? reason.message : "Could not start the word game.")
    } finally {
      setLoadingQuiz(false)
    }
  }

  function selectSubject(category: CategoryId) {
    setPageError("")
    setLevelQuote(pickMotivation(motivation.level))
    setSelectedCategory(category)
  }

  if (!introComplete) return <WelcomeLamp onWake={() => setIntroComplete(true)} />
  if (activeCategory === "wordgame" && wordPuzzle && !result) return <WordGameView puzzle={wordPuzzle} playerName={player ?? ""} onExit={() => { setActiveCategory(null); setWordPuzzle(null); setAttemptToken(""); setHomeQuote(pickMotivation(motivation.home)) }} onDone={(nextResult) => { setResultQuote(pickMotivation(motivation.result)); setResult(nextResult); void refreshBoard() }} />
  if (activeCategory && questions.length > 0 && !result) return <QuizView category={activeCategory} level={selectedLevel} motivationQuote={quizQuote} questions={questions} playerName={player ?? ""} attemptToken={attemptToken} onExit={() => { setActiveCategory(null); setSelectedCategory(null); setAttemptToken(""); setHomeQuote(pickMotivation(motivation.home)) }} onDone={(nextResult) => { setResultQuote(pickMotivation(motivation.result)); setResult(nextResult); void refreshBoard() }} />
  if (result && activeCategory) return <ResultView result={result} category={activeCategory} motivationQuote={resultQuote} onHome={() => { setActiveCategory(null); setSelectedCategory(null); setResult(null); setHomeQuote(pickMotivation(motivation.home)) }} />
  if (selectedCategory) return <LevelPicker category={selectedCategory} quote={levelQuote} error={pageError} loading={loadingQuiz} player={player} onSignIn={signIn} onBack={() => { setSelectedCategory(null); setHomeQuote(pickMotivation(motivation.home)) }} onSelect={(level) => selectedCategory === "wordgame" ? void startWordGame(level) : void startQuiz(selectedCategory, level)} />

  return (
    <main className="dashboard-wrap">
      <header className="site-header">
        <a className="brand" href="#home" aria-label="Quizlet home"><span className="brand-mark"><BookOpen aria-hidden="true" /></span><span>bright<span className="brand-dot">.</span>minds</span></a>
        <div className="header-right"><span className="header-tag"><Sparkles aria-hidden="true" /> A little progress every day</span>{player && <div className="signed-in"><span className="signed-avatar">{player.slice(0, 1).toUpperCase()}</span><span className="signed-name">{player}</span><button onClick={signOut} className="sign-out" aria-label="Sign out" title="Sign out"><LogOut aria-hidden="true" /></button></div>}</div>
      </header>
      <div className="dashboard-grid" id="home">
        <section className="main-column">
          <div className="welcome-line"><span className="eyebrow">YOUR KNOWLEDGE QUEST STARTS HERE</span><span className="welcome-date"><Sparkles aria-hidden="true" /> Learn something new today</span></div>
          <h1 className="hero-title hero-rotating-quote">{homeQuote}</h1>
          <p className="hero-copy">Pick a topic, trust what you know, and see how far you can go.</p>
          {!nameLoading && !player && <NameGate onSignIn={signIn} />}
          {player && <div className="player-welcome"><span className="player-welcome-icon"><Sparkles aria-hidden="true" /></span><span>Welcome back, <strong>{player}</strong>. Your next great score is one quiz away.</span><span className="streak-badge"><Flame aria-hidden="true" /> Keep learning</span></div>}
          <div className="section-heading"><div><span className="eyebrow">PICK YOUR PLAYGROUND</span><h2>Explore a subject</h2></div><span className="quiz-count-badge"><CircleHelp aria-hidden="true" /> {quizCategories.length} subjects</span></div>
          {pageError && <p className="submit-error" role="alert">{pageError}</p>}
          {loadingQuiz && <div className="loading-row"><LoaderCircle className="spin" /> Picking your questions…</div>}
          <div className="category-grid">{quizCategories.map((category) => <CategoryCard key={category.id} category={category} disabled={loadingQuiz} onClick={() => selectSubject(category.id)} />)}</div>
          {!player && <p className="locked-hint"><span aria-hidden="true">↗</span> Add your name before starting a quiz.</p>}
          <div className="daily-note"><span className="daily-note-icon"><Sparkles aria-hidden="true" /></span><span><strong>Curiosity looks good on you.</strong><small>Fresh 15-question sets, powered by <a className="source-link" href="https://opentdb.com" target="_blank" rel="noreferrer">Open Trivia DB</a>.</small></span><span className="daily-note-decoration" aria-hidden="true">✳</span></div>
          <footer className="dashboard-footer"><span>Made for curious minds</span><span>Learn at your own pace <span aria-hidden="true">·</span> One question at a time</span></footer>
        </section>
        <aside className="sidebar-column"><Leaderboard rows={leaderboard} loading={boardLoading} error={boardError} /><ReferenceLinks /><div className="sidebar-tip"><span className="tip-icon"><Brain aria-hidden="true" /></span><div><span className="eyebrow">A QUICK REMINDER</span><p>You don’t have to know it all. You just have to start.</p></div></div><div className="score-note"><Trophy aria-hidden="true" /><span>Scores are saved to the shared scoreboard, so your classmates can cheer you on.</span></div></aside>
      </div>
      <div className="mobile-footer"><span><BookOpen aria-hidden="true" /> bright.minds</span><span>Learn at your own pace</span></div>
    </main>
  )
}
