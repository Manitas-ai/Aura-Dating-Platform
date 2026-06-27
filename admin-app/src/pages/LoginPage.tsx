import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminAuth, ADMIN_PASSWORD } from '../context/AuthContext'

export default function LoginPage() {
  const [pw,      setPw]      = useState('')
  const [error,   setError]   = useState(false)
  const { login } = useAdminAuth()
  const navigate  = useNavigate()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pw === ADMIN_PASSWORD) {
      login()
      navigate('/dashboard')
    } else {
      setError(true)
      setPw('')
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d18] flex items-center justify-center px-6">
      <div className="w-full max-w-sm animate-[fadeIn_0.4s_ease-out]">

        <div className="text-center mb-10">
          <div className="font-serif text-3xl font-light tracking-[0.3em] text-white mb-1">aura</div>
          <div className="text-xs tracking-[0.3em] uppercase text-slate-500">Admin Console</div>
        </div>

        <div className="bg-[#131320] border border-white/8 rounded-2xl p-8">
          <h1 className="text-white font-light text-lg mb-1">Administrator access</h1>
          <p className="text-slate-500 text-sm mb-6 font-light">Enter the admin password to continue.</p>

          <form onSubmit={submit} className="space-y-4">
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              placeholder="Password"
              autoFocus
              className={`w-full bg-[#0d0d18] border rounded-xl px-4 py-3 text-white text-sm
                placeholder:text-slate-600 focus:outline-none transition-colors
                ${error ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/10 focus:border-aura-gold/40'}`}
            />
            {error && (
              <p className="text-xs text-red-400 font-light">Incorrect password.</p>
            )}
            <button type="submit" className="w-full bg-aura-gold text-[#0d0d18] font-medium py-3 rounded-xl text-sm tracking-widest uppercase hover:bg-aura-gold-lt transition-colors">
              Enter
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <a
            href="/overview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-aura-gold transition-colors font-light tracking-wider group"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            Technical Documentation
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              <polyline points="15,3 21,3 21,9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>
          <p className="text-xs text-slate-700 font-light tracking-wider">
            Restricted area — authorised personnel only
          </p>
        </div>
      </div>
    </div>
  )
}
