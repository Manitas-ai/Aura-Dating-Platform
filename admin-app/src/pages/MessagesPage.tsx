import { useState, useEffect } from 'react'
import { Trash2, ChevronDown } from 'lucide-react'
import { db } from '../lib/supabase'
import { Message } from '../types'

interface Thread {
  matchId:   string
  p1Name:    string
  p1Photo?:  string
  p2Name:    string
  p2Photo?:  string
  msgCount:  number
  lastMsg?:  string
  lastAt?:   string
}

export default function MessagesPage() {
  const [threads,  setThreads]  = useState<Thread[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [msgs,     setMsgs]     = useState<Record<string, Message[]>>({})
  const [loading,  setLoading]  = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data: matches } = await db
      .from('matches')
      .select('id, profile_1:profiles!matches_profile_1_id_fkey(name,photo_url), profile_2:profiles!matches_profile_2_id_fkey(name,photo_url)')
      .order('created_at', { ascending: false })

    if (!matches) { setLoading(false); return }

    const threads: Thread[] = await Promise.all(matches.map(async (m: any) => {
      const { data: ms, count } = await db
        .from('messages')
        .select('content,created_at', { count: 'exact' })
        .eq('match_id', m.id)
        .order('created_at', { ascending: false })
        .limit(1)
      return {
        matchId:  m.id,
        p1Name:   m.profile_1?.name,
        p1Photo:  m.profile_1?.photo_url,
        p2Name:   m.profile_2?.name,
        p2Photo:  m.profile_2?.photo_url,
        msgCount: count || 0,
        lastMsg:  ms?.[0]?.content,
        lastAt:   ms?.[0]?.created_at,
      }
    }))

    setThreads(threads.filter(t => t.msgCount > 0))
    setLoading(false)
  }

  const expandThread = async (matchId: string) => {
    if (expanded === matchId) { setExpanded(null); return }
    setExpanded(matchId)
    if (msgs[matchId]) return
    const { data } = await db
      .from('messages')
      .select('*, sender:profiles!messages_sender_id_fkey(name)')
      .eq('match_id', matchId)
      .order('created_at')
    setMsgs(prev => ({ ...prev, [matchId]: (data as any[]) || [] }))
  }

  const deleteMsg = async (msgId: string, matchId: string) => {
    await db.from('messages').delete().eq('id', msgId)
    setMsgs(prev => ({ ...prev, [matchId]: prev[matchId].filter(m => m.id !== msgId) }))
  }

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="p-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.2em] text-aura-gold font-medium mb-1">Platform</p>
        <h1 className="font-serif text-3xl font-light text-slate-800">Messages</h1>
        <p className="text-sm text-slate-400 font-light mt-1">Moderation view — read and remove inappropriate content.</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-16 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-sm font-light">No conversations with messages yet.</div>
      ) : (
        <div className="space-y-2">
          {threads.map(t => (
            <div key={t.matchId} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
              <button
                onClick={() => expandThread(t.matchId)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors text-left"
              >
                <div className="flex -space-x-2 flex-shrink-0">
                  {[{ name: t.p1Name, photo: t.p1Photo }, { name: t.p2Name, photo: t.p2Photo }].map((p, i) => (
                    p.photo ? (
                      <img key={i} src={p.photo} alt={p.name} className="w-9 h-9 rounded-full object-cover border-2 border-white" />
                    ) : (
                      <div key={i} className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center">
                        <span className="font-serif text-sm text-slate-400">{p.name?.[0]}</span>
                      </div>
                    )
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700">{t.p1Name} × {t.p2Name}</p>
                  <p className="text-xs text-slate-400 font-light truncate">{t.lastMsg}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-300 border border-slate-200 px-2 py-1 rounded-full">{t.msgCount} msg</span>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    className={`text-slate-400 transition-transform ${expanded === t.matchId ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {expanded === t.matchId && (
                <div className="border-t border-slate-100 divide-y divide-slate-50">
                  {(msgs[t.matchId] || []).map((m: any) => (
                    <div key={m.id} className="flex items-start gap-4 px-6 py-3 group hover:bg-slate-50/40">
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-slate-500">{m.sender?.name}</span>
                        <span className="mx-2 text-slate-300">·</span>
                        <span className="text-xs text-slate-400 font-light">{fmt(m.created_at)}</span>
                        <p className="text-sm text-slate-600 font-light mt-1 leading-relaxed">{m.content}</p>
                      </div>
                      <button
                        onClick={() => deleteMsg(m.id, t.matchId)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={13} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
