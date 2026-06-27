import { MapPin, Briefcase, X, Heart } from 'lucide-react'
import { Profile } from '../types'

interface Props {
  profile: Profile
  onClose: () => void
  onLike:  () => void
  onPass:  () => void
}

export default function ProfileDetailModal({ profile, onClose, onLike, onPass }: Props) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-6 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-lg bg-aura-surface border border-aura-border rounded-t-3xl md:rounded-3xl overflow-hidden animate-slide-up max-h-[92vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Photo */}
        <div className="relative" style={{ height: '52vw', maxHeight: '320px', minHeight: '200px' }}>
          {profile.photo_url ? (
            <img src={profile.photo_url} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-aura-elevated flex items-center justify-center">
              <span className="font-serif text-7xl text-aura-subtle">{profile.name[0]}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-aura-surface via-transparent to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center"
          >
            <X size={14} strokeWidth={1.5} className="text-white/70" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 pt-4 pb-6">
          <h2 className="font-serif text-4xl font-light text-aura-text">
            {profile.name}, {profile.age}
          </h2>
          <div className="flex items-center gap-5 mt-2 mb-5">
            {profile.location && (
              <div className="flex items-center gap-1.5 text-aura-muted text-xs font-light">
                <MapPin size={11} strokeWidth={1.5} />
                {profile.location}
              </div>
            )}
            {profile.occupation && (
              <div className="flex items-center gap-1.5 text-aura-muted text-xs font-light">
                <Briefcase size={11} strokeWidth={1.5} />
                {profile.occupation}
              </div>
            )}
          </div>

          {profile.bio && (
            <p className="text-aura-muted text-sm font-light leading-relaxed mb-6">
              {profile.bio}
            </p>
          )}

          {profile.interests?.length > 0 && (
            <>
              <div className="divider mb-4" />
              <p className="label-section mb-3">Interests</p>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map(tag => (
                  <span key={tag} className="tag-interest">{tag}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-aura-border flex gap-3">
          <button onClick={onPass} className="btn-ghost flex-1 flex items-center justify-center gap-2 text-xs">
            <X size={14} strokeWidth={1.5} />
            Pass
          </button>
          <button onClick={onLike} className="btn-gold flex-1 flex items-center justify-center gap-2 text-xs">
            <Heart size={14} strokeWidth={1.5} />
            Like
          </button>
        </div>
      </div>
    </div>
  )
}
