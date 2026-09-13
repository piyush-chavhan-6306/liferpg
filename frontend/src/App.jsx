import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import LandingPage from './pages/LandingPage.jsx'
import AuthCallback from './pages/AuthCallback.jsx'

import LoadingScreen from './components/LoadingScreen.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <LoadingScreen message="RESTORING YOUR CHARACTER" subtitle="Preparing your realm..." />
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      {/* Legacy /  protected route for existing links */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

