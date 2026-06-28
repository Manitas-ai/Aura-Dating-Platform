import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { Compass, Eye, Flame, User, LogOut, HelpCircle, MessageSquarePlus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/discover',  icon: Compass,           label: 'Discover'  },
  { to: '/observe',   icon: Eye,               label: 'Observe'   },
  { to: '/flirts',    icon: Flame,             label: 'Flirts'    },
  { to: '/feedback',  icon: MessageSquarePlus, label: 'Feedback'  },
  { to: '/profile',   icon: User,              label: 'Profile'   },
]

export default function Layout() {
  const { profile, logout } = useAuth()
  const loc = useLocation()
  const navigate = useNavigate()

  const active = (to: string) =>
    to === '/flirts'
      ? loc.pathname.startsWith('/flirts')
      : loc.pathname === to

  return (
    <div className="min-h-screen bg-aura-bg flex flex-col">

      {/* ── Desktop top nav ── */}
      <header className="hidden md:flex items-center justify-between px-10 py-5 border-b border-aura-border/50 sticky top-0 z-30 bg-aura-bg/90 backdrop-blur-md">
        <span className="font-serif text-2xl font-light tracking-[0.25em] text-aura-text">
          aura
        </span>

        <nav className="flex items-center gap-1">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-5 py-2 rounded-full text-xs uppercase tracking-[0.18em] transition-all duration-200 ` +
                (isActive || (to === '/flirts' && loc.pathname.startsWith('/flirts'))
                  ? 'text-aura-gold'
                  : 'text-aura-muted hover:text-aura-text')
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <NavLink
            to="/guide"
            title="How Aura works"
            className={({ isActive }) =>
              `p-1.5 rounded-full transition-colors duration-200 ` +
              (isActive ? 'text-aura-gold' : 'text-aura-subtle hover:text-aura-muted')
            }
          >
            <HelpCircle size={16} strokeWidth={1.5} />
          </NavLink>
          {profile?.photo_url ? (
            <img
              src={profile.photo_url}
              alt={profile.username}
              className="w-8 h-8 rounded-full object-cover border border-aura-border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-aura-elevated border border-aura-border flex items-center justify-center">
              <span className="text-xs text-aura-muted font-medium">{profile?.username[0].toUpperCase()}</span>
            </div>
          )}
          <span className="text-sm text-aura-muted font-light">{profile?.username}</span>
          <button
            onClick={() => { logout(); navigate('/login') }}
            title="Sign out"
            className="ml-1 p-1.5 rounded-full text-aura-subtle hover:text-red-400 hover:bg-aura-elevated transition-colors duration-200"
          >
            <LogOut size={15} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-aura-bg/95 backdrop-blur-md border-t border-aura-border/50">
        <div className="flex items-center justify-around py-3 px-4 safe-area-pb">
          {NAV.map(({ to, icon: Icon, label }) => {
            const isActive = active(to)
            return (
              <NavLink
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 min-w-[52px] py-1 group"
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 1.5 : 1.25}
                  className={`transition-colors duration-200 ${
                    isActive ? 'text-aura-gold' : 'text-aura-subtle group-hover:text-aura-muted'
                  }`}
                />
                <span className={`text-[9px] uppercase tracking-[0.15em] transition-colors duration-200 ${
                  isActive ? 'text-aura-gold' : 'text-aura-subtle'
                }`}>
                  {label}
                </span>
              </NavLink>
            )
          })}
        </div>
      </nav>

    </div>
  )
}
