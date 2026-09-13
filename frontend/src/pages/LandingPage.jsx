import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { playQuestComplete, playLevelUpFanfare } from '../utils/audio.js'

/* ── Demo quest for the interactive hero section ──────────────── */
const DEMO_QUESTS = [
  { id: 1, title: 'Read 20 pages of a book', attribute: '🧠', attrLabel: 'Intellect', diff: 'Easy', xp: 20 },
  { id: 2, title: 'Morning power workout', attribute: '💪', attrLabel: 'Strength', diff: 'Medium', xp: 35 },
  { id: 3, title: 'Reflective journal entry', attribute: '🕯️', attrLabel: 'Discipline', diff: 'Easy', xp: 20 },
  { id: 4, title: 'Creative side-project work', attribute: '🎨', attrLabel: 'Creativity', diff: 'Hard', xp: 55 },
]

const FEATURES = [
  {
    icon: '⚔️',
    title: 'Quest System',
    description: 'Turn everyday goals into quests. Assign attributes and difficulty tiers — trivial to epic — so every achievement feels earned.',
  },
  {
    icon: '📈',
    title: 'True Progression',
    description: "XP flows to your character's attributes in real-time. Level up triggers an orchestrated fanfare. Progress persists across sessions.",
  },
  {
    icon: '🔥',
    title: 'Daily Streaks',
    description: 'Consecutive active days build your streak and unlock bonus gold. Miss a day and the flame dims — keep it alive.',
  },
  {
    icon: '🛒',
    title: 'Economy & Rewards',
    description: 'Earn gold by completing quests. Spend it in the Trading Post on themes, titles and profile badges to make your journal yours.',
  },
  {
    icon: '🎨',
    title: 'Live Theme Swap',
    description: 'Four hand-crafted themes — Ember, Frost, Verdant, Void — apply instantly across the whole interface without a page reload.',
  },
  {
    icon: '🏅',
    title: 'Titles & Badges',
    description: 'Earn unique cosmetics that appear beside your name and in your character sheet, broadcasting your dedication to the world.',
  },
]

const ATTRIBUTES_PREVIEW = [
  { label: 'Intellect',   icon: '🧠', color: '#7fb6e0', value: 16, desc: 'Knowledge, deep focus, and strategic clarity' },
  { label: 'Strength',    icon: '💪', color: '#e0736a', value: 12, desc: 'Physical power, stamina, and workout consistency' },
  { label: 'Discipline',  icon: '🕯️', color: '#f0a15c', value: 22, desc: 'Daily routines, habits, and impulse mastery' },
  { label: 'Creativity',  icon: '🎨', color: '#c98fe0', value: 14, desc: 'Art, design, writing, and inventive builds' },
  { label: 'Vitality',    icon: '🌱', color: '#8fae6b', value: 18, desc: 'Rest, nutrition, health, and holistic balance' },
]

const LORE = [
  { symbol: '📜', heading: 'Forge your legend', body: 'Questlog was born from a single belief: your daily efforts deserve to feel epic. Real growth is slow. We make it visible.' },
  { symbol: '⚗️',  heading: 'Server-validated XP', body: 'All reward math runs on the backend. No browser tricks can inflate your level. Every point is earned.' },
  { symbol: '🔒', heading: 'Your data, local first', body: 'Your journal lives in your account, not in an ad-targeting funnel. No social feed, no daily notifications.' },
]

// Floating runes background particles
const FLOATING_RUNES = [
  { symbol: '✦', top: '12%', left: '8%', delay: 0, duration: 8 },
  { symbol: '⚔', top: '24%', right: '12%', delay: 1.5, duration: 10 },
  { symbol: 'ᚱ', top: '45%', left: '5%', delay: 2.5, duration: 9 },
  { symbol: '✨', top: '65%', right: '8%', delay: 3, duration: 7 },
  { symbol: 'ᛟ', top: '80%', left: '12%', delay: 0.8, duration: 11 },
  { symbol: 'ᛋ', top: '38%', right: '6%', delay: 2, duration: 8.5 },
]

export default function LandingPage() {
  const [completedIds, setCompletedIds] = useState([])
  const [xp, setXp] = useState(25)
  const [level, setLevel] = useState(2)
  const [justLeveledUp, setJustLeveledUp] = useState(false)

  // Automatically clean up any lingering ?error= in URL from failed oauth attempts
  useEffect(() => {
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  function handleDemoComplete(quest) {
    if (completedIds.includes(quest.id)) return
    setCompletedIds((prev) => [...prev, quest.id])
    playQuestComplete()

    const gained = quest.xp
    setXp((prev) => {
      const next = prev + gained
      if (next >= 80) {
        setLevel((l) => l + 1)
        setJustLeveledUp(true)
        playLevelUpFanfare()
        setTimeout(() => setJustLeveledUp(false), 3000)
        return next - 80
      }
      return next
    })
  }

  const xpPct = Math.min(100, Math.round((xp / 80) * 100))

  return (
    <div className="min-h-screen theme-ember bg-ink-950 text-parchment-100 relative overflow-x-hidden">
      {/* ── Ambient Floating Runes ───────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0" aria-hidden="true">
        {FLOATING_RUNES.map((rune, idx) => (
          <motion.span
            key={idx}
            className="absolute text-amber-500/20 text-xl select-none"
            style={{ top: rune.top, left: rune.left, right: rune.right }}
            animate={{
              y: [-12, 12, -12],
              opacity: [0.15, 0.4, 0.15],
              rotate: [0, 15, -15, 0],
            }}
            transition={{
              duration: rune.duration,
              delay: rune.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {rune.symbol}
          </motion.span>
        ))}
      </div>

      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-ink-700/80 bg-ink-950/85 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-ember-500/15 border border-ember-500/40 flex items-center justify-center text-ember-400 text-sm shadow-glow">
            ⚔️
          </span>
          <span className="font-display text-xl sm:text-2xl accent-text tracking-wide font-bold">Questlog</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-xs sm:text-sm px-3.5 py-1.5 rounded-lg font-medium">
            Sign In
          </Link>
          <Link to="/register" className="btn-primary text-xs sm:text-sm px-4 py-1.5 rounded-lg shadow-glow font-semibold">
            Start Journey →
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-8 pt-20 pb-24 text-center z-10" aria-labelledby="hero-heading">
        {/* Glow blooms */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-36 left-1/2 -translate-x-1/2 w-[720px] h-[720px] rounded-full bg-ember-500/12 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-52 h-52 rounded-full bg-void-500/10 blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 rounded-full bg-frost-500/10 blur-2xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest accent-text mb-6 px-3.5 py-1.5 rounded-full border accent-border/40 bg-ink-900/80 shadow-sm backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-ember-400 animate-ping" />
            <span>Real-World RPG Productivity</span>
          </div>

          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-6xl lg:text-7xl text-parchment-100 mb-6 leading-[1.1] font-bold tracking-tight"
          >
            Turn Your Day<br />
            <span className="bg-gradient-to-r from-amber-200 via-ember-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(240,161,92,0.4)]">
              Into an Adventure
            </span>
          </h1>

          <p className="text-parchment-300/80 text-base sm:text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Gamify your real-world ambitions. Log daily goals as RPG quests, earn XP and gold, unlock prestige titles, and level up your character sheet.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              id="hero-cta"
              to="/register"
              className="btn-primary px-8 py-3.5 rounded-lg text-base shadow-theme-glow font-semibold tracking-wide hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <span>Create Your Character</span>
              <span>→</span>
            </Link>
            <a
              href="#demo"
              className="btn-secondary px-7 py-3.5 rounded-lg text-base hover:border-parchment-500/40 transition-colors"
            >
              Try the Demo
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Interactive Demo ─────────────────────────────────── */}
      <section id="demo" className="max-w-2xl mx-auto px-4 sm:px-8 py-16 z-10 relative" aria-labelledby="demo-heading">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-ember-400/80 font-semibold mb-1 block">
            Interactive Preview
          </span>
          <h2 id="demo-heading" className="font-display text-3xl sm:text-4xl text-parchment-100 mb-2 font-bold">
            Live Demo — No Sign-up
          </h2>
          <p className="text-parchment-300/60 text-sm">
            Click <strong className="text-emerald-400">✓</strong> to complete quests, gain attribute XP, and trigger your level up.
          </p>
        </div>

        {/* Demo Adventurer Character Card */}
        <motion.div
          className={`panel p-5 mb-4 relative transition-all duration-500 ${
            justLeveledUp ? 'ring-2 ring-amber-400 shadow-[0_0_28px_rgba(245,158,11,0.5)] scale-[1.01]' : ''
          }`}
          animate={justLeveledUp ? { scale: [1, 1.02, 1] } : {}}
        >
          <div className="flex justify-between items-center text-xs text-parchment-300/80 mb-2 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              Demo Adventurer · <strong className="accent-text text-sm">Level {level}</strong>
            </span>
            <span>{xp} / 80 XP</span>
          </div>

          <div className="h-3.5 rounded-full bg-ink-800/90 overflow-hidden p-0.5 border border-ink-700" role="progressbar" aria-valuenow={xpPct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-ember-500 via-amber-400 to-amber-300 shadow-glow"
              animate={{ width: `${xpPct}%` }}
              transition={{ type: 'spring', stiffness: 90, damping: 16 }}
            />
          </div>

          {justLeveledUp && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-2.5 text-xs text-amber-300 font-semibold tracking-wider uppercase animate-pulse"
            >
              🎉 LEVEL UP! You reached Level {level}!
            </motion.div>
          )}
        </motion.div>

        {/* Quest List */}
        <ul className="space-y-3" aria-label="Demo quest list">
          <AnimatePresence>
            {DEMO_QUESTS.map((quest) => {
              const done = completedIds.includes(quest.id)
              return (
                <motion.li
                  key={quest.id}
                  layout
                  animate={{ opacity: done ? 0.5 : 1 }}
                  className={`panel px-4 py-3.5 flex items-center gap-3 transition-colors ${
                    done ? 'border-ink-800 bg-ink-950/40' : 'hover:border-ember-500/40'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleDemoComplete(quest)}
                    disabled={done}
                    aria-label={done ? `${quest.title} completed` : `Complete quest: ${quest.title}`}
                    className={`shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-200
                      ${done
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400 cursor-default shadow-sm'
                        : 'border-ember-400/60 hover:border-ember-400 hover:bg-ember-500/20 text-ember-400 cursor-pointer shadow-sm active:scale-90'
                      }`}
                  >
                    <span>✓</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-parchment-100 font-medium truncate ${done ? 'line-through text-parchment-300/40' : ''}`}>
                      {quest.title}
                    </p>
                    <div className="flex gap-2 mt-0.5 flex-wrap items-center">
                      <span className="text-xs text-parchment-300/60">{quest.attribute} {quest.attrLabel}</span>
                      <span className="text-xs text-amber-400/90 font-semibold">+{quest.xp} XP</span>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-ink-800 border border-ink-700 text-parchment-300/70 shrink-0">
                    {quest.diff}
                  </span>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {completedIds.length === DEMO_QUESTS.length && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 panel p-6 text-center border accent-border/60 bg-gradient-to-b from-ink-900 to-ink-950 shadow-glow"
          >
            <p className="text-xl font-display accent-text mb-1 font-bold">🎉 All demo quests complete!</p>
            <p className="text-sm text-parchment-300/80 mb-4">Ready to forge your personal character?</p>
            <Link to="/register" className="btn-primary px-7 py-2.5 rounded-lg font-semibold inline-block shadow-glow">
              Claim Your Free Character Sheet →
            </Link>
          </motion.div>
        )}
      </section>

      {/* ── Attribute Preview ─────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-12 z-10 relative" aria-labelledby="attrs-heading">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-ember-400/80 font-semibold mb-1 block">
            RPG Character Sheet
          </span>
          <h2 id="attrs-heading" className="font-display text-3xl text-parchment-100 mb-2 font-bold">
            Five Core Disciplines
          </h2>
          <p className="text-parchment-300/60 text-sm max-w-lg mx-auto">
            Every quest you accomplish elevates a specific discipline. Balance your lifestyle or specialize in your preferred archetype.
          </p>
        </div>

        <div className="panel p-6 space-y-4 shadow-xl">
          {ATTRIBUTES_PREVIEW.map((attr) => (
            <div key={attr.label} className="group flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 p-2 rounded-lg hover:bg-ink-800/40 transition-colors">
              <div className="flex items-center gap-2.5 w-36 shrink-0">
                <span className="text-xl" aria-hidden="true">{attr.icon}</span>
                <span className="text-sm font-semibold text-parchment-100">{attr.label}</span>
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-ink-800 overflow-hidden border border-ink-700/50">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: attr.color }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${(attr.value / 25) * 100}%` }}
                    viewport={{ once: true, amount: 0.6 }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                  />
                </div>
                <p className="text-[11px] text-parchment-300/40 mt-1 hidden sm:block">
                  {attr.desc}
                </p>
              </div>
              <span className="text-sm font-semibold text-parchment-200 text-right w-10 shrink-0">
                {attr.value}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16 z-10 relative" aria-labelledby="features-heading">
        <div className="text-center mb-12">
          <span className="text-xs uppercase tracking-widest text-ember-400/80 font-semibold mb-1 block">
            System Features
          </span>
          <h2 id="features-heading" className="font-display text-3xl sm:text-4xl text-parchment-100 mb-2 font-bold">
            Built for Lifelong Consistency
          </h2>
          <p className="text-parchment-300/60 text-sm max-w-lg mx-auto">
            Every feature is calibrated to sustain momentum for months, avoiding the drop-off of generic habit trackers.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.06 }}
              className="panel p-6 hover:border-ember-500/50 hover:shadow-glow transition-all duration-300 group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform" aria-hidden="true">{f.icon}</div>
              <h3 className="text-parchment-100 font-semibold text-lg mb-1.5 font-display">{f.title}</h3>
              <p className="text-sm text-parchment-300/60 leading-relaxed">{f.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-12 z-10 relative" aria-labelledby="lore-heading">
        <div className="text-center mb-8">
          <span className="text-xs uppercase tracking-widest text-ember-400/80 font-semibold mb-1 block">
            Core Principles
          </span>
          <h2 id="lore-heading" className="font-display text-3xl text-parchment-100 mb-2 font-bold">
            The Questlog Creed
          </h2>
        </div>
        <div className="space-y-4">
          {LORE.map((item) => (
            <div key={item.heading} className="flex gap-4 panel p-5 items-start">
              <div className="text-2xl shrink-0 mt-0.5" aria-hidden="true">{item.symbol}</div>
              <div>
                <h3 className="text-parchment-100 font-semibold mb-1 font-display">{item.heading}</h3>
                <p className="text-sm text-parchment-300/70 leading-relaxed">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final Call to Action ─────────────────────────────── */}
      <section className="text-center px-4 sm:px-8 py-20 z-10 relative" aria-labelledby="cta-heading">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          className="panel inline-block max-w-lg w-full px-8 py-10 shadow-glow border accent-border/40 relative overflow-hidden"
        >
          <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-ember-500/10 blur-xl pointer-events-none" />
          <h2 id="cta-heading" className="font-display text-3xl text-parchment-100 mb-2 font-bold">
            Your Legend Awaits
          </h2>
          <p className="text-parchment-300/80 mb-6 text-sm">
            Free forever. No subscription walls. Your personal chronicles stay yours.
          </p>
          <Link
            to="/register"
            className="btn-primary px-8 py-3.5 rounded-lg text-base shadow-glow font-semibold inline-block hover:scale-105 transition-transform"
          >
            Create Your Character →
          </Link>
          <p className="text-xs text-parchment-300/40 mt-4">
            Already adventuring?{' '}
            <Link to="/login" className="accent-text hover:underline font-medium">Sign in to your journal</Link>
          </p>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-ink-700/60 px-4 sm:px-8 py-8 text-center text-xs text-parchment-300/40 z-10 relative">
        <p className="font-display accent-text text-sm mb-1 font-semibold">Questlog — Life RPG</p>
        <p>Built for Tech Zephyr 4.0 · IIT Bhubaneswar Web Hackathon</p>
        <p className="mt-2.5">
          <Link to="/login" className="hover:accent-text transition-colors">Sign In</Link>
          {' · '}
          <Link to="/register" className="hover:accent-text transition-colors">Register</Link>
        </p>
      </footer>
    </div>
  )
}
