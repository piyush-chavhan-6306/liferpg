import React from 'react'
import { AnimatePresence } from 'framer-motion'
import TaskItem from './TaskItem.jsx'

export default function TaskList({ tasks, onComplete, onDelete, completingId }) {
  if (tasks.length === 0) {
    return (
      <div className="panel p-8 text-center text-parchment-300/60">
        <p className="text-3xl mb-2" aria-hidden="true">📜</p>
        <p>Your quest log is empty.</p>
        <p className="text-sm mt-1">Add a quest to start earning XP.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3" aria-label="Active quests">
      <AnimatePresence initial={false}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
            completing={completingId === task.id}
          />
        ))}
      </AnimatePresence>
    </ul>
  )
}
