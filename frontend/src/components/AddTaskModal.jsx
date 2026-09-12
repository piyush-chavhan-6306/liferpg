import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ATTRIBUTES, DIFFICULTIES } from '../utils/leveling.js'

export default function AddTaskModal({ open, onClose, onCreate }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [attribute, setAttribute] = useState('discipline')
  const [difficulty, setDifficulty] = useState('easy')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const titleRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => titleRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) {
      setError('A quest needs a title.')
      return
    }
    setError('')
    setBusy(true)
    try {
      await onCreate({ title: title.trim(), description: description.trim(), attribute, difficulty })
      setTitle('')
      setDescription('')
      setAttribute('discipline')
      setDifficulty('easy')
      onClose()
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not create the quest. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-quest-heading"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="panel w-full max-w-md p-6 bg-ink-900"
          >
            <h2 id="add-quest-heading" className="text-lg text-ember-400 mb-4">
              New Quest
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="task-title" className="block text-sm mb-1 text-parchment-200">
                  Title
                </label>
                <input
                  id="task-title"
                  ref={titleRef}
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-field w-full"
                  placeholder="Read 20 pages"
                />
              </div>
              <div>
                <label htmlFor="task-desc" className="block text-sm mb-1 text-parchment-200">
                  Notes (optional)
                </label>
                <textarea
                  id="task-desc"
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field w-full resize-none"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="task-attr" className="block text-sm mb-1 text-parchment-200">
                    Attribute
                  </label>
                  <select
                    id="task-attr"
                    value={attribute}
                    onChange={(e) => setAttribute(e.target.value)}
                    className="input-field w-full"
                  >
                    {ATTRIBUTES.map((a) => (
                      <option key={a.key} value={a.key}>
                        {a.icon} {a.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="task-diff" className="block text-sm mb-1 text-parchment-200">
                    Difficulty
                  </label>
                  <select
                    id="task-diff"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="input-field w-full"
                  >
                    {DIFFICULTIES.map((d) => (
                      <option key={d.key} value={d.key}>
                        {d.label} (+{d.xp} XP)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="btn-primary">
                  {busy ? 'Adding…' : 'Add Quest'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
