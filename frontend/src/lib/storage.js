// Safe wrapper around browser localStorage to prevent crashes from
// restricted storage, corrupt JSON, or incognito browser security exceptions.

export const safeStorage = {
  getItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null
      return window.localStorage.getItem(key)
    } catch (e) {
      console.warn(`[storage] Could not read "${key}":`, e)
      return null
    }
  },

  setItem: (key, value) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      const stringValue = typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)
      window.localStorage.setItem(key, stringValue)
    } catch (e) {
      console.warn(`[storage] Could not write "${key}":`, e)
    }
  },

  removeItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      window.localStorage.removeItem(key)
    } catch (e) {
      console.warn(`[storage] Could not remove "${key}":`, e)
    }
  },

  getParsedItem: (key) => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return null
      const raw = window.localStorage.getItem(key)
      if (!raw || raw === 'undefined' || raw === 'null') return null
      return JSON.parse(raw)
    } catch (e) {
      console.warn(`[storage] Corrupted item "${key}", auto-clearing:`, e)
      try {
        window.localStorage.removeItem(key)
      } catch {}
      return null
    }
  },

  clearAllQuestlog: () => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return
      window.localStorage.removeItem('questlog_token')
      window.localStorage.removeItem('questlog_user')
    } catch (e) {
      console.warn('[storage] Could not clear questlog keys:', e)
    }
  },
}
