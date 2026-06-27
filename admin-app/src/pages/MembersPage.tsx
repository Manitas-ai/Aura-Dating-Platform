import { useState, useEffect } from 'react'
import { Search, ShieldOff, ShieldCheck, Trash2, X } from 'lucide-react'
import { db } from '../lib/supabase'
import { Profile } from '../types'

export default function MembersPage() {
  const [members,  setMembers]  = useState<Profile[]>([])
  const [filtered, setFiltered] = useState<Profile[]>([])
  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<'all' | 'active' | 'suspended'>('all')
  const [loading,  setLoading]  = useState(true)
  const [editPrf,  setEditPrf]  = useState<Profile | null>(null)
  const [saving,   setSaving]   = useState(false)

  useEffect(() => { load() }, [])

  useEffect(() => {
    let list = members
    if (status !== 'all') list = list.filter(m => m.status === status)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.location?.toLowerCase().includes(q) ||
        m.username.toLowerCase().includes(q)
      )
    }
    setFiltered(list)
  }, [members, search, status])

  async function load() {
    setLoading(true)
    const { data } = await db.from('profiles').select('*').order('created_at', { ascending: false })
    setMembers((data as Profile[]) || [])
    setLoading(false)
  }

  const toggleStatus = async (m: Profile) => {
    const next = m.status === 'active' ? 'suspended' : 'active'
    await db.from('profiles').update({ status: next }).eq('id', m.id)
    setMembers(prev => prev.map(p => p.id === m.id ? { ...p, status: next } : p))
  }

  const deleteMember = async (id: string) => {
    if (!confirm('Permanently delete this member and all their data?')) return
    await db.from('profiles').delete().eq('id', id)
    setMembers(prev => prev.filter(p => p.id !== id))
  }

  const saveEdit = async () => {
    if (!editPrf) return
    setSaving(true)
    const { bio, occupation, location, age } = editPrf
    await db.from('profiles').update({ bio, occupation, location, age }).eq('id', editPrf.id)
    setMembers(prev => prev.map(p => p.id === editPrf.id ? editPrf : p))
    setSaving(false)
    setEditPrf(null)
  }

  const FILTERS: Array<{ val: typeof status; label: string }> = [
    { val: 'all',       label: 'All'       },
    { val: 'active',    label: 'Active'    },
    { val: 'suspended', label: 'Suspended' },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-aura-gold font-medium mb-1">Platform</p>
        <h1 className="font-serif text-3xl font-light text-slate-800">Members</h1>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-6 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search members…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-aura-gold/50 transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {FILTERS.map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setStatus(val)}
              className={`px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all ${
                status === val
                  ? 'bg-[#0d0d18] text-white'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              {['Member','Age / City','Occupation','Looking for','Status','Actions'].map(h => (
                <th key={h} className="text-left px-5 py-4 text-[11px] uppercase tracking-[0.14em] text-slate-400 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={6} className="px-5 py-4">
                    <div className="h-4 bg-slate-100 rounded animate-pulse w-full" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-slate-400 text-sm font-light">No members found.</td></tr>
            ) : (
              filtered.map(m => (
                <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      {m.photo_url ? (
                        <img src={m.photo_url} alt={m.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 flex-shrink-0" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                          <span className="font-serif text-base text-slate-400">{m.name[0]}</span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-slate-700">{m.name}</p>
                        <p className="text-xs text-slate-400 font-mono">@{m.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 font-light">{m.age} · {m.location}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 font-light">{m.occupation || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 font-light capitalize">{m.looking_for}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium uppercase tracking-wider ${
                      m.status === 'active'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                        : 'bg-red-50 text-red-500 border border-red-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditPrf(m)}
                        className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-500 hover:border-aura-gold/40 hover:text-aura-gold transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => toggleStatus(m)}
                        title={m.status === 'active' ? 'Suspend' : 'Reactivate'}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600 transition-all"
                      >
                        {m.status === 'active'
                          ? <ShieldOff  size={13} strokeWidth={1.5} />
                          : <ShieldCheck size={13} strokeWidth={1.5} />
                        }
                      </button>
                      <button
                        onClick={() => deleteMember(m.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500 transition-all"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit modal */}
      {editPrf && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setEditPrf(null)}>
          <div className="bg-white rounded-2xl border border-slate-200 p-7 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-xl font-light text-slate-800">Edit Member</h2>
              <button onClick={() => setEditPrf(null)}><X size={16} strokeWidth={1.5} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Name',       field: 'name',       type: 'text' },
                { label: 'Age',        field: 'age',        type: 'number' },
                { label: 'Location',   field: 'location',   type: 'text' },
                { label: 'Occupation', field: 'occupation', type: 'text' },
              ].map(({ label, field, type }) => (
                <div key={field}>
                  <label className="block text-xs uppercase tracking-[0.18em] text-slate-400 mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(editPrf as any)[field] || ''}
                    onChange={e => setEditPrf({ ...editPrf, [field]: type === 'number' ? +e.target.value : e.target.value } as Profile)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-aura-gold/50 transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs uppercase tracking-[0.18em] text-slate-400 mb-1.5">Bio</label>
                <textarea
                  rows={3}
                  value={editPrf.bio || ''}
                  onChange={e => setEditPrf({ ...editPrf, bio: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-aura-gold/50 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditPrf(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
              <button onClick={saveEdit} disabled={saving} className="flex-1 py-2.5 bg-aura-gold text-[#0d0d18] rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-aura-gold-lt transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
