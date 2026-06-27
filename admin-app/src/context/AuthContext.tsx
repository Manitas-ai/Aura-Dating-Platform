import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AdminAuthCtx {
  authed:  boolean
  login:   () => void
  logout:  () => void
}

const ADMIN_PASSWORD = 'aura2024'
const STORAGE_KEY    = 'aura_admin_authed'

const AdminAuthContext = createContext<AdminAuthCtx | null>(null)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    setAuthed(localStorage.getItem(STORAGE_KEY) === '1')
  }, [])

  const login  = () => { setAuthed(true);  localStorage.setItem(STORAGE_KEY, '1') }
  const logout = () => { setAuthed(false); localStorage.removeItem(STORAGE_KEY)   }

  return (
    <AdminAuthContext.Provider value={{ authed, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider')
  return ctx
}

export { ADMIN_PASSWORD }
