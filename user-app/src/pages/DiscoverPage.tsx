import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile } from '../types'
import ProfileDetailModal from '../components/ProfileDetailModal'

export default function DiscoverPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [profiles,     setProfiles]     = useState<Profile[]>([])
  const [observations, setObservations] = useState<Set<string>>(new Set())
  const [selected,     setSelected]     = useState<Profile | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [justAdded,    setJustAdded]    = useState<string | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: profs }, { data: obs }] = await Promise.all([
      db.from('profiles')
        .select('*')
        .eq('status', 'active')
        .neq('id', profile!.id)
        .order('created_at'),
      db.from('observations')
        .select('observed_id')
        .eq('observer_id', profile!.id),
    ])
    const shuffled = [...(profs || [])].sort(() => Math.random() - 0.5)
    setProfiles(shuffled as Profile[])
    setObservations(new Set((obs || []).map((o: any) => o.observed_id)))
    setLoading(false)
  }

  const addToObservations = async (p: Profile) => {
    if (observations.has(p.id)) return
    await db.from('observations').insert({ observer_id: profile!.id, observed_id: p.id })
    setObservations(prev => new Set([...prev, p.id]))
    setJustAdded(p.id)
    setTimeout(() => setJustAdded(null), 2000)
  }

  const suggested = profiles.slice(0, 2)
  const rest      = profiles.slice(2)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {loading ? (
        <div className="space-y-6">
          <div className="h-5 w-36 bg-aura-surface rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-aura-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-2xl font-light text-aura-text mb-2">No profiles yet.</p>
          <p className="text-sm text-aura-muted font-light">Come back once more members have joined.</p>
        </div>
      ) : (
        <>
          {suggested.length > 0 && (
            <section className="mb-10">
              <p className="label-section mb-4">Aura suggests</p>
              <div className="grid grid-cols-2 gap-4">
                {suggested.map(p => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    observed={observations.has(p.id)}
                    justAdded={justAdded === p.id}
                    onView={() => setSelected(p)}
                    onObserve={() => addToObservations(p)}
                    featured
                  />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <p className="label-section mb-4">Browse members</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {rest.map(p => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    observed={observations.has(p.id)}
                    justAdded={justAdded === p.id}
                    onView={() => setSelected(p)}
                    onObserve={() => addToObservations(p)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {selected && (
        <ProfileDetailModal
          profile={selected}
          observed={observations.has(selected.id)}
          onObserve={() => addToObservations(selected)}
          onGoObserve={() => { setSelected(null); navigate('/observe') }}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function ProfileCard({
  profile, observed, justAdded, onView, onObserve, featured,
}: {
  profile:   Profile
  observed:  boolean
  justAdded: boolean
  onView:    () => void
  onObserve: () => void
  featured?: boolean
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${
        featured ? 'ring-1 ring-aura-gold/20' : ''
      }`}
      style={{ aspectRatio: '3/4' }}
      onClick={onView}
    >
      {profile.photo_url ? (
        <img
          src={profile.photo_url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-aura-elevated flex items-center justify-center">
          <span className="font-serif text-5xl font-light text-aura-muted">
            {profile.username[0].toUpperCase()}
          </span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Eye / observe button */}
      <button
        onClick={e => { e.stopPropagation(); onObserve() }}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${
          observed
            ? 'bg-aura-gold/30 border border-aura-gold/50'
            : 'bg-black/30 border border-white/20 opacity-0 group-hover:opacity-100'
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill={observed ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" className={observed ? 'text-aura-gold' : 'text-white'}>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
        </svg>
      </button>

      {justAdded && (
        <div className="absolute top-3 left-3 right-12 bg-aura-gold/90 text-[#09090c] text-[10px] font-medium px-2 py-1 rounded-full text-center animate-fade-in">
          Added to Observe
        </div>
      )}

      <div className="absolute bottom-0 inset-x-0 px-4 pb-4">
        <p className="font-serif text-lg font-light text-white leading-tight">{profile.username}</p>
        <p className="text-xs text-white/60 font-light mt-0.5">
          {[profile.age_group, profile.region].filter(Boolean).join(' · ')}
        </p>
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {profile.interests.slice(0, 3).map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/10">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
