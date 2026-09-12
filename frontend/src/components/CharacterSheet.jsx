import React from 'react'
import { motion } from 'framer-motion'
import XPBar from './XPBar.jsx'
import StreakFlame from './StreakFlame.jsx'
import { ATTRIBUTES } from '../utils/leveling.js'

export default function CharacterSheet({ character, username }) {
  if (!character) return null
  const maxAttr = Math.max(1, ...ATTRIBUTES.map((a) => character[a.key] || 0))

  return (
    <section className="panel p-5" aria-labelledby="character-heading">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 id="character-heading" className="text-xl text-parchment-100">
            {username}
          </h2>
          <p className="text-sm text-parchment-300/60">Level {character.level} Adventurer</p>
        </div>
        <div className="flex items-center gap-1.5 text-ember-400 font-semibold" aria-label={`${character.gold} gold`}>
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
