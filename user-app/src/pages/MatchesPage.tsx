import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Match, Profile } from '../types'

interface MatchWithPartner {
  matchId:    string
  partner:    Profile
  createdAt:  string
  lastMsg?:   string
  isNew:      boolean
}

export default function MatchesPage() {
  const { profile: me } = useAuth()
  const [matches,  setMatches]  = useState<MatchWithPartner[]>([])
  const [loading,  setLoading]  = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!me) return
    load()
  }, [me])

  async function load() {
    setLoading(true)

    const { data: rawMatches } = await db
      .from('matches')
      .select('*, profile_1:profiles!matches_profile_1_id_fkey(*), profile_2:profiles!matches_profile_2_id_fkey(*)')
      .or(`profile_1_id.eq.${me!.id},profile_2_id.eq.${me!.id}`)
      .order('created_at', { ascending: false })

    if (!rawMatches) { setLoading(false); return }

    const enriched: MatchWithPartner[] = await Promise.all(
      rawMatches.map(async (m: any) => {
        const partner: Profile = m.profile_1_id === me!.id ? m.profile_2 : m.profile_1

        const { data: msgs } = await db
          .from('messages')
          .select('content, created_at, sender_id')
          .eq('match_id', m.id)
          .order('created_at', { ascending: false })
          .limit(1)

        const lastMsg = msgs?.[0]?.content
        const isNew   = !lastMsg

        return { matchId: m.id, partner, createdAt: m.created_at, lastMsg, isNew }
      })
    )

    setMatches(enriched)
    setLoading(false)
  }

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    return `${days}d ago`
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">

      <div className="mb-8 animate-fade-in">
        <p className="label-section mb-1">Your</p>
        <h1 className="font-serif text-4xl font-light text-aura-text">Connections</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-2xl bg-aura-elevated animate-pulse" />
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="text-center py-24 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-aura-muted">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2 className="font-serif text-2xl font-light text-aura-text mb-2">No connections yet.</h2>
          <p className="text-sm text-aura-muted font-light">Keep discovering — your first match is close.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-fade-in">
          {matches.map(({ matchId, partner, createdAt, lastMsg, isNew }) => (
            <div
              key={matchId}
              onClick={() => navigate(`/messages/${matchId}`)}
              className={`relative rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300
                border hover:scale-[1.02]
                ${isNew ? 'border-aura-gold/40 shadow-lg shadow-aura-gold/5' : 'border-aura-border hover:border-aura-border/80'}
              `}
              style={{ aspectRatio: '3/4' }}
            >
              {partner.photo_url ? (
                <img src={partner.photo_url} alt={partner.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-aura-elevated flex items-center justify-center">
                  <span className="font-serif text-5xl text-aura-subtle">{partner.name[0]}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              {isNew && (
                <div className="absolute top-3 right-3 bg-aura-gold text-aura-bg text-[9px] font-semibold uppercase tracking-widest px-2 py-1 rounded-full">
                  New
                </div>
              )}

              <div className="absolute bottom-0 inset-x-0 p-4">
                <p className="font-serif text-xl font-light text-white">{partner.name.split(' ')[0]}</p>
                <div className="flex items-center gap-1 mt-0.5 mb-2">
                  <MapPin size={9} strokeWidth={1.5} className="text-white/50" />
                  <span className="text-[11px] text-white/50 font-light">{partner.location}</span>
                </div>
                {lastMsg ? (
                  <p className="text-[11px] text-white/60 font-light leading-snug line-clamp-2">{lastMsg}</p>
                ) : (
                  <p className="text-[11px] text-aura-gold/70 font-light italic">Say hello…</p>
                )}
                <p className="text-[10px] text-white/30 mt-1">{timeAgo(createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
