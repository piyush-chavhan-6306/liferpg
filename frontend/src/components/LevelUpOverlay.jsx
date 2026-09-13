import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { playLevelUpFanfare } from '../utils/audio.js'

const PARTICLE_COLORS = [
  '#f0a15c', '#e8823f', '#c98fe0', '#7fb6e0', '#8fae6b', '#f3ecd8', '#ffd700',
]

// A short-lived celebratory moment. Deliberately the one big animated
// flourish in the app — everything else in the UI stays quiet.
export default function LevelUpOverlay({ result, onDismiss }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        angle: (i / 24) * Math.PI * 2,
        distance: 90 + Math.random() * 80,
        delay: Math.random() * 0.2,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        size: 4 + Math.random() * 6,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [result]
  )

  useEffect(() => {
    if (!result) return
    playLevelUpFanfare()
    const t = setTimeout(onDismiss, 3600)
    return () => clearTimeout(t)
  }, [result, onDismiss])

  return (
    <AnimatePresence>
      {result && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="status"
          aria-live="polite"
          aria-label={`Level up! You are now level ${result?.character?.level}`}
          onClick={onDismiss}
        >
          <div className="relative flex items-center justify-center">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute rounded-full"
                style={{
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  boxShadow: `0 0 6px ${p.color}`,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 1.1, delay: p.delay, ease: 'easeOut' }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.6, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              className="panel px-10 py-8 text-center bg-ink-900 border-ember-500 shadow-glow"
            >
              <p className="text-sm uppercase tracking-widest text-ember-400 mb-1">⚔ Level Up ⚔</p>
              <motion.p
                className="text-6xl font-display text-parchment-100 mb-2"
                initial={{ scale: 0.7 }}
                animate={{ scale: [0.7, 1.15, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {result.character.level}
              </motion.p>
              <p className="text-parchment-300/70 text-sm mb-1">
                {result.levels_gained > 1
                  ? `You gained ${result.levels_gained} levels!`
                  : 'A new chapter begins.'}
              </p>
              <p className="text-xs text-ember-400/70">
                +{result.xp_gained} XP · +{result.gold_gained}g
              </p>
              <p className="text-xs text-parchment-300/40 mt-3">Click anywhere to continue</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

