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

        <p className="text-center text-xs text-slate-700 mt-6 font-light tracking-wider">
          Restricted area — authorised personnel only
        </p>
      </div>
    </div>
  )
}
