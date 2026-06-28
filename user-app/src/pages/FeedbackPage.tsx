import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Check } from 'lucide-react'
import { db } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = [
  { value: 'general',    label: 'General impression' },
  { value: 'onboarding', label: 'Registration & onboarding' },
  { value: 'discover',   label: 'Discover & browsing' },
  { value: 'observe',    label: 'Observation list' },
  { value: 'flirts',     label: 'Flirt proposals & chat' },
  { value: 'profile',    label: 'My profile & questionnaire' },
  { value: 'bug',        label: 'Bug or technical issue' },
  { value: 'idea',       label: 'Feature idea or suggestion' },
]

const RATINGS = [
  { value: 1, label: '1 — Very poor' },
  { value: 2, label: '2 — Poor' },
  { value: 3, label: '3 — Okay' },
  { value: 4, label: '4 — Good' },
  { value: 5, label: '5 — Excellent' },
]

export default function FeedbackPage() {
  const { profile } = useAuth()
  const navigate    = useNavigate()

  const [category, setCategory] = useState('general')
  const [rating,   setRating]   = useState(0)
  const [feedback, setFeedback] = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [error,    setError]    = useState('')

  const submit = async () => {
    if (!feedback.trim()) { setError('Please write something before submitting.'); return }
    setSending(true); setError('')
    const { error: err } = await db.from('feedback').insert({
      profile_id: profile!.id,
      username:   profile!.username,
      category,
      rating:     rating || null,
      feedback:   feedback.trim(),
    })
    setSending(false)
    if (err) { setError(`Could not send feedback: ${err.message}`); return }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center mx-auto mb-5">
          <Check size={24} strokeWidth={1.5} className="text-green-500" />
        </div>
        <h2 className="font-serif text-2xl font-light text-aura-text mb-3">Thank you</h2>
        <p className="text-aura-muted font-light mb-8 leading-relaxed">
          Your feedback has been received. It goes directly to the team and helps shape the next version of Aura.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={() => { setSent(false); setFeedback(''); setRating(0); setCategory('general') }}
            className="py-3 px-6 rounded-xl border border-aura-border text-sm text-aura-muted hover:text-aura-text transition-colors">
            Leave more feedback
          </button>
          <button onClick={() => navigate('/discover')}
            className="py-3 px-6 rounded-xl bg-aura-gold text-[#09090c] text-sm font-medium hover:bg-aura-gold-lt transition-colors">
            Continue browsing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1.5 text-aura-subtle hover:text-aura-muted">
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-light text-aura-text">Alpha Feedback</h1>
          <p className="text-xs text-aura-subtle font-light mt-0.5">Your experience shapes the product</p>
        </div>
      </div>

      {/* Context */}
      <div className="bg-aura-surface border border-aura-gold/20 rounded-2xl p-5 mb-6">
        <p className="text-sm text-aura-muted font-light leading-relaxed">
          You're one of the first people to use Aura. Everything you write here goes directly
          to the founding team. Please be honest and detailed — the good, the bad, and the confusing.
          No feedback is too small.
        </p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-xl bg-aura-rose/10 border border-aura-rose/30 text-xs text-aura-rose font-light">
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* Category */}
        <div>
          <p className="label-section mb-3">What is your feedback about?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {CATEGORIES.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`px-4 py-3 rounded-xl text-left text-sm border transition-all duration-150 ${
                  category === c.value
                    ? 'border-aura-gold bg-aura-gold/10 text-aura-text'
                    : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <p className="label-section mb-3">Overall rating <span className="text-aura-subtle normal-case tracking-normal font-light">(optional)</span></p>
          <div className="flex flex-wrap gap-2">
            {RATINGS.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRating(prev => prev === r.value ? 0 : r.value)}
                className={`px-4 py-2 rounded-full text-xs border transition-all duration-150 ${
                  rating === r.value
                    ? 'border-aura-gold bg-aura-gold/10 text-aura-gold'
                    : 'border-aura-border text-aura-muted hover:border-aura-subtle hover:text-aura-text'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback text */}
        <div>
          <p className="label-section mb-2">
            Your feedback
            <span className="ml-2 text-aura-subtle normal-case tracking-normal font-light">{feedback.length}/3000</span>
          </p>
          <textarea
            className="input-aura resize-none"
            rows={10}
            value={feedback}
            onChange={e => setFeedback(e.target.value.slice(0, 3000))}
            placeholder="Write freely. What worked? What confused you? What would make this better? Describe your experience in as much detail as you like."
          />
        </div>

        <button
          onClick={submit}
          disabled={sending || !feedback.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-aura-gold text-[#09090c] text-sm font-medium hover:bg-aura-gold-lt disabled:opacity-50 transition-colors"
        >
          <Send size={14} strokeWidth={1.5} />
          {sending ? 'Sending…' : 'Send feedback'}
        </button>

      </div>
    </div>
  )
}
