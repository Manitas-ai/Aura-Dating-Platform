import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, Edit2, HelpCircle, MessageSquarePlus } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { DACH_REGIONS, AGE_GROUPS } from '../lib/constants'

const INTEREST_OPTIONS = [
  'Books', 'Reading', 'Writing', 'Hiking', 'Trail running', 'Cycling', 'Yoga', 'Gym',
  'Cooking', 'Wine & food', 'Travel', 'Photography', 'Music', 'Art & culture',
  'Museum', 'Theatre', 'Cinema', 'Architecture', 'Design', 'Philosophy',
  'AI & society', 'Geopolitics', 'Nature', 'Gardening', 'DIY',
  'Learning', 'Podcast', 'Meditation', 'Spirituality', 'Family',
  'Wellness', 'Sport', 'Board games', 'Volunteering',
]

export default function MyProfilePage() {
  const { profile, logout, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [editBasic,     setEditBasic]     = useState(false)
  const [editInterests, setEditInterests] = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [saveErr, setSaveErr] = useState('')

  // Basic editable fields
  const [ageGroup,   setAgeGroup]   = useState(profile?.age_group   || '')
  const [region,     setRegion]     = useState(profile?.region      || '')
  const [aboutMe,    setAboutMe]    = useState(profile?.about_me    || '')
  const [interests,  setInterests]  = useState<string[]>(profile?.interests || [])

  // Photos
  const [photos,    setPhotos]    = useState<{ id: string; url: string; is_primary: boolean }[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => { loadPhotos() }, [])

  async function loadPhotos() {
    const { data } = await db
      .from('profile_photos')
      .select('*')
      .eq('profile_id', profile!.id)
      .order('sort_order')
    if (data) setPhotos(data.map((p: any) => ({ id: p.id, url: p.photo_url, is_primary: p.is_primary })))
  }

  const saveBasic = async () => {
    setSaving(true); setSaveErr('')
    const { data, error } = await db
      .from('profiles')
      .update({ age_group: ageGroup || null, region: region || null, about_me: aboutMe || null })
      .eq('id', profile!.id)
      .select()
      .single()
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    if (data) { updateProfile(data); setEditBasic(false) }
  }

  const saveInterests = async () => {
    setSaving(true); setSaveErr('')
    const { data, error } = await db
      .from('profiles')
      .update({ interests })
      .eq('id', profile!.id)
      .select()
      .single()
    setSaving(false)
    if (error) { setSaveErr(error.message); return }
    if (data) { updateProfile(data); setEditInterests(false) }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || photos.length >= 5) return
    setUploading(true)
    const ext  = file.name.split('.').pop()
    const path = `${profile!.id}/${Date.now()}.${ext}`
    const { error: upErr } = await db.storage.from('profile-photos').upload(path, file)
    if (upErr) { setUploading(false); return }
    const { data: { publicUrl } } = db.storage.from('profile-photos').getPublicUrl(path)
    const isPrimary = photos.length === 0
    await db.from('profile_photos').insert({
      profile_id: profile!.id, photo_url: publicUrl, is_primary: isPrimary, sort_order: photos.length,
    })
    if (isPrimary) {
      const { data } = await db.from('profiles').update({ photo_url: publicUrl }).eq('id', profile!.id).select().single()
      if (data) updateProfile(data)
    }
    setUploading(false)
    loadPhotos()
  }

  const setPrimary = async (photoId: string, url: string) => {
    await db.from('profile_photos').update({ is_primary: false }).eq('profile_id', profile!.id)
    await db.from('profile_photos').update({ is_primary: true }).eq('id', photoId)
    const { data } = await db.from('profiles').update({ photo_url: url }).eq('id', profile!.id).select().single()
    if (data) updateProfile(data)
    loadPhotos()
  }

  const deletePhoto = async (photoId: string, isPrimary: boolean) => {
    await db.from('profile_photos').delete().eq('id', photoId)
    if (isPrimary) {
      const remaining = photos.filter(p => p.id !== photoId)
      const next = remaining[0]
      if (next) {
        await db.from('profile_photos').update({ is_primary: true }).eq('id', next.id)
        const { data } = await db.from('profiles').update({ photo_url: next.url }).eq('id', profile!.id).select().single()
        if (data) updateProfile(data)
      } else {
        const { data } = await db.from('profiles').update({ photo_url: null }).eq('id', profile!.id).select().single()
        if (data) updateProfile(data)
      }
    }
    loadPhotos()
  }

  const toggleInterest = (tag: string) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        {profile?.photo_url ? (
          <img src={profile.photo_url} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-aura-border" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-aura-elevated border-2 border-aura-border flex items-center justify-center">
            <span className="font-serif text-2xl text-aura-muted">{profile?.username[0].toUpperCase()}</span>
          </div>
        )}
        <div>
          <p className="font-serif text-xl font-light text-aura-text">{profile?.username}</p>
          <p className="text-xs text-aura-muted font-light">
            {[profile?.age_group, profile?.region].filter(Boolean).join(' · ')}
          </p>
        </div>
      </div>

      {saveErr && (
        <div className="px-4 py-3 rounded-xl bg-aura-rose/10 border border-aura-rose/30 text-xs text-aura-rose font-light">
          Save failed: {saveErr}
        </div>
      )}

      {/* ── Basic info ── */}
      <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="label-section">Basic info</p>
          {!editBasic && (
            <button onClick={() => { setEditBasic(true); setSaveErr('') }} className="p-1.5 text-aura-subtle hover:text-aura-muted">
              <Edit2 size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {!editBasic ? (
          <div className="space-y-2 text-sm">
            <p className="text-aura-text font-light">{profile?.age_group || <span className="text-aura-subtle italic">Age group not set</span>}</p>
            <p className="text-aura-text font-light">{profile?.region || <span className="text-aura-subtle italic">Region not set</span>}</p>
            {profile?.about_me ? (
              <p className="text-aura-muted font-light leading-relaxed">{profile.about_me}</p>
            ) : (
              <p className="text-aura-subtle italic text-sm">No description yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <p className="label-section mb-1.5">Age group</p>
              <select value={ageGroup} onChange={e => setAgeGroup(e.target.value)} className="input-aura">
                <option value="">—</option>
                {AGE_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <p className="label-section mb-1.5">Region</p>
              <select value={region} onChange={e => setRegion(e.target.value)} className="input-aura">
                <option value="">—</option>
                {DACH_REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <p className="label-section mb-1.5">
                About me
                <span className="ml-2 text-aura-subtle normal-case tracking-normal font-light">{aboutMe.length}/300</span>
              </p>
              <textarea
                className="input-aura h-24 resize-none"
                value={aboutMe}
                onChange={e => setAboutMe(e.target.value.slice(0, 300))}
              />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                onClick={saveBasic}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-aura-gold text-[#09090c] text-sm font-medium disabled:opacity-50 hover:bg-aura-gold-lt transition-colors"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
              <button onClick={() => { setEditBasic(false); setSaveErr('') }} className="py-2.5 px-4 rounded-xl border border-aura-border text-sm text-aura-muted hover:text-aura-text transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── Photos ── */}
      <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="label-section">Photos <span className="text-aura-subtle normal-case tracking-normal font-light">({photos.length}/5)</span></p>
          {photos.length < 5 && (
            <label className="text-xs text-aura-gold hover:text-aura-gold-lt transition-colors cursor-pointer font-light">
              {uploading ? 'Uploading…' : '+ Add photo'}
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          )}
        </div>
        {photos.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-aura-subtle font-light mb-3">No photos yet.</p>
            <label className="btn-ghost text-xs cursor-pointer">
              Upload a photo
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {photos.map(p => (
              <div key={p.id} className="relative group" style={{ aspectRatio: '1' }}>
                <img src={p.url} alt="" className="w-full h-full object-cover rounded-xl" />
                {p.is_primary && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] bg-aura-gold text-[#09090c] font-medium px-1.5 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
                <div className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!p.is_primary && (
                    <button
                      onClick={() => setPrimary(p.id, p.url)}
                      className="text-[10px] bg-aura-gold/90 text-[#09090c] font-medium px-2 py-1 rounded-full"
                    >
                      Set primary
                    </button>
                  )}
                  <button
                    onClick={() => deletePhoto(p.id, p.is_primary)}
                    className="text-[10px] bg-white/20 text-white px-2 py-1 rounded-full"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Interests ── */}
      <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="label-section">Interests</p>
          {!editInterests && (
            <button onClick={() => { setEditInterests(true); setSaveErr('') }} className="p-1.5 text-aura-subtle hover:text-aura-muted">
              <Edit2 size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>

        {!editInterests ? (
          interests.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {interests.map(t => <span key={t} className="tag-interest">{t}</span>)}
            </div>
          ) : (
            <p className="text-sm text-aura-subtle italic font-light">No interests set yet.</p>
          )
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {INTEREST_OPTIONS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleInterest(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all duration-150 ${
                    interests.includes(tag)
                      ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                      : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={saveInterests}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl bg-aura-gold text-[#09090c] text-sm font-medium disabled:opacity-50 hover:bg-aura-gold-lt transition-colors"
              >
                {saving ? 'Saving…' : 'Save interests'}
              </button>
              <button onClick={() => { setInterests(profile?.interests || []); setEditInterests(false); setSaveErr('') }} className="py-2.5 px-4 rounded-xl border border-aura-border text-sm text-aura-muted hover:text-aura-text transition-colors">
                Cancel
              </button>
            </div>
          </>
        )}
      </section>

      {/* ── Questionnaire link ── */}
      <section className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5">
        <p className="label-section mb-2">Questionnaire</p>
        <p className="text-sm text-aura-muted font-light mb-4">
          Your answers help us suggest compatible profiles and populate your interests automatically.
        </p>
        <button onClick={() => navigate('/questionnaire')} className="btn-ghost text-xs">
          Edit questionnaire →
        </button>
      </section>

      {/* ── Guide + Feedback + Sign-out ── */}
      <section className="bg-aura-surface border border-aura-border/60 rounded-2xl overflow-hidden">
        <button
          onClick={() => navigate('/guide')}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-aura-elevated transition-colors border-b border-aura-border/40"
        >
          <HelpCircle size={16} strokeWidth={1.5} className="text-aura-gold shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-aura-text font-light">How Aura works</p>
            <p className="text-xs text-aura-subtle font-light">Step-by-step guide to the platform</p>
          </div>
          <span className="text-aura-subtle text-xs">→</span>
        </button>
        <button
          onClick={() => navigate('/feedback')}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-aura-elevated transition-colors border-b border-aura-border/40"
        >
          <MessageSquarePlus size={16} strokeWidth={1.5} className="text-aura-gold shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-aura-text font-light">Leave alpha feedback</p>
            <p className="text-xs text-aura-subtle font-light">Help shape the next version of Aura</p>
          </div>
          <span className="text-aura-subtle text-xs">→</span>
        </button>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-aura-elevated transition-colors"
        >
          <LogOut size={16} strokeWidth={1.5} className="text-aura-subtle shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-aura-muted font-light">Sign out</p>
            <p className="text-xs text-aura-subtle font-light">Log in as a different user</p>
          </div>
        </button>
      </section>

    </div>
  )
}
