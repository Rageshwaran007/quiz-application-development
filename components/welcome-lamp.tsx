"use client"

import { useRef, useState } from "react"
import type { KeyboardEvent, PointerEvent } from "react"
import { ArrowDown, BookOpen, Sparkles } from "lucide-react"

export function WelcomeLamp({ onWake }: { onWake: () => void }) {
  const [isLit, setIsLit] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const startY = useRef<number | null>(null)
  const hasWoken = useRef(false)

  function wakeUp() {
    if (hasWoken.current) return
    hasWoken.current = true
    setIsLit(true)
    window.setTimeout(onWake, 1350)
  }

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    startY.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (startY.current === null) return
    setPullDistance(Math.max(0, Math.min(65, event.clientY - startY.current)))
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (startY.current === null) return
    const distance = event.clientY - startY.current
    startY.current = null
    if (distance >= 44) {
      setPullDistance(65)
      wakeUp()
    }
    else setPullDistance(0)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      wakeUp()
    }
  }

  return (
    <main className={`intro-shell ${isLit ? "intro-awake" : ""}`}>
      <div className="intro-city intro-city-night" aria-hidden="true" />
      <div className="intro-city intro-city-morning" aria-hidden="true" />
      <div className="intro-starfield" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
      <header className="intro-header">
        <a className="intro-brand" href="#welcome" aria-label="Bright Minds welcome">
          <span className="intro-brand-mark"><BookOpen aria-hidden="true" /></span>
          <span>bright<span className="brand-dot">.</span>minds</span>
        </a>
        <span className="intro-edition"><Sparkles aria-hidden="true" /> THE QUIZ CLUB</span>
      </header>
      <section className="intro-poster" id="welcome" aria-labelledby="welcome-title">
        <span className="intro-kicker">A LITTLE LIGHT GOES A LONG WAY</span>
        <h1 id="welcome-title">Ignite the lamp of knowledge, and let its light brighten the path to success.</h1>
        <div className={`lamp-stage ${isLit ? "lamp-is-lit" : "lamp-is-off"}`}>
          <div className="lamp-halo" aria-hidden="true" />
          <svg className="lamp-drawing" viewBox="0 0 420 330" role="img" aria-label={isLit ? "A warm desk lamp glowing" : "A desk lamp turned off"}>
            <defs>
              <radialGradient id="lamp-glow"><stop stopColor="#fff3ba" stopOpacity=".95" /><stop offset="1" stopColor="#ffc858" stopOpacity="0" /></radialGradient>
              <linearGradient id="lamp-shade" x1=".15" y1="0" x2=".85" y2="1"><stop stopColor={isLit ? "#edb949" : "#4a635b"} /><stop offset="1" stopColor={isLit ? "#ca872d" : "#263e37"} /></linearGradient>
              <linearGradient id="lamp-base" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#71947a" /><stop offset="1" stopColor="#315b47" /></linearGradient>
            </defs>
            {isLit && <circle cx="210" cy="150" r="150" fill="url(#lamp-glow)" />}
            <path d="M210 144V72" stroke="#74907d" strokeWidth="12" strokeLinecap="round" />
            <path d="M112 76Q210 23 308 76L275 148Q210 166 145 148Z" fill="url(#lamp-shade)" stroke="#263e37" strokeWidth="5" strokeLinejoin="round" />
            <path d="M147 145Q210 161 273 145L268 160H152Z" fill="#f5d88e" opacity={isLit ? ".95" : ".18"} />
            <ellipse cx="210" cy="160" rx="35" ry="10" fill={isLit ? "#fff4c5" : "#9ca89c"} opacity=".92" />
            <path d={`M210 170V${225 + pullDistance}`} stroke="#b7c2b8" strokeWidth="4" strokeLinecap="round" />
            <path d="M210 185L174 225Q158 243 180 256L211 275" fill="none" stroke="#73917b" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M210 275L236 294" fill="none" stroke="#73917b" strokeWidth="9" strokeLinecap="round" />
            <ellipse cx="211" cy="303" rx="86" ry="13" fill="url(#lamp-base)" />
            <path d="M186 295L195 276H226L237 295" fill="#456d53" />
            <ellipse cx="210" cy="301" rx="53" ry="7" fill="#95ac91" opacity=".45" />
          </svg>
          <button
            className="lamp-pull"
            style={{ top: `calc(68% + ${pullDistance}px)` }}
            type="button"
            aria-label="Pull the lamp cord down to turn on the light"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { startY.current = null; setPullDistance(0) }}
            onKeyDown={handleKeyDown}
            onClick={wakeUp}
          ><span /></button>
        </div>
        <div className={`intro-instruction ${isLit ? "intro-instruction-lit" : ""}`} aria-live="polite">
          {isLit ? <><Sparkles aria-hidden="true" /> Your study space is ready. Let’s go!</> : <><ArrowDown aria-hidden="true" /> Pull the lamp cord down — or tap it to wake up</>}
        </div>
        <div className="intro-progress" aria-hidden="true"><span className={isLit ? "intro-progress-on" : ""} /></div>
        <span className="intro-bottom-note">A brighter mind starts with one question.</span>
      </section>
    </main>
  )
}
