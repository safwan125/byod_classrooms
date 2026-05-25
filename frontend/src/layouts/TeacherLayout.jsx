import React, { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  LayoutDashboard, BookOpen, Users, Activity, ShieldOff,
  BarChart3, Megaphone, Settings, LogOut, Bell, ChevronDown,
  ShieldAlert, X, Menu
} from 'lucide-react'
import api from '../services/api'

const NAV = [
  { to: 'dashboard',        icon: LayoutDashboard, label: 'Dashboard' },
  { to: 'classrooms',       icon: BookOpen,         label: 'Classrooms' },
  { to: 'students',         icon: Users,            label: 'Students' },
  { to: 'activity-monitor', icon: Activity,         label: 'Activity Monitor' },
  { to: 'blocked-websites', icon: ShieldOff,        label: 'Blocked Websites' },
  { to: 'reports',          icon: BarChart3,        label: 'Reports' },
  { to: 'announcements',    icon: Megaphone,        label: 'Announcements' },
  { to: 'settings',         icon: Settings,         label: 'Settings' },
]

export default function TeacherLayout() {
  const { user, logout }       = useAuth()
  const { showToast }          = useToast()
  const navigate               = useNavigate()
  const [profileOpen, setProfileOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [alerts, setAlerts]    = useState([])
  const [alertOpen, setAlertOpen] = useState(false)
  const profileRef             = useRef(null)
  const lastAlertTime          = useRef(new Date().toISOString())

  // Poll for blocked-site alerts every 6 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await api.get(`/teacher/blocked-alerts?since=${lastAlertTime.current}`)
        const newAlerts = res.data
        if (newAlerts.length > 0) {
          lastAlertTime.current = new Date().toISOString()
          setAlerts(prev => [...newAlerts, ...prev].slice(0, 20))
          newAlerts.forEach(a =>
            showToast(`🚨 ${a.student} tried to visit ${a.website}`, 'error')
          )
        }
      } catch {}
    }
    const id = setInterval(poll, 6000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const handler = e => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'T'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Sidebar ────────────────────────────────────────── */}
      <aside
        style={{ background: 'linear-gradient(180deg,#0f0c29 0%,#302b63 60%,#24243e 100%)' }}
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex flex-col sidebar-dots
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shadow-primary">
            <ShieldAlert size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">SecureClass</p>
            <p className="text-white/40 text-xs">BYOD Platform</p>
          </div>
        </div>

        {/* User info */}
        <div className="flex items-center gap-3 mx-4 mt-4 mb-3 px-3 py-3 rounded-xl bg-white/5 border border-white/10">
          <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-white/40 text-xs capitalize">{user?.role}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
            >
              <Icon size={17} />
              <span>{label}</span>
              {to === 'activity-monitor' && alerts.length > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {alerts.length > 9 ? '9+' : alerts.length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 pb-5">
          <button onClick={handleLogout} className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <LogOut size={17} /><span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 bg-white/90 backdrop-blur border-b border-indigo-50 flex items-center justify-between px-4 lg:px-6 z-20 shrink-0">
          <button className="lg:hidden p-2 rounded-xl hover:bg-indigo-50" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} className="text-indigo-600" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            {/* Alert bell */}
            <div className="relative">
              <button
                onClick={() => setAlertOpen(!alertOpen)}
                className="relative p-2 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <Bell size={19} className="text-slate-600" />
                {alerts.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-ping-slow" />
                )}
              </button>

              {alertOpen && (
                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-card-hover border border-indigo-50 z-50 animate-fade-in overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-50">
                    <p className="font-semibold text-sm text-slate-800">Blocked Site Alerts</p>
                    <button onClick={() => { setAlerts([]); setAlertOpen(false) }} className="text-slate-400 hover:text-rose-500">
                      <X size={15} />
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {alerts.length === 0 ? (
                      <p className="text-slate-400 text-sm text-center py-8">No alerts</p>
                    ) : alerts.map((a, i) => (
                      <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-indigo-50 last:border-0 hover:bg-rose-50/40">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                          <ShieldOff size={14} className="text-rose-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{a.student}</p>
                          <p className="text-xs text-rose-600 font-medium truncate">tried → {a.website}</p>
                          <p className="text-xs text-slate-400">{a.classroom}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center text-white font-bold text-xs">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name?.split(' ')[0]}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-12 w-44 bg-white rounded-2xl shadow-card-hover border border-indigo-50 z-50 animate-fade-in overflow-hidden">
                  <NavLink to="settings" onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-slate-700 hover:bg-indigo-50">
                    <Settings size={15} /> Settings
                  </NavLink>
                  <button onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm text-rose-600 hover:bg-rose-50 w-full border-t border-indigo-50">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
