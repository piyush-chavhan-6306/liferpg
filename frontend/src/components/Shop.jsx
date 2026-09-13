import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shopApi, characterApi } from '../api/client.js'
import { playPurchase } from '../utils/audio.js'

const CATEGORIES = [
  { key: 'all', label: 'All' },
  { key: 'theme', label: '🎨 Themes' },
  { key: 'badge', label: '🏅 Badges' },
  { key: 'title', label: '🏷️ Titles' },
]

export default function Shop({ open, onClose, gold, equippedTheme, onPurchased, onEquipped }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [purchasingId, setPurchasingId] = useState(null)
  const [equippingId, setEquippingId] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    setError('')
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
      playPurchase()
      onPurchased(res.data.character)
    } catch (err) {
      setError(err.response?.data?.detail || 'Purchase failed.')
    } finally {
      setPurchasingId(null)
    }
  }

  async function handleEquip(item) {
    setError('')
    setEquippingId(item.id)
    try {
      const res = await characterApi.equip(item.id)
      onEquipped(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Could not equip that item.')
    } finally {
      setEquippingId(null)
    }
  }

  const filteredItems = activeCategory === 'all'
    ? items
    : items.filter((i) => i.category === activeCategory)

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
            className="panel w-full max-w-lg p-6 bg-ink-900 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="shop-heading" className="text-lg accent-text">
                The Trading Post
              </h2>
              <div className="flex items-center gap-1 accent-text font-semibold">
                <span aria-hidden="true">🪙</span> {gold}
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-1 mb-4 flex-wrap" role="tablist" aria-label="Shop categories">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  role="tab"
                  aria-selected={activeCategory === cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    activeCategory === cat.key
                      ? 'accent-bg text-ink-950 border-transparent font-semibold'
                      : 'border-ink-700 text-parchment-300/70 hover:border-ink-600 bg-ink-800/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
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
                {filteredItems.map((item) => {
                  const isEquipped = item.id === equippedTheme && item.category === 'theme'
                  return (
                    <li
                      key={item.id}
                      className={`flex items-center gap-3 border rounded-md px-3 py-2 transition-colors ${
                        isEquipped ? 'border-[var(--accent)] bg-ink-800' : 'border-ink-700'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">{item.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-parchment-100 text-sm font-medium">
                          {item.name}
                          {isEquipped && (
                            <span className="ml-2 text-xs accent-text">(Equipped)</span>
                          )}
                        </p>
                        <p className="text-xs text-parchment-300/60 truncate">{item.description}</p>
                      </div>
                      {item.owned ? (
                        item.category === 'badge' ? (
                          <span className="text-xs text-moss-400 px-2 py-1 shrink-0">Owned</span>
                        ) : isEquipped ? (
                          <span className="text-xs accent-text px-2 py-1 shrink-0">✓ Active</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleEquip(item)}
                            disabled={equippingId === item.id}
                            className="btn-secondary text-xs shrink-0 !px-2 !py-1"
                            aria-label={`Equip ${item.name}`}
                          >
                            {equippingId === item.id ? '…' : 'Equip'}
                          </button>
                        )
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleBuy(item)}
                          disabled={purchasingId === item.id || gold < item.cost}
                          className="btn-primary text-xs shrink-0 !px-2 !py-1"
                          aria-label={`Buy ${item.name} for ${item.cost} gold`}
                        >
                          {purchasingId === item.id ? '…' : `${item.cost}g`}
                        </button>
                      )}
                    </li>
                  )
                })}
                {filteredItems.length === 0 && (
                  <li className="text-center text-parchment-300/50 text-sm py-6">
                    No items in this category.
                  </li>
                )}
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

