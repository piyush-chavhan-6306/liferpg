import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(username, email, password)
      navigate('/')
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : 'Could not create your character. Check your details.')
    } finally {
      setBusy(false)
    }
  }

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

        <p className="text-sm text-parchment-300/60 mt-6 text-center">
          Already adventuring?{' '}
          <Link to="/login" className="text-ember-400 hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  )
}
