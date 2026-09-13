import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

/* ── Demo quest for the interactive hero section ──────────────── */
const DEMO_QUESTS = [
  { id: 1, title: 'Read 20 pages', attribute: '🧠', attrLabel: 'Intellect', diff: 'Easy', xp: 15 },
  { id: 2, title: 'Morning workout', attribute: '💪', attrLabel: 'Strength', diff: 'Medium', xp: 30 },
  { id: 3, title: 'Journal entry', attribute: '🕯️', attrLabel: 'Discipline', diff: 'Easy', xp: 15 },
  { id: 4, title: 'Creative writing', attribute: '🎨', attrLabel: 'Creativity', diff: 'Hard', xp: 55 },
]

const FEATURES = [
  {
    icon: '⚔',
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
  { label: 'Intellect',   icon: '🧠', color: '#7fb6e0', value: 14 },
  { label: 'Strength',    icon: '💪', color: '#e0736a', value: 8  },
  { label: 'Discipline',  icon: '🕯️', color: '#f0a15c', value: 20 },
  { label: 'Creativity',  icon: '🎨', color: '#c98fe0', value: 5  },
  { label: 'Vitality',    icon: '🌱', color: '#8fae6b', value: 11 },
]

const LORE = [
  { symbol: '📜', heading: 'Forge your legend', body: 'Questlog was born from a single belief: your daily efforts deserve to feel epic. Real growth is slow. We make it visible.' },
  { symbol: '⚗️',  heading: 'Server-validated XP', body: 'All reward math runs on the backend. No browser tricks can inflate your level. Every point is earned.' },
  { symbol: '🔒', heading: 'Your data, local first', body: 'Your journal lives in your account, not in an ad-targeting funnel. No social feed, no daily notifications.' },
]

export default function LandingPage() {
  const [completedIds, setCompletedIds] = useState([])
  const [xp, setXp] = useState(12)
  const [level, setLevel] = useState(2)

  function handleDemoComplete(quest) {
    if (completedIds.includes(quest.id)) return
    setCompletedIds((prev) => [...prev, quest.id])
    const gained = quest.xp
    setXp((prev) => {
      const next = prev + gained
      if (next >= 80) {
        setLevel((l) => l + 1)
        return next - 80
      }
      return next
    })
  }

  const xpPct = Math.min(100, Math.round((xp / 80) * 100))

  return (
    <div className="min-h-screen theme-ember">
      {/* ── Nav ─────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-ink-700 bg-ink-950/80 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between">
        <span className="font-display text-xl accent-text tracking-wide">Questlog</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
          <Link to="/register" className="btn-primary text-sm px-4 py-2 rounded-md">Start Journey</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 sm:px-8 pt-20 pb-24 text-center" aria-labelledby="hero-heading">
        {/* Decorative glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-ember-500/10 blur-3xl" />
          <div className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full bg-void-500/8 blur-2xl" />
          <div className="absolute top-1/3 right-1/4 w-40 h-40 rounded-full bg-frost-500/8 blur-2xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="relative max-w-3xl mx-auto"
        >
          <span className="inline-block text-xs uppercase tracking-widest accent-text mb-4 px-3 py-1 rounded-full border accent-border/40 bg-ink-900/60">
            Life RPG for Achievers
          </span>
          <h1
            id="hero-heading"
            className="font-display text-4xl sm:text-6xl text-parchment-100 mb-6 leading-tight"
          >
            Turn Your Day<br />
            <span className="accent-text">Into an Adventure</span>
          </h1>
          <p className="text-parchment-300/70 text-lg mb-10 max-w-xl mx-auto">
            Questlog turns real-world goals into RPG quests — complete them, earn XP, level up your character, and buy cosmetics with gold.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              id="hero-cta"
              to="/register"
              className="btn-primary px-8 py-3 rounded-md text-base shadow-theme-glow"
            >
              Create Your Character →
            </Link>
            <a
              href="#demo"
              className="btn-secondary px-8 py-3 rounded-md text-base"
            >
              Try the Demo
            </a>
          </div>
        </motion.div>
      </section>

      {/* ── Interactive Demo ─────────────────────────────────── */}
      <section id="demo" className="max-w-2xl mx-auto px-4 sm:px-8 py-16" aria-labelledby="demo-heading">
        <div className="text-center mb-8">
          <h2 id="demo-heading" className="font-display text-3xl text-parchment-100 mb-2">
            Live Demo — No Sign-up
          </h2>
          <p className="text-parchment-300/60 text-sm">
            Click ✓ to complete quests and watch your XP bar fill.
          </p>
        </div>

        {/* Fake character bar */}
        <div className="panel p-4 mb-4">
          <div className="flex justify-between text-xs text-parchment-300/70 mb-1">
            <span>Demo Adventurer · Level {level}</span>
            <span>{xp} / 80 XP</span>
          </div>
          <div className="h-3 rounded-full bg-ink-800 overflow-hidden" role="progressbar" aria-valuenow={xpPct} aria-valuemin={0} aria-valuemax={100}>
            <motion.div
              className="h-full xp-bar-fill"
              animate={{ width: `${xpPct}%` }}
              transition={{ type: 'spring', stiffness: 100, damping: 18 }}
            />
          </div>
        </div>

        <ul className="space-y-3" aria-label="Demo quest list">
          <AnimatePresence>
            {DEMO_QUESTS.map((quest) => {
              const done = completedIds.includes(quest.id)
              return (
                <motion.li
                  key={quest.id}
                  layout
                  animate={{ opacity: done ? 0.55 : 1 }}
                  className="panel px-4 py-3 flex items-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => handleDemoComplete(quest)}
                    disabled={done}
                    aria-label={done ? `${quest.title} completed` : `Complete quest: ${quest.title}`}
                    className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors
                      ${done
                        ? 'border-moss-400 bg-moss-400/20 cursor-default'
                        : 'border-[var(--accent)] hover:bg-[var(--accent)]/20 cursor-pointer'
                      }`}
                  >
                    <span className={done ? 'text-moss-400 text-sm' : 'accent-text text-sm'}>✓</span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-parchment-100 truncate ${done ? 'line-through text-parchment-300/50' : ''}`}>
                      {quest.title}
                    </p>
                    <div className="flex gap-2 mt-0.5 flex-wrap">
                      <span className="text-xs text-parchment-300/60">{quest.attribute} {quest.attrLabel}</span>
                      <span className="text-xs accent-text/80">+{quest.xp} XP</span>
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-ink-800 border border-ink-700 text-parchment-300/70 shrink-0">
                    {quest.diff}
                  </span>
                </motion.li>
              )
            })}
          </AnimatePresence>
        </ul>

        {completedIds.length === DEMO_QUESTS.length && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 panel p-5 text-center border accent-border"
          >
            <p className="text-lg accent-text mb-1">🎉 All quests complete!</p>
            <p className="text-sm text-parchment-300/70 mb-3">Ready for the real thing?</p>
            <Link to="/register" className="btn-primary px-6 py-2 rounded-md">
              Create Your Account
            </Link>
          </motion.div>
        )}
      </section>

      {/* ── Attribute Preview ─────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-8 py-8" aria-labelledby="attrs-heading">
        <h2 id="attrs-heading" className="font-display text-2xl text-parchment-100 mb-2 text-center">
          Five Attributes. One Character.
        </h2>
        <p className="text-parchment-300/60 text-center text-sm mb-6">
          Every quest you complete improves a specific attribute — mix and match to build your archetype.
        </p>
        <div className="panel p-5 space-y-3">
          {ATTRIBUTES_PREVIEW.map((attr) => (
            <div key={attr.label} className="flex items-center gap-3">
              <span className="w-5 text-center text-base" aria-hidden="true">{attr.icon}</span>
              <span className="w-20 text-sm text-parchment-200">{attr.label}</span>
              <div className="flex-1 h-2.5 rounded-full bg-ink-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: attr.color }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(attr.value / 25) * 100}%` }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                />
              </div>
              <span className="w-6 text-right text-sm text-parchment-300/70">{attr.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature Grid ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 py-16" aria-labelledby="features-heading">
        <div className="text-center mb-10">
          <h2 id="features-heading" className="font-display text-3xl text-parchment-100 mb-2">
            Built for the long game
          </h2>
          <p className="text-parchment-300/60 text-sm max-w-lg mx-auto">
            Every feature is tuned to keep you logging quests months from now, not just day one.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.07 }}
              className="panel p-5 hover:border-[var(--accent)]/50 transition-colors"
            >
              <div className="text-3xl mb-3" aria-hidden="true">{f.icon}</div>
              <h3 className="text-parchment-100 font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-parchment-300/60">{f.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Lore / Philosophy ─────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-8 py-12" aria-labelledby="lore-heading">
        <h2 id="lore-heading" className="font-display text-3xl text-parchment-100 mb-8 text-center">
          The Questlog philosophy
        </h2>
        <div className="space-y-6">
          {LORE.map((item) => (
            <div key={item.heading} className="flex gap-5 panel p-5">
              <div className="text-3xl shrink-0" aria-hidden="true">{item.symbol}</div>
              <div>
                <h3 className="text-parchment-100 font-semibold mb-1">{item.heading}</h3>
                <p className="text-sm text-parchment-300/60">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="text-center px-4 sm:px-8 py-20" aria-labelledby="cta-heading">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          className="panel inline-block max-w-lg w-full px-8 py-10 shadow-theme-glow"
        >
          <h2 id="cta-heading" className="font-display text-3xl text-parchment-100 mb-3">
            Your adventure awaits
          </h2>
          <p className="text-parchment-300/70 mb-6">
            Free to start. No subscriptions. Your data stays yours.
          </p>
          <Link
            to="/register"
            className="btn-primary px-8 py-3 rounded-md text-base shadow-theme-glow inline-block"
          >
            Create Your Character →
          </Link>
          <p className="text-xs text-parchment-300/40 mt-4">
            Already adventuring?{' '}
            <Link to="/login" className="accent-text hover:underline">Sign in</Link>
          </p>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-ink-700 px-4 sm:px-8 py-8 text-center text-xs text-parchment-300/40">
        <p className="font-display accent-text mb-1">Questlog — Life RPG</p>
        <p>Built for Tech Zephyr 4.0 · IIT Bhubaneswar Web Hackathon</p>
        <p className="mt-2">
          <Link to="/login" className="hover:accent-text transition-colors">Sign In</Link>
          {' · '}
          <Link to="/register" className="hover:accent-text transition-colors">Register</Link>
        </p>
      </footer>
    </div>
  )
}
