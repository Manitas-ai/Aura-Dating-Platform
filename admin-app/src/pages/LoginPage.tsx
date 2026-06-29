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

        <div className="mt-8 w-full flex flex-col gap-3">
          <p className="text-[10px] text-slate-600 font-light tracking-[0.2em] uppercase text-center mb-1">
            Project Documentation
          </p>

          <a
            href="/overview.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-[#131320] border border-white/8 hover:border-aura-gold/30 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-[#1a1a2e]"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center group-hover:bg-aura-gold/15 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-aura-gold">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18"/><path d="M9 21V9"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium leading-tight">Technical Overview</div>
              <div className="text-[11px] text-slate-500 font-light mt-0.5">Architecture · Data model · Scope · Demo credentials</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-aura-gold transition-colors flex-shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          <a
            href="/project-plan.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-[#131320] border border-white/8 hover:border-aura-gold/30 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-[#1a1a2e]"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center group-hover:bg-aura-gold/15 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-aura-gold">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium leading-tight">Executive Briefing</div>
              <div className="text-[11px] text-slate-500 font-light mt-0.5">High-level project plan · 11 phases · Strategy to launch</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-aura-gold transition-colors flex-shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          <a
            href="/market-map.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-[#131320] border border-white/8 hover:border-aura-gold/30 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-[#1a1a2e]"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center group-hover:bg-aura-gold/15 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-aura-gold">
                <circle cx="12" cy="12" r="3"/><circle cx="6" cy="7" r="2"/><circle cx="18" cy="7" r="4"/><circle cx="7" cy="17" r="3.5"/><circle cx="17" cy="16" r="2.5"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium leading-tight">Market Segmentation Map</div>
              <div className="text-[11px] text-slate-500 font-light mt-0.5">Competitive positioning · German dating market · 35–50 segment</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-aura-gold transition-colors flex-shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          <a
            href="/codebase-guide.html"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 bg-[#131320] border border-white/8 hover:border-aura-gold/30 rounded-xl px-4 py-3.5 transition-all duration-200 hover:bg-[#1a1a2e]"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-aura-gold/10 border border-aura-gold/20 flex items-center justify-center group-hover:bg-aura-gold/15 transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-aura-gold">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium leading-tight">Codebase Guide for Beginners</div>
              <div className="text-[11px] text-slate-500 font-light mt-0.5">File tree · React · TypeScript · Tailwind · Supabase explained</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover:text-aura-gold transition-colors flex-shrink-0">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          </a>

          <p className="text-[10px] text-slate-700 font-light tracking-wider text-center mt-1">
            Restricted area — authorised personnel only
          </p>
        </div>
      </div>
    </div>
  )
}
