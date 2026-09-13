import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { characterApi, tasksApi, shopApi } from '../api/client.js'
import CharacterSheet from '../components/CharacterSheet.jsx'
import TaskList from '../components/TaskList.jsx'
import AddTaskModal from '../components/AddTaskModal.jsx'
import EditTaskModal from '../components/EditTaskModal.jsx'
import LevelUpOverlay from '../components/LevelUpOverlay.jsx'
import Shop from '../components/Shop.jsx'
import { CharacterSkeleton, TaskListSkeleton } from '../components/Skeletons.jsx'
import { playQuestComplete } from '../utils/audio.js'
import { ATTRIBUTES, DIFFICULTIES } from '../utils/leveling.js'

// Map equipped_theme id → CSS class
const THEME_CLASS = {
  'ember':         'theme-ember',   // legacy default
  'theme-ember':   'theme-ember',
  'theme-frost':   'theme-frost',
  'theme-verdant': 'theme-verdant',
  'theme-void':    'theme-void',
}

const TABS = ['active', 'completed']

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [character, setCharacter] = useState(null)
  const [tasks, setTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [shopOpen, setShopOpen] = useState(false)
  const [completingId, setCompletingId] = useState(null)
  const [levelUpResult, setLevelUpResult] = useState(null)
  const [activeTab, setActiveTab] = useState('active')
  const [filterAttr, setFilterAttr] = useState('all')
  const [filterDiff, setFilterDiff] = useState('all')

  const themeClass = THEME_CLASS[character?.equipped_theme] || 'theme-ember'

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [charRes, activeRes, completedRes, invRes] = await Promise.all([
        characterApi.get(),
        tasksApi.list('active'),
        tasksApi.list('completed'),
        shopApi.inventory(),
      ])
      setCharacter(charRes.data)
      setTasks(activeRes.data)
      setCompletedTasks(completedRes.data)
      setInventory(invRes.data)
    } catch {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  async function handleCreateTask(payload) {
    const res = await tasksApi.create(payload)
    setTasks((prev) => [res.data, ...prev])
  }

  async function handleEditTask(taskId, payload) {
    const res = await tasksApi.update(taskId, payload)
    setTasks((prev) => prev.map((t) => t.id === taskId ? res.data : t))
    setEditTask(null)
  }

  async function handleComplete(taskId) {
    const previousTasks = tasks
    setCompletingId(taskId)
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    try {
      const res = await tasksApi.complete(taskId)
      setCharacter(res.data.character)
      setCompletedTasks((prev) => [res.data.task, ...prev])
      playQuestComplete()
      if (res.data.leveled_up) {
        setLevelUpResult(res.data)
      }
    } catch (err) {
      setTasks(previousTasks)
      setError(err.response?.data?.detail || 'Could not complete that quest.')
    } finally {
      setCompletingId(null)
    }
  }

  async function handleDelete(taskId) {
    const previousTasks = tasks
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    try {
      await tasksApi.remove(taskId)
    } catch {
      setTasks(previousTasks)
      setError('Could not abandon that quest.')
    }
  }

  function handleEquipped(updatedCharacter) {
    setCharacter(updatedCharacter)
    // Reload inventory so badges/titles reflect
    shopApi.inventory().then((r) => setInventory(r.data)).catch(() => null)
  }

  // Filter logic for active tab
  const filteredActive = tasks.filter((t) => {
    if (filterAttr !== 'all' && t.attribute !== filterAttr) return false
    if (filterDiff !== 'all' && t.difficulty !== filterDiff) return false
    return true
  })

  const displayedTasks = activeTab === 'active' ? filteredActive : completedTasks

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClass}`}>
      <header className="border-b border-ink-700 px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl accent-text">Questlog</h1>
        <nav className="flex items-center gap-2" aria-label="Account">
          <button
            id="shop-btn"
            type="button"
            onClick={() => setShopOpen(true)}
            className="btn-secondary text-sm"
            aria-label="Open Trading Post"
          >
            🛒 Shop
          </button>
          <button type="button" onClick={logout} className="btn-secondary text-sm">
            Sign out
          </button>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 grid gap-6 sm:grid-cols-[280px_1fr]">
        <div>
          {loading
            ? <CharacterSkeleton />
            : <CharacterSheet character={character} username={user?.username} inventory={inventory} isLevelingUp={!!levelUpResult} />
          }
        </div>

        <div>
          {/* Tab Nav */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1" role="tablist" aria-label="Quest tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm px-3 py-1.5 rounded-md capitalize font-medium transition-colors ${
                    activeTab === tab
                      ? 'accent-bg text-ink-950'
                      : 'text-parchment-300/60 hover:text-parchment-100'
                  }`}
                >
                  {tab === 'active'
                    ? `⚔ Active (${tasks.length})`
                    : `✓ Done (${completedTasks.length})`
                  }
                </button>
              ))}
            </div>
            {activeTab === 'active' && (
              <button
                id="new-quest-btn"
                type="button"
                onClick={() => setModalOpen(true)}
                className="btn-primary text-sm"
              >
                + New Quest
              </button>
            )}
          </div>

          {/* Filters (active tab only) */}
          {activeTab === 'active' && (
            <div className="flex gap-2 mb-3 flex-wrap" aria-label="Quest filters">
              <select
                value={filterAttr}
                onChange={(e) => setFilterAttr(e.target.value)}
                className="input-field text-xs py-1 px-2"
                aria-label="Filter by attribute"
              >
                <option value="all">All attributes</option>
                {ATTRIBUTES.map((a) => (
                  <option key={a.key} value={a.key}>{a.icon} {a.label}</option>
                ))}
              </select>
              <select
                value={filterDiff}
                onChange={(e) => setFilterDiff(e.target.value)}
                className="input-field text-xs py-1 px-2"
                aria-label="Filter by difficulty"
              >
                <option value="all">All difficulties</option>
                {DIFFICULTIES.map((d) => (
                  <option key={d.key} value={d.key}>{d.label}</option>
                ))}
              </select>
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2 mb-3">
              {error}
            </p>
          )}

          {loading ? (
            <TaskListSkeleton />
          ) : (
            <TaskList
              tasks={displayedTasks}
              onComplete={activeTab === 'active' ? handleComplete : null}
              onDelete={activeTab === 'active' ? handleDelete : null}
              onEdit={activeTab === 'active' ? (t) => setEditTask(t) : null}
              completingId={completingId}
              isCompleted={activeTab === 'completed'}
            />
          )}
        </div>
      </main>

      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateTask} />
      <EditTaskModal task={editTask} onClose={() => setEditTask(null)} onSave={handleEditTask} />
      <Shop
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        gold={character?.gold || 0}
        equippedTheme={character?.equipped_theme}
        onPurchased={(updatedCharacter) => setCharacter(updatedCharacter)}
        onEquipped={handleEquipped}
      />
      <LevelUpOverlay result={levelUpResult} onDismiss={() => setLevelUpResult(null)} />
    </div>
  )
}

