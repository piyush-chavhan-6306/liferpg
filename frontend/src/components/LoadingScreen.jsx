import React from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen({
  message = 'RESTORING YOUR CHARACTER',
  subtitle = 'Preparing your realm...',
  fullScreen = true,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center bg-ink-950 text-parchment-100 select-none overflow-hidden relative ${
        fullScreen ? 'fixed inset-0 z-50 min-h-screen w-screen' : 'py-16 w-full'
      }`}
      role="status"
      aria-live="polite"
      aria-label={`${message}. ${subtitle}`}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="w-[320px] sm:w-[460px] h-[320px] sm:h-[460px] rounded-full bg-ember-500/10 blur-3xl animate-pulse" />
        <div className="w-[200px] h-[200px] rounded-full bg-parchment-200/5 blur-2xl" />
      </div>

      <div className="relative flex flex-col items-center justify-center">
        {/* Summoning Circle & Rune Rings */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
          {/* Outer rotating rune ring with archaic tick marks & cardinal glyphs */}
          <motion.svg
            className="absolute inset-0 w-full h-full text-ember-400/40"
            viewBox="0 0 200 200"
            fill="none"
            stroke="currentColor"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              duration: 26,
              ease: 'linear',
            }}
            aria-hidden="true"
          >
            {/* Outer fine border */}
            <circle cx="100" cy="100" r="94" strokeWidth="1" strokeDasharray="3 4" opacity="0.6" />
            <circle cx="100" cy="100" r="88" strokeWidth="1.2" opacity="0.8" />

            {/* 12 Celestial Rune notches around perimeter */}
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = (i * 30 * Math.PI) / 180
              const x1 = 100 + Math.cos(angle) * 88
              const y1 = 100 + Math.sin(angle) * 88
              const x2 = 100 + Math.cos(angle) * 94
              const y2 = 100 + Math.sin(angle) * 94
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeWidth="1.5" stroke="currentColor" />
            })}

            {/* Cardinal Rune Nodes */}
            <circle cx="100" cy="8" r="2.5" fill="currentColor" />
            <circle cx="100" cy="192" r="2.5" fill="currentColor" />
            <circle cx="8" cy="100" r="2.5" fill="currentColor" />
            <circle cx="192" cy="100" r="2.5" fill="currentColor" />

            {/* Geometric Octagram lines */}
            <polygon
              points="100,16 160,100 100,184 40,100"
              strokeWidth="0.75"
              stroke="currentColor"
              opacity="0.3"
            />
            <polygon
              points="100,16 184,100 100,184 16,100"
              strokeWidth="0.5"
              stroke="currentColor"
              opacity="0.2"
              transform="rotate(45 100 100)"
            />
          </motion.svg>

          {/* Inner counter-rotating ring with subtle geometric wave */}
          <motion.svg
            className="absolute w-36 h-36 sm:w-40 sm:h-40 text-ember-300/50"
            viewBox="0 0 160 160"
            fill="none"
            stroke="currentColor"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              duration: 18,
              ease: 'linear',
            }}
            aria-hidden="true"
          >
            <circle cx="80" cy="80" r="72" strokeWidth="1" strokeDasharray="6 3 2 3" opacity="0.7" />
            <circle cx="80" cy="80" r="62" strokeWidth="0.8" opacity="0.5" />
            <circle cx="80" cy="80" r="48" strokeWidth="0.6" strokeDasharray="1 4" opacity="0.6" />

            {/* 8 Mystic Accent Dots */}
            {Array.from({ length: 8 }).map((_, i) => {
              const angle = (i * 45 * Math.PI) / 180
              const x = 80 + Math.cos(angle) * 62
              const y = 80 + Math.sin(angle) * 62
              return <circle key={i} cx={x} cy={y} r="1.5" fill="currentColor" />
            })}
          </motion.svg>

          {/* Central Pulsing Sigil / Emblem */}
          <motion.div
            className="relative z-10 flex items-center justify-center w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-ink-900/90 border border-ember-400/40 shadow-glow"
            animate={{
              scale: [0.95, 1.05, 0.95],
              boxShadow: [
                '0 0 15px rgba(240, 161, 92, 0.25)',
                '0 0 28px rgba(240, 161, 92, 0.55)',
                '0 0 15px rgba(240, 161, 92, 0.25)',
              ],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
          >
            {/* Elegant RPG Sword Sigil */}
            <span className="text-2xl sm:text-3xl select-none filter drop-shadow-[0_0_8px_rgba(240,161,92,0.7)]" aria-hidden="true">
              ⚔️
            </span>
          </motion.div>

          {/* Rising Ember Sparks */}
          {[
            { id: 1, x: -28, duration: 2.4, delay: 0 },
            { id: 2, x: 24, duration: 2.9, delay: 0.6 },
            { id: 3, x: -12, duration: 2.2, delay: 1.2 },
            { id: 4, x: 16, duration: 2.7, delay: 1.8 },
          ].map((ember) => (
            <motion.span
              key={ember.id}
              className="absolute w-1.5 h-1.5 rounded-full bg-ember-300 shadow-[0_0_6px_#f0a15c]"
              initial={{ y: 20, x: ember.x, opacity: 0, scale: 0.8 }}
              animate={{
                y: -65,
                opacity: [0, 0.85, 0],
                scale: [0.8, 1.2, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: ember.duration,
                delay: ember.delay,
                ease: 'easeOut',
              }}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Text Presentation */}
        <motion.div
          className="mt-6 text-center space-y-1.5 z-10 px-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h2 className="font-display tracking-[0.22em] text-xs sm:text-sm uppercase text-parchment-100 font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {message}
          </h2>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-parchment-300/60 tracking-wider">
              {subtitle}
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
