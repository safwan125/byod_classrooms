import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, TrendingUp, Clock, ChevronDown } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Students() {
  const { showToast } = useToast()
  const [classrooms, setClassrooms] = useState([])
  const [classroomId, setClassroomId] = useState('')
  const [students, setStudents]     = useState([])
  const [meta, setMeta]             = useState(null)
  const [loading, setLoading]       = useState(false)

  useEffect(() => {
    api.get('/classrooms').then(r => {
      setClassrooms(r.data)
      if (r.data.length) setClassroomId(String(r.data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!classroomId) return
    setLoading(true)
    api.get(`/classrooms/${classroomId}/students`).then(r => {
      const arr = Array.isArray(r.data) ? r.data : []
      arr.sort((a,b) => b.productivity_score - a.productivity_score)
      setStudents(arr)
      const total = arr.length
      const avg = total > 0 ? Math.round(arr.reduce((s,x)=>s+x.productivity_score,0)/total) : 0
      const time = arr.reduce((s,x)=>s+x.total_time_spent,0)
      setMeta({ total, avg, time })
    }).catch(() => showToast('Failed to load students','error'))
    .finally(() => setLoading(false))
  }, [classroomId])

  const colorBar = p => p>=80 ? '#10b981' : p>=60 ? '#f59e0b' : '#f43f5e'
  const initials = name => name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">View productivity and activity per student.</p>
        </div>
        <div className="flex items-center gap-2">
          <ChevronDown size={16} className="text-indigo-400"/>
          <select value={classroomId} onChange={e => setClassroomId(e.target.value)} className="input-field max-w-xs">
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.classroom_name}</option>)}
          </select>
        </div>
      </div>

      {meta && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label:'Enrolled',      value: meta.total, icon: Users,      grad:'bg-primary-gradient' },
            { label:'Avg Productivity',value: `${meta.avg}%`, icon: TrendingUp, grad:'bg-success-gradient' },
            { label:'Total Time',    value: `${meta.time}m`,  icon: Clock,      grad:'bg-danger-gradient' },
          ].map((s,i) => (
            <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
              className="card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${s.grad} flex items-center justify-center shrink-0`}>
                <s.icon size={18} className="text-white"/>
              </div>
              <div>
                <p className="text-xl font-black text-slate-900">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="table-wrapper rounded-none border-0">
          <table className="table">
            <thead><tr><th>#</th><th>Student</th><th>Email</th><th>Productivity</th><th>Activities</th><th>Time (min)</th><th>Joined</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Loading…</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">No students enrolled</td></tr>
              ) : students.map((s,i) => (
                <motion.tr key={s.id} initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.04 }}>
                  <td className="text-slate-400 font-mono text-xs">{i+1}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center text-white font-bold text-xs">
                        {initials(s.name)}
                      </div>
                      <span className="font-semibold text-slate-800">{s.name}</span>
                    </div>
                  </td>
                  <td className="text-slate-500 text-xs">{s.email}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width:`${s.productivity_score}%`, backgroundColor: colorBar(s.productivity_score) }}/>
                      </div>
                      <span className="font-bold text-sm" style={{ color: colorBar(s.productivity_score) }}>
                        {s.productivity_score}%
                      </span>
                    </div>
                  </td>
                  <td className="font-mono text-slate-700">{s.activity_count}</td>
                  <td className="font-mono text-slate-700">{s.total_time_spent}</td>
                  <td className="text-slate-400 text-xs">{s.joined_at ? new Date(s.joined_at).toLocaleDateString() : '—'}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
