import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Profile } from '../types'

interface AuthCtx {
  profile:  Profile | null
  login:    (p: Profile) => void
  logout:   () => void
  loading:  boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

const STORAGE_KEY = 'aura_profile_id'
const PROFILE_KEY = 'aura_profile_data'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(PROFILE_KEY)
    if (stored) {
      try {
        setProfile(JSON.parse(stored))
      } catch {
        localStorage.removeItem(PROFILE_KEY)
        localStorage.removeItem(STORAGE_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = (p: Profile) => {
    setProfile(p)
    localStorage.setItem(STORAGE_KEY,  p.id)
    localStorage.setItem(PROFILE_KEY,  JSON.stringify(p))
  }

  const logout = () => {
    setProfile(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(PROFILE_KEY)
  }

  return (
    <AuthContext.Provider value={{ profile, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
