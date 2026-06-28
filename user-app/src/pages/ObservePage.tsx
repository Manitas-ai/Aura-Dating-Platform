import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile, FlirtProposal } from '../types'
import ProfileDetailModal from '../components/ProfileDetailModal'

interface ObservedEntry {
  profile:   Profile
  proposal:  FlirtProposal | null  // latest proposal from me to this person
}

export default function ObservePage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [entries,    setEntries]    = useState<ObservedEntry[]>([])
  const [loading,    setLoading]    = useState(true)
  const [proposing,  setProposing]  = useState<string | null>(null)
  const [propMsg,    setPropMsg]    = useState('')
  const [sending,    setSending]    = useState(false)
  const [selected,   setSelected]   = useState<Profile | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: obs } = await db
      .from('observations')
      .select('observed_id')
      .eq('observer_id', profile!.id)

    if (!obs || obs.length === 0) { setLoading(false); return }

    const ids = obs.map((o: any) => o.observed_id)

    const [{ data: profs }, { data: props }] = await Promise.all([
      db.from('profiles').select('*').in('id', ids),
      db.from('flirt_proposals')
        .select('*')
        .eq('from_id', profile!.id)
        .in('to_id', ids)
        .order('created_at', { ascending: false }),
    ])

    const propMap = new Map<string, FlirtProposal>()
    ;(props || []).forEach((p: any) => {
      if (!propMap.has(p.to_id)) propMap.set(p.to_id, p as FlirtProposal)
    })

    const result: ObservedEntry[] = (profs || []).map((p: any) => ({
      profile: p as Profile,
      proposal: propMap.get(p.id) || null,
    }))

    setEntries(result)
    setLoading(false)
  }

  const sendProposal = async (toId: string) => {
    setSending(true)
    const entry = entries.find(e => e.profile.id === toId)!
    const attempt = entry.proposal ? entry.proposal.attempt + 1 : 1
    const { data } = await db
      .from('flirt_proposals')
      .insert({ from_id: profile!.id, to_id: toId, message: propMsg.trim() || null, attempt })
      .select()
      .single()
    setSending(false)
    if (data) {
      setEntries(prev => prev.map(e =>
        e.profile.id === toId ? { ...e, proposal: data as FlirtProposal } : e
      ))
    }
    setProposing(null)
    setPropMsg('')
  }

  const removeFromList = async (observedId: string) => {
    await db.from('observations').delete()
      .eq('observer_id', profile!.id)
      .eq('observed_id', observedId)
    setEntries(prev => prev.filter(e => e.profile.id !== observedId))
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-light text-aura-text">Observation List</h1>
        <p className="text-sm text-aura-muted font-light mt-1">Private. Nobody knows you're watching.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-aura-surface rounded-2xl animate-pulse" />)}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-serif text-xl font-light text-aura-muted">No one here yet.</p>
          <p className="text-sm text-aura-subtle font-light mt-2">Browse profiles and tap the eye icon to add someone.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(({ profile: p, proposal }) => {
            const canPropose  = !proposal || (proposal.status === 'declined' && proposal.attempt < 2)
            const isBlocked   = proposal?.status === 'declined' && proposal.attempt >= 2
            const isAccepted  = proposal?.status === 'accepted'
            const isPending   = proposal?.status === 'pending'

            return (
              <div key={p.id} className="bg-aura-surface border border-aura-border/60 rounded-2xl p-4">
                <div className="flex items-start gap-4">
                  {/* Avatar — clickable to open profile */}
                  <button
                    className="flex-shrink-0 focus:outline-none"
                    onClick={() => setSelected(p)}
                    title="View profile"
                  >
                    {p.photo_url ? (
                      <img src={p.photo_url} alt="" className="w-12 h-12 rounded-full object-cover border border-aura-border hover:ring-2 hover:ring-aura-gold/40 transition-all" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center hover:ring-2 hover:ring-aura-gold/40 transition-all">
                        <span className="font-serif text-lg text-aura-muted">{p.username[0].toUpperCase()}</span>
                      </div>
                    )}
                  </button>

                  {/* Info — username also clickable */}
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => setSelected(p)}
                      className="text-sm font-medium text-aura-text hover:text-aura-gold transition-colors"
                    >
                      {p.username}
                    </button>
                    <p className="text-xs text-aura-muted font-light">
                      {[p.age_group, p.region].filter(Boolean).join(' · ')}
                    </p>
                    {p.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.interests.slice(0, 4).map(t => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-aura-elevated border border-aura-border text-aura-subtle">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromList(p.id)}
                    className="text-aura-subtle hover:text-aura-muted transition-colors flex-shrink-0 p-1"
                    title="Remove from list"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Proposal status / actions */}
                <div className="mt-3 pt-3 border-t border-aura-border/40">
                  {isAccepted && (
                    <p className="text-xs text-aura-gold font-light">Flirt accepted — chat in Flirts ✓</p>
                  )}
                  {isPending && (
                    <p className="text-xs text-aura-muted font-light italic">
                      Proposal sent · awaiting response
                    </p>
                  )}
                  {isBlocked && (
                    <p className="text-xs text-aura-subtle font-light">Declined twice — no further proposals possible.</p>
                  )}
                  {canPropose && proposing !== p.id && (
                    <button
                      onClick={() => { setProposing(p.id); setPropMsg('') }}
                      className="text-xs text-aura-gold hover:text-aura-gold-lt transition-colors font-light"
                    >
                      {proposal?.status === 'declined' ? 'Try again →' : 'Propose a flirt →'}
                    </button>
                  )}
                  {canPropose && proposing === p.id && (
                    <div className="space-y-2 animate-fade-in">
                      <textarea
                        className="input-aura h-16 resize-none text-sm"
                        placeholder="Leave a short message… (optional, max 120 chars)"
                        value={propMsg}
                        onChange={e => setPropMsg(e.target.value.slice(0, 120))}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendProposal(p.id)}
                          disabled={sending}
                          className="btn-gold flex-1 text-xs py-2 disabled:opacity-40"
                        >
                          {sending ? 'Sending…' : 'Send proposal'}
                        </button>
                        <button
                          onClick={() => setProposing(null)}
                          className="btn-ghost text-xs py-2 px-4"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selected && (
        <ProfileDetailModal
          profile={selected}
          observed={true}
          onObserve={() => {}}
          onGoObserve={() => setSelected(null)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

