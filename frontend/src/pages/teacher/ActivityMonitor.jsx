import React, { useState, useEffect, useRef } from 'react'
import { Activity, ShieldOff, RefreshCw, AlertTriangle, Globe, Clock, Filter } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function ActivityMonitor() {
  const { showToast } = useToast()
  const [classrooms, setClassrooms]  = useState([])
  const [classroomId, setClassroomId]= useState('')
  const [activities, setActivities]  = useState([])
  const [blockedOnly, setBlockedOnly]= useState(false)
  const [loading, setLoading]        = useState(false)
  const [lastPoll, setLastPoll]      = useState(null)
  const [newCount, setNewCount]      = useState(0)
  const lastFetchRef                 = useRef(null)

  useEffect(() => {
    api.get('/classrooms').then(r => {
      setClassrooms(r.data)
      if (r.data.length) setClassroomId(String(r.data[0].id))
    })
  }, [])

  const fetchActivities = async (showLoader = false) => {
    if (!classroomId) return
    if (showLoader) setLoading(true)
    try {
      const res = await api.get(`/classrooms/${classroomId}/activities`)
      const items = res.data.data || []
      if (lastFetchRef.current) {
        const fresh = items.filter(a => new Date(a.created_at) > new Date(lastFetchRef.current))
        if (fresh.length > 0) {
          setNewCount(c => c + fresh.length)
          const blocked = fresh.filter(a => a.is_blocked_attempt)
          blocked.forEach(a => showToast(`🚨 ${a.user?.name ?? 'Student'} tried ${a.website}`, 'error'))
        }
      }
      lastFetchRef.current = new Date().toISOString()
      setActivities(items)
      setLastPoll(new Date())
    } catch {}
    finally { setLoading(false) }
  }

  useEffect(() => {
    if (!classroomId) return
    fetchActivities(true)
    const id = setInterval(() => fetchActivities(false), 5000)
    return () => clearInterval(id)
  }, [classroomId])

  const displayed = blockedOnly ? activities.filter(a => a.is_blocked_attempt) : activities

  const typeColor = a => a.is_blocked_attempt
    ? 'badge-red'
    : a.activity_type === 'educational' ? 'badge-green' : 'badge-amber'

  const typeLabel = a => a.is_blocked_attempt ? '🚫 Blocked' : a.activity_type === 'educational' ? '📚 Educational' : '🎮 Non-Edu'

  const fmt = t => t ? new Date(t).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '—'

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="page-header mb-0">
          <h1 className="page-title flex items-center gap-2">
            Activity Monitor
            <span className="live-dot" />
          </h1>
          <p className="page-subtitle">Live feed — auto-refreshes every 5 seconds</p>
        </div>
        <div className="flex items-center gap-2">
          {newCount > 0 && (
            <span className="badge badge-indigo animate-slide-in">
              {newCount} new
            </span>
          )}
          <button onClick={() => fetchActivities(true)} className="btn-secondary text-sm gap-1.5">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="flex items-center gap-2 flex-1">
          <Filter size={16} className="text-indigo-500 shrink-0" />
          <select value={classroomId} onChange={e => { setClassroomId(e.target.value); setNewCount(0) }}
            className="input-field max-w-xs">
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.classroom_name}</option>)}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={blockedOnly} onChange={e => setBlockedOnly(e.target.checked)}
            className="w-4 h-4 accent-rose-500 rounded" />
          <span className="text-sm font-semibold text-rose-600">Blocked attempts only</span>
        </label>
        {lastPoll && (
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={11} /> {fmt(lastPoll)}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:'Total Events',    value: activities.length,                                         color:'bg-primary-gradient' },
          { label:'Blocked Attempts',value: activities.filter(a=>a.is_blocked_attempt).length,         color:'bg-danger-gradient' },
          { label:'Educational',     value: activities.filter(a=>!a.is_blocked_attempt && a.activity_type==='educational').length, color:'bg-success-gradient' },
        ].map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center shrink-0`}>
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Website</th>
                <th>Type</th>
                <th>Status</th>
                <th>Time (min)</th>
                <th>Logged At</th>
              </tr>
            </thead>
            <tbody>
                  {displayed.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No activity data yet</td></tr>
                ) : displayed.map((a) => (
                  <tr
                    key={a.id}
                    className={`animate-fade-in ${a.is_blocked_attempt ? 'bg-rose-50/60' : ''}`}
                  >
                    <td className="font-semibold text-slate-800">
                      {a.is_blocked_attempt && <AlertTriangle size={13} className="inline text-rose-500 mr-1" />}
                      {a.user?.name ?? '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5">
                        <Globe size={13} className="text-slate-400 shrink-0" />
                        <span className="font-mono text-xs text-slate-700">{a.website}</span>
                      </div>
                    </td>
                    <td><span className={typeColor(a) + ' badge'}>{typeLabel(a)}</span></td>
                    <td>
                      {a.is_blocked_attempt
                        ? <span className="badge badge-red">Blocked</span>
                        : <span className={`badge ${a.productivity_status==='productive' ? 'badge-green' : 'badge-amber'}`}>
                            {a.productivity_status}
                          </span>
                      }
                    </td>
                    <td className="font-mono text-slate-700">{a.time_spent ?? 0}</td>
                    <td className="text-slate-400 text-xs font-mono">{fmt(a.created_at)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
