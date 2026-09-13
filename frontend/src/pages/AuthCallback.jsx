import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [status, setStatus] = useState('Verifying realm credentials…')
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true

    async function handleAuth() {
      try {
        // 1. Get current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session || !session.user) {
          // Wait briefly for hash tokens to parse
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession && newSession.user && mounted) {
              await processUser(newSession.user)
            }
          })
          return () => {
            authListener?.subscription?.unsubscribe()
          }
        }

        await processUser(session.user)
      } catch (err) {
        console.error('Auth callback error:', err)
        if (mounted) {
          setError(err.message || 'Authentication failed. Please try again.')
          setStatus('')
        }
      }
    }

    async function processUser(user) {
      if (!mounted) return
      setStatus('Forging character sheet…')

      const username =
        user.user_metadata?.user_name ||
        user.user_metadata?.preferred_username ||
        user.user_metadata?.name ||
        user.user_metadata?.full_name ||
        user.email?.split('@')[0]

      const payload = {
        email: user.email,
        username: username,
        provider: user.app_metadata?.provider || 'oauth',
        avatar_url: user.user_metadata?.avatar_url || null,
        supabase_uid: user.id,
      }

      const res = await authApi.supabaseSync(payload)
      setSession(res.data.access_token, res.data.user)
      navigate('/app', { replace: true })
    }

    handleAuth()

    return () => {
      mounted = false
    }
  }, [navigate, setSession])

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4">
      <div className="w-full max-w-md bg-ink-900 border border-parchment-500/20 rounded-xl p-8 text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-ember-500/10 border border-ember-500/30 flex items-center justify-center text-ember-400 text-2xl animate-pulse">
          ⚔️
        </div>

        {error ? (
          <div>
            <h2 className="text-xl font-heading text-red-400 mb-2">Authentication Failed</h2>
            <p className="text-sm text-parchment-300 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2.5 bg-ember-600 hover:bg-ember-500 text-white rounded-lg font-medium transition-colors"
            >
              Return to Login
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-heading text-parchment-100 mb-2">Entering the Realm</h2>
            <p className="text-sm text-parchment-400">{status}</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-ember-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
