import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, BookOpen, Globe, Activity, Clock, Bell, TrendingUp } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const { user }   = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [classRes, actRes] = await Promise.all([
          api.get('/classrooms'),
          api.get('/my-activities'),
        ])
        const classrooms = classRes.data
        const activities = actRes.data.data || []
        const totalTime  = activities.reduce((s,a)=>s+a.time_spent,0)
        const eduTime    = activities.filter(a=>a.activity_type==='educational').reduce((s,a)=>s+a.time_spent,0)
        const productivity = totalTime>0 ? Math.round((eduTime/totalTime)*100) : 100

        // Announcements from first classroom
        let announcements = []
        if (classrooms.length) {
          const aRes = await api.get(`/classrooms/${classrooms[0].id}/announcements`)
          announcements = aRes.data.slice(0,3)
        }
        setData({ classrooms, activities: activities.slice(0,5), totalTime, productivity, announcements })
      } catch {}
      finally { setLoading(false) }
    }
    load()
  }, [])

  const hour  = new Date().getHours()
  const greet = hour<12?'Good morning':hour<17?'Good afternoon':'Good evening'
  const pColor = p => p>=80?'#10b981':p>=60?'#f59e0b':'#f43f5e'

  if (loading) return <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"/></div>

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-900">{greet}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your learning overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'My Classrooms',    value: data?.classrooms.length||0,   icon: BookOpen,     grad:'linear-gradient(135deg,#06b6d4,#0e7490)' },
          { label:'Productivity',     value: `${data?.productivity||0}%`,  icon: TrendingUp,   grad:'linear-gradient(135deg,#10b981,#059669)' },
          { label:'Total Activities', value: data?.activities.length||0,   icon: Activity,     grad:'linear-gradient(135deg,#4f46e5,#7c3aed)' },
          { label:'Time Spent',       value: `${data?.totalTime||0}m`,     icon: Clock,        grad:'linear-gradient(135deg,#f59e0b,#d97706)' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
            className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background:s.grad }}>
              <s.icon size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Productivity bar */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.35 }}
        className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800">My Productivity Score</h3>
            <p className="text-xs text-slate-400">Based on educational vs non-educational time</p>
          </div>
          <p className="text-3xl font-black" style={{ color: pColor(data?.productivity||0) }}>
            {data?.productivity||0}%
          </p>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div className="h-full rounded-full"
            initial={{ width:0 }}
            animate={{ width:`${data?.productivity||0}%` }}
            transition={{ duration:1, ease:'easeOut', delay:.5 }}
            style={{ backgroundColor: pColor(data?.productivity||0) }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>0%</span><span>Educational time ratio</span><span>100%</span>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Classrooms */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.42 }}
          className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-cyan-50 flex items-center gap-2">
            <BookOpen size={15} className="text-cyan-600"/><h3 className="font-bold text-slate-800">My Classrooms</h3>
          </div>
          <div className="divide-y divide-cyan-50">
            {data?.classrooms.length===0 ? (
              <p className="text-center py-8 text-sm text-slate-400">No classrooms joined yet.</p>
            ) : data?.classrooms.map((c,i) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-cyan-50/30 transition-colors">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#06b6d4,#10b981)' }}>
                  <BookOpen size={15} className="text-white"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{c.classroom_name}</p>
                  <p className="text-xs text-slate-400">{c.teacher?.name}</p>
                </div>
                <span className="badge badge-cyan font-mono text-xs"># {c.classroom_code}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Announcements */}
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.5 }}
          className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-cyan-50 flex items-center gap-2">
            <Bell size={15} className="text-violet-500"/><h3 className="font-bold text-slate-800">Announcements</h3>
          </div>
          <div className="divide-y divide-cyan-50">
            {!data?.announcements.length ? (
              <p className="text-center py-8 text-sm text-slate-400">No announcements yet.</p>
            ) : data?.announcements.map((a,i) => (
              <div key={a.id} className="px-5 py-3.5 hover:bg-violet-50/20 transition-colors">
                <p className="font-semibold text-slate-800 text-sm">{a.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.message}</p>
                <p className="text-xs text-slate-400 mt-1.5">{new Date(a.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent activity */}
      {data?.activities.length > 0 && (
        <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.58 }}
          className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-cyan-50 flex items-center gap-2">
            <Activity size={15} className="text-emerald-500"/><h3 className="font-bold text-slate-800">Recent Activity</h3>
          </div>
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead><tr><th>Website</th><th>Type</th><th>Status</th><th>Time</th></tr></thead>
              <tbody>
                {data.activities.map(a => (
                  <tr key={a.id} className={a.is_blocked_attempt ? 'bg-rose-50/40' : ''}>
                    <td className="font-mono text-xs text-slate-700">{a.website}</td>
                    <td><span className={`badge text-xs ${a.is_blocked_attempt ? 'badge-red' : a.activity_type==='educational'?'badge-indigo':'badge-amber'}`}>
                      {a.is_blocked_attempt ? '🚫 Blocked' : a.activity_type==='educational'?'📚 Educational':'🎮 Non-Edu'}
                    </span></td>
                    <td><span className={`badge text-xs ${a.productivity_status==='productive'?'badge-green':'badge-red'}`}>{a.productivity_status||'—'}</span></td>
                    <td className="font-mono text-slate-500">{a.time_spent}m</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  )
}
