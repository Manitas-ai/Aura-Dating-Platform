import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { RefreshCw, Search } from 'lucide-react'

interface UserLogin {
  id:        string
  username:  string
  logged_at: string
}

export default function UserLoginsPage() {
  const [rows,    setRows]    = useState<UserLogin[]>([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await db
      .from('user_logins')
      .select('id, username, logged_at')
      .order('logged_at', { ascending: false })
      .limit(500)
    setRows((data || []) as UserLogin[])
    setLoading(false)
  }

  const filtered = rows.filter(r =>
    !search || r.username.toLowerCase().includes(search.toLowerCase())
  )

  const fmt = (iso: string) => {
    const d = new Date(iso)
    return {
      date: d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
  }

  return (
    <div className="px-8 py-8 max-w-3xl">

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">Login History</h1>
        <p className="text-sm text-slate-500 mt-1 font-light">All sign-in events, newest first</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total logins',  value: rows.length },
          { label: 'Unique users',  value: new Set(rows.map(r => r.username)).size },
          { label: 'Showing',       value: filtered.length },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl px-5 py-4">
            <div className="text-xl font-bold text-slate-800">{s.value}</div>
            <div className="text-xs text-slate-400 mt-0.5 font-light uppercase tracking-wide">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-8 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-aura-gold/50"
            placeholder="Search username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 bg-white border border-slate-200 rounded-lg hover:text-slate-700 hover:border-slate-300 transition-colors"
        >
          <RefreshCw size={13} strokeWidth={1.5} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider w-8">#</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="border-b border-slate-50">
                  {[...Array(4)].map((_, j) => (
                    <td key={j} className="px-5 py-3.5">
                      <div className="h-3 bg-slate-100 rounded animate-pulse w-24" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-slate-400 text-sm font-light">
                  {search ? 'No results matching your search.' : 'No login events recorded yet.'}
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => {
                const { date, time } = fmt(r.logged_at)
                return (
                  <tr key={r.id} className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i % 2 !== 0 ? 'bg-slate-50/30' : ''}`}>
                    <td className="px-5 py-3.5 text-slate-300 text-xs tabular-nums">{i + 1}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-slate-800 font-mono text-xs bg-slate-100 px-2 py-0.5 rounded">{r.username}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 tabular-nums">{date}</td>
                    <td className="px-5 py-3.5 text-slate-500 font-mono text-xs tabular-nums">{time}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 mt-3 font-light">
          Showing {filtered.length} of {rows.length} records · newest first · last 500 events
        </p>
      )}

    </div>
  )
}
