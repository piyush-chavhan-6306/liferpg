/**
 * audio.js — Web Audio API synthesizer for RPG feedback sounds.
 * No external files required. Uses the browser's built-in AudioContext.
 * Automatically respects prefers-reduced-motion (skips sound when user
 * has set the OS to reduce motion/stimulation).
 */

let ctx = null

function getCtx() {
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)()
    } catch {
      return null
    }
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

/**
 * Play a celebratory 3-note fanfare on level-up.
 * Frequencies: C5 → E5 → G5 (major chord arpeggio).
 */
export function playLevelUpFanfare() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ac = getCtx()
  if (!ac) return

  const notes = [523.25, 659.25, 783.99, 1046.5] // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.12)

    const start = ac.currentTime + i * 0.12
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.22, start + 0.04)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55)

    osc.start(start)
    osc.stop(start + 0.6)
  })
}

/**
 * Short quest-complete chime — single pleasant ping.
 */
export function playQuestComplete() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ac = getCtx()
  if (!ac) return

  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.connect(gain)
  gain.connect(ac.destination)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, ac.currentTime)         // A5
  osc.frequency.exponentialRampToValueAtTime(1320, ac.currentTime + 0.08) // E6

  gain.gain.setValueAtTime(0, ac.currentTime)
  gain.gain.linearRampToValueAtTime(0.15, ac.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35)

  osc.start(ac.currentTime)
  osc.stop(ac.currentTime + 0.4)
}

/**
 * Short purchase chime — coin-drop sound.
 */
export function playPurchase() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const ac = getCtx()
  if (!ac) return

  const freqs = [1047, 1319]
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain)
    gain.connect(ac.destination)

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq, ac.currentTime + i * 0.07)

    const start = ac.currentTime + i * 0.07
    gain.gain.setValueAtTime(0.12, start)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3)

    osc.start(start)
    osc.stop(start + 0.35)
  })
}
