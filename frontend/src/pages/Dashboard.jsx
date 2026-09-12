import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { characterApi, tasksApi } from '../api/client.js'
import CharacterSheet from '../components/CharacterSheet.jsx'
import TaskList from '../components/TaskList.jsx'
import AddTaskModal from '../components/AddTaskModal.jsx'
import LevelUpOverlay from '../components/LevelUpOverlay.jsx'
import Shop from '../components/Shop.jsx'
import { CharacterSkeleton, TaskListSkeleton } from '../components/Skeletons.jsx'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [character, setCharacter] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [shopOpen, setShopOpen] = useState(false)
  const [completingId, setCompletingId] = useState(null)
  const [levelUpResult, setLevelUpResult] = useState(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [charRes, tasksRes] = await Promise.all([characterApi.get(), tasksApi.list()])
      setCharacter(charRes.data)
      setTasks(tasksRes.data.filter((t) => t.status === 'active'))
    } catch (err) {
      setError('Could not reach the server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function handleCreateTask(payload) {
    const res = await tasksApi.create(payload)
    // Optimistic-feeling: server responds fast, but we still avoid a full reload
    setTasks((prev) => [res.data, ...prev])
  }

  async function handleComplete(taskId) {
    const previousTasks = tasks
    setCompletingId(taskId)
    // Optimistic UI: remove immediately so the checkmark feels instant,
    // then reconcile with the server response (or roll back on failure).
    setTasks((prev) => prev.filter((t) => t.id !== taskId))
    try {
      const res = await tasksApi.complete(taskId)
      setCharacter(res.data.character)
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
    } catch (err) {
      setTasks(previousTasks)
      setError('Could not abandon that quest.')
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink-700 px-4 sm:px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl text-ember-400">Questlog</h1>
        <nav className="flex items-center gap-2" aria-label="Account">
          <button type="button" onClick={() => setShopOpen(true)} className="btn-secondary text-sm">
            🛒 Shop
          </button>
          <button type="button" onClick={logout} className="btn-secondary text-sm">
            Sign out
          </button>
        </nav>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 grid gap-6 sm:grid-cols-[280px_1fr]">
        <div>{loading ? <CharacterSkeleton /> : <CharacterSheet character={character} username={user?.username} />}</div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg text-parchment-100">Active Quests</h2>
            <button type="button" onClick={() => setModalOpen(true)} className="btn-primary text-sm">
              + New Quest
            </button>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2 mb-3">
              {error}
            </p>
          )}

          {loading ? (
            <TaskListSkeleton />
          ) : (
            <TaskList
              tasks={tasks}
              onComplete={handleComplete}
              onDelete={handleDelete}
              completingId={completingId}
            />
          )}
        </div>
      </main>

      <AddTaskModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={handleCreateTask} />
      <Shop
        open={shopOpen}
        onClose={() => setShopOpen(false)}
        gold={character?.gold || 0}
        onPurchased={(updatedCharacter) => setCharacter(updatedCharacter)}
      />
      <LevelUpOverlay result={levelUpResult} onDismiss={() => setLevelUpResult(null)} />
    </div>
  )
}
