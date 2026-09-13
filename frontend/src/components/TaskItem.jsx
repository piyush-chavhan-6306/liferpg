import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { attributeMeta, difficultyMeta } from '../utils/leveling.js'

export default function TaskItem({ task, onComplete, onDelete, onEdit, completing, isCompleted }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const attr = attributeMeta(task.attribute)
  const diff = difficultyMeta(task.difficulty)

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
      className={`panel px-4 py-3 flex items-center gap-3 ${isCompleted ? 'opacity-70' : ''}`}
    >
      {/* Complete / Status button */}
      {isCompleted ? (
        <span
          className="shrink-0 w-8 h-8 rounded-full border-2 border-moss-400 flex items-center justify-center"
          aria-label="Completed"
        >
          <span className="text-moss-400 text-sm">✓</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => onComplete(task.id)}
          disabled={completing}
          aria-label={`Complete quest: ${task.title}`}
          className="shrink-0 w-8 h-8 rounded-full border-2 border-[var(--accent)] flex items-center justify-center
                     hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-40 focus-visible:outline-[var(--accent)]"
        >
          {completing ? (
            <span className="animate-spin h-3.5 w-3.5 border-2 border-[var(--accent)] border-t-transparent rounded-full" />
          ) : (
            <span aria-hidden="true" className="accent-text">✓</span>
          )}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <p className={`text-parchment-100 truncate ${isCompleted ? 'line-through text-parchment-300/60' : ''}`}>
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-parchment-300/60 truncate">{task.description}</p>
        )}
        <div className="flex gap-2 mt-1 flex-wrap">
          <span
            className="text-xs px-2 py-0.5 rounded-full border"
            style={{ borderColor: attr.color, color: attr.color }}
          >
            {attr.icon} {attr.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-ink-800 text-parchment-300/70 border border-ink-700">
            {diff.label}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-ink-800 accent-text/90 border border-ink-700">
            +{task.xp_reward} XP · +{task.gold_reward}g
          </span>
          {isCompleted && task.completed_at && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-ink-800 text-parchment-300/40 border border-ink-700">
              {new Date(task.completed_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — only for active quests */}
      {!isCompleted && (
        confirmingDelete ? (
          <div className="flex gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="text-xs btn-secondary !px-2 !py-1 !bg-red-950 !border-red-800 hover:!bg-red-900"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              className="text-xs btn-secondary !px-2 !py-1"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(task)}
                aria-label={`Edit quest: ${task.title}`}
                className="text-parchment-300/40 hover:accent-text transition-colors px-1 text-sm"
              >
                ✏
              </button>
            )}
            <button
              type="button"
              onClick={() => setConfirmingDelete(true)}
              aria-label={`Abandon quest: ${task.title}`}
              className="text-parchment-300/40 hover:text-red-400 transition-colors px-1"
            >
              ✕
            </button>
          </div>
        )
      )}
    </motion.li>
  )
}

