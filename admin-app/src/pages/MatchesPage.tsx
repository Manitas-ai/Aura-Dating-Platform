import { useState, useEffect } from 'react'
import { db } from '../lib/supabase'
import { Flirt } from '../types'

export default function FlirtsPage() {
  const [flirts,  setFlirts]  = useState<Flirt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await db
      .from('flirts')
      .select('*, profile_1:profiles!flirts_profile_1_id_fkey(username,photo_url,region), profile_2:profiles!flirts_profile_2_id_fkey(username,photo_url,region)')
      .order('created_at', { ascending: false })
    setFlirts((data as Flirt[]) || [])
    setLoading(false)
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-aura-gold font-medium mb-1">Platform</p>
        <h1 className="font-serif text-3xl font-light text-slate-800">Flirts</h1>
        <p className="text-sm text-slate-400 font-light mt-1">All active connections where both users accepted.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Connection','Started on'].map(h => (
                <th key={h} className="text-left px-6 py-4 text-[11px] uppercase tracking-[0.14em] text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={2} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded animate-pulse w-64" /></td></tr>
              ))
            ) : flirts.length === 0 ? (
              <tr><td colSpan={2} className="text-center py-12 text-slate-400 text-sm font-light">No flirts yet.</td></tr>
            ) : (
              flirts.map((f: any) => (
                <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2">
                        {[f.profile_1, f.profile_2].map((p: any, i: number) => (
                          p?.photo_url ? (
                            <img key={i} src={p.photo_url} alt={p.username} className="w-9 h-9 rounded-full object-cover border-2 border-white" />
                          ) : (
                            <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                              <span className="font-serif text-sm text-slate-400">{p?.username?.[0]?.toUpperCase()}</span>
                            </div>
                          )
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">
                          {f.profile_1?.username} &nbsp;×&nbsp; {f.profile_2?.username}
                        </p>
                        <p className="text-xs text-slate-400 font-light">
                          {f.profile_1?.region} · {f.profile_2?.region}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-light">{fmt(f.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
