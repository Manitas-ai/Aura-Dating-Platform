import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'

interface FeedbackRow {
  id: string
  username: string | null
  category: string
  rating: number | null
  feedback: string
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  general:    'General',
  onboarding: 'Onboarding',
  discover:   'Discover',
  observe:    'Observe',
  flirts:     'Flirts / Chat',
  profile:    'Profile / Questionnaire',
  bug:        'Bug',
  idea:       'Feature idea',
}

const CATEGORY_COLORS: Record<string, string> = {
  bug:  'bg-red-500/10 text-red-400 border-red-500/20',
  idea: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

export default function FeedbackPage() {
  const [rows,    setRows]    = useState<FeedbackRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState('all')

  useEffect(() => {
    db.from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setRows(data as FeedbackRow[])
        setLoading(false)
      })
  }, [])

  const categories = ['all', ...Array.from(new Set(rows.map(r => r.category)))]
  const visible    = filter === 'all' ? rows : rows.filter(r => r.category === filter)

  const avgRating = rows.filter(r => r.rating).length
    ? (rows.filter(r => r.rating).reduce((s, r) => s + (r.rating ?? 0), 0) / rows.filter(r => r.rating).length).toFixed(1)
    : '—'

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-light text-white mb-1">Tester Feedback</h1>
        <p className="text-sm text-slate-400">Alpha feedback from real users</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total responses', value: rows.length },
          { label: 'Avg rating', value: `${avgRating} / 5` },
          { label: 'Bug reports', value: rows.filter(r => r.category === 'bug').length },
        ].map(stat => (
          <div key={stat.label} className="bg-[#13131f] border border-white/5 rounded-xl p-5">
            <p className="text-2xl font-light text-white mb-1">{stat.value}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs border transition-all ${
              filter === cat
                ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                : 'border-white/10 text-slate-400 hover:text-white hover:border-white/20'
            }`}
          >
            {cat === 'all' ? 'All' : (CATEGORY_LABELS[cat] ?? cat)}
            {cat !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-60">{rows.filter(r => r.category === cat).length}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#13131f] rounded-2xl animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <p className="text-sm">No feedback yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(row => (
            <div key={row.id} className="bg-[#13131f] border border-white/5 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-white">{row.username ?? 'Anonymous'}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border uppercase tracking-[0.1em] ${
                    CATEGORY_COLORS[row.category] ?? 'bg-white/5 text-slate-400 border-white/10'
                  }`}>
                    {CATEGORY_LABELS[row.category] ?? row.category}
                  </span>
                  {row.rating && (
                    <span className="text-xs text-aura-gold font-medium">★ {row.rating}/5</span>
                  )}
                </div>
                <span className="text-xs text-slate-600 shrink-0">
                  {new Date(row.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="text-sm text-slate-300 font-light leading-relaxed whitespace-pre-wrap">{row.feedback}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
