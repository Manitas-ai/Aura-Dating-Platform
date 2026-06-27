import { useState, useEffect, useCallback } from 'react'
import { X, Heart, Info, MapPin, Briefcase } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile } from '../types'
import ProfileDetailModal from '../components/ProfileDetailModal'

export default function DiscoverPage() {
  const { profile: me } = useAuth()
  const [queue,     setQueue]     = useState<Profile[]>([])
  const [index,     setIndex]     = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [detail,    setDetail]    = useState<Profile | null>(null)
  const [action,    setAction]    = useState<'like' | 'pass' | null>(null)
  const [matched,   setMatched]   = useState<Profile | null>(null)

  useEffect(() => {
    if (!me) return
    load()
  }, [me])

  async function load() {
    setLoading(true)
    // IDs already seen (liked or passed) by the current user
    const { data: likedData } = await db
      .from('likes')
      .select('to_id')
      .eq('from_id', me!.id)

    const seenIds = (likedData || []).map((l: any) => l.to_id)
    seenIds.push(me!.id)   // exclude self

    const { data } = await db
      .from('profiles')
      .select('*')
      .eq('status', 'active')
      .not('id', 'in', `(${seenIds.join(',')})`)
      .order('created_at')

    setQueue((data as Profile[]) || [])
    setIndex(0)
    setLoading(false)
  }

  const current = queue[index]

  const advance = useCallback(() => {
    setAction(null)
    setTimeout(() => setIndex(i => i + 1), 300)
  }, [])

  const handleLike = async () => {
    if (!current || !me) return
    setAction('like')

    await db.from('likes').insert({ from_id: me.id, to_id: current.id })

    // Check if it's a match
    const { data: reciprocal } = await db
      .from('likes')
      .select('id')
      .eq('from_id', current.id)
      .eq('to_id', me.id)
      .maybeSingle()

    if (reciprocal) {
      setMatched(current)
    } else {
      advance()
    }
  }

  const handlePass = async () => {
    if (!current || !me) return
    setAction('pass')
    // Record pass as a like with negative intent — we just use the likes table
    // to track "seen". Alternatively, skip recording passes to keep it simple.
    advance()
  }

  const dismissMatch = () => {
    setMatched(null)
    advance()
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="font-serif text-2xl font-light tracking-widest text-aura-muted mb-2">aura</div>
        <div className="w-1 h-6 bg-aura-gold rounded-full animate-pulse mx-auto" />
      </div>
    </div>
  )

  const isEmpty = !current || index >= queue.length

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">

      {/* ── Match overlay ── */}
      {matched && (
        <div className="fixed inset-0 z-50 bg-aura-bg/95 backdrop-blur-lg flex flex-col items-center justify-center animate-fade-in px-8">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(201,169,110,0.08) 0%, transparent 60%)'
          }} />
          <div className="relative z-10 text-center animate-match-pop max-w-sm">
            <div className="flex items-center justify-center gap-4 mb-8">
              <img
                src={me?.photo_url || ''}
                alt={me?.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-aura-gold/40"
              />
              <div className="text-aura-gold font-serif text-3xl font-light">×</div>
              <img
                src={matched.photo_url || ''}
                alt={matched.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-aura-gold/40"
              />
            </div>

            <div className="w-8 h-px bg-aura-gold mx-auto mb-6 opacity-50" />
            <h2 className="font-serif text-4xl font-light text-aura-text mb-3">
              A new connection.
            </h2>
            <p className="text-sm text-aura-muted font-light leading-relaxed mb-8">
              You and {matched.name} have expressed mutual interest.<br />
              The conversation begins with you.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={dismissMatch} className="btn-ghost text-xs">
                Continue Discovering
              </button>
              <a href="/messages" onClick={dismissMatch} className="btn-gold text-xs">
                Send a Message
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Profile detail modal ── */}
      {detail && (
        <ProfileDetailModal
          profile={detail}
          onClose={() => setDetail(null)}
          onLike={() => { setDetail(null); handleLike() }}
          onPass={() => { setDetail(null); handlePass() }}
        />
      )}

      {isEmpty ? (
        /* ── Empty state ── */
        <div className="text-center animate-fade-in max-w-xs">
          <div className="w-16 h-16 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center mx-auto mb-6">
            <Compass size={24} strokeWidth={1} className="text-aura-muted" />
          </div>
          <h2 className="font-serif text-2xl font-light text-aura-text mb-2">You have seen everyone.</h2>
          <p className="text-sm text-aura-muted font-light leading-relaxed">
            New members join every day.<br />Check back tomorrow.
          </p>
        </div>
      ) : (
        <>
          {/* ── Progress indicator ── */}
          <div className="w-full max-w-sm mb-4 flex items-center justify-between px-1">
            <span className="label-section">Discover</span>
            <span className="text-xs text-aura-subtle font-light">
              {queue.length - index} remaining
            </span>
          </div>

          {/* ── Profile Card ── */}
          <div
            className={`relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl shadow-black/60 border border-white/5
              transition-all duration-300 cursor-pointer group
              ${action === 'like' ? 'translate-x-4 opacity-0' : ''}
              ${action === 'pass' ? '-translate-x-4 opacity-0' : ''}
            `}
            style={{ aspectRatio: '3/4' }}
            onClick={() => setDetail(current)}
          >
            {/* Photo */}
            {current.photo_url ? (
              <img
                src={current.photo_url}
                alt={current.name}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-aura-elevated flex items-center justify-center">
                <span className="font-serif text-7xl text-aura-subtle">{current.name[0]}</span>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Info hint */}
            <button
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={e => { e.stopPropagation(); setDetail(current) }}
            >
              <Info size={13} strokeWidth={1.5} className="text-white/70" />
            </button>

            {/* Bottom info */}
            <div className="absolute bottom-0 inset-x-0 p-6">
              <h2 className="font-serif text-4xl font-light text-white tracking-wide">
                {current.name}, <span className="font-light">{current.age}</span>
              </h2>
              <div className="flex items-center gap-4 mt-2 mb-4">
                {current.location && (
                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <MapPin size={11} strokeWidth={1.5} />
                    <span className="font-light tracking-wide">{current.location}</span>
                  </div>
                )}
                {current.occupation && (
                  <div className="flex items-center gap-1.5 text-white/60 text-xs">
                    <Briefcase size={11} strokeWidth={1.5} />
                    <span className="font-light tracking-wide">{current.occupation}</span>
                  </div>
                )}
              </div>

              {/* Interest tags */}
              {current.interests?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.interests.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/75 font-light tracking-wide border border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Action buttons ── */}
          <div className="flex items-center gap-8 mt-7">
            <button
              onClick={handlePass}
              className="w-14 h-14 rounded-full border border-aura-border bg-aura-surface flex items-center justify-center hover:border-aura-muted hover:scale-105 active:scale-95 transition-all duration-200 group"
              aria-label="Pass"
            >
              <X size={20} strokeWidth={1.25} className="text-aura-muted group-hover:text-aura-text transition-colors" />
            </button>

            <button
              onClick={handleLike}
              className="w-16 h-16 rounded-full bg-aura-gold/10 border border-aura-gold/30 flex items-center justify-center hover:bg-aura-gold/20 hover:border-aura-gold/60 hover:scale-105 active:scale-95 transition-all duration-200 group"
              aria-label="Like"
            >
              <Heart size={22} strokeWidth={1.25} className="text-aura-gold group-hover:fill-aura-gold transition-all" />
            </button>
          </div>

          <p className="mt-4 text-xs text-aura-subtle font-light tracking-wide">
            Tap card to view full profile
          </p>
        </>
      )}

    </div>
  )
}

// Needed for empty state icon
function Compass({ size, strokeWidth, className }: { size: number; strokeWidth: number; className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  )
}
