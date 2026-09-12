// Mirrors the backend curve (backend/app/leveling.py) for instant client-side
// display; the server remains the source of truth for actual XP awards.
const BASE_XP = 80
const EXPONENT = 1.45

export function xpToNextLevel(level) {
  return Math.floor(BASE_XP * Math.pow(level, EXPONENT))
}

export const ATTRIBUTES = [
  { key: 'intellect', label: 'Intellect', color: '#7fb6e0', icon: '🧠' },
  { key: 'strength', label: 'Strength', color: '#e0736a', icon: '💪' },
  { key: 'discipline', label: 'Discipline', color: '#f0a15c', icon: '🕯️' },
  { key: 'creativity', label: 'Creativity', color: '#c98fe0', icon: '🎨' },
  { key: 'vitality', label: 'Vitality', color: '#8fae6b', icon: '🌱' },
]

export const DIFFICULTIES = [
  { key: 'trivial', label: 'Trivial', xp: 8, gold: 2 },
  { key: 'easy', label: 'Easy', xp: 15, gold: 5 },
  { key: 'medium', label: 'Medium', xp: 30, gold: 12 },
  { key: 'hard', label: 'Hard', xp: 55, gold: 22 },
  { key: 'epic', label: 'Epic', xp: 100, gold: 45 },
]

export function attributeMeta(key) {
  return ATTRIBUTES.find((a) => a.key === key) || ATTRIBUTES[2]
}

export function difficultyMeta(key) {
  return DIFFICULTIES.find((d) => d.key === key) || DIFFICULTIES[1]
}
