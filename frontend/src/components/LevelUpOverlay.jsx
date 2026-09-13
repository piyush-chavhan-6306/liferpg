import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playLevelUpFanfare } from '../utils/audio.js'

// Elegant golden & radiant amber particle palette
const GOLDEN_PARTICLES = [
  '#fde68a', '#f59e0b', '#fbbf24', '#f0a15c', '#ffd700', '#fffbeb', '#e8823f',
]

export default function LevelUpOverlay({ result, onDismiss }) {
  // Generate rising and radiating energy particles
  const particles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, i) => ({
        id: i,
        angle: (i / 32) * Math.PI * 2,
        distance: 80 + Math.random() * 110,
        delay: 0.2 + Math.random() * 0.4,
        yDrift: -(40 + Math.random() * 70), // upward drift
        color: GOLDEN_PARTICLES[i % GOLDEN_PARTICLES.length],
        size: 3 + Math.random() * 5,
        duration: 1.4 + Math.random() * 0.8,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result]
  )

  useEffect(() => {
    if (!result) return
    playLevelUpFanfare()

    // Smooth celebration timing before natural return to normal UI
    const timer = setTimeout(onDismiss, 4600)

    function handleKeyDown(e) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        onDismiss()
      }
    }
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [result, onDismiss])

  if (!result) return null

  const newLevel = result.character?.level ?? '?'
  const levelsGained = result.levels_gained || 1

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-center justify-center px-4 overflow-hidden select-none cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onDismiss}
        role="dialog"
        aria-modal="true"
        aria-label={`Level up celebration! You reached level ${newLevel}`}
      >
        {/* 1 & 2. Cinematic Dim & Blur overlay allowing underlying screen to remain subtly visible */}
        <motion.div
          className="absolute inset-0 bg-ink-950/80 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* 3. Golden Energy Gathering radial glow */}
        <motion.div
          className="pointer-events-none absolute w-[360px] sm:w-[540px] h-[360px] sm:h-[540px] rounded-full bg-gradient-radial from-amber-500/25 via-amber-600/10 to-transparent blur-3xl"
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{
            scale: [0.4, 1.25, 1.05],
            opacity: [0, 0.9, 0.65],
          }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
        />

        {/* Subtle rotating radiant rays in the background */}
        <motion.div
          className="pointer-events-none absolute w-[420px] sm:w-[600px] h-[420px] sm:h-[600px] rounded-full opacity-35"
          style={{
            background:
              'conic-gradient(from 0deg at 50% 50%, rgba(251,191,36,0.18) 0deg, transparent 35deg, rgba(245,158,11,0.2) 70deg, transparent 105deg, rgba(251,191,36,0.18) 140deg, transparent 175deg, rgba(245,158,11,0.2) 210deg, transparent 245deg, rgba(251,191,36,0.18) 280deg, transparent 315deg, rgba(245,158,11,0.2) 360deg)',
          }}
          initial={{ rotate: 0, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 180, scale: 1, opacity: 0.35 }}
          transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
          aria-hidden="true"
        />

        {/* Central Magical Chamber */}
        <div className="relative z-10 flex flex-col items-center justify-center max-w-sm sm:max-w-md w-full text-center">
          {/* 4. Circular Energy Rune Rings */}
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
            {/* Outer Sacred Geometry Rune Circle */}
            <motion.svg
              className="absolute inset-0 w-full h-full text-amber-400/50"
              viewBox="0 0 200 200"
              fill="none"
              stroke="currentColor"
              initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
              animate={{ scale: 1, rotate: 90, opacity: 0.75 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
              aria-hidden="true"
            >
              <circle cx="100" cy="100" r="92" strokeWidth="1.2" strokeDasharray="4 4" />
              <circle cx="100" cy="100" r="85" strokeWidth="1.5" />
              {/* Rune Hash Notches */}
              {Array.from({ length: 16 }).map((_, i) => {
                const a = (i * 22.5 * Math.PI) / 180
                return (
                  <line
                    key={i}
                    x1={100 + Math.cos(a) * 85}
                    y1={100 + Math.sin(a) * 85}
                    x2={100 + Math.cos(a) * 92}
                    y2={100 + Math.sin(a) * 92}
                    strokeWidth="1.5"
                    stroke="currentColor"
                  />
                )
              })}
              <circle cx="100" cy="100" r="66" strokeWidth="0.8" opacity="0.5" />
              <polygon
                points="100,20 180,100 100,180 20,100"
                strokeWidth="0.8"
                stroke="currentColor"
                opacity="0.35"
              />
              <polygon
                points="100,20 180,100 100,180 20,100"
                strokeWidth="0.8"
                stroke="currentColor"
                opacity="0.25"
                transform="rotate(45 100 100)"
              />
            </motion.svg>

            {/* Inner Rotating Magic Glow Ring */}
            <motion.div
              className="absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full border border-amber-300/40 shadow-[0_0_30px_rgba(245,158,11,0.4)]"
              initial={{ scale: 0.2, opacity: 0 }}
              animate={{
                scale: [0.2, 1.05, 1],
                opacity: [0, 1, 0.85],
              }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
            />

            {/* 6. Controlled Radiant Golden Flash / Burst */}
            <motion.div
              className="absolute w-28 h-28 rounded-full bg-amber-200"
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: [0, 2.2, 0], opacity: [0.9, 0.4, 0] }}
              transition={{ duration: 0.85, ease: 'easeOut', delay: 0.25 }}
              aria-hidden="true"
            />

            {/* 5. Rising Golden Particles & Sparks */}
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 0, scale: 0.5 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance + p.yDrift,
                  opacity: [0, 1, 0.8, 0],
                  scale: [0.5, 1.4, 0.4],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: 'easeOut',
                }}
                aria-hidden="true"
              />
            ))}

            {/* Central Crest with New Level Number */}
            <motion.div
              className="relative z-20 flex flex-col items-center justify-center w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-b from-ink-900 via-ink-950 to-ink-900 border-2 border-amber-400/90 shadow-[0_0_30px_rgba(245,158,11,0.6)]"
              initial={{ scale: 0.3, opacity: 0, y: 15 }}
              animate={{ scale: [0.3, 1.12, 1], opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, type: 'spring', damping: 12 }}
            >
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-amber-400 uppercase">
                Level
              </span>
              <motion.span
                className="font-display text-5xl sm:text-6xl font-bold text-parchment-100 leading-none filter drop-shadow-[0_2px_8px_rgba(240,161,92,0.6)]"
                initial={{ scale: 0.7 }}
                animate={{ scale: [0.7, 1.25, 1] }}
                transition={{ duration: 0.5, delay: 0.55 }}
              >
                {newLevel}
              </motion.span>
            </motion.div>
          </div>

          {/* 7 & 8. Elegant Title & Achievement Badge */}
          <motion.div
            className="mt-4 flex flex-col items-center space-y-2 z-20"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            {/* LARGE ELEGANT: LEVEL UP */}
            <h2 className="font-display tracking-[0.3em] text-2xl sm:text-3xl font-bold uppercase bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              LEVEL UP
            </h2>

            <p className="text-sm sm:text-base text-parchment-200 font-medium">
              {levelsGained > 1
                ? `Heroic Ascent! +${levelsGained} Levels Gained`
                : 'A new echelon of mastery awaits.'}
            </p>

            {/* Rewards Pill */}
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-ink-900/90 border border-amber-500/30 text-xs sm:text-sm text-parchment-200 mt-1 shadow-inner">
              <span className="text-amber-400 font-semibold">+{result.xp_gained || 0} XP</span>
              <span className="text-parchment-500/40">·</span>
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                <span>🪙</span> +{result.gold_gained || 0} Gold
              </span>
            </div>

            {/* 9. XP / Progression Completion Bar */}
            <div className="w-48 sm:w-56 mt-3">
              <div className="h-1.5 rounded-full bg-ink-800/80 overflow-hidden border border-ink-700/50">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1.1, delay: 0.75, ease: 'easeInOut' }}
                />
              </div>
            </div>

            {/* 10. Dismiss guide */}
            <p className="text-[11px] text-parchment-300/40 tracking-wider pt-2">
              Tap anywhere or press Esc to continue
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
