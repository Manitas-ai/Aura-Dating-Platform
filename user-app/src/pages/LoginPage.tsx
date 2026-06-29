import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile } from '../types'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) return
    setLoading(true)
    setError('')

    const { data, error: dbErr } = await db
      .from('profiles')
      .select('*')
      .eq('username', username.trim().toLowerCase())
      .eq('password', password.trim())
      .eq('status',   'active')
      .single()

    setLoading(false)

    if (dbErr || !data) {
      setError('The credentials you entered do not match any account.')
      return
    }

    await db.from('user_logins').insert({ username: data.username })

    login(data as Profile)
    navigate('/discover')
  }

  return (
    <div className="min-h-screen bg-aura-bg flex">

      {/* ── Left panel — brand atmosphere ── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden px-14 py-14">
        {/* layered background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0a1a] via-[#0d0d14] to-[#09090c]" />
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(ellipse at 30% 60%, rgba(201,169,110,0.06) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(184,112,112,0.05) 0%, transparent 45%)'
        }} />
        {/* subtle grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(to right, #c9a96e 1px, transparent 1px), linear-gradient(to bottom, #c9a96e 1px, transparent 1px)',
          backgroundSize: '80px 80px'
        }} />

        <div className="relative z-10">
          <div className="font-serif text-4xl font-light tracking-[0.35em] text-aura-text">aura</div>
          <div className="mt-2 text-xs tracking-[0.35em] uppercase text-aura-muted">Find your wavelength</div>
        </div>

        <div className="relative z-10 max-w-sm">
          <div className="w-8 h-px bg-aura-gold mb-8 opacity-60" />
          <blockquote className="font-serif text-2xl font-light italic leading-relaxed text-aura-text/80">
            "The meeting of two personalities is like the contact of two chemical substances: if there is any reaction, both are transformed."
          </blockquote>
          <cite className="block mt-6 text-xs tracking-[0.2em] uppercase text-aura-muted not-italic">
            — Carl Gustav Jung
          </cite>
        </div>

        <div className="relative z-10 text-xs text-aura-subtle tracking-wider">
          For those who seek depth over surface.
        </div>
      </div>

      {/* ── Right panel — login form ── */}
      <div className="flex-1 flex items-center justify-center px-8 py-14 lg:border-l border-aura-border/30">
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="font-serif text-4xl font-light tracking-[0.35em] text-aura-text">aura</div>
            <div className="mt-1 text-xs tracking-[0.35em] uppercase text-aura-muted">Find your wavelength</div>
          </div>

          <div className="mb-10">
            <h1 className="font-serif text-3xl font-light text-aura-text">Welcome back.</h1>
            <p className="mt-2 text-sm text-aura-muted font-light">Enter your credentials to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label-section block mb-2">Username</label>
              <input
                className="input-aura"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. alex"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label className="label-section block mb-2">Password</label>
              <input
                type="password"
                className="input-aura"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-xs text-aura-rose font-light tracking-wide pt-1 animate-fade-in">
                {error}
              </p>
            )}

            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying…' : 'Enter'}
              </button>
            </div>
          </form>

          {/* Demo hint */}
          <div className="mt-10 pt-6 border-t border-aura-border/40">
            <p className="label-section mb-3">Demo credentials</p>
            <div className="grid grid-cols-2 gap-2">
              {[['alex','sun42'],['sara','wave7'],['lena','mint3'],['marco','fire9'],['julia','sky11']].map(([u,p]) => (
                <button
                  key={u}
                  onClick={() => { setUsername(u); setPassword(p) }}
                  className="text-left px-3 py-2 rounded-lg border border-aura-border hover:border-aura-gold/30 transition-colors group"
                >
                  <span className="text-xs text-aura-muted font-mono group-hover:text-aura-gold transition-colors">{u}</span>
                  <span className="text-xs text-aura-subtle ml-2 font-mono">{p}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs text-aura-subtle font-light">
              New here?{' '}
              <Link to="/register" className="text-aura-gold hover:text-aura-gold-lt transition-colors">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  )
}
