import React from 'react'
import { motion } from 'framer-motion'
import XPBar from './XPBar.jsx'
import StreakFlame from './StreakFlame.jsx'
import { ATTRIBUTES } from '../utils/leveling.js'

// Map shop item ID → display label for titles
const TITLE_LABELS = {
  'title-adept': 'Adept',
  'title-archon': 'Archon',
}

export default function CharacterSheet({ character, username, inventory = [], isLevelingUp = false }) {
  if (!character) return null
  const maxAttr = Math.max(1, ...ATTRIBUTES.map((a) => character[a.key] || 0))

  const badges = inventory.filter((i) => i.category === 'badge')
  const equippedTitle =
    inventory.find((i) => i.category === 'title' && TITLE_LABELS[i.id])

  return (
    <section
      className={`panel p-5 relative transition-all duration-700 ${
        isLevelingUp
          ? 'ring-2 ring-amber-400/90 shadow-[0_0_35px_rgba(245,158,11,0.5)] scale-[1.02]'
          : ''
      }`}
      aria-labelledby="character-heading"
    >
      {isLevelingUp && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-lg overflow-hidden z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/15 via-transparent to-amber-400/10 animate-pulse" />
          {[12, 28, 48, 68, 84].map((left, idx) => (
            <motion.span
              key={idx}
              className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_6px_#fbbf24]"
              style={{ left: `${left}%` }}
              animate={{
                y: [-5, -80],
                opacity: [0, 1, 0],
                scale: [0.6, 1.2, 0.4],
              }}
              transition={{
                duration: 1.5 + idx * 0.2,
                repeat: Infinity,
                delay: idx * 0.15,
                ease: 'easeOut',
              }}
            />
          ))}
        </motion.div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 id="character-heading" className="text-xl text-parchment-100 flex items-center gap-2 flex-wrap">
            {username}
            {equippedTitle && (
              <span className="text-xs px-2 py-0.5 rounded-full border accent-border accent-text font-normal">
                {equippedTitle.icon} {TITLE_LABELS[equippedTitle.id]}
              </span>
            )}
          </h2>
          <p className="text-sm text-parchment-300/60">Level {character.level} Adventurer</p>
          {badges.length > 0 && (
            <div className="flex gap-1.5 mt-1.5 flex-wrap" aria-label="Earned badges">
              {badges.map((b) => (
                <span
                  key={b.id}
                  title={b.name + ' — ' + b.description}
                  aria-label={b.name}
                  className="text-base cursor-default"
                >
                  {b.icon}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 accent-text font-semibold" aria-label={`${character.gold} gold`}>
          <span aria-hidden="true">🪙</span>
          <motion.span key={character.gold} initial={{ scale: 1.3 }} animate={{ scale: 1 }}>
            {character.gold}
          </motion.span>
        </div>
      </div>

      <div className="mb-4">
        <XPBar xp={character.xp} xpToNext={character.xp_to_next} level={character.level} />
      </div>

      <div className="mb-4">
        <StreakFlame streak={character.streak_count} />
      </div>

      <h3 className="text-sm uppercase tracking-wide text-parchment-300/50 mb-2">Attributes</h3>
      <ul className="space-y-2">
        {ATTRIBUTES.map((attr) => {
          const value = character[attr.key] || 0
          const pct = Math.round((value / maxAttr) * 100)
          return (
            <li key={attr.key} className="flex items-center gap-2">
              <span aria-hidden="true" className="w-5 text-center">
                {attr.icon}
              </span>
              <span className="w-20 text-sm text-parchment-200">{attr.label}</span>
              <div className="flex-1 h-2 rounded-full bg-ink-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: attr.color }}
                  initial={false}
                  animate={{ width: `${Math.max(pct, value > 0 ? 6 : 0)}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 18 }}
                />
              </div>
              <span className="w-6 text-right text-sm text-parchment-300/70">{value}</span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

