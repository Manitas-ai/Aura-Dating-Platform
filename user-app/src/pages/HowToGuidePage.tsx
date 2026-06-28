import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

const STEPS = [
  {
    num: '1',
    title: 'Complete your profile',
    desc: 'Go to Profile → fill in your basic info, upload up to 5 photos, and complete the questionnaire. The more honest and detailed your answers, the better your matches will be. You control per-chapter who can see your questionnaire answers.',
  },
  {
    num: '2',
    title: 'Browse on Discover',
    desc: 'Discover shows you all other members. Browse at your own pace — there\'s no swiping. Open a profile to read it properly. Aura rewards depth and deliberate choice.',
  },
  {
    num: '3',
    title: 'Add people to your Observation List',
    desc: 'When someone interests you, add them to your Observation List (the eye icon on their profile). This is private — they won\'t be notified. Use it as your shortlist while you think.',
  },
  {
    num: '4',
    title: 'Propose a Flirt',
    desc: 'When you\'re ready, propose a flirt from your Observation List. You write a short personal message (max 120 characters) — something you noticed in their profile. You have up to two attempts per person.',
  },
  {
    num: '5',
    title: 'Accept or decline proposals',
    desc: 'Check the Pending tab in Flirts to see who has proposed to you. You\'ll see their profile summary and their personal message. Accept to start a conversation, or decline — your choice, no pressure.',
  },
  {
    num: '6',
    title: 'Start your conversation',
    desc: 'Once both sides have accepted, a private 1:1 chat opens in Flirts. There\'s no time limit, no gamification, no notifications counting down. Just a real conversation at your pace.',
  },
  {
    num: '7',
    title: 'Leave feedback',
    desc: 'You\'re one of the first people to use Aura. Your feedback directly shapes the product. Use the Feedback section to tell us what works, what doesn\'t, and what you\'d like to see.',
  },
]

const PRINCIPLES = [
  { title: 'No swiping',            desc: 'Deliberate browsing replaces the dopamine swipe loop.' },
  { title: 'No public age or city', desc: 'You choose what to share and with whom.' },
  { title: 'Two-step proposals',    desc: 'A personal message is required — no silent "likes".' },
  { title: 'Questionnaire depth',   desc: 'Your answers reveal what matters, not just what you look like.' },
  { title: 'Private watchlist',     desc: 'Observe without pressure. Decide at your own pace.' },
]

export default function HowToGuidePage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="p-1.5 text-aura-subtle hover:text-aura-muted">
          <ArrowLeft size={16} strokeWidth={1.5} />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-light text-aura-text">How Aura works</h1>
          <p className="text-xs text-aura-subtle font-light mt-0.5">Your guide to getting the most from this platform</p>
        </div>
      </div>

      {/* Philosophy */}
      <section className="bg-aura-surface border border-aura-gold/20 rounded-2xl p-5 mb-8">
        <p className="font-serif text-base font-light text-aura-text leading-relaxed mb-3">
          Aura is built for people who are serious about finding a meaningful connection —
          not the fastest one. There are no algorithms pushing you toward quick decisions.
          Everything here is designed for depth, honesty, and deliberate choice.
        </p>
        <p className="text-xs text-aura-subtle font-light">
          This is an alpha version. Your experience and feedback are actively shaping the product.
        </p>
      </section>

      {/* Steps */}
      <section className="mb-8">
        <p className="label-section mb-4">Step by step</p>
        <div className="space-y-3">
          {STEPS.map(step => (
            <div key={step.num} className="bg-aura-surface border border-aura-border/60 rounded-2xl p-5 flex gap-4">
              <div className="shrink-0 w-7 h-7 rounded-full bg-aura-gold/10 border border-aura-gold/30 flex items-center justify-center mt-0.5">
                <span className="text-xs font-medium text-aura-gold">{step.num}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-aura-text mb-1">{step.title}</p>
                <p className="text-sm text-aura-muted font-light leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Principles */}
      <section className="mb-8">
        <p className="label-section mb-4">Design principles</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRINCIPLES.map(p => (
            <div key={p.title} className="bg-aura-surface border border-aura-border/60 rounded-xl p-4">
              <p className="text-xs font-medium text-aura-gold mb-1 uppercase tracking-[0.12em]">{p.title}</p>
              <p className="text-sm text-aura-muted font-light leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => navigate('/discover')}
          className="flex-1 py-3 rounded-xl bg-aura-gold text-[#09090c] text-sm font-medium hover:bg-aura-gold-lt transition-colors"
        >
          Start browsing
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="flex-1 py-3 rounded-xl border border-aura-border text-sm text-aura-muted hover:text-aura-text transition-colors"
        >
          Complete my profile
        </button>
      </div>

    </div>
  )
}
