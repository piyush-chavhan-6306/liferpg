import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { authApi } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function AuthCallback() {
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [status, setStatus] = useState('Verifying realm credentials…')
  const [error, setError] = useState('')

  // State for first-time OAuth character naming
  const [pendingUser, setPendingUser] = useState(null)
  const [usernameInput, setUsernameInput] = useState('')
  const [inputError, setInputError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true

    async function handleAuth() {
      try {
        // Check for URL error params (e.g. user cancelled or state expired)
        const params = new URLSearchParams(window.location.search)
        const urlError = params.get('error_description') || params.get('error')
        if (urlError) {
          throw new Error(urlError.replace(/\+/g, ' '))
        }

        // 1. Get current Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()

        if (sessionError) throw sessionError

        if (!session || !session.user) {
          // Listen for session parsing from URL hash
          const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (newSession && newSession.user && mounted) {
              await verifyAndProcessUser(newSession.user)
            }
          })
          return () => {
            authListener?.subscription?.unsubscribe()
          }
        }

        await verifyAndProcessUser(session.user)
      } catch (err) {
        console.error('Auth callback error:', err)
        if (mounted) {
          setError(err.message || 'Authentication failed. Please try again.')
          setStatus('')
        }
      }
    }

    async function verifyAndProcessUser(user) {
      if (!mounted) return
      setStatus('Checking character chronicles…')

      try {
        // Check if this account already has a registered character in the DB
        const checkRes = await authApi.checkEmail(user.email)

        if (checkRes.data.exists) {
          // Returning adventurer: sync directly into game
          setStatus('Restoring your character…')
          const payload = {
            email: user.email,
            username: checkRes.data.username,
            provider: user.app_metadata?.provider || 'oauth',
            avatar_url: user.user_metadata?.avatar_url || null,
            supabase_uid: user.id,
          }
          const res = await authApi.supabaseSync(payload)
          setSession(res.data.access_token, res.data.user)
          navigate('/app', { replace: true })
        } else {
          // First-time adventurer: prompt for character name
          const suggested = (
            user.user_metadata?.user_name ||
            user.user_metadata?.preferred_username ||
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email?.split('@')[0] ||
            'adventurer'
          ).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 20)

          setPendingUser(user)
          setUsernameInput(suggested.length >= 3 ? suggested : `hero_${Math.floor(1000 + Math.random() * 9000)}`)
          setStatus('')
        }
      } catch (err) {
        console.error('Check user error:', err)
        // Fallback: sync directly if check-email has network issue
        const payload = {
          email: user.email,
          username: user.email.split('@')[0],
          provider: user.app_metadata?.provider || 'oauth',
          avatar_url: user.user_metadata?.avatar_url || null,
          supabase_uid: user.id,
        }
        const res = await authApi.supabaseSync(payload)
        setSession(res.data.access_token, res.data.user)
        navigate('/app', { replace: true })
      }
    }

    handleAuth()

    return () => {
      mounted = false
    }
  }, [navigate, setSession])

  async function handleConfirmName(e) {
    e.preventDefault()
    setInputError('')

    const clean = usernameInput.trim()
    if (clean.length < 3) {
      setInputError('Character name must be at least 3 characters.')
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(clean)) {
      setInputError('Name can only contain letters, numbers, and underscores.')
      return
    }

    setSubmitting(true)
    try {
      const payload = {
        email: pendingUser.email,
        username: clean,
        provider: pendingUser.app_metadata?.provider || 'oauth',
        avatar_url: pendingUser.user_metadata?.avatar_url || null,
        supabase_uid: pendingUser.id,
      }

      const res = await authApi.supabaseSync(payload)
      setSession(res.data.access_token, res.data.user)
      navigate('/app', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Could not forge character sheet.'
      setInputError(typeof msg === 'string' ? msg : 'Error saving character name.')
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 px-4 py-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[450px] h-[450px] rounded-full bg-ember-500/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md bg-ink-900 border border-parchment-500/20 rounded-xl p-8 text-center shadow-2xl relative z-10"
      >
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-ember-500/10 border border-ember-500/30 flex items-center justify-center text-ember-400 text-2xl shadow-glow">
          ⚔️
        </div>

        {error ? (
          <div>
            <h2 className="text-xl font-display text-red-400 mb-2">Authentication Failed</h2>
            <p className="text-sm text-parchment-300/80 mb-6">{error}</p>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary px-6 py-2.5 rounded-lg font-medium"
            >
              Return to Login
            </button>
          </div>
        ) : pendingUser ? (
          /* First-Time Character Naming Step */
          <form onSubmit={handleConfirmName} className="text-left space-y-4">
            <div className="text-center mb-5">
              <h2 className="text-2xl font-display text-parchment-100 mb-1">
                Name Your Character
              </h2>
              <p className="text-xs text-parchment-300/70">
                Signed in as <span className="text-amber-400">{pendingUser.email}</span>. How shall the realm address you?
              </p>
            </div>

            {inputError && (
              <div className="p-3 text-xs text-red-300 bg-red-950/40 border border-red-500/30 rounded-md">
                {inputError}
              </div>
            )}

            <div>
              <label htmlFor="adventurer-name" className="block text-xs uppercase tracking-wider text-parchment-300/80 mb-1.5 font-medium">
                Adventurer Handle
              </label>
              <input
                id="adventurer-name"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                maxLength={24}
                required
                disabled={submitting}
                placeholder="e.g. shadowblade"
                className="input-field w-full text-base py-2.5 px-3"
                autoFocus
              />
              <p className="text-[11px] text-parchment-300/40 mt-1">
                3 to 24 characters (letters, numbers, underscores). This name appears in your journal and profile.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 rounded-lg text-sm font-semibold shadow-glow mt-4"
            >
              {submitting ? 'Summoning Realm…' : 'Claim Name & Begin Journey →'}
            </button>
          </form>
        ) : (
          /* Ongoing Loading Screen */
          <div>
            <h2 className="text-xl font-display text-parchment-100 mb-2">Entering the Realm</h2>
            <p className="text-sm text-parchment-300/60">{status}</p>
            <div className="mt-6 flex justify-center">
              <div className="w-8 h-8 border-2 border-ember-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
