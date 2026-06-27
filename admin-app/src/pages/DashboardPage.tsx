import { useState, useEffect } from 'react'
import { Users, Heart, MessageCircle, UserPlus } from 'lucide-react'
import { db } from '../lib/supabase'

interface Stats {
  totalMembers:   number
  newToday:       number
  totalMatches:   number
  totalMessages:  number
  recentMembers:  any[]
}

export default function DashboardPage() {
  const [stats,   setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const today = new Date(); today.setHours(0, 0, 0, 0)

    const [
      { count: totalMembers  },
      { count: newToday      },
      { count: totalMatches  },
      { count: totalMessages },
      { data: recentMembers  },
    ] = await Promise.all([
      db.from('profiles').select('*', { count: 'exact', head: true }),
      db.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      db.from('matches').select('*',  { count: 'exact', head: true }),
      db.from('messages').select('*', { count: 'exact', head: true }),
      db.from('profiles').select('id,name,photo_url,location,age,created_at').order('created_at', { ascending: false }).limit(5),
    ])

    setStats({
      totalMembers:  totalMembers  || 0,
      newToday:      newToday      || 0,
      totalMatches:  totalMatches  || 0,
      totalMessages: totalMessages || 0,
      recentMembers: recentMembers || [],
    })
    setLoading(false)
  }

  const KPI = ({ icon: Icon, label, value, sub }: { icon: any; label: string; value: number | string; sub?: string }) => (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-[0.18em] text-slate-400 font-medium">{label}</span>
        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center">
          <Icon size={14} strokeWidth={1.5} className="text-aura-gold" />
        </div>
      </div>
      <div className="font-serif text-4xl font-light text-slate-800">{loading ? '—' : value}</div>
      {sub && <p className="text-xs text-slate-400 mt-1 font-light">{sub}</p>}
    </div>
  )

  return (
    <div className="p-8 max-w-5xl">

      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-aura-gold font-medium mb-1">Platform</p>
        <h1 className="font-serif text-3xl font-light text-slate-800">Dashboard</h1>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <KPI icon={Users}         label="Total Members"   value={stats?.totalMembers  || 0} sub="all time" />
        <KPI icon={UserPlus}      label="Joined Today"    value={stats?.newToday      || 0} sub="last 24h" />
        <KPI icon={Heart}         label="Total Matches"   value={stats?.totalMatches  || 0} sub="mutual likes" />
        <KPI icon={MessageCircle} label="Messages Sent"   value={stats?.totalMessages || 0} sub="all time" />
      </div>

      {/* Recent members */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-700 tracking-wide">Recent Members</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {loading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-slate-200 rounded w-28" />
                  <div className="h-2.5 bg-slate-100 rounded w-20" />
                </div>
              </div>
            ))
          ) : (
            stats?.recentMembers.map((m: any) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4">
                {m.photo_url ? (
                  <img src={m.photo_url} alt={m.name} className="w-10 h-10 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg text-slate-400">{m.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{m.name}</p>
                  <p className="text-xs text-slate-400 font-light">{m.location} · {m.age}</p>
                </div>
                <span className="text-xs text-slate-400 font-light">
                  {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
