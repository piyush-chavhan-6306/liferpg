import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bcwsiyxkpodaeempmaar.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjd3NpeXhrcG9kYWVlbXBtYWFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYzNTExNDgsImV4cCI6MjA5MTkyNzE0OH0.iG9uBnMxUG1WdBSKmJuLQqt-yczEirTw9cYHcTVTk3c'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
