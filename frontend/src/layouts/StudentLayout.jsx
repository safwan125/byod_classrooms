import React, { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, BookOpen, Globe, Activity, LogOut, ShieldAlert, Menu, X } from 'lucide-react'

const NAV = [
  { to: 'dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'join-classroom',icon: BookOpen,         label: 'Join Classroom' },
  { to: 'browse',        icon: Globe,            label: 'Browse Website' },
  { to: 'my-activity',   icon: Activity,         label: 'My Activity' },
]

export default function StudentLayout() {
  const { user, logout } = useAuth()
  const navigate          = useNavigate()
  const [open, setOpen]   = useState(false)

  const handleLogout = async () => { await logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'S'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 flex flex-col
        sidebar-dots
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex
      `}
        style={{ background: 'linear-gradient(180deg,#0c4a6e 0%,#0e7490 50%,#0f766e 100%)' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#10b981)' }}>
            <ShieldAlert size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">SecureClass</p>
            <p className="text-white/40 text-xs">Student Portal</p>
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 mx-4 mt-4 mb-3 px-3 py-3 rounded-xl bg-white/10 border border-white/10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg,#06b6d4,#10b981)' }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/40 text-xs">Student</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-white/20 border border-white/20'
                  : 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200'
              }
            >
              <Icon size={17} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all">
            <LogOut size={17} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white/90 backdrop-blur border-b border-cyan-100/60 flex items-center px-4 lg:px-6 shrink-0">
          <button className="lg:hidden p-2 rounded-xl hover:bg-cyan-50 mr-2" onClick={() => setOpen(true)}>
            <Menu size={20} className="text-cyan-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="live-dot" />
            <span className="text-xs font-semibold text-emerald-600">Session Active</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-100">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
              style={{ background: 'linear-gradient(135deg,#06b6d4,#10b981)' }}>
              {initials}
            </div>
            <p className="text-sm font-semibold text-cyan-800 hidden sm:block">{user?.name?.split(' ')[0]}</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
