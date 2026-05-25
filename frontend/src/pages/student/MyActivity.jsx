import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Globe, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react'
import api from '../../services/api'

export default function MyActivity() {
  const [activities, setActivities] = useState([])
  const [page, setPage]             = useState(1)
  const [meta, setMeta]             = useState(null)
  const [loading, setLoading]       = useState(true)

  const load = async (p=1) => {
    setLoading(true)
    try {
      const r = await api.get(`/my-activities?page=${p}`)
      setActivities(r.data.data || [])
      setMeta(r.data)
      setPage(p)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const total    = meta?.total || 0
  const eduCount = activities.filter(a=>a.activity_type==='educational').length
  const blocked  = activities.filter(a=>a.is_blocked_attempt).length
  const totalMin = activities.reduce((s,a)=>s+a.time_spent,0)

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><Activity size={22} className="text-indigo-500"/>My Activity</h1>
        <p className="page-subtitle">Your complete browsing history — auto-logged by SecureClass.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Total Records',  value:total,    color:'text-primary',  bg:'bg-indigo-50' },
          { label:'Educational',   value:eduCount,  color:'text-emerald-600', bg:'bg-emerald-50' },
          { label:'Blocked',       value:blocked,   color:'text-rose-600',    bg:'bg-rose-50' },
          { label:'Time Logged',   value:`${totalMin}m`,color:'text-amber-600',bg:'bg-amber-50' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
            className={`card p-4 ${s.bg}`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead><tr><th>Website</th><th>Classroom</th><th>Type</th><th>Status</th><th>Time</th><th>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading…</td></tr>
              : activities.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-slate-400">No activity recorded yet</td></tr>
              : activities.map((a,i) => (
                <motion.tr key={a.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                  className={a.is_blocked_attempt ? 'bg-rose-50/50' : ''}>
                  <td>
                    <div className="flex items-center gap-1.5">
                      {a.is_blocked_attempt ? <AlertTriangle size={13} className="text-rose-500 shrink-0"/> : <Globe size={13} className="text-slate-300 shrink-0"/>}
                      <span className="font-mono text-xs">{a.website}</span>
                    </div>
                  </td>
                  <td className="text-xs text-slate-500">{a.classroom?.classroom_name || '—'}</td>
                  <td><span className={`badge text-xs ${a.is_blocked_attempt?'badge-red':a.activity_type==='educational'?'badge-indigo':'badge-amber'}`}>
                    {a.is_blocked_attempt?'Blocked':a.activity_type==='educational'?'Educational':'Non-Edu'}
                  </span></td>
                  <td><span className={`badge text-xs ${a.productivity_status==='productive'?'badge-green':'badge-red'}`}>{a.productivity_status||'—'}</span></td>
                  <td className="font-mono text-slate-600">{a.time_spent}m</td>
                  <td className="text-xs text-slate-400 font-mono">{new Date(a.created_at).toLocaleDateString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-indigo-50">
            <p className="text-xs text-slate-400">Page {page} of {meta.last_page}</p>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={()=>load(page-1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">← Prev</button>
              <button disabled={page>=meta.last_page} onClick={()=>load(page+1)} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
