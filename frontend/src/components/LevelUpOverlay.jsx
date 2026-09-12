import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// A short-lived celebratory moment. Deliberately the one big animated
// flourish in the app (see brief: "one orchestrated moment lands better
// than scattered effects") — everything else in the UI stays quiet.
export default function LevelUpOverlay({ result, onDismiss }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        angle: (i / 18) * Math.PI * 2,
        distance: 90 + Math.random() * 60,
        delay: Math.random() * 0.15,
      })),
    [result]
  )

  useEffect(() => {
    if (!result) return
    const t = setTimeout(onDismiss, 3200)
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
          onClick={onDismiss}
        >
          <div className="relative flex items-center justify-center">
            {particles.map((p) => (
              <motion.span
                key={p.id}
                className="absolute w-2 h-2 rounded-full bg-ember-400"
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos(p.angle) * p.distance,
                  y: Math.sin(p.angle) * p.distance,
                  opacity: 0,
                  scale: 0.4,
                }}
                transition={{ duration: 0.9, delay: p.delay, ease: 'easeOut' }}
              />
            ))}

            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 14 }}
              className="panel px-10 py-8 text-center bg-ink-900 border-ember-500 shadow-glow"
            >
              <p className="text-sm uppercase tracking-widest text-ember-400 mb-1">Level Up</p>
              <p className="text-5xl font-display text-parchment-100 mb-2">
                {result.character.level}
              </p>
              <p className="text-parchment-300/70 text-sm">
                {result.levels_gained > 1
                  ? `You gained ${result.levels_gained} levels!`
                  : 'A new chapter begins.'}
              </p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
