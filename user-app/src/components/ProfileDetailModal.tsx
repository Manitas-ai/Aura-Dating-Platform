import { useEffect, useState } from 'react'
import { X, Eye, Lock } from 'lucide-react'
import { db } from '../lib/supabase'
import { Profile, Questionnaire } from '../types'

interface Props {
  profile:     Profile
  observed:    boolean
  onObserve:   () => void
  onGoObserve: () => void
  onClose:     () => void
}

// ── Questionnaire chapter definitions ─────────────────────────
const CHAPTERS = ['life_situation','appearance','lifestyle','vacation','values','dealbreakers','intellectual'] as const
type Chapter = typeof CHAPTERS[number]

const CHAPTER_LABELS: Record<Chapter, string> = {
  life_situation: 'Life Situation',
  appearance:     'Physical Appearance',
  lifestyle:      'Lifestyle',
  vacation:       'Vacation',
  values:         'Values & Vision',
  dealbreakers:   'Dealbreakers',
  intellectual:   'Intellectual & Quotes',
}

interface IntellectualItem { title: string; url: string }

function parseIntellectual(raw: string | null): IntellectualItem[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed
    return [{ title: raw, url: '' }]
  } catch {
    return [{ title: raw, url: '' }]
  }
}

// ── Per-chapter renderers ──────────────────────────────────────
function ChapterContent({ chapter, q }: { chapter: Chapter; q: Questionnaire }) {
  const row = (label: string, value: string | null | undefined) =>
    value ? (
      <div key={label} className="flex gap-3 text-sm">
        <span className="text-aura-subtle font-light w-40 shrink-0">{label}</span>
        <span className="text-aura-text font-light">{value}</span>
      </div>
    ) : null

  const tags = (label: string, values: string[]) =>
    values?.length > 0 ? (
      <div key={label}>
        <p className="text-xs text-aura-subtle font-light mb-1.5">{label}</p>
        <div className="flex flex-wrap gap-1.5">
          {values.map(v => (
            <span key={v} className="text-[11px] px-2 py-0.5 rounded-full bg-aura-elevated border border-aura-border text-aura-muted">
              {v}
            </span>
          ))}
        </div>
      </div>
    ) : null

  switch (chapter) {
    case 'life_situation':
      return (
        <div className="space-y-2.5">
          {row('Has kids',            q.q_existing_kids === true ? 'Yes' : q.q_existing_kids === false ? 'No' : null)}
          {q.q_existing_kids && row('Kids living with', q.q_kids_living_with)}
          {row('Wants kids',          q.q_wish_kids)}
          {row('Religion',            q.q_religion)}
          {row('Relocation',          q.q_relocation)}
          {row('Employment',          q.q_employment)}
          {row('Desired relationship',q.q_desired_relationship)}
          {tags('Languages',          q.q_languages || [])}
        </div>
      )
    case 'appearance':
      return (
        <div className="space-y-2.5">
          {row('Body type',       q.q_body_type)}
          {row('Height',          q.q_height)}
          {row('Fitness level',   q.q_fitness_level)}
          {row('Personal style',  q.q_personal_style)}
          {q.q_appearance_attitude && (
            <p className="text-sm text-aura-muted font-light italic leading-relaxed border-l-2 border-aura-gold/30 pl-3">
              "{q.q_appearance_attitude}"
            </p>
          )}
        </div>
      )
    case 'lifestyle': {
      const alone = q.q_saturday_alone || []
      const kids  = q.q_saturday_kids  || []
      return (
        <div className="space-y-3">
          {alone.length > 0 && (
            <div>
              <p className="text-xs text-aura-subtle font-light mb-1.5">Perfect Saturday (alone)</p>
              <ol className="space-y-1">
                {alone.map((v, i) => (
                  <li key={i} className="text-sm text-aura-muted font-light flex gap-2">
                    <span className="text-aura-subtle w-4 shrink-0">{i + 1}.</span>{v}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {kids.length > 0 && (
            <div>
              <p className="text-xs text-aura-subtle font-light mb-1.5">Perfect Saturday (with kids)</p>
              <ol className="space-y-1">
                {kids.map((v, i) => (
                  <li key={i} className="text-sm text-aura-muted font-light flex gap-2">
                    <span className="text-aura-subtle w-4 shrink-0">{i + 1}.</span>{v}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )
    }
    case 'vacation': {
      const alone = q.q_vacation_alone || []
      const kids  = q.q_vacation_kids  || []
      return (
        <div className="space-y-3">
          {alone.length > 0 && (
            <div>
              <p className="text-xs text-aura-subtle font-light mb-1.5">Dream vacation (alone)</p>
              <ol className="space-y-1">
                {alone.map((v, i) => (
                  <li key={i} className="text-sm text-aura-muted font-light flex gap-2">
                    <span className="text-aura-subtle w-4 shrink-0">{i + 1}.</span>{v}
                  </li>
                ))}
              </ol>
            </div>
          )}
          {kids.length > 0 && (
            <div>
              <p className="text-xs text-aura-subtle font-light mb-1.5">Dream vacation (with kids)</p>
              <ol className="space-y-1">
                {kids.map((v, i) => (
                  <li key={i} className="text-sm text-aura-muted font-light flex gap-2">
                    <span className="text-aura-subtle w-4 shrink-0">{i + 1}.</span>{v}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )
    }
    case 'values':
      return (
        <div className="space-y-3">
          {tags('Core values',             q.q_values || [])}
          {tags('Partnership priorities',  q.q_partnership_priorities || [])}
          {tags('Life vision',             q.q_life_vision || [])}
          {tags('What occupies my mind',   q.q_mind_occupiers || [])}
        </div>
      )
    case 'dealbreakers':
      return (
        <div className="space-y-2.5">
          {row('Smoking', q.q_smoking)}
          {row('Alcohol', q.q_alcohol)}
          {row('Diet',    q.q_diet)}
          {row('Pets',    q.q_pets)}
        </div>
      )
    case 'intellectual': {
      const items = parseIntellectual(q.q_about_intellectual)
      const quotes = [q.q_quote_1, q.q_quote_2, q.q_quote_3].filter(Boolean)
      return (
        <div className="space-y-4">
          {items.length > 0 && (
            <div>
              <p className="text-xs text-aura-subtle font-light mb-2">Books, podcasts & more</p>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-aura-subtle text-xs mt-0.5 shrink-0">·</span>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noopener noreferrer"
                        className="text-sm text-aura-gold font-light hover:underline"
                        onClick={e => e.stopPropagation()}
                      >
                        {item.title}
                      </a>
                    ) : (
                      <span className="text-sm text-aura-muted font-light">{item.title}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {quotes.length > 0 && (
            <div className="space-y-2">
              {quotes.map((q, i) => (
                <p key={i} className="text-sm text-aura-muted font-light italic leading-relaxed border-l-2 border-aura-gold/30 pl-3">
                  "{q}"
                </p>
              ))}
            </div>
          )}
        </div>
      )
    }
    default:
      return null
  }
}

// ── Main modal ─────────────────────────────────────────────────
export default function ProfileDetailModal({ profile, observed, onObserve, onGoObserve, onClose }: Props) {
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(null)
  const [visibility,    setVisibility]    = useState<Record<string, string>>({})
  const [qLoading,      setQLoading]      = useState(true)

  useEffect(() => {
    let cancelled = false
    async function fetchQ() {
      setQLoading(true)
      const { data } = await db
        .from('questionnaires')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle()
      if (!cancelled) {
        setQuestionnaire(data || null)
        setVisibility((data as any)?.q_visibility || {})
        setQLoading(false)
      }
    }
    fetchQ()
    return () => { cancelled = true }
  }, [profile.id])

  const publicChapters = CHAPTERS.filter(c => visibility[c] === 'public')

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-aura-surface rounded-t-3xl md:rounded-3xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col">

        {/* Photo header */}
        <div className="relative flex-shrink-0" style={{ height: '45vw', maxHeight: '260px' }}>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-aura-elevated flex items-center justify-center">
              <span className="font-serif text-6xl font-light text-aura-muted">
                {profile.username[0].toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-aura-surface via-aura-surface/20 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <X size={14} strokeWidth={1.5} className="text-white" />
          </button>

          <div className="absolute bottom-4 left-5">
            <p className="font-serif text-2xl font-light text-white">{profile.username}</p>
            <p className="text-xs text-white/60 mt-0.5">
              {[profile.age_group, profile.region].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {profile.about_me && (
            <p className="text-sm text-aura-text font-light leading-relaxed">{profile.about_me}</p>
          )}

          {profile.interests.length > 0 && (
            <div>
              <p className="label-section mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(t => (
                  <span key={t} className="tag-interest">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* ── Questionnaire public chapters ── */}
          {qLoading ? (
            <div className="space-y-2 pt-1">
              <div className="h-3 w-32 bg-aura-elevated rounded animate-pulse" />
              <div className="h-16 bg-aura-elevated rounded-xl animate-pulse" />
            </div>
          ) : !questionnaire || publicChapters.length === 0 ? (
            <div className="flex items-center gap-2 py-3 text-xs text-aura-subtle font-light">
              <Lock size={12} strokeWidth={1.5} />
              <span>{profile.username} hasn't made any questionnaire chapters public yet.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye size={13} strokeWidth={1.5} className="text-aura-gold" />
                <p className="label-section">Questionnaire</p>
                <span className="text-[10px] text-aura-subtle font-light">public chapters only</span>
              </div>
              {publicChapters.map(chapter => (
                <div key={chapter} className="bg-aura-elevated border border-aura-border/40 rounded-xl p-4">
                  <p className="text-xs font-medium text-aura-gold uppercase tracking-[0.1em] mb-3">
                    {CHAPTER_LABELS[chapter]}
                  </p>
                  <ChapterContent chapter={chapter} q={questionnaire} />
                </div>
              ))}
            </div>
          )}

          {/* Observe / propose CTA */}
          <div className="pt-4 border-t border-aura-border/40">
            {observed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-aura-gold font-light mb-3">
                  <Eye size={12} strokeWidth={1.5} />
                  In your observation list
                </div>
                <button onClick={onGoObserve} className="btn-gold w-full">
                  Go to Observation List →
                </button>
              </div>
            ) : (
              <button onClick={onObserve} className="btn-gold w-full">
                Add to Observation List
              </button>
            )}
            <button onClick={onClose} className="btn-ghost w-full mt-2">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
