import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Users, UserCheck, ShieldOff, TrendingUp, AlertTriangle, Globe, Activity } from 'lucide-react'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const CARD_DELAY = i => ({ initial:{ opacity:0, y:20 }, animate:{ opacity:1, y:0 }, transition:{ delay: i*0.08 } })

export default function TeacherDashboard() {
  const [stats, setStats]           = useState(null)
  const [overview, setOverview]     = useState(null)
  const [alerts, setAlerts]         = useState([])
  const lastAlertRef                = useRef(new Date(Date.now() - 3600000).toISOString())

  const hour  = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/dashboard/overview'),
      api.get(`/teacher/blocked-alerts?since=${lastAlertRef.current}`),
    ]).then(([s, o, a]) => {
      setStats(s.data)
      setOverview(o.data)
      setAlerts(a.data.slice(0,8))
      if (a.data.length) lastAlertRef.current = new Date().toISOString()
    }).catch(() => {})
  }, [])

  const lineData = overview ? {
    labels: overview.daily_trend.map(d => d.date),
    datasets: [
      {
        label: 'Educational',
        data: overview.daily_trend.map(d => d.educational),
        borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,.12)',
        fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#4f46e5',
      },
      {
        label: 'Non-Educational',
        data: overview.daily_trend.map(d => d.non_educational),
        borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,.08)',
        fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#f43f5e',
      },
    ],
  } : null

  const totalEdu    = overview?.daily_trend.reduce((s,d) => s + d.educational, 0) || 0
  const totalNonEdu = overview?.daily_trend.reduce((s,d) => s + d.non_educational, 0) || 0

  const doughnutData = {
    labels: ['Educational', 'Non-Educational'],
    datasets: [{
      data: [totalEdu || 1, totalNonEdu || 0],
      backgroundColor: ['#4f46e5','#f43f5e'],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { mode:'index', intersect:false } },
    scales: {
      x: { grid:{ display:false }, ticks:{ color:'#94a3b8', font:{ size:11 } } },
      y: { grid:{ color:'rgba(0,0,0,.04)' }, ticks:{ color:'#94a3b8', font:{ size:11 } } },
    },
  }

  const statCards = stats ? [
    { label:'Total Students',  value: stats.total_students,    sub:`${stats.total_classrooms} classrooms`, icon: Users,      grad:'linear-gradient(135deg,#4f46e5,#7c3aed)' },
    { label:'Active This Week', value: stats.active_students,  sub:'in your classrooms',                  icon: UserCheck,  grad:'linear-gradient(135deg,#10b981,#06b6d4)' },
    { label:'Blocked Sites',    value: stats.blocked_sites,    sub:'across all classes',                  icon: ShieldOff,  grad:'linear-gradient(135deg,#f43f5e,#f59e0b)' },
    { label:'Productivity',     value: `${stats.productivity_score}%`, sub:'avg educational time',        icon: TrendingUp, grad:'linear-gradient(135deg,#4f46e5,#7c3aed)' },
  ] : []

  return (
    <div className="animate-fade-in space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">{greet}, Dr. 👋</h1>
        <p className="text-sm text-slate-500 mt-1">Here's your classroom overview for today.</p>
      </div>

      {/* Alert banner if blocked attempts */}
      {alerts.length > 0 && (
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="alert-danger">
          <AlertTriangle size={18} />
          <span><strong>{alerts.length}</strong> blocked site attempt{alerts.length>1?'s':''} detected recently — check Activity Monitor</span>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={c.label} {...CARD_DELAY(i)} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{c.label}</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{c.value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{c.sub}</p>
              </div>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: c.grad }}>
                <c.icon size={20} className="text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Line chart */}
        <motion.div {...CARD_DELAY(4)} className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800">Activity Trends</h3>
              <p className="text-xs text-slate-400">Last 7 days — time in minutes</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-primary rounded-full inline-block"/>Educational</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-danger rounded-full inline-block"/>Non-Edu</span>
            </div>
          </div>
          <div className="h-52">
            {lineData ? <Line data={lineData} options={chartOpts} /> : <div className="h-full flex items-center justify-center text-slate-300">Loading…</div>}
          </div>
        </motion.div>

        {/* Doughnut */}
        <motion.div {...CARD_DELAY(5)} className="card p-5">
          <h3 className="font-bold text-slate-800 mb-1">Productivity Mix</h3>
          <p className="text-xs text-slate-400 mb-4">Educational vs Non-Educational</p>
          <div className="h-36 flex items-center justify-center">
            <Doughnut data={doughnutData} options={{ responsive:true, cutout:'72%', plugins:{ legend:{ display:false } } }} />
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="text-center p-2 bg-indigo-50 rounded-xl">
              <p className="text-lg font-black text-primary">{totalEdu}m</p>
              <p className="text-xs text-slate-500">Educational</p>
            </div>
            <div className="text-center p-2 bg-rose-50 rounded-xl">
              <p className="text-lg font-black text-danger">{totalNonEdu}m</p>
              <p className="text-xs text-slate-500">Non-Edu</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity + Alerts */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent activity table */}
        <motion.div {...CARD_DELAY(6)} className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity size={16} className="text-indigo-500" /> Recent Activity
            </h3>
            <div className="live-dot" />
          </div>
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead><tr><th>Student</th><th>Website</th><th>Type</th><th>Status</th></tr></thead>
              <tbody>
                {(overview?.recent_activities || []).slice(0,8).map((a, i) => (
                  <tr key={a.id} className={a.is_blocked_attempt ? 'bg-rose-50/50' : ''}>
                    <td className="font-semibold text-slate-800 text-xs">
                      {a.is_blocked_attempt && <AlertTriangle size={11} className="inline text-rose-500 mr-1" />}
                      {a.student}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Globe size={11} className="text-slate-300 shrink-0" />
                        <span className="font-mono text-xs text-slate-600">{a.website}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-xs ${a.is_blocked_attempt ? 'badge-red' : a.activity_type==='educational' ? 'badge-indigo' : 'badge-amber'}`}>
                        {a.is_blocked_attempt ? 'Blocked' : a.activity_type==='educational' ? 'Educational' : 'Non-Edu'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-xs ${a.productivity_status==='productive' ? 'badge-green' : 'badge-red'}`}>
                        {a.productivity_status || '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Blocked alerts panel */}
        <motion.div {...CARD_DELAY(7)} className="card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-indigo-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ShieldOff size={16} className="text-rose-500" /> Block Attempts
            </h3>
            {alerts.length > 0 && (
              <span className="badge badge-red">{alerts.length}</span>
            )}
          </div>
          <div className="divide-y divide-indigo-50 max-h-72 overflow-y-auto">
            {alerts.length === 0 ? (
              <p className="text-center py-10 text-slate-400 text-sm">No blocked attempts 🎉</p>
            ) : alerts.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-rose-50/30 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                  <ShieldOff size={13} className="text-rose-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{a.student}</p>
                  <p className="text-xs text-rose-600 font-mono truncate">{a.website}</p>
                  <p className="text-xs text-slate-400">{a.classroom}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
