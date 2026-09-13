import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { authApi } from '../api/client.js'
import OAuthButtons from '../components/OAuthButtons.jsx'

export default function Register() {
  const { register: localRegister, setSession } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [resendStatus, setResendStatus] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    const cleanUsername = username.trim()
    const cleanEmail = email.trim().toLowerCase()

    try {
      // 1. Try Supabase sign up
      try {
        const redirectTo = `${window.location.origin}/auth/callback`
        const { data, error: supaError } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { username: cleanUsername },
            emailRedirectTo: redirectTo,
          },
        })

        // If Supabase session is immediate (e.g. autoconfirmed)
        if (!supaError && data?.session && data?.user) {
          const syncRes = await authApi.supabaseSync({
            email: data.user.email,
            username: cleanUsername || data.user.email.split('@')[0],
            provider: 'supabase',
            supabase_uid: data.user.id,
          })
          setSession(syncRes.data.access_token, syncRes.data.user)
          navigate('/app')
          return
        }

        if (data?.user && (!data.user.identities || data.user.identities.length === 0)) {
          setError('This email is already registered. Please sign in with your password, or use Google / GitHub.')
          return
        }

        if (supaError) {
          console.warn('Supabase auth notice, falling back to direct database registration:', supaError.message)
        }
      } catch (supaErr) {
        console.warn('Supabase auth error, falling back to direct database registration:', supaErr)
      }

      // 2. Seamless fallback: direct backend database registration
      // This bypasses any Supabase email rate limits or SMTP delivery blocks
      await localRegister(cleanUsername, cleanEmail, password)
      navigate('/app')
    } catch (err) {
      console.error('Registration error:', err)
      const msg =
        err.response?.data?.detail ||
        err.message ||
        'Could not create your character. Please check your details.'
      setError(typeof msg === 'string' ? msg : 'Could not create your character.')
    } finally {
      setBusy(false)
    }
  }

  async function handleResendEmail() {
    setResendStatus('Resending…')
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
      setResendStatus('Verification email resent! Check your inbox.')
    } catch (err) {
      setResendStatus(err.message || 'Failed to resend email.')
    }
  }

  // ----------------------------------------------------
  // Verification Sent Screen
  // ----------------------------------------------------
  if (verificationSent) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-ink-950">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md panel p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-ember-500/10 border border-ember-500/30 flex items-center justify-center text-ember-400 text-3xl shadow-lg">
            📜
          </div>

          <h2 className="text-2xl font-heading text-ember-400 mb-2">Verification Scroll Dispatched!</h2>
          <p className="text-sm text-parchment-200/80 mb-4">
            A confirmation link was sent to:
          </p>
          <div className="bg-ink-900 border border-parchment-500/20 rounded-lg py-2 px-4 mb-6 font-mono text-sm text-ember-300 break-all">
            {email}
          </div>

          <p className="text-xs text-parchment-400/80 mb-4 leading-relaxed">
            Please click the link in your email to verify your address and awaken your adventurer profile.
          </p>

          <div className="bg-amber-950/40 border border-amber-600/30 rounded-lg p-3 mb-6 text-left">
            <p className="text-xs text-amber-300 font-medium mb-1">🔍 Can't find the email?</p>
            <p className="text-xs text-parchment-300/80 leading-relaxed">
              Supabase verification emails often land in your <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folder. Search your mailbox for <em>"Supabase"</em> or check Spam.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              type="button"
              className="w-full py-2 px-4 rounded-lg bg-ink-800 hover:bg-ink-750 border border-parchment-500/30 text-parchment-200 text-sm font-medium transition-colors"
            >
              Resend Verification Email
            </button>

            {resendStatus && (
              <p className="text-xs text-ember-400 font-medium">{resendStatus}</p>
            )}

            <Link
              to="/login"
              className="block text-sm text-ember-400 hover:underline pt-2"
            >
              Already verified? Sign in here
            </Link>
          </div>
        </motion.div>
      </main>
    )
  }

  // ----------------------------------------------------
  // Main Register Form Screen
  // ----------------------------------------------------
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm panel p-8"
      >
        <h1 className="text-2xl text-ember-400 mb-1">Create your character</h1>
        <p className="text-parchment-300/70 text-sm mb-6">Every quest starts with a name.</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username" className="block text-sm mb-1 text-parchment-200">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              minLength={3}
              maxLength={24}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field w-full"
              placeholder="e.g. shadowblade"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm mb-1 text-parchment-200">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field w-full"
              placeholder="you@domain.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm mb-1 text-parchment-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field w-full"
            />
            <p className="text-xs text-parchment-300/50 mt-1">At least 6 characters.</p>
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Forging character…' : 'Begin the journey'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-parchment-500/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-ink-900 px-3 text-parchment-400/60 font-medium">Or connect with</span>
          </div>
        </div>

        <OAuthButtons onError={setError} />

        <p className="text-sm text-parchment-300/60 mt-6 text-center">
          Already adventuring?{' '}
          <Link to="/login" className="text-ember-400 hover:underline">
            Sign in
          </Link>
        </p>
        <p className="text-sm text-parchment-300/40 mt-3 text-center">
          <Link to="/" className="hover:text-parchment-300 transition-colors">← Back to home</Link>
        </p>
      </motion.div>
    </main>
  )
}
