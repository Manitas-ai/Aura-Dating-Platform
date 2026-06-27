import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Send, ArrowLeft } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Message, Profile } from '../types'

interface ConvItem {
  matchId:  string
  partner:  Profile
  lastMsg?: string
  lastAt?:  string
}

export default function MessagesPage() {
  const { profile: me } = useAuth()
  const { id: matchId }  = useParams()
  const navigate         = useNavigate()

  const [convos,    setConvos]    = useState<ConvItem[]>([])
  const [messages,  setMessages]  = useState<Message[]>([])
  const [partner,   setPartner]   = useState<Profile | null>(null)
  const [newMsg,    setNewMsg]    = useState('')
  const [loading,   setLoading]   = useState(true)
  const [sending,   setSending]   = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { if (me) loadConvos() }, [me])
  useEffect(() => { if (matchId && me) loadThread(matchId) }, [matchId, me])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function loadConvos() {
    setLoading(true)
    const { data } = await db
      .from('matches')
      .select('*, profile_1:profiles!matches_profile_1_id_fkey(*), profile_2:profiles!matches_profile_2_id_fkey(*)')
      .or(`profile_1_id.eq.${me!.id},profile_2_id.eq.${me!.id}`)
      .order('created_at', { ascending: false })

    if (data) {
      const items: ConvItem[] = await Promise.all(data.map(async (m: any) => {
        const p: Profile = m.profile_1_id === me!.id ? m.profile_2 : m.profile_1
        const { data: msgs } = await db.from('messages').select('content,created_at').eq('match_id', m.id).order('created_at', { ascending: false }).limit(1)
        return { matchId: m.id, partner: p, lastMsg: msgs?.[0]?.content, lastAt: msgs?.[0]?.created_at }
      }))
      setConvos(items)
    }
    setLoading(false)
  }

  async function loadThread(mid: string) {
    // Load partner
    const { data: match } = await db
      .from('matches')
      .select('*, profile_1:profiles!matches_profile_1_id_fkey(*), profile_2:profiles!matches_profile_2_id_fkey(*)')
      .eq('id', mid)
      .single()

    if (match) {
      const p: Profile = match.profile_1_id === me!.id ? (match as any).profile_2 : (match as any).profile_1
      setPartner(p)
    }

    const { data: msgs } = await db
      .from('messages')
      .select('*')
      .eq('match_id', mid)
      .order('created_at')

    setMessages((msgs as Message[]) || [])
  }

  const sendMessage = async () => {
    if (!newMsg.trim() || !matchId || !me || sending) return
    setSending(true)
    const content = newMsg.trim()
    setNewMsg('')

    const { data } = await db.from('messages').insert({
      match_id:  matchId,
      sender_id: me.id,
      content,
    }).select().single()

    if (data) setMessages(prev => [...prev, data as Message])
    setSending(false)
    await loadConvos()
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="h-[calc(100vh-64px)] md:h-screen flex">

      {/* ── Conversation list ── */}
      <div className={`w-full md:w-80 border-r border-aura-border flex-shrink-0 flex flex-col
        ${matchId ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="px-6 py-6 border-b border-aura-border">
          <p className="label-section mb-1">Your</p>
          <h2 className="font-serif text-2xl font-light text-aura-text">Messages</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-aura-elevated flex-shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 bg-aura-elevated rounded w-24" />
                    <div className="h-2.5 bg-aura-elevated rounded w-36" />
                  </div>
                </div>
              ))}
            </div>
          ) : convos.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-aura-muted font-light">No conversations yet.</p>
              <p className="text-xs text-aura-subtle mt-1">Match with someone to start chatting.</p>
            </div>
          ) : (
            convos.map(({ matchId: mid, partner: p, lastMsg }) => (
              <button
                key={mid}
                onClick={() => navigate(`/messages/${mid}`)}
                className={`w-full flex items-center gap-3 px-5 py-4 border-b border-aura-border/40 hover:bg-aura-elevated transition-colors text-left
                  ${matchId === mid ? 'bg-aura-elevated border-l-2 border-l-aura-gold' : ''}
                `}
              >
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="w-11 h-11 rounded-full object-cover border border-aura-border flex-shrink-0" />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-aura-surface border border-aura-border flex items-center justify-center flex-shrink-0">
                    <span className="font-serif text-lg text-aura-muted">{p.name[0]}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-aura-text font-medium">{p.name.split(' ')[0]}</p>
                  <p className="text-xs text-aura-muted font-light truncate mt-0.5">
                    {lastMsg || <span className="italic text-aura-subtle">No messages yet</span>}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Thread ── */}
      {matchId && partner ? (
        <div className="flex-1 flex flex-col">
          {/* Thread header */}
          <div className="flex items-center gap-4 px-6 py-4 border-b border-aura-border bg-aura-bg/80 backdrop-blur-sm">
            <button
              onClick={() => navigate('/messages')}
              className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-aura-elevated transition-colors"
            >
              <ArrowLeft size={16} strokeWidth={1.5} className="text-aura-muted" />
            </button>
            {partner.photo_url ? (
              <img src={partner.photo_url} alt={partner.name} className="w-9 h-9 rounded-full object-cover border border-aura-border" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center">
                <span className="font-serif text-sm text-aura-muted">{partner.name[0]}</span>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-aura-text">{partner.name}</p>
              <p className="text-xs text-aura-muted font-light">{partner.location}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 md:px-8 py-6 space-y-3">
            {messages.length === 0 && (
              <div className="text-center pt-12 animate-fade-in">
                <p className="font-serif text-2xl font-light text-aura-muted mb-2">Begin the conversation.</p>
                <p className="text-xs text-aura-subtle font-light">A thoughtful opening says a great deal.</p>
              </div>
            )}
            {messages.map(msg => {
              const isMine = msg.sender_id === me?.id
              return (
                <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                  <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm font-light leading-relaxed
                    ${isMine
                      ? 'bg-aura-gold/15 border border-aura-gold/20 text-aura-text rounded-br-sm'
                      : 'bg-aura-elevated border border-aura-border text-aura-text rounded-bl-sm'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1.5 ${isMine ? 'text-aura-gold/50 text-right' : 'text-aura-subtle'}`}>
                      {fmt(msg.created_at)}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Compose */}
          <div className="px-5 md:px-8 py-4 border-t border-aura-border">
            <form
              onSubmit={e => { e.preventDefault(); sendMessage() }}
              className="flex gap-3 items-end"
            >
              <textarea
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Write something thoughtful…"
                rows={1}
                className="flex-1 input-aura resize-none min-h-[44px] max-h-28 overflow-auto leading-relaxed"
                style={{ height: 'auto' }}
              />
              <button
                type="submit"
                disabled={!newMsg.trim() || sending}
                className="w-11 h-11 rounded-full bg-aura-gold/15 border border-aura-gold/30 flex items-center justify-center hover:bg-aura-gold/25 hover:border-aura-gold/50 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0"
              >
                <Send size={14} strokeWidth={1.5} className="text-aura-gold" />
              </button>
            </form>
          </div>
        </div>
      ) : !matchId ? (
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="font-serif text-3xl font-light text-aura-muted mb-2">Select a conversation.</p>
            <p className="text-xs text-aura-subtle font-light">Your connections are on the left.</p>
          </div>
        </div>
      ) : null}

    </div>
  )
}
