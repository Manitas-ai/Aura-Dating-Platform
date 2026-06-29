import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Users, Heart, MessageCircle, LogOut, MessageSquarePlus, History } from 'lucide-react'
import { useAdminAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard,   label: 'Dashboard' },
  { to: '/members',   icon: Users,             label: 'Members'   },
  { to: '/matches',   icon: Heart,             label: 'Flirts'    },
  { to: '/messages',  icon: MessageCircle,     label: 'Messages'  },
  { to: '/feedback',    icon: MessageSquarePlus, label: 'Feedback'       },
  { to: '/user-logins', icon: History,           label: 'Login History'  },
]

export default function AdminLayout() {
  const { logout } = useAdminAuth()
  const navigate   = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="w-56 bg-[#0d0d18] flex flex-col fixed inset-y-0 left-0 z-20">
        <div className="px-6 py-7 border-b border-white/5">
          <div className="font-serif text-2xl font-light tracking-[0.25em] text-white">aura</div>
          <div className="text-xs text-slate-500 mt-1 tracking-widest uppercase">Admin Console</div>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-light transition-all duration-200 ` +
                (isActive
                  ? 'bg-aura-gold/10 text-aura-gold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} strokeWidth={isActive ? 1.75 : 1.25} />
                  <span className="tracking-wide">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm text-slate-500 hover:text-red-400 hover:bg-white/5 transition-all duration-200"
          >
            <LogOut size={15} strokeWidth={1.25} />
            <span className="tracking-wide">Sign out</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="ml-56 flex-1 min-h-screen">
        <Outlet />
      </main>

    </div>
  )
}
