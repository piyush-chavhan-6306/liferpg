import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shopApi } from '../api/client.js'

export default function Shop({ open, onClose, gold, onPurchased }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasingId, setPurchasingId] = useState(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    shopApi
      .list()
      .then((res) => setItems(res.data))
      .catch(() => setError('Could not load the shop right now.'))
      .finally(() => setLoading(false))
  }, [open])

  async function handleBuy(item) {
    setError('')
    setPurchasingId(item.id)
    try {
      const res = await shopApi.purchase(item.id)
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i)))
      onPurchased(res.data.character)
    } catch (err) {
      setError(err.response?.data?.detail || 'Purchase failed.')
    } finally {
      setPurchasingId(null)
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
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="shop-heading"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="panel w-full max-w-lg p-6 bg-ink-900 max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="shop-heading" className="text-lg text-ember-400">
                The Trading Post
              </h2>
              <div className="flex items-center gap-1 text-ember-400 font-semibold">
                <span aria-hidden="true">🪙</span> {gold}
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2 mb-3">
                {error}
              </p>
            )}

            {loading ? (
              <p className="text-parchment-300/60 text-sm">Loading wares…</p>
            ) : (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-3 border border-ink-700 rounded-md px-3 py-2"
                  >
                    <span className="text-xl" aria-hidden="true">
                      {item.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-parchment-100 text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-parchment-300/60">{item.description}</p>
                    </div>
                    {item.owned ? (
                      <span className="text-xs text-moss-400 px-2 py-1">Owned</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(item)}
                        disabled={purchasingId === item.id || gold < item.cost}
                        className="btn-secondary text-xs shrink-0"
                      >
                        {purchasingId === item.id ? '…' : `${item.cost}g`}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end mt-4">
              <button type="button" onClick={onClose} className="btn-secondary">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
