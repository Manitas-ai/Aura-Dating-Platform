import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile } from '../types'
import ProfileDetailModal from '../components/ProfileDetailModal'
import { DACH_REGIONS, AGE_GROUPS } from '../lib/constants'

// ── Filter state ───────────────────────────────────────────────
interface Filters {
  gender:       string   // '' | 'man' | 'woman'
  age_group:    string   // '' | one of AGE_GROUPS
  region:       string   // '' | one of DACH_REGIONS
  has_kids:     string   // '' | 'yes' | 'no'
  desired_rel:  string   // '' | free value
}
const EMPTY_FILTERS: Filters = { gender: '', age_group: '', region: '', has_kids: '', desired_rel: '' }

const DESIRED_REL_OPTIONS = [
  'A long-term relationship',
  'Marriage',
  'Something casual',
  'Open to everything',
  'Not sure yet',
]

export default function DiscoverPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [profiles,     setProfiles]     = useState<Profile[]>([])
  const [observations, setObservations] = useState<Set<string>>(new Set())
  const [selected,     setSelected]     = useState<Profile | null>(null)
  const [loading,      setLoading]      = useState(true)
  const [justAdded,    setJustAdded]    = useState<string | null>(null)
  const [showFilters,  setShowFilters]  = useState(false)
  const [filters,      setFilters]      = useState<Filters>(EMPTY_FILTERS)

  // We also store questionnaire data (kids + desired_rel) keyed by profile_id
  // so we can filter on them without hitting DB per-card
  const [qData, setQData] = useState<Record<string, { has_kids: boolean | null; desired_rel: string | null }>>({})

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const [{ data: profs }, { data: obs }, { data: qs }] = await Promise.all([
      db.from('profiles')
        .select('*')
        .eq('status', 'active')
        .neq('id', profile!.id)
        .order('created_at'),
      db.from('observations')
        .select('observed_id')
        .eq('observer_id', profile!.id),
      db.from('questionnaires')
        .select('profile_id, q_existing_kids, q_desired_relationship')
        .neq('profile_id', profile!.id),
    ])
    const shuffled = [...(profs || [])].sort(() => Math.random() - 0.5)
    setProfiles(shuffled as Profile[])
    setObservations(new Set((obs || []).map((o: any) => o.observed_id)))

    const map: Record<string, { has_kids: boolean | null; desired_rel: string | null }> = {}
    ;(qs || []).forEach((q: any) => {
      map[q.profile_id] = { has_kids: q.q_existing_kids, desired_rel: q.q_desired_relationship }
    })
    setQData(map)
    setLoading(false)
  }

  const addToObservations = async (p: Profile) => {
    if (observations.has(p.id)) return
    await db.from('observations').insert({ observer_id: profile!.id, observed_id: p.id })
    setObservations(prev => new Set([...prev, p.id]))
    setJustAdded(p.id)
    setTimeout(() => setJustAdded(null), 2000)
  }

  // ── Apply filters client-side ──────────────────────────────
  const filtered = useMemo(() => {
    return profiles.filter(p => {
      if (filters.gender    && p.gender     !== filters.gender)    return false
      if (filters.age_group && p.age_group  !== filters.age_group) return false
      if (filters.region    && p.region     !== filters.region)     return false
      if (filters.has_kids) {
        const q = qData[p.id]
        if (!q) return false
        const want = filters.has_kids === 'yes'
        if (q.has_kids !== want) return false
      }
      if (filters.desired_rel) {
        const q = qData[p.id]
        if (!q || q.desired_rel !== filters.desired_rel) return false
      }
      return true
    })
  }, [profiles, filters, qData])

  const activeFilterCount = Object.values(filters).filter(Boolean).length
  const suggested = filtered.slice(0, 2)
  const rest      = filtered.slice(2)

  const setFilter = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters(prev => ({ ...prev, [key]: prev[key] === val ? '' : val }))

  const clearFilters = () => setFilters(EMPTY_FILTERS)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

      {/* ── Filter bar ── */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-light transition-all duration-150 ${
              showFilters || activeFilterCount > 0
                ? 'border-aura-gold/50 bg-aura-gold/10 text-aura-gold'
                : 'border-aura-border text-aura-muted hover:text-aura-text'
            }`}
          >
            <SlidersHorizontal size={12} strokeWidth={1.5} />
            Filter
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-aura-gold text-[#09090c] text-[10px] font-medium flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-xs text-aura-subtle hover:text-aura-muted transition-colors flex items-center gap-1 font-light">
              <X size={10} strokeWidth={1.5} />
              Clear all
            </button>
          )}
          {!loading && (
            <span className="ml-auto text-xs text-aura-subtle font-light">
              {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
            </span>
          )}
        </div>

        {showFilters && (
          <div className="bg-aura-surface border border-aura-border/60 rounded-2xl p-4 space-y-4 animate-fade-in">

            {/* Gender */}
            <div>
              <p className="label-section mb-2">Gender</p>
              <div className="flex flex-wrap gap-2">
                {['man', 'woman'].map(g => (
                  <button key={g} onClick={() => setFilter('gender', g)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                      filters.gender === g
                        ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                        : 'border-aura-border text-aura-muted hover:border-aura-subtle'
                    }`}>
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Age group */}
            <div>
              <p className="label-section mb-2">Age group</p>
              <div className="flex flex-wrap gap-2">
                {AGE_GROUPS.map(g => (
                  <button key={g} onClick={() => setFilter('age_group', g)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                      filters.age_group === g
                        ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                        : 'border-aura-border text-aura-muted hover:border-aura-subtle'
                    }`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Region */}
            <div>
              <p className="label-section mb-2">Region</p>
              <select
                value={filters.region}
                onChange={e => setFilters(prev => ({ ...prev, region: e.target.value }))}
                className="input-aura text-sm"
              >
                <option value="">All regions</option>
                {DACH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Has kids */}
            <div>
              <p className="label-section mb-2">Has kids</p>
              <div className="flex flex-wrap gap-2">
                {[['yes', 'Yes'], ['no', 'No']].map(([val, label]) => (
                  <button key={val} onClick={() => setFilter('has_kids', val)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                      filters.has_kids === val
                        ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                        : 'border-aura-border text-aura-muted hover:border-aura-subtle'
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Desired relationship */}
            <div>
              <p className="label-section mb-2">Desired relationship</p>
              <div className="flex flex-wrap gap-2">
                {DESIRED_REL_OPTIONS.map(o => (
                  <button key={o} onClick={() => setFilter('desired_rel', o)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                      filters.desired_rel === o
                        ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                        : 'border-aura-border text-aura-muted hover:border-aura-subtle'
                    }`}>
                    {o}
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-5 w-36 bg-aura-surface rounded animate-pulse mb-8" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-aura-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif text-2xl font-light text-aura-text mb-2">
            {activeFilterCount > 0 ? 'No matches for these filters.' : 'No profiles yet.'}
          </p>
          <p className="text-sm text-aura-muted font-light">
            {activeFilterCount > 0 ? (
              <button onClick={clearFilters} className="text-aura-gold hover:text-aura-gold-lt transition-colors">
                Clear filters →
              </button>
            ) : 'Come back once more members have joined.'}
          </p>
        </div>
      ) : (
        <>
          {suggested.length > 0 && (
            <section className="mb-10">
              <p className="label-section mb-4">
                {activeFilterCount > 0 ? 'Filtered results' : 'Aura suggests'}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {suggested.map(p => (
                  <ProfileCard
                    key={p.id}
                    profile={p}
                    observed={observations.has(p.id)}
                    justAdded={justAdded === p.id}
                    onView={() => setSelected(p)}
                    onObserve={() => addToObservations(p)}
                    featured={!activeFilterCount}
                  />
                ))}
              </div>
            </section>
          )}
          {rest.length > 0 && (
            <section>
              <p className="label-section mb-4">
                {activeFilterCount > 0 ? '' : 'Browse members'}
              </p>
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
