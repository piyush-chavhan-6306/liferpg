import React from 'react'
import { motion } from 'framer-motion'

export default function StreakFlame({ streak }) {
  const active = streak > 0
  return (
    <div
      className="flex items-center gap-2 panel px-3 py-2"
      aria-label={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
    >
      <motion.span
        aria-hidden="true"
        className="text-xl"
        animate={active ? { scale: [1, 1.15, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
      >
        {active ? '🔥' : '🕯️'}
      </motion.span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-parchment-100">{streak}-day streak</div>
        <div className="text-xs text-parchment-300/60">
          {active ? 'Keep the flame alive' : 'Complete a quest to start one'}
        </div>
      </div>
    </div>
  )
}
