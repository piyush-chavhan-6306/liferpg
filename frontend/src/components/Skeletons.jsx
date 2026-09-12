import React from 'react'

function ShimmerBlock({ className = '' }) {
  return (
    <div
      className={`bg-gradient-to-r from-ink-800 via-ink-700 to-ink-800 bg-[length:200%_100%] animate-shimmer rounded-md ${className}`}
      aria-hidden="true"
    />
  )
}

export function CharacterSkeleton() {
  return (
    <div className="panel p-5 space-y-4" aria-hidden="true">
      <ShimmerBlock className="h-6 w-40" />
      <ShimmerBlock className="h-3 w-full" />
      <ShimmerBlock className="h-10 w-full" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <ShimmerBlock key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

export function TaskListSkeleton() {
  return (
    <div className="space-y-3" aria-hidden="true">
      {[...Array(4)].map((_, i) => (
        <ShimmerBlock key={i} className="h-16 w-full" />
      ))}
    </div>
  )
}
