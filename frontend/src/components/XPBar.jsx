import React from 'react'
import { motion } from 'framer-motion'

export default function XPBar({ xp, xpToNext, level }) {
  const pct = Math.min(100, Math.round((xp / xpToNext) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-parchment-300/70 mb-1">
        <span>Level {level}</span>
        <span aria-hidden="true">
          {xp} / {xpToNext} XP
        </span>
      </div>
      <div
        className="h-3 rounded-full bg-ink-800 border border-ink-700 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Experience progress: ${xp} of ${xpToNext} toward level ${level + 1}`}
      >
        <motion.div
          className="h-full xp-bar-fill"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}

