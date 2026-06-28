import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, Lock, Check, X, Plus } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  Q_KIDS_LIVING_WITH, Q_WISH_KIDS, Q_RELIGION, Q_RELOCATION, Q_EMPLOYMENT,
  Q_DESIRED_RELATIONSHIP, Q_LANGUAGES,
  Q_APPEARANCE_ATTITUDE, Q_BODY_TYPE, Q_HEIGHT, Q_FITNESS_LEVEL, Q_PERSONAL_STYLE,
  Q_SATURDAY_ALONE, Q_SATURDAY_KIDS, Q_VACATION_ALONE, Q_VACATION_KIDS,
  Q_VALUES, Q_PARTNERSHIP_PRIORITIES, Q_LIFE_VISION, Q_MIND_OCCUPIERS,
  Q_SMOKING, Q_ALCOHOL, Q_DIET, Q_PETS,
} from '../lib/constants'

// ── Visibility types ──────────────────────────────────────────
type Visibility = 'public' | 'flirts_only'

const CHAPTERS = [
  'life_situation',
  'appearance',
  'lifestyle',
  'vacation',
  'values',
  'dealbreakers',
  'intellectual',
] as const
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

// ── Sub-components ────────────────────────────────────────────
function SelectOne({ label, options, value, onChange }: {
  label?: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="mb-5">
      {label && <p className="label-section mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o} type="button" onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 text-left ${
              value === o
                ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
            }`}>{o}</button>
        ))}
      </div>
    </div>
  )
}

function SelectMulti({ label, options, value, onChange, max }: {
  label?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter(x => x !== o))
    else if (!max || value.length < max) onChange([...value, o])
  }
  return (
    <div className="mb-5">
      {label && (
        <p className="label-section mb-2">
          {label}{max && <span className="text-aura-subtle ml-2 normal-case tracking-normal">(select up to {max})</span>}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(o => {
          const sel = value.includes(o)
          const disabled = !sel && !!max && value.length >= max
          return (
            <button key={o} type="button" onClick={() => toggle(o)} disabled={disabled}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 text-left ${
                sel ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                : disabled ? 'border-aura-border/40 text-aura-subtle/40 cursor-not-allowed'
                : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
              }`}>{o}</button>
          )
        })}
      </div>
    </div>
  )
}

function RankPick({ label, options, value, onChange, max }: {
  label?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max: number
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) onChange(value.filter(x => x !== o))
    else if (value.length < max) onChange([...value, o])
  }
  return (
    <div className="mb-5">
      {label && (
        <p className="label-section mb-1">
          {label}
          <span className="text-aura-subtle ml-2 normal-case tracking-normal">— choose {max}, order = priority</span>
        </p>
      )}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {value.map((v, i) => (
            <span key={v} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-aura-gold/50 bg-aura-gold/10 text-xs text-aura-gold">
              <span className="text-[10px] text-aura-gold/60 font-medium">{i + 1}</span>
              {v}
              <button type="button" onClick={() => toggle(v)} className="ml-1 text-aura-gold/50 hover:text-aura-gold text-[10px]">✕</button>
            </span>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {options.filter(o => !value.includes(o)).map(o => (
          <button key={o} type="button" onClick={() => toggle(o)} disabled={value.length >= max}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 text-left ${
              value.length >= max
                ? 'border-aura-border/40 text-aura-subtle/40 cursor-not-allowed'
                : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
            }`}>{o}</button>
        ))}
      </div>
    </div>
  )
}

// ── Visibility toggle ─────────────────────────────────────────
function VisibilityToggle({ value, onChange }: { value: Visibility; onChange: (v: Visibility) => void }) {
  return (
    <div className="flex items-center gap-1 bg-aura-elevated border border-aura-border rounded-full p-0.5">
      <button
        type="button"
        onClick={() => onChange('public')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.12em] transition-all duration-150 ${
          value === 'public'
            ? 'bg-aura-gold/15 text-aura-gold border border-aura-gold/30'
            : 'text-aura-subtle hover:text-aura-muted'
        }`}
      >
        <Eye size={10} strokeWidth={1.5} />
        Public
      </button>
      <button
        type="button"
        onClick={() => onChange('flirts_only')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.12em] transition-all duration-150 ${
          value === 'flirts_only'
            ? 'bg-aura-surface text-aura-muted border border-aura-border'
            : 'text-aura-subtle hover:text-aura-muted'
        }`}
      >
        <Lock size={10} strokeWidth={1.5} />
        Flirts only
      </button>
    </div>
  )
}

// ── Chapter header ────────────────────────────────────────────
function ChapterHeader({ chapter, label, visibility, onVisibilityChange }: {
  chapter: Chapter; label: string; visibility: Visibility; onVisibilityChange: (v: Visibility) => void
}) {
  return (
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-aura-border/40">
      <h3 className="font-serif text-lg font-light text-aura-text">{label}</h3>
      <VisibilityToggle value={visibility} onChange={onVisibilityChange} />
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function QuestionnaireEditPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [loading, setLoading]   = useState(true)
  const [saving,  setSaving]    = useState(false)
  const [saved,   setSaved]     = useState(false)
  const [error,   setError]     = useState('')

  // Visibility per chapter — default all public
  const [vis, setVis] = useState<Record<Chapter, Visibility>>({
    life_situation: 'public',
    appearance:     'public',
    lifestyle:      'public',
    vacation:       'public',
    values:         'public',
    dealbreakers:   'public',
    intellectual:   'public',
  })

  const setChapterVis = useCallback((ch: Chapter, v: Visibility) => {
    setVis(prev => ({ ...prev, [ch]: v }))
  }, [])

  // Questionnaire fields
  const [existingKids,         setExistingKids]         = useState<boolean | null>(null)
  const [kidsLivingWith,       setKidsLivingWith]       = useState('')
  const [wishKids,             setWishKids]             = useState('')
  const [religion,             setReligion]             = useState('')
  const [relocation,           setRelocation]           = useState('')
  const [employment,           setEmployment]           = useState('')
  const [desiredRelationship,  setDesiredRelationship]  = useState('')
  const [languages,            setLanguages]            = useState<string[]>([])
  const [appearanceAttitude,   setAppearanceAttitude]   = useState('')
  const [bodyType,             setBodyType]             = useState('')
  const [height,               setHeight]               = useState('')
  const [fitnessLevel,         setFitnessLevel]         = useState('')
  const [personalStyle,        setPersonalStyle]        = useState('')
  const [saturdayAlone,        setSaturdayAlone]        = useState<string[]>([])
  const [saturdayKids,         setSaturdayKids]         = useState<string[]>([])
  const [vacationAlone,        setVacationAlone]        = useState<string[]>([])
  const [vacationKids,         setVacationKids]         = useState<string[]>([])
  const [values,               setValues]               = useState<string[]>([])
  const [partnershipPriorities,setPartnershipPriorities]= useState<string[]>([])
  const [lifeVision,           setLifeVision]           = useState<string[]>([])
  const [mindOccupiers,        setMindOccupiers]        = useState<string[]>([])
  const [smoking,              setSmoking]              = useState('')
  const [alcohol,              setAlcohol]              = useState('')
  const [diet,                 setDiet]                 = useState('')
  const [pets,                 setPets]                 = useState('')

  // Intellectual items: [{title, url}] stored as JSON in q_about_intellectual
  const [intellectualItems, setIntellectualItems] = useState<{title: string; url: string}[]>([])
  const addItem    = () => setIntellectualItems(p => p.length < 10 ? [...p, { title: '', url: '' }] : p)
  const removeItem = (i: number) => setIntellectualItems(p => p.filter((_, idx) => idx !== i))
  const updateItem = (i: number, field: 'title' | 'url', val: string) =>
    setIntellectualItems(p => p.map((item, idx) => idx === i ? { ...item, [field]: val } : item))

  const [quote1,               setQuote1]               = useState('')
  const [quote2,               setQuote2]               = useState('')
  const [quote3,               setQuote3]               = useState('')

  useEffect(() => {
    async function load() {
      const { data, error } = await db
        .from('questionnaires')
        .select('*')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      if (error) {
        console.error('[QuestionnaireEditPage] load error:', error)
        setError(`Could not load questionnaire: ${error.message}`)
        setLoading(false)
        return
      }
      if (data) {
        setExistingKids(data.q_existing_kids ?? null)
        setKidsLivingWith(data.q_kids_living_with ?? '')
        setWishKids(data.q_wish_kids ?? '')
        setReligion(data.q_religion ?? '')
        setRelocation(data.q_relocation ?? '')
        setEmployment(data.q_employment ?? '')
        setDesiredRelationship(data.q_desired_relationship ?? '')
        setLanguages(data.q_languages ?? [])
        setAppearanceAttitude(data.q_appearance_attitude ?? '')
        setBodyType(data.q_body_type ?? '')
        setHeight(data.q_height ?? '')
        setFitnessLevel(data.q_fitness_level ?? '')
        setPersonalStyle(data.q_personal_style ?? '')
        setSaturdayAlone(data.q_saturday_alone ?? [])
        setSaturdayKids(data.q_saturday_kids ?? [])
        setVacationAlone(data.q_vacation_alone ?? [])
        setVacationKids(data.q_vacation_kids ?? [])
        setValues(data.q_values ?? [])
        setPartnershipPriorities(data.q_partnership_priorities ?? [])
        setLifeVision(data.q_life_vision ?? [])
        setMindOccupiers(data.q_mind_occupiers ?? [])
        setSmoking(data.q_smoking ?? '')
        setAlcohol(data.q_alcohol ?? '')
        setDiet(data.q_diet ?? '')
        setPets(data.q_pets ?? '')
        // Parse intellectual items — stored as JSON, falls back from old plain text
        const raw = data.q_about_intellectual ?? ''
        if (raw) {
          try {
            const parsed = JSON.parse(raw)
            setIntellectualItems(Array.isArray(parsed) ? parsed : [{ title: raw, url: '' }])
          } catch {
            setIntellectualItems([{ title: raw, url: '' }])
          }
        }
        setQuote1(data.q_quote_1 ?? '')
        setQuote2(data.q_quote_2 ?? '')
        setQuote3(data.q_quote_3 ?? '')
        if (data.q_visibility && Object.keys(data.q_visibility).length > 0) {
          setVis(prev => ({ ...prev, ...data.q_visibility }))
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true); setError(''); setSaved(false)
    const payload = {
      profile_id:               profile!.id,
      q_visibility:             vis,
      q_existing_kids:          existingKids,
      q_kids_living_with:       kidsLivingWith   || null,
      q_wish_kids:              wishKids         || null,
      q_religion:               religion         || null,
      q_relocation:             relocation       || null,
      q_employment:             employment       || null,
      q_desired_relationship:   desiredRelationship || null,
      q_languages:              languages,
      q_appearance_attitude:    appearanceAttitude || null,
      q_body_type:              bodyType         || null,
      q_height:                 height           || null,
      q_fitness_level:          fitnessLevel     || null,
      q_personal_style:         personalStyle    || null,
      q_saturday_alone:         saturdayAlone,
      q_saturday_kids:          saturdayKids,
      q_vacation_alone:         vacationAlone,
      q_vacation_kids:          vacationKids,
      q_values:                 values,
      q_partnership_priorities: partnershipPriorities,
      q_life_vision:            lifeVision,
      q_mind_occupiers:         mindOccupiers,
      q_smoking:                smoking          || null,
      q_alcohol:                alcohol          || null,
      q_diet:                   diet             || null,
      q_pets:                   pets             || null,
      q_about_intellectual:     intellectualItems.filter(i => i.title.trim()).length > 0
                                  ? JSON.stringify(intellectualItems.filter(i => i.title.trim()))
                                  : null,
      q_quote_1:                quote1           || null,
      q_quote_2:                quote2           || null,
      q_quote_3:                quote3           || null,
    }
    const { error: err } = await db.from('questionnaires').upsert(payload)
    setSaving(false)
    if (err) { setError('Could not save. Please try again.'); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  if (loading) return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-4">
      {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-aura-surface rounded-xl animate-pulse" />)}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/profile')} className="p-1.5 text-aura-subtle hover:text-aura-muted">
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <div className="flex-1">
          <h1 className="font-serif text-2xl font-light text-aura-text">Questionnaire</h1>
          <p className="text-xs text-aura-subtle font-light mt-0.5">
            Each chapter can be set to <strong className="text-aura-muted font-medium">Public</strong> (everyone sees it) or <strong className="text-aura-muted font-medium">Flirts only</strong> (only people you've proposed to or accepted).
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-aura-rose/10 border border-aura-rose/30 text-xs text-aura-rose font-light">
          {error}
        </div>
      )}

      <div className="space-y-8">

        {/* ── Life Situation ────────────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="life_situation" label="Life Situation" visibility={vis.life_situation} onVisibilityChange={v => setChapterVis('life_situation', v)} />
          <div className="mb-5">
            <p className="label-section mb-2">Existing children</p>
            <div className="flex gap-3">
              {['Yes', 'No'].map(v => (
                <button key={v} type="button" onClick={() => setExistingKids(v === 'Yes')}
                  className={`px-6 py-2 rounded-full text-xs border transition-all duration-150 ${
                    existingKids === (v === 'Yes')
                      ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                      : 'border-aura-border text-aura-muted hover:border-aura-subtle'
                  }`}>{v}</button>
              ))}
            </div>
          </div>
          {existingKids && (
            <SelectOne label="Children living with me" options={Q_KIDS_LIVING_WITH} value={kidsLivingWith} onChange={setKidsLivingWith} />
          )}
          <SelectOne label="Wish for (more) children" options={Q_WISH_KIDS} value={wishKids} onChange={setWishKids} />
          <SelectOne label="Religion / Spirituality" options={Q_RELIGION} value={religion} onChange={setReligion} />
          <SelectOne label="Relocation" options={Q_RELOCATION} value={relocation} onChange={setRelocation} />
          <SelectOne label="Employment" options={Q_EMPLOYMENT} value={employment} onChange={setEmployment} />
          <SelectOne label="Desired relationship" options={Q_DESIRED_RELATIONSHIP} value={desiredRelationship} onChange={setDesiredRelationship} />
          <SelectMulti label="Languages spoken" options={Q_LANGUAGES} value={languages} onChange={setLanguages} />
        </section>

        {/* ── Physical Appearance ───────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="appearance" label="Physical Appearance" visibility={vis.appearance} onVisibilityChange={v => setChapterVis('appearance', v)} />
          <div className="mb-6">
            <p className="label-section mb-3">My relationship with my appearance</p>
            <div className="space-y-2">
              {Q_APPEARANCE_ATTITUDE.map((opt, i) => (
                <button key={i} type="button" onClick={() => setAppearanceAttitude(opt)}
                  className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                    appearanceAttitude === opt
                      ? 'border-aura-gold bg-aura-gold/8 text-aura-text'
                      : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
                  }`}>{opt}</button>
              ))}
            </div>
          </div>
          <SelectOne label="Body type" options={Q_BODY_TYPE} value={bodyType} onChange={setBodyType} />
          <SelectOne label="Height" options={Q_HEIGHT} value={height} onChange={setHeight} />
          <SelectOne label="Fitness level" options={Q_FITNESS_LEVEL} value={fitnessLevel} onChange={setFitnessLevel} />
          <SelectOne label="Personal style" options={Q_PERSONAL_STYLE} value={personalStyle} onChange={setPersonalStyle} />
        </section>

        {/* ── Lifestyle ─────────────────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="lifestyle" label="Lifestyle" visibility={vis.lifestyle} onVisibilityChange={v => setChapterVis('lifestyle', v)} />
          <RankPick label="A free Saturday — alone" options={Q_SATURDAY_ALONE} value={saturdayAlone} onChange={setSaturdayAlone} max={5} />
          {existingKids && (
            <RankPick label="A free Saturday — with your children" options={Q_SATURDAY_KIDS} value={saturdayKids} onChange={setSaturdayKids} max={5} />
          )}
        </section>

        {/* ── Vacation ──────────────────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="vacation" label="Vacation" visibility={vis.vacation} onVisibilityChange={v => setChapterVis('vacation', v)} />
          <RankPick label="Short holiday — alone" options={Q_VACATION_ALONE} value={vacationAlone} onChange={setVacationAlone} max={3} />
          {existingKids && (
            <RankPick label="Short holiday — with children" options={Q_VACATION_KIDS} value={vacationKids} onChange={setVacationKids} max={3} />
          )}
        </section>

        {/* ── Values & Vision ───────────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="values" label="Values & Vision" visibility={vis.values} onVisibilityChange={v => setChapterVis('values', v)} />
          <RankPick label="What currently matters most to me" options={Q_VALUES} value={values} onChange={setValues} max={5} />
          <SelectMulti label="In a partnership, I prioritise" options={Q_PARTNERSHIP_PRIORITIES} value={partnershipPriorities} onChange={setPartnershipPriorities} max={5} />
          <SelectMulti label="Life vision" options={Q_LIFE_VISION} value={lifeVision} onChange={setLifeVision} max={2} />
          <SelectMulti label="What occupies my mind" options={Q_MIND_OCCUPIERS} value={mindOccupiers} onChange={setMindOccupiers} max={3} />
        </section>

        {/* ── Dealbreakers ──────────────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="dealbreakers" label="Dealbreakers" visibility={vis.dealbreakers} onVisibilityChange={v => setChapterVis('dealbreakers', v)} />
          <SelectOne label="Smoking" options={Q_SMOKING} value={smoking} onChange={setSmoking} />
          <SelectOne label="Alcohol" options={Q_ALCOHOL} value={alcohol} onChange={setAlcohol} />
          <SelectOne label="Diet" options={Q_DIET} value={diet} onChange={setDiet} />
          <SelectOne label="Pets" options={Q_PETS} value={pets} onChange={setPets} />
        </section>

        {/* ── Intellectual & Quotes ─────────────────────────── */}
        <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
          <ChapterHeader chapter="intellectual" label="Intellectual Interests & Quotes" visibility={vis.intellectual} onVisibilityChange={v => setChapterVis('intellectual', v)} />
          <div className="mb-5">
            <p className="label-section mb-1">
              Books, podcasts, channels
              <span className="ml-2 text-aura-subtle normal-case tracking-normal font-light">({intellectualItems.length}/10)</span>
            </p>
            <p className="text-xs text-aura-subtle font-light mb-3">Add each item separately — title and an optional link (Amazon, Spotify, YouTube…)</p>
            <div className="space-y-2">
              {intellectualItems.map((item, i) => (
                <div key={i} className="bg-aura-elevated border border-aura-border/50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      className="input-aura flex-1 text-sm py-1.5"
                      value={item.title}
                      onChange={e => updateItem(i, 'title', e.target.value)}
                      placeholder="Title — e.g. Sapiens (Harari), Lex Fridman Podcast…"
                    />
                    <button type="button" onClick={() => removeItem(i)}
                      className="p-1.5 text-aura-subtle hover:text-aura-rose transition-colors shrink-0">
                      <X size={13} strokeWidth={1.5} />
                    </button>
                  </div>
                  <input
                    className="input-aura text-sm py-1.5"
                    value={item.url}
                    onChange={e => updateItem(i, 'url', e.target.value)}
                    placeholder="Link (optional) — paste Amazon, Spotify, YouTube, podcast URL…"
                    type="url"
                  />
                </div>
              ))}
              {intellectualItems.length < 10 && (
                <button type="button" onClick={addItem}
                  className="w-full py-2.5 border border-dashed border-aura-border/60 rounded-xl text-xs text-aura-subtle hover:text-aura-muted hover:border-aura-subtle transition-colors flex items-center justify-center gap-1.5">
                  <Plus size={12} strokeWidth={1.5} />
                  Add book, podcast or channel
                </button>
              )}
            </div>
          </div>
          {[
            { label: 'Quote 1', value: quote1, set: setQuote1 },
            { label: 'Quote 2', value: quote2, set: setQuote2 },
            { label: 'Quote 3', value: quote3, set: setQuote3 },
          ].map(({ label, value, set }) => (
            <div key={label} className="mb-4">
              <p className="label-section mb-2">{label} <span className="text-aura-subtle normal-case tracking-normal font-light">(optional)</span></p>
              <input
                className="input-aura"
                value={value}
                onChange={e => set(e.target.value)}
                placeholder="A sentence that matters to you…"
              />
            </div>
          ))}
        </section>

      </div>

      {/* Save button — sticky at bottom */}
      <div className="sticky bottom-24 md:bottom-6 mt-8 flex justify-end">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-light transition-all duration-200 shadow-lg ${
            saved
              ? 'bg-green-600/80 text-white'
              : 'bg-aura-gold text-[#09090c] hover:bg-aura-gold-lt disabled:opacity-50'
          }`}
        >
          {saved ? <><Check size={14} strokeWidth={2} /> Saved</> : saving ? 'Saving…' : 'Save questionnaire'}
        </button>
      </div>

    </div>
  )
}
