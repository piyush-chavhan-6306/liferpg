import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function OAuthButtons({ onError }) {
  const [loadingProvider, setLoadingProvider] = useState(null)

  async function handleOAuth(provider) {
    try {
      setLoadingProvider(provider)
      if (onError) onError('')

      const redirectTo = `${window.location.origin}/auth/callback`

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (err) {
      console.error(`${provider} OAuth error:`, err)
      if (onError) {
        onError(err.message || `Failed to sign in with ${provider}.`)
      }
      setLoadingProvider(null)
    }
  }

  return (
    <div className="space-y-3 w-full">
      {/* Google Sign In */}
      <button
        type="button"
        onClick={() => handleOAuth('google')}
        disabled={!!loadingProvider}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-parchment-500/20 bg-ink-900/80 hover:bg-ink-800 hover:border-parchment-500/40 text-parchment-100 text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loadingProvider === 'google' ? (
          <div className="w-5 h-5 border-2 border-ember-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
        )}
        <span>{loadingProvider === 'google' ? 'Summoning Google…' : 'Continue with Google'}</span>
      </button>

      {/* GitHub Sign In */}
      <button
        type="button"
        onClick={() => handleOAuth('github')}
        disabled={!!loadingProvider}
        className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-parchment-500/20 bg-ink-900/80 hover:bg-ink-800 hover:border-parchment-500/40 text-parchment-100 text-sm font-medium transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {loadingProvider === 'github' ? (
          <div className="w-5 h-5 border-2 border-ember-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-4 h-4 fill-current text-parchment-100" viewBox="0 0 24 24">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
        )}
        <span>{loadingProvider === 'github' ? 'Summoning GitHub…' : 'Continue with GitHub'}</span>
      </button>
    </div>
  )
}
