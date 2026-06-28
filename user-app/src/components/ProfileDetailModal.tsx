import { X } from 'lucide-react'
import { Profile } from '../types'

interface Props {
  profile:     Profile
  observed:    boolean
  onObserve:   () => void
  onGoObserve: () => void
  onClose:     () => void
}

export default function ProfileDetailModal({ profile, observed, onObserve, onGoObserve, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-md bg-aura-surface rounded-t-3xl md:rounded-3xl overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">

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
        <div className="overflow-y-auto flex-1 px-5 py-5">

          {profile.about_me && (
            <p className="text-sm text-aura-text font-light leading-relaxed mb-5">{profile.about_me}</p>
          )}

          {profile.interests.length > 0 && (
            <div className="mb-5">
              <p className="label-section mb-2">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(t => (
                  <span key={t} className="tag-interest">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Observe / propose CTA */}
          <div className="pt-4 border-t border-aura-border/40">
            {observed ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-aura-gold font-light mb-3">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                  In your observation list
                </div>
                <button onClick={onGoObserve} className="btn-gold w-full">
                  Go to Observation List →
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onObserve(); }}
                className="btn-gold w-full"
              >
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
