import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Briefcase, LogOut, Edit2, Check, X } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const ALL_INTERESTS = [
  'Architecture','Contemporary Art','Wine','Jazz','Photography','Hiking',
  'Yoga','Literature','Film','Gastronomy','Travel','Writing','Sailing',
  'Tennis','Classical Music','Philosophy','Cinema','Vinyl','Poetry',
  'Skiing','Running','Art','Fashion','Design','Ballet','Cooking',
  'Cycling','Film Noir','Entrepreneurship',
]

export default function MyProfilePage() {
  const { profile, login, logout } = useAuth()
  const navigate  = useNavigate()
  const [editing, setEditing] = useState(false)
  const [saving,  setSaving]  = useState(false)

  const [bio,        setBio]        = useState(profile?.bio        || '')
  const [occupation, setOccupation] = useState(profile?.occupation || '')
  const [location,   setLocation]   = useState(profile?.location   || '')
  const [interests,  setInterests]  = useState<string[]>(profile?.interests || [])

  if (!profile) return null

  const toggleInterest = (tag: string) => {
    setInterests(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const save = async () => {
    setSaving(true)
    const updates = { bio, occupation, location, interests }
    await db.from('profiles').update(updates).eq('id', profile.id)
    login({ ...profile, ...updates })
    setSaving(false)
    setEditing(false)
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="max-w-lg mx-auto px-4 py-10 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="label-section mb-1">Your</p>
          <h1 className="font-serif text-4xl font-light text-aura-text">Profile</h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-aura-muted hover:text-aura-rose transition-colors tracking-wider uppercase font-medium"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </div>

      {/* Photo + name */}
      <div className="flex items-center gap-5 mb-8 p-5 card">
        {profile.photo_url ? (
          <img src={profile.photo_url} alt={profile.name} className="w-20 h-20 rounded-full object-cover border border-aura-border flex-shrink-0" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center flex-shrink-0">
            <span className="font-serif text-3xl text-aura-muted">{profile.name[0]}</span>
          </div>
        )}
        <div>
          <p className="font-serif text-2xl font-light text-aura-text">{profile.name}</p>
          <p className="text-sm text-aura-muted font-light mt-0.5">{profile.age} · {profile.gender}</p>
          <p className="text-xs text-aura-subtle mt-1 font-mono tracking-wide">@{profile.username}</p>
        </div>
      </div>

      {/* Details */}
      <div className="card p-5 mb-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="label-section">Details</p>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs text-aura-muted hover:text-aura-gold transition-colors">
              <Edit2 size={12} strokeWidth={1.5} /> Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="flex items-center gap-1 text-xs text-aura-muted hover:text-aura-text transition-colors">
                <X size={12} strokeWidth={1.5} /> Cancel
              </button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1 text-xs text-aura-gold hover:text-aura-gold-lt transition-colors">
                <Check size={12} strokeWidth={2} /> {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {editing ? (
          <div className="space-y-3">
            <div>
              <label className="label-section block mb-1.5">Location</label>
              <input className="input-aura" value={location} onChange={e => setLocation(e.target.value)} placeholder="City" />
            </div>
            <div>
              <label className="label-section block mb-1.5">Occupation</label>
              <input className="input-aura" value={occupation} onChange={e => setOccupation(e.target.value)} placeholder="What do you do?" />
            </div>
            <div>
              <label className="label-section block mb-1.5">About you</label>
              <textarea className="input-aura resize-none" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a short bio…" />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-aura-muted font-light">
                <MapPin size={13} strokeWidth={1.25} className="text-aura-subtle" />
                {profile.location}
              </div>
            )}
            {profile.occupation && (
              <div className="flex items-center gap-2 text-sm text-aura-muted font-light">
                <Briefcase size={13} strokeWidth={1.25} className="text-aura-subtle" />
                {profile.occupation}
              </div>
            )}
            {profile.bio ? (
              <p className="text-sm text-aura-muted font-light leading-relaxed pt-1">{profile.bio}</p>
            ) : (
              <p className="text-sm text-aura-subtle italic font-light">No bio yet — click Edit to add one.</p>
            )}
          </div>
        )}
      </div>

      {/* Interests */}
      <div className="card p-5">
        <p className="label-section mb-4">Interests</p>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {ALL_INTERESTS.map(tag => (
              <button
                key={tag}
                onClick={() => toggleInterest(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150
                  ${interests.includes(tag)
                    ? 'bg-aura-gold/15 border-aura-gold/40 text-aura-gold'
                    : 'border-aura-border text-aura-subtle hover:border-aura-muted hover:text-aura-muted'
                  }`}
              >
                {tag}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {(profile.interests || []).length === 0 ? (
              <p className="text-sm text-aura-subtle italic font-light">No interests added yet.</p>
            ) : (
              profile.interests.map(tag => (
                <span key={tag} className="tag-interest">{tag}</span>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  )
}
