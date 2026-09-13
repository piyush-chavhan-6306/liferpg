import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import MedievalCanvas from '../medieval3d/MedievalCanvas.jsx'
import OAuthButtons from '../components/OAuthButtons.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { supabase } from '../lib/supabase.js'
import { authApi } from '../api/client.js'
import { playQuestComplete, playLevelUpFanfare } from '../utils/audio.js'

// Realm Journey Waypoints
const WAYPOINTS = [
  { id: 'void', label: 'The Void', progress: 0.02, icon: '✦' },
  { id: 'awakening', label: 'Awakening', progress: 0.12, icon: '⚔' },
  { id: 'journey', label: 'The Journey', progress: 0.24, icon: '🌲' },
  { id: 'quests', label: 'Quest Board', progress: 0.36, icon: '📜' },
  { id: 'forge', label: 'The Forge', progress: 0.48, icon: '⚒' },
  { id: 'flame', label: 'The Flame', progress: 0.60, icon: '🔥' },
  { id: 'attributes', label: 'Attributes', progress: 0.72, icon: '🗿' },
  { id: 'kingdom', label: 'Kingdom', progress: 0.83, icon: '👑' },
  { id: 'gate', label: 'Castle Gate', progress: 0.96, icon: '🚪' },
]

export default function LandingPage() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isAuthSuccess, setIsAuthSuccess] = useState(false)
  const [authMode, setAuthMode] = useState('login') // 'login' | 'register'
  const [loginInput, setLoginInput] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  const { login, register: localRegister, setSession } = useAuth()
  const navigate = useNavigate()
  const containerRef = useRef(null)

  useEffect(() => {
    // Clear any lingering query parameters
    if (window.location.search.includes('error=') || window.location.search.includes('code=')) {
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0
      setScrollProgress(progress)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to a specific narrative chapter
  const scrollToProgress = (targetProgress) => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    window.scrollTo({
      top: targetProgress * maxScroll,
      behavior: 'smooth',
    })
  }

  // Handle Login submission
  async function handleLogin(e) {
    e.preventDefault()
    setAuthError('')
    setAuthBusy(true)

    const input = loginInput.trim()
    try {
      if (input.includes('@')) {
        const { data, error: supaErr } = await supabase.auth.signInWithPassword({
          email: input,
          password: loginPassword,
        })
        if (!supaErr && data?.user) {
          const syncRes = await authApi.supabaseSync({
            email: data.user.email,
            username: data.user.user_metadata?.username || data.user.email.split('@')[0],
            provider: 'supabase',
            supabase_uid: data.user.id,
          })
          setSession(syncRes.data.access_token, syncRes.data.user)
          triggerRealmEntry()
          return
        }
      }

      await login(input, loginPassword)
      triggerRealmEntry()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Incorrect credentials.'
      setAuthError(typeof msg === 'string' ? msg : 'Incorrect credentials.')
      setAuthBusy(false)
    }
  }

  // Handle Register submission
  async function handleRegister(e) {
    e.preventDefault()
    setAuthError('')
    setAuthBusy(true)

    const cleanUsername = regUsername.trim()
    const cleanEmail = regEmail.trim().toLowerCase()

    try {
      try {
        const redirectTo = `${window.location.origin}/auth/callback`
        const { data, error: supaError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: regPassword,
          options: {
            data: { username: cleanUsername },
            emailRedirectTo: redirectTo,
          },
        })

        if (!supaError && data?.session && data?.user) {
          const syncRes = await authApi.supabaseSync({
            email: data.user.email,
            username: cleanUsername || data.user.email.split('@')[0],
            provider: 'supabase',
            supabase_uid: data.user.id,
          })
          setSession(syncRes.data.access_token, syncRes.data.user)
          triggerRealmEntry()
          return
        }
      } catch (supaErr) {
        console.warn('Supabase fallback:', supaErr)
      }

      await localRegister(cleanUsername, cleanEmail, regPassword)
      triggerRealmEntry()
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Could not awaken your character.'
      setAuthError(typeof msg === 'string' ? msg : 'Registration failed.')
      setAuthBusy(false)
    }
  }

  // Trigger doors opening and camera glide into dashboard
  function triggerRealmEntry() {
    playLevelUpFanfare()
    setIsAuthSuccess(true)
    setTimeout(() => {
      navigate('/app')
    }, 1400)
  }

  // Active waypoint determination
  const currentWaypoint =
    WAYPOINTS.slice().reverse().find((w) => scrollProgress >= w.progress - 0.05) || WAYPOINTS[0]

  return (
    <div
      ref={containerRef}
      className="relative bg-[#06050b] text-parchment-100 min-h-[900vh] selection:bg-amber-600/30 selection:text-amber-200"
    >
      {/* 3D WebGL World Viewport (Fixed background across all 9 scenes) */}
      <MedievalCanvas scrollProgress={scrollProgress} isAuthSuccess={isAuthSuccess} />

      {/* Atmospheric Vignette Overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-10"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 35%, rgba(6,5,11,0.75) 100%)',
        }}
      />

      {/* Top Realm Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between pointer-events-auto bg-gradient-to-b from-[#06050b]/90 via-[#06050b]/50 to-transparent backdrop-blur-[2px]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded border border-amber-500/40 bg-ink-950/80 flex items-center justify-center text-amber-400 text-sm shadow-md group-hover:border-amber-400 transition-colors">
            ⚔
          </div>
          <span className="font-heading tracking-widest text-base uppercase bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent font-medium">
            Life RPG
          </span>
        </Link>

        {/* Current Realm Indicator Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full border border-parchment-500/20 bg-ink-950/60 text-xs font-heading tracking-wider text-parchment-200/80">
          <span className="text-amber-400">{currentWaypoint.icon}</span>
          <span className="uppercase">{currentWaypoint.label}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-heading tracking-wider uppercase">
          <button
            onClick={() => scrollToProgress(0.96)}
            className="text-parchment-300/80 hover:text-amber-300 px-3 py-1.5 transition-colors hidden sm:block"
          >
            Castle Gate
          </button>
          <button
            onClick={() => scrollToProgress(0.96)}
            className="px-4 py-1.5 rounded bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-ink-950 font-semibold shadow-lg shadow-amber-900/30 transition-all transform hover:scale-[1.02]"
          >
            Enter Realm
          </button>
        </div>
      </header>

      {/* Left Realm Waypoint Track */}
      <aside className="fixed left-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-3 pointer-events-auto">
        {WAYPOINTS.map((w) => {
          const isActive = currentWaypoint.id === w.id
          return (
            <button
              key={w.id}
              onClick={() => scrollToProgress(w.progress)}
              className={`flex items-center gap-2.5 text-left group transition-all duration-300 ${
                isActive ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-80'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? 'bg-amber-400 shadow-[0_0_10px_#f59e0b]'
                    : 'bg-parchment-400/50 group-hover:bg-amber-300'
                }`}
              />
              <span
                className={`text-[10px] font-heading tracking-widest uppercase transition-colors ${
                  isActive ? 'text-amber-300 font-medium' : 'text-parchment-400/80'
                }`}
              >
                {w.label}
              </span>
            </button>
          )
        })}
      </aside>

      {/* ----------------------------------------------------
       * SCENE 1: THE VOID (0% - 8%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-center justify-center px-4 text-center pointer-events-none transition-opacity duration-700 ${
          scrollProgress < 0.08 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-2xl flex flex-col items-center pointer-events-auto">
          <div className="w-12 h-12 mb-6 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shadow-[0_0_20px_rgba(245,158,11,0.15)] bg-ink-950/40">
            ✦
          </div>
          <h1 className="text-4xl md:text-6xl font-heading tracking-[0.25em] uppercase font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-200 to-amber-600 drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] mb-4">
            Life RPG
          </h1>
          <p className="text-sm md:text-base font-heading tracking-[0.2em] uppercase text-parchment-300/80 font-light max-w-lg mb-8">
            Every legend begins with a single step.
          </p>
          <div
            onClick={() => scrollToProgress(0.12)}
            className="flex flex-col items-center gap-2 cursor-pointer group pt-4"
          >
            <span className="text-[10px] font-heading tracking-[0.3em] uppercase text-amber-400/80 group-hover:text-amber-300">
              Scroll to awaken
            </span>
            <span className="text-amber-400/70 text-xs animate-bounce">▼</span>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 2: THE AWAKENING (8% - 18%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-center justify-end pb-24 px-6 text-center pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.08 && scrollProgress < 0.18 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-md bg-ink-950/85 border border-amber-500/25 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
          <div className="text-amber-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            Chapter I
          </div>
          <h2 className="text-xl md:text-2xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            The Awakening
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif">
            From the quiet abyss, your adventurer stirs. Clad in forged steel and royal mantle, the journey from everyday routine into heroic purpose begins.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 3: THE JOURNEY (18% - 30%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-start justify-center pl-8 md:pl-28 px-6 pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.18 && scrollProgress < 0.30 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-md bg-ink-950/85 border border-amber-500/25 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
          <div className="text-amber-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            Chapter II
          </div>
          <h2 className="text-xl md:text-2xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            The Mountain Road
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif">
            A cobblestone highway stretches through pine-covered slopes and rocky crags. Each step forward mirrors your real-world discipline.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 4: THE QUEST BOARD (30% - 42%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-end justify-center pr-8 md:pr-24 px-6 pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.30 && scrollProgress < 0.42 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-sm bg-ink-950/85 border border-amber-500/30 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto text-left">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            <span>📜</span>
            <span>Chapter III</span>
          </div>
          <h2 className="text-xl md:text-2xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            The Ancient Quest Board
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif mb-4">
            Turn your daily goals into epic contracts. Slay procrastination and claim your rightful bounty.
          </p>
          <div className="space-y-2 border-t border-parchment-500/20 pt-3">
            <div className="flex items-center justify-between text-xs bg-ink-900/80 p-2 rounded border border-parchment-500/15">
              <span className="text-parchment-200">⚔ Complete daily focus sprint</span>
              <span className="text-amber-400 font-mono">+50 XP</span>
            </div>
            <div className="flex items-center justify-between text-xs bg-ink-900/80 p-2 rounded border border-parchment-500/15">
              <span className="text-parchment-200">🧠 30 mins deep reading</span>
              <span className="text-yellow-400 font-mono">+20 Gold</span>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 5: THE FORGE & PROGRESSION (42% - 54%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-start justify-center pl-8 md:pl-28 px-6 pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.42 && scrollProgress < 0.54 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-sm bg-ink-950/85 border border-orange-500/30 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto text-left">
          <div className="flex items-center gap-2 text-orange-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            <span>⚒</span>
            <span>Chapter IV</span>
          </div>
          <h2 className="text-xl md:text-2xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            The Blacksmith's Forge
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif mb-4">
            Discipline is tempered like folded steel. Each task completed fuels the forge fire, leveling your character up from novice to mythic.
          </p>
          <div className="bg-ink-900/90 border border-orange-500/30 p-3 rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] text-parchment-400 uppercase tracking-widest">Ascension</div>
              <div className="text-sm font-heading text-amber-300">Level 4 → Level 5</div>
            </div>
            <div className="text-orange-400 font-bold text-xs bg-orange-950/60 px-2.5 py-1 rounded border border-orange-500/40">
              LEVEL UP
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 6: THE ETERNAL FLAME (54% - 66%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-end justify-center pr-8 md:pr-24 px-6 pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.54 && scrollProgress < 0.66 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-sm bg-ink-950/85 border border-amber-500/30 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto text-left">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            <span>🔥</span>
            <span>Chapter V</span>
          </div>
          <h2 className="text-xl md:text-2xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            Shrine of the Flame
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif mb-4">
            A warrior is not forged in a single day. Maintain your daily streak to feed the sacred fire and unlock multiplier rewards.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-ink-900/80 p-2 rounded border border-parchment-500/20">
              <div className="text-amber-400 font-bold">3 Days</div>
              <div className="text-[10px] text-parchment-400">Spark</div>
            </div>
            <div className="bg-ink-900/80 p-2 rounded border border-amber-500/40 shadow-sm shadow-amber-900/30">
              <div className="text-amber-400 font-bold">7 Days</div>
              <div className="text-[10px] text-amber-300">Blaze</div>
            </div>
            <div className="bg-ink-900/80 p-2 rounded border border-yellow-500/50 shadow-md shadow-yellow-900/40">
              <div className="text-yellow-300 font-bold">30 Days</div>
              <div className="text-[10px] text-yellow-200">Eternal</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 7: ATTRIBUTES (66% - 78%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-center justify-end pb-20 px-6 pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.66 && scrollProgress < 0.78 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-xl bg-ink-950/90 border border-amber-500/30 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto text-center">
          <div className="text-amber-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            Chapter VI
          </div>
          <h2 className="text-xl md:text-2xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            The Pillars of Mastery
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif max-w-md mx-auto mb-4">
            Four ancient obelisks channel your efforts into tangible character attributes.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs text-left">
            <div className="bg-ink-900/80 p-2.5 rounded border border-red-500/30">
              <div className="text-red-400 font-semibold mb-0.5">⚔ Strength</div>
              <div className="text-[10px] text-parchment-400">Physical health & power</div>
            </div>
            <div className="bg-ink-900/80 p-2.5 rounded border border-blue-500/30">
              <div className="text-blue-400 font-semibold mb-0.5">🧠 Intellect</div>
              <div className="text-[10px] text-parchment-400">Study, focus & logic</div>
            </div>
            <div className="bg-ink-900/80 p-2.5 rounded border border-amber-500/30">
              <div className="text-amber-400 font-semibold mb-0.5">🕯 Discipline</div>
              <div className="text-[10px] text-parchment-400">Consistency & habits</div>
            </div>
            <div className="bg-ink-900/80 p-2.5 rounded border border-emerald-500/30">
              <div className="text-emerald-400 font-semibold mb-0.5">🌱 Vitality</div>
              <div className="text-[10px] text-parchment-400">Sleep & nourishment</div>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 8: KINGDOM REVEAL (78% - 88%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-20 flex flex-col items-center justify-start pt-24 px-6 text-center pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.78 && scrollProgress < 0.88 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="max-w-lg bg-ink-950/85 border border-amber-500/30 p-6 rounded-xl backdrop-blur-md shadow-2xl pointer-events-auto">
          <div className="text-amber-400 text-xs font-heading tracking-[0.25em] uppercase mb-1">
            Chapter VII
          </div>
          <h2 className="text-2xl md:text-3xl font-heading text-parchment-100 uppercase tracking-wider mb-2">
            The Kingdom Awaits
          </h2>
          <p className="text-xs text-parchment-300/80 leading-relaxed font-serif">
            Rising beyond the mist stands the great fortress. Twin stone bastions and torchlit ramparts mark the gateway to your personal realm.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------
       * SCENE 9: CASTLE GATES & GATEKEEPER AUTHENTICATION (88% - 100%)
       * ---------------------------------------------------- */}
      <section
        className={`fixed inset-0 z-30 flex flex-col items-center justify-center px-4 pointer-events-none transition-opacity duration-700 ${
          scrollProgress >= 0.88 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-ink-950/95 border-2 border-amber-600/40 rounded-2xl p-7 md:p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] pointer-events-auto relative overflow-hidden"
        >
          {/* Subtle Golden Crest at Portal */}
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-lg shadow-inner">
            🏰
          </div>

          <h2 className="text-2xl font-heading text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-300 to-amber-500 uppercase tracking-wider mb-1">
            Enter Your Realm
          </h2>
          <p className="text-xs text-center text-parchment-300/80 mb-6 font-serif">
            Cross the castle threshold to access your quests, character, and kingdom.
          </p>

          {/* Auth Mode Toggle Tabs */}
          <div className="flex rounded-lg bg-ink-900/90 p-1 border border-parchment-500/20 mb-6 text-xs font-heading uppercase tracking-wider">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login')
                setAuthError('')
              }}
              className={`flex-1 py-2 rounded-md transition-all ${
                authMode === 'login'
                  ? 'bg-amber-600 text-ink-950 font-bold shadow'
                  : 'text-parchment-300/70 hover:text-parchment-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register')
                setAuthError('')
              }}
              className={`flex-1 py-2 rounded-md transition-all ${
                authMode === 'register'
                  ? 'bg-amber-600 text-ink-950 font-bold shadow'
                  : 'text-parchment-300/70 hover:text-parchment-100'
              }`}
            >
              Create Character
            </button>
          </div>

          {/* Error Banner */}
          {authError && (
            <div className="mb-4 p-3 rounded bg-red-950/70 border border-red-700/50 text-red-200 text-xs text-center">
              {authError}
            </div>
          )}

          {/* Form */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-parchment-300/90 mb-1">
                  Username or Email
                </label>
                <input
                  type="text"
                  required
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="Enter your adventurer name or email"
                  className="w-full bg-ink-900 border border-parchment-500/30 rounded-lg px-3 py-2 text-sm text-parchment-100 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-parchment-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-parchment-300/90 mb-1">
                  Secret Passphrase
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-ink-900 border border-parchment-500/30 rounded-lg px-3 py-2 text-sm text-parchment-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-ink-950 font-heading font-bold text-sm tracking-wider uppercase shadow-lg shadow-amber-900/40 transition-all transform hover:scale-[1.01] disabled:opacity-50"
              >
                {authBusy ? 'Opening Castle Gates…' : 'Enter the Realm'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-parchment-300/90 mb-1">
                  Adventurer Name
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="e.g. shadow_blade"
                  className="w-full bg-ink-900 border border-parchment-500/30 rounded-lg px-3 py-2 text-sm text-parchment-100 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-parchment-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-parchment-300/90 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="adventurer@realm.com"
                  className="w-full bg-ink-900 border border-parchment-500/30 rounded-lg px-3 py-2 text-sm text-parchment-100 focus:outline-none focus:border-amber-500 transition-colors placeholder:text-parchment-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-heading uppercase tracking-wider text-parchment-300/90 mb-1">
                  Passphrase (Min. 6 chars)
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-ink-900 border border-parchment-500/30 rounded-lg px-3 py-2 text-sm text-parchment-100 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={authBusy}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-500 text-ink-950 font-heading font-bold text-sm tracking-wider uppercase shadow-lg shadow-amber-900/40 transition-all transform hover:scale-[1.01] disabled:opacity-50"
              >
                {authBusy ? 'Forging Character…' : 'Claim Title & Enter'}
              </button>
            </form>
          )}

          {/* Social OAuth Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-parchment-500/20" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-heading tracking-widest text-parchment-400">
              <span className="bg-ink-950 px-3">or align with</span>
            </div>
          </div>

          <OAuthButtons onError={(err) => setAuthError(err)} />
        </motion.div>
      </section>

      {/* Scroll track spacer allowing continuous travel */}
      <div className="relative z-0 h-[800vh] pointer-events-none" />
    </div>
  )
}
