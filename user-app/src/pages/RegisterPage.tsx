import { useState, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { Profile } from '../types'
import {
  DACH_REGIONS, AGE_GROUPS,
  Q_KIDS_LIVING_WITH, Q_WISH_KIDS, Q_RELIGION, Q_RELOCATION, Q_EMPLOYMENT,
  Q_DESIRED_RELATIONSHIP, Q_LANGUAGES,
  Q_APPEARANCE_ATTITUDE, Q_BODY_TYPE, Q_HEIGHT, Q_FITNESS_LEVEL, Q_PERSONAL_STYLE,
  Q_SATURDAY_ALONE, Q_SATURDAY_KIDS, Q_VACATION_ALONE, Q_VACATION_KIDS,
  Q_VALUES, Q_PARTNERSHIP_PRIORITIES, Q_LIFE_VISION, Q_MIND_OCCUPIERS,
  Q_SMOKING, Q_ALCOHOL, Q_DIET, Q_PETS,
} from '../lib/constants'

// ── Helpers ───────────────────────────────────────────────────

function deriveInterests(q: Partial<QData>): string[] {
  const tags: string[] = []
  if (q.q_saturday_alone) tags.push(...q.q_saturday_alone.slice(0, 3))
  if (q.q_values)          tags.push(...q.q_values.slice(0, 2))
  if (q.q_mind_occupiers)  tags.push(...q.q_mind_occupiers.slice(0, 2))
  // Clean up duplicates and shorten long labels
  return [...new Set(tags)].slice(0, 8).map(t => {
    // Shorten very long option strings to a usable tag
    if (t.length > 30) return t.split(' — ')[0].split(' / ')[0].trim()
    return t
  })
}

interface QData {
  q_existing_kids:          boolean | null
  q_kids_living_with:       string
  q_wish_kids:              string
  q_religion:               string
  q_relocation:             string
  q_employment:             string
  q_desired_relationship:   string
  q_languages:              string[]
  q_appearance_attitude:    string
  q_body_type:              string
  q_height:                 string
  q_fitness_level:          string
  q_personal_style:         string
  q_saturday_alone:         string[]
  q_saturday_kids:          string[]
  q_vacation_alone:         string[]
  q_vacation_kids:          string[]
  q_values:                 string[]
  q_partnership_priorities: string[]
  q_life_vision:            string[]
  q_mind_occupiers:         string[]
  q_smoking:                string
  q_alcohol:                string
  q_diet:                   string
  q_pets:                   string
  q_about_intellectual:     string
  q_quote_1:                string
  q_quote_2:                string
  q_quote_3:                string
}

const BLANK_Q: QData = {
  q_existing_kids: null, q_kids_living_with: '', q_wish_kids: '', q_religion: '',
  q_relocation: '', q_employment: '', q_desired_relationship: '', q_languages: [],
  q_appearance_attitude: '', q_body_type: '', q_height: '', q_fitness_level: '', q_personal_style: '',
  q_saturday_alone: [], q_saturday_kids: [], q_vacation_alone: [], q_vacation_kids: [],
  q_values: [], q_partnership_priorities: [], q_life_vision: [], q_mind_occupiers: [],
  q_smoking: '', q_alcohol: '', q_diet: '', q_pets: '',
  q_about_intellectual: '', q_quote_1: '', q_quote_2: '', q_quote_3: '',
}

const TOTAL_STEPS = 10

// ── Sub-components ────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between text-[10px] text-aura-subtle uppercase tracking-[0.15em] mb-2">
        <span>Step {step} of {TOTAL_STEPS}</span>
        <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
      </div>
      <div className="h-px bg-aura-border w-full rounded-full overflow-hidden">
        <div
          className="h-full bg-aura-gold transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  )
}

function StepTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-7">
      <h2 className="font-serif text-2xl font-light text-aura-text">{title}</h2>
      {sub && <p className="text-sm text-aura-muted font-light mt-1">{sub}</p>}
    </div>
  )
}

function SelectOne({ label, options, value, onChange }: {
  label?: string; options: string[]; value: string; onChange: (v: string) => void
}) {
  return (
    <div className="mb-5">
      {label && <p className="label-section mb-2">{label}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 text-left ${
              value === o
                ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

function SelectMulti({ label, options, value, onChange, max }: {
  label?: string; options: string[]; value: string[]; onChange: (v: string[]) => void; max?: number
}) {
  const toggle = (o: string) => {
    if (value.includes(o)) {
      onChange(value.filter(x => x !== o))
    } else if (!max || value.length < max) {
      onChange([...value, o])
    }
  }
  return (
    <div className="mb-5">
      {label && (
        <p className="label-section mb-2">
          {label}
          {max && <span className="text-aura-subtle ml-2 normal-case tracking-normal">(select {max})</span>}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map(o => {
          const sel = value.includes(o)
          const disabled = !sel && !!max && value.length >= max
          return (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              disabled={disabled}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 text-left ${
                sel
                  ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                  : disabled
                  ? 'border-aura-border/40 text-aura-subtle/40 cursor-not-allowed'
                  : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
              }`}
            >
              {o}
            </button>
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
    if (value.includes(o)) {
      onChange(value.filter(x => x !== o))
    } else if (value.length < max) {
      onChange([...value, o])
    }
  }
  return (
    <div className="mb-5">
      {label && (
        <p className="label-section mb-1">
          {label}
          <span className="text-aura-subtle ml-2 normal-case tracking-normal">
            — choose {max}, first selected = highest priority
          </span>
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
          <button
            key={o}
            type="button"
            onClick={() => toggle(o)}
            disabled={value.length >= max}
            className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 text-left ${
              value.length >= max
                ? 'border-aura-border/40 text-aura-subtle/40 cursor-not-allowed'
                : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main wizard ───────────────────────────────────────────────

export default function RegisterPage() {
  const { login }  = useAuth()
  const navigate   = useNavigate()

  const [step, setStep]         = useState(1)
  const [saving, setSaving]     = useState(false)
  const [error,  setError]      = useState('')
  const [usernameOk, setUsernameOk] = useState<boolean | null>(null)
  const [checkingU, setCheckingU]   = useState(false)

  // Step 1 — credentials
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Step 2 — basic data
  const [ageGroup,    setAgeGroup]    = useState('')
  const [gender,      setGender]      = useState('')
  const [lookingFor,  setLookingFor]  = useState('')
  const [region,      setRegion]      = useState('')
  const [aboutMe,     setAboutMe]     = useState('')

  // Created profile ID (set after step 1 submit)
  const [profileId, setProfileId] = useState<string | null>(null)

  // Questionnaire data
  const [q, setQ] = useState<QData>({ ...BLANK_Q })

  const setQf = useCallback(<K extends keyof QData>(key: K, val: QData[K]) => {
    setQ(prev => ({ ...prev, [key]: val }))
  }, [])

  // ── Username availability check ───────────────────────────
  const checkUsername = async (u: string) => {
    if (!u || u.length < 3) { setUsernameOk(null); return }
    setCheckingU(true)
    const { data } = await db.from('profiles').select('id').eq('username', u.toLowerCase()).maybeSingle()
    setUsernameOk(!data)
    setCheckingU(false)
  }

  // ── Step 1: Create account ────────────────────────────────
  const submitStep1 = async () => {
    if (!username.trim() || !password.trim()) { setError('Please fill in all fields.'); return }
    if (usernameOk === false) { setError('That username is already taken.'); return }
    setSaving(true); setError('')
    const { data, error: err } = await db
      .from('profiles')
      .insert({ username: username.trim().toLowerCase(), password: password.trim() })
      .select()
      .single()
    setSaving(false)
    if (err || !data) { setError('Could not create account. Try a different username.'); return }
    setProfileId(data.id)
    login(data as Profile)
    setStep(2)
  }

  // ── Step 2: Save basic data ───────────────────────────────
  const submitStep2 = async () => {
    if (!ageGroup || !gender || !lookingFor || !region) { setError('Please complete all fields.'); return }
    setSaving(true); setError('')
    const { data, error: err } = await db
      .from('profiles')
      .update({ age_group: ageGroup, gender, looking_for: lookingFor, region, about_me: aboutMe || null })
      .eq('id', profileId!)
      .select()
      .single()
    setSaving(false)
    if (err) { setError('Could not save. Please try again.'); return }
    login(data as Profile)
    setStep(3)
  }

  // ── Steps 3–9: Save questionnaire sections ────────────────
  const upsertQ = async (patch: Partial<QData>) => {
    if (!profileId) return false
    const merged = { profile_id: profileId, ...q, ...patch }
    const { error: err } = await db.from('questionnaires').upsert(merged)
    if (err) { setError('Could not save. Please try again.'); return false }
    return true
  }

  const nextQ = async (patch: Partial<QData>, nextStep: number) => {
    setSaving(true); setError('')
    const ok = await upsertQ(patch)
    setSaving(false)
    if (ok) setStep(nextStep)
  }

  // ── Final step: derive interests, finish ─────────────────
  const finish = async () => {
    setSaving(true); setError('')
    const interests = deriveInterests(q)
    const ok = await upsertQ({})
    if (!ok) { setSaving(false); return }
    const { data, error: err } = await db
      .from('profiles')
      .update({ interests })
      .eq('id', profileId!)
      .select()
      .single()
    setSaving(false)
    if (err || !data) { setError('Could not finalise profile.'); return }
    login(data as Profile)
    navigate('/discover')
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-aura-bg flex items-start justify-center px-6 py-10">
      <div className="w-full max-w-lg animate-fade-in">

        <div className="text-center mb-8">
          <div className="font-serif text-3xl font-light tracking-[0.3em] text-aura-text">aura</div>
        </div>

        <ProgressBar step={step} />

        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-aura-rose/10 border border-aura-rose/30 text-xs text-aura-rose font-light animate-fade-in">
            {error}
          </div>
        )}

        {/* ── Step 1: Credentials ───────────────────────────── */}
        {step === 1 && (
          <div>
            <StepTitle title="Create your account." sub="Choose a username and password. There is no email — write your password down." />
            <div className="space-y-4">
              <div>
                <label className="label-section block mb-2">Username</label>
                <div className="relative">
                  <input
                    className="input-aura pr-10"
                    value={username}
                    onChange={e => {
                      const v = e.target.value.toLowerCase().replace(/\s/g, '')
                      setUsername(v)
                      setUsernameOk(null)
                      clearTimeout((window as any)._uCheck)
                      ;(window as any)._uCheck = setTimeout(() => checkUsername(v), 500)
                    }}
                    placeholder="e.g. elena_b"
                    autoFocus
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                    {checkingU && <span className="text-aura-subtle">…</span>}
                    {!checkingU && usernameOk === true  && <span className="text-green-500">✓</span>}
                    {!checkingU && usernameOk === false && <span className="text-aura-rose">✗</span>}
                  </span>
                </div>
                {usernameOk === false && <p className="text-xs text-aura-rose mt-1 font-light">Username taken.</p>}
              </div>
              <div>
                <label className="label-section block mb-2">Password</label>
                <input
                  type="password"
                  className="input-aura"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Something you can remember"
                />
                <p className="text-[11px] text-aura-subtle mt-1 font-light">No recovery option — write it down.</p>
              </div>
              <button
                type="button"
                onClick={submitStep1}
                disabled={saving || !username || !password || usernameOk === false}
                className="btn-gold w-full mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {saving ? 'Creating…' : 'Create account →'}
              </button>
              <p className="text-center text-xs text-aura-subtle mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-aura-gold hover:text-aura-gold-lt">Sign in</Link>
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Basic data ────────────────────────────── */}
        {step === 2 && (
          <div>
            <StepTitle title="About you." sub="This is what other members will see on your profile." />
            <SelectOne label="Age group" options={AGE_GROUPS} value={ageGroup} onChange={setAgeGroup} />
            <SelectOne label="I am" options={['man', 'woman']} value={gender} onChange={setGender} />
            <SelectOne label="I am looking for" options={['a man', 'a woman']} value={lookingFor} onChange={setLookingFor} />
            <div className="mb-5">
              <label className="label-section block mb-2">Region</label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value)}
                className="input-aura"
              >
                <option value="">Select your region…</option>
                {DACH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="mb-5">
              <label className="label-section block mb-2">
                About me
                <span className="ml-2 text-aura-subtle normal-case tracking-normal font-light">{aboutMe.length}/300</span>
              </label>
              <textarea
                className="input-aura h-24 resize-none"
                value={aboutMe}
                onChange={e => setAboutMe(e.target.value.slice(0, 300))}
                placeholder="A sentence or two — who you are, what you're looking for…"
              />
            </div>
            <button
              type="button"
              onClick={submitStep2}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 3: Life situation ────────────────────────── */}
        {step === 3 && (
          <div>
            <StepTitle title="Life situation." />
            <div className="mb-5">
              <p className="label-section mb-2">Do you have existing children?</p>
              <div className="flex gap-3">
                {['Yes', 'No'].map(v => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setQf('q_existing_kids', v === 'Yes')}
                    className={`px-6 py-2 rounded-full text-xs border transition-all duration-150 ${
                      q.q_existing_kids === (v === 'Yes')
                        ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                        : 'border-aura-border text-aura-muted hover:border-aura-subtle'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            {q.q_existing_kids && (
              <SelectOne label="Children living with me" options={Q_KIDS_LIVING_WITH} value={q.q_kids_living_with} onChange={v => setQf('q_kids_living_with', v)} />
            )}
            <SelectOne label="Wish for (more) children" options={Q_WISH_KIDS} value={q.q_wish_kids} onChange={v => setQf('q_wish_kids', v)} />
            <SelectOne label="Religion / Spirituality" options={Q_RELIGION} value={q.q_religion} onChange={v => setQf('q_religion', v)} />
            <SelectOne label="Relocation" options={Q_RELOCATION} value={q.q_relocation} onChange={v => setQf('q_relocation', v)} />
            <SelectOne label="Employment" options={Q_EMPLOYMENT} value={q.q_employment} onChange={v => setQf('q_employment', v)} />
            <SelectOne label="Desired relationship" options={Q_DESIRED_RELATIONSHIP} value={q.q_desired_relationship} onChange={v => setQf('q_desired_relationship', v)} />
            <SelectMulti label="Languages spoken" options={Q_LANGUAGES} value={q.q_languages} onChange={v => setQf('q_languages', v)} />
            <button
              type="button"
              onClick={() => nextQ(q, 4)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 4: Physical appearance ──────────────────── */}
        {step === 4 && (
          <div>
            <StepTitle title="Physical appearance." sub="Be honest — this is for compatibility, not judgement." />
            <div className="mb-6">
              <p className="label-section mb-3">My relationship with my appearance</p>
              <div className="space-y-2">
                {Q_APPEARANCE_ATTITUDE.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQf('q_appearance_attitude', opt)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-150 ${
                      q.q_appearance_attitude === opt
                        ? 'border-aura-gold bg-aura-gold/8 text-aura-text'
                        : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <SelectOne label="Body type" options={Q_BODY_TYPE} value={q.q_body_type} onChange={v => setQf('q_body_type', v)} />
            <SelectOne label="Height" options={Q_HEIGHT} value={q.q_height} onChange={v => setQf('q_height', v)} />
            <SelectOne label="Fitness level" options={Q_FITNESS_LEVEL} value={q.q_fitness_level} onChange={v => setQf('q_fitness_level', v)} />
            <SelectOne label="Personal style" options={Q_PERSONAL_STYLE} value={q.q_personal_style} onChange={v => setQf('q_personal_style', v)} />
            <button
              type="button"
              onClick={() => nextQ(q, 5)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 5: Lifestyle ─────────────────────────────── */}
        {step === 5 && (
          <div>
            <StepTitle title="Lifestyle." />
            <RankPick
              label="A free Saturday — alone"
              options={Q_SATURDAY_ALONE}
              value={q.q_saturday_alone}
              onChange={v => setQf('q_saturday_alone', v)}
              max={5}
            />
            {q.q_existing_kids && (
              <RankPick
                label="A free Saturday — with your children"
                options={Q_SATURDAY_KIDS}
                value={q.q_saturday_kids}
                onChange={v => setQf('q_saturday_kids', v)}
                max={5}
              />
            )}
            <button
              type="button"
              onClick={() => nextQ(q, 6)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 6: Holidays ──────────────────────────────── */}
        {step === 6 && (
          <div>
            <StepTitle title="Short holidays." />
            <RankPick
              label="Alone"
              options={Q_VACATION_ALONE}
              value={q.q_vacation_alone}
              onChange={v => setQf('q_vacation_alone', v)}
              max={3}
            />
            {q.q_existing_kids && (
              <RankPick
                label="With your children"
                options={Q_VACATION_KIDS}
                value={q.q_vacation_kids}
                onChange={v => setQf('q_vacation_kids', v)}
                max={3}
              />
            )}
            <button
              type="button"
              onClick={() => nextQ(q, 7)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 7: Values & vision ───────────────────────── */}
        {step === 7 && (
          <div>
            <StepTitle title="Values & vision." />
            <RankPick
              label="What currently matters most to me"
              options={Q_VALUES}
              value={q.q_values}
              onChange={v => setQf('q_values', v)}
              max={5}
            />
            <SelectMulti
              label="Future partnership — what I value most"
              options={Q_PARTNERSHIP_PRIORITIES}
              value={q.q_partnership_priorities}
              onChange={v => setQf('q_partnership_priorities', v)}
              max={5}
            />
            <button
              type="button"
              onClick={() => nextQ(q, 8)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 8: Life vision & mind ────────────────────── */}
        {step === 8 && (
          <div>
            <StepTitle title="Where are you headed?" />
            <SelectMulti
              label="5 years from now, I would like to…"
              options={Q_LIFE_VISION}
              value={q.q_life_vision}
              onChange={v => setQf('q_life_vision', v)}
              max={2}
            />
            <SelectMulti
              label="What occupies my mind these days"
              options={Q_MIND_OCCUPIERS}
              value={q.q_mind_occupiers}
              onChange={v => setQf('q_mind_occupiers', v)}
              max={3}
            />
            <button
              type="button"
              onClick={() => nextQ(q, 9)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 9: Dealbreakers ──────────────────────────── */}
        {step === 9 && (
          <div>
            <StepTitle title="Potential dealbreakers." sub="Select one per line." />
            <SelectOne label="Smoking" options={Q_SMOKING} value={q.q_smoking} onChange={v => setQf('q_smoking', v)} />
            <SelectOne label="Alcohol" options={Q_ALCOHOL} value={q.q_alcohol} onChange={v => setQf('q_alcohol', v)} />
            <SelectOne label="Diet" options={Q_DIET} value={q.q_diet} onChange={v => setQf('q_diet', v)} />
            <SelectOne label="Pets" options={Q_PETS} value={q.q_pets} onChange={v => setQf('q_pets', v)} />
            <button
              type="button"
              onClick={() => nextQ(q, 10)}
              disabled={saving}
              className="btn-gold w-full disabled:opacity-40"
            >
              {saving ? 'Saving…' : 'Continue →'}
            </button>
          </div>
        )}

        {/* ── Step 10: Intellectual interests & quotes ─────── */}
        {step === 10 && (
          <div>
            <StepTitle
              title="Intellectual life."
              sub="What has shaped your thinking? Books, podcasts, films, talks. Max 1000 characters."
            />
            <div className="mb-5">
              <label className="label-section block mb-2">
                What has influenced your thinking recently?
                <span className="ml-2 text-aura-subtle normal-case tracking-normal font-light">{q.q_about_intellectual.length}/1000</span>
              </label>
              <textarea
                className="input-aura h-32 resize-none"
                value={q.q_about_intellectual}
                onChange={e => setQf('q_about_intellectual', e.target.value.slice(0, 1000))}
                placeholder="e.g. Thinking Fast and Slow — Kahneman. Lex Fridman podcast. The Alignment Problem. …"
              />
            </div>
            {[1,2,3].map(n => (
              <div key={n} className="mb-4">
                <label className="label-section block mb-2">Quote {n} {n > 1 && '(optional)'}</label>
                <input
                  className="input-aura"
                  value={(q as any)[`q_quote_${n}`]}
                  onChange={e => setQf(`q_quote_${n}` as keyof QData, e.target.value as any)}
                  placeholder="A quote from someone whose thinking resonates with you"
                />
              </div>
            ))}
            <div className="mt-6 pt-6 border-t border-aura-border/40">
              <p className="text-sm text-aura-muted font-light mb-4">
                That's it. Your profile is ready. You can edit everything later.
              </p>
              <button
                type="button"
                onClick={finish}
                disabled={saving}
                className="btn-gold w-full disabled:opacity-40"
              >
                {saving ? 'Finalising…' : 'Enter Aura →'}
              </button>
            </div>
          </div>
        )}

        {/* Skip questionnaire for now */}
        {step > 2 && step < 10 && (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="w-full mt-3 text-xs text-aura-subtle hover:text-aura-muted transition-colors py-2"
          >
            Skip this step
          </button>
        )}

      </div>
    </div>
  )
}
