import React from 'react'
import { safeStorage } from '../lib/storage'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Questlog Error Boundary Caught:', error, errorInfo)
  }

  handleReset = () => {
    safeStorage.clearAllQuestlog()
    window.location.href = '/'
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink-950 text-parchment-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-ink-900 border border-parchment-500/30 rounded-xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-3xl">
              ⚠️
            </div>
            <h1 className="font-display text-2xl text-parchment-100 mb-2">
              The Realm Encountered an Obstacle
            </h1>
            <p className="text-sm text-parchment-300/80 mb-6">
              A spell misfired while loading the interface. You can reload the page or reset local realm data.
            </p>

            {this.state.error && (
              <pre className="text-xs text-left bg-ink-950 border border-ink-800 p-3 rounded mb-6 text-red-300 overflow-x-auto max-h-32">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="btn-primary px-5 py-2 rounded-lg text-sm font-medium"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="btn-secondary px-5 py-2 rounded-lg text-sm"
              >
                Reset & Go Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
