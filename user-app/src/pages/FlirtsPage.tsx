import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile, Flirt, FlirtProposal, Message, otherProfile } from '../types'

type Tab = 'flirts' | 'pending'

export default function FlirtsPage() {
  const { profile }  = useAuth()
  const { id }       = useParams<{ id?: string }>()
  const navigate     = useNavigate()

  const [tab,       setTab]       = useState<Tab>('flirts')
  const [flirts,    setFlirts]    = useState<Flirt[]>([])
  const [incoming,  setIncoming]  = useState<FlirtProposal[]>([])
  const [msgs,      setMsgs]      = useState<Message[]>([])
  const [activeFlirt, setActiveFlirt] = useState<Flirt | null>(null)
  const [newMsg,    setNewMsg]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadAll() }, [])
  useEffect(() => {
    if (id && flirts.length > 0) {
      const f = flirts.find(f => f.id === id)
      if (f) openFlirt(f)
    }
  }, [id, flirts])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs])

  async function loadAll() {
    setLoading(true)
    const [{ data: myFlirts }, { data: proposals }] = await Promise.all([
      db.from('flirts')
        .select('*, profile_1:profiles!flirts_profile_1_id_fkey(*), profile_2:profiles!flirts_profile_2_id_fkey(*)')
        .or(`profile_1_id.eq.${profile!.id},profile_2_id.eq.${profile!.id}`)
        .order('created_at', { ascending: false }),
      db.from('flirt_proposals')
        .select('*, from_profile:profiles!flirt_proposals_from_id_fkey(*)')
        .eq('to_id', profile!.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false }),
    ])
    setFlirts((myFlirts as Flirt[]) || [])
    setIncoming((proposals as FlirtProposal[]) || [])
    setLoading(false)
  }

  async function openFlirt(f: Flirt) {
    setActiveFlirt(f)
    const { data } = await db
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(id, username)')
      .eq('flirt_id', f.id)
      .order('created_at')
    setMsgs((data as Message[]) || [])
  }

  async function send() {
    if (!newMsg.trim() || !activeFlirt) return
    setSending(true)
    const { data } = await db
      .from('messages')
      .insert({ flirt_id: activeFlirt.id, sender_id: profile!.id, content: newMsg.trim() })
      .select('*, sender:profiles!messages_sender_id_fkey(id, username)')
      .single()
    setSending(false)
    if (data) {
      setMsgs(prev => [...prev, data as Message])
      setNewMsg('')
    }
  }

  const acceptProposal = async (prop: FlirtProposal) => {
    await db.from('flirt_proposals').update({ status: 'accepted' }).eq('id', prop.id)
    const ids   = [profile!.id, prop.from_id].sort()
    await db.from('flirts').insert({ profile_1_id: ids[0], profile_2_id: ids[1] })
    setIncoming(prev => prev.filter(p => p.id !== prop.id))
    loadAll()
    setTab('flirts')
  }

  const declineProposal = async (prop: FlirtProposal) => {
    await db.from('flirt_proposals').update({ status: 'declined' }).eq('id', prop.id)
    setIncoming(prev => prev.filter(p => p.id !== prop.id))
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  const isMobile = () => window.innerWidth < 768

  return (
    <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-73px)] overflow-hidden">

      {/* ── Left panel: list ── */}
      <div className={`flex flex-col flex-shrink-0 border-r border-aura-border/50 ${
        activeFlirt && isMobile() ? 'hidden' : 'w-full md:w-72 lg:w-80'
      }`}>

        {/* Tabs */}
        <div className="flex border-b border-aura-border/50">
          {(['flirts', 'pending'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3.5 text-xs uppercase tracking-[0.15em] transition-colors relative ${
                tab === t ? 'text-aura-gold' : 'text-aura-subtle hover:text-aura-muted'
              }`}
            >
              {t === 'flirts' ? 'Flirts' : `Pending${incoming.length > 0 ? ` (${incoming.length})` : ''}`}
              {tab === t && <span className="absolute bottom-0 inset-x-4 h-px bg-aura-gold" />}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-aura-surface rounded-xl animate-pulse" />)}
          </div>
        ) : tab === 'flirts' ? (
          <div className="overflow-y-auto flex-1">
            {flirts.length === 0 ? (
              <p className="text-center text-sm text-aura-subtle font-light py-12 px-4">
                No active flirts yet. Accept a proposal to start chatting.
              </p>
            ) : flirts.map(f => {
              const other = otherProfile(f, profile!.id)
              return (
                <button
                  key={f.id}
                  onClick={() => { setActiveFlirt(f); openFlirt(f); if (isMobile()) navigate(`/flirts/${f.id}`) }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-aura-border/30 hover:bg-aura-surface/60 transition-colors text-left ${
                    activeFlirt?.id === f.id ? 'bg-aura-surface/80' : ''
                  }`}
                >
                  {other?.photo_url ? (
                    <img src={other.photo_url} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-aura-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center flex-shrink-0">
                      <span className="font-serif text-sm text-aura-muted">{other?.username[0].toUpperCase()}</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-aura-text">{other?.username}</p>
                    <p className="text-xs text-aura-subtle font-light truncate">
                      {other ? [other.age_group, other.region].filter(Boolean).join(' · ') : ''}
                    </p>
                  </div>
                  <span className="text-[10px] text-aura-subtle">{fmtDate(f.created_at)}</span>
                </button>
              )
            })}
          </div>
        ) : (
          // Pending proposals tab
          <div className="overflow-y-auto flex-1">
            {incoming.length === 0 ? (
              <p className="text-center text-sm text-aura-subtle font-light py-12 px-4">No pending proposals.</p>
            ) : incoming.map(prop => (
              <div key={prop.id} className="px-4 py-4 border-b border-aura-border/30">
                <div className="flex items-center gap-3 mb-3">
                  {(prop.from_profile as any)?.photo_url ? (
                    <img src={(prop.from_profile as any).photo_url} alt="" className="w-10 h-10 rounded-full object-cover border border-aura-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center">
                      <span className="font-serif text-sm text-aura-muted">
                        {(prop.from_profile as any)?.username?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-aura-text">{(prop.from_profile as any)?.username}</p>
                    <p className="text-xs text-aura-subtle">{fmtDate(prop.created_at)}</p>
                  </div>
                </div>
                {prop.message && (
                  <p className="text-sm text-aura-muted font-light italic mb-3 px-1">"{prop.message}"</p>
                )}
                <div className="flex gap-2">
                  <button onClick={() => acceptProposal(prop)} className="btn-gold flex-1 text-xs py-2">Accept</button>
                  <button onClick={() => declineProposal(prop)} className="btn-ghost text-xs py-2 px-4">Decline</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Right panel: chat ── */}
      <div className={`flex flex-col flex-1 ${!activeFlirt && 'hidden md:flex'}`}>
        {!activeFlirt ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-aura-subtle font-light">Select a flirt to open the conversation.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-aura-border/50 flex-shrink-0">
              <button
                onClick={() => { setActiveFlirt(null); navigate('/flirts') }}
                className="md:hidden p-1 text-aura-muted"
              >
                <ArrowLeft size={18} strokeWidth={1.5} />
              </button>
              {(() => {
                const other = otherProfile(activeFlirt, profile!.id)
                return (
                  <>
                    {other?.photo_url ? (
                      <img src={other.photo_url} alt="" className="w-9 h-9 rounded-full object-cover border border-aura-border" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center">
                        <span className="font-serif text-sm text-aura-muted">{other?.username[0].toUpperCase()}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-aura-text">{other?.username}</p>
                      <p className="text-xs text-aura-subtle font-light">{[other?.age_group, other?.region].filter(Boolean).join(' · ')}</p>
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {msgs.map(m => {
                const mine = m.sender_id === profile!.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[72%] rounded-2xl px-4 py-2.5 ${
                      mine
                        ? 'bg-aura-gold/15 border border-aura-gold/25'
                        : 'bg-aura-surface border border-aura-border'
                    }`}>
                      <p className="text-sm text-aura-text font-light leading-relaxed">{m.content}</p>
                      <p className={`text-[10px] mt-1 ${mine ? 'text-aura-gold/50 text-right' : 'text-aura-subtle'}`}>
                        {fmt(m.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-aura-border/50 px-4 py-3 flex items-end gap-3 flex-shrink-0">
              <textarea
                className="flex-1 bg-aura-surface border border-aura-border rounded-xl px-4 py-2.5 text-sm text-aura-text placeholder:text-aura-subtle resize-none focus:outline-none focus:border-aura-gold/40 transition-colors"
                rows={1}
                placeholder="Write something…"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={send}
                disabled={!newMsg.trim() || sending}
                className="w-9 h-9 rounded-full bg-aura-gold flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-opacity"
              >
                <Send size={14} className="text-[#09090c]" strokeWidth={2} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
