import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bar, Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { BarChart3 } from 'lucide-react'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const COLORS = ['#4f46e5','#7c3aed','#06b6d4','#10b981','#f59e0b','#f43f5e','#8b5cf6','#ec4899']

export default function Reports() {
  const [classrooms, setClassrooms] = useState([])
  const [classroomId, setClassroomId] = useState('')
  const [report, setReport]         = useState(null)
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
    api.get(`/classrooms/${classroomId}/reports`)
      .then(r => setReport(r.data))
      .finally(() => setLoading(false))
  }, [classroomId])

  const baseOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ display:false } },
    scales:{
      x:{ grid:{ display:false }, ticks:{ color:'#94a3b8', font:{ size:10 } } },
      y:{ grid:{ color:'rgba(0,0,0,.04)' }, ticks:{ color:'#94a3b8', font:{ size:10 } } },
    },
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><BarChart3 size={22} className="text-indigo-500"/>Reports & Analytics</h1>
          <p className="page-subtitle">Detailed analytics per classroom.</p>
        </div>
        <select value={classroomId} onChange={e => setClassroomId(e.target.value)} className="input-field max-w-xs">
          {classrooms.map(c => <option key={c.id} value={c.id}>{c.classroom_name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
      ) : report && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label:'Students',     value: report.total_students },
              { label:'Productivity', value: `${report.productivity_score}%` },
              { label:'Total Time',   value: `${report.total_time_spent}m` },
              { label:'Edu Time',     value: `${report.educational_time}m` },
            ].map((s,i) => (
              <motion.div key={s.label} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                className="card p-4 text-center">
                <p className="text-2xl font-black text-primary">{s.value}</p>
                <p className="text-xs text-slate-500 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-5">
            {/* Daily trend */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-bold text-slate-800 mb-1">Daily Activity Trend</h3>
              <p className="text-xs text-slate-400 mb-4">Educational vs Non-Educational (minutes)</p>
              <div className="h-52">
                <Line data={{
                  labels: report.daily_trend.map(d => d.date),
                  datasets: [
                    { label:'Educational',    data:report.daily_trend.map(d=>d.educational),     borderColor:'#4f46e5', backgroundColor:'rgba(79,70,229,.1)', fill:true, tension:.4 },
                    { label:'Non-Educational',data:report.daily_trend.map(d=>d.non_educational), borderColor:'#f43f5e', backgroundColor:'rgba(244,63,94,.06)', fill:true, tension:.4 },
                  ]
                }} options={baseOpts} />
              </div>
            </div>

            {/* Productivity mix */}
            <div className="card p-5">
              <h3 className="font-bold text-slate-800 mb-4">Productivity Split</h3>
              <div className="h-40 flex items-center justify-center">
                <Doughnut data={{
                  labels:['Educational','Non-Educational'],
                  datasets:[{ data:[report.educational_time||1, (report.total_time_spent-report.educational_time)||0], backgroundColor:['#4f46e5','#f43f5e'], borderWidth:0 }]
                }} options={{ responsive:true, cutout:'70%', plugins:{ legend:{ display:false } } }} />
              </div>
              <div className="flex gap-3 mt-3">
                <div className="flex-1 text-center p-2 bg-indigo-50 rounded-xl">
                  <p className="font-black text-primary">{report.educational_time}m</p>
                  <p className="text-xs text-slate-400">Edu</p>
                </div>
                <div className="flex-1 text-center p-2 bg-rose-50 rounded-xl">
                  <p className="font-black text-danger">{report.total_time_spent - report.educational_time}m</p>
                  <p className="text-xs text-slate-400">Non-Edu</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top websites */}
          {report.website_stats?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-slate-800 mb-4">Top Websites by Time Spent</h3>
              <div className="h-52">
                <Bar data={{
                  labels: report.website_stats.map(w => w.website),
                  datasets:[{
                    label:'Minutes',
                    data: report.website_stats.map(w => w.total_time),
                    backgroundColor: report.website_stats.map((_,i) => COLORS[i % COLORS.length]),
                    borderRadius: 8,
                  }]
                }} options={baseOpts} />
              </div>
            </div>
          )}

          {/* Student breakdown */}
          {report.student_stats?.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-indigo-50">
                <h3 className="font-bold text-slate-800">Student Productivity Breakdown</h3>
              </div>
              <div className="divide-y divide-indigo-50">
                {report.student_stats.map((s,i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                    <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <span className="font-semibold text-slate-800 w-36 truncate">{s.name}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700"
                        style={{ width:`${s.productivity_score}%`, backgroundColor: s.productivity_score>=80?'#10b981':s.productivity_score>=60?'#f59e0b':'#f43f5e' }}/>
                    </div>
                    <span className="font-bold text-sm w-10 text-right" style={{ color: s.productivity_score>=80?'#10b981':s.productivity_score>=60?'#f59e0b':'#f43f5e' }}>
                      {s.productivity_score}%
                    </span>
                    <span className="text-xs text-slate-400 w-14 text-right">{s.total_time}m</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
