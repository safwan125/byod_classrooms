import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ShieldOff, CheckCircle, Clock, Loader, RotateCcw, AlertTriangle, Wifi, WifiOff } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

const normalize = url => url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].toLowerCase().trim()

export default function BrowseWebsite() {
  const { showToast } = useToast()

  const [classrooms, setClassrooms]     = useState([])
  const [classroomId, setClassroomId]   = useState('')
  const [urlInput, setUrlInput]         = useState('')
  const [checking, setChecking]         = useState(false)

  // Active browsing session
  const [session, setSession] = useState(null)
  // { site, classroomId, seconds, activityType, paused }

  const [blocked, setBlocked]           = useState(null)  // blocked site object
  const [allowed, setAllowed]           = useState(null)  // allowed site name
  const [tabHidden, setTabHidden]       = useState(false)

  const timerRef            = useRef(null)
  const heartbeatSecondsRef = useRef(0)   // seconds sent in last heartbeat
  const sessionRef          = useRef(null) // always up-to-date session ref

  useEffect(() => { sessionRef.current = session }, [session])

  // ── Load classrooms ────────────────────────────────────────
  useEffect(() => {
    api.get('/classrooms').then(r => {
      setClassrooms(r.data)
      if (r.data.length > 0) setClassroomId(String(r.data[0].id))
    }).catch(() => {})
  }, [])

  // ── Timer tick ─────────────────────────────────────────────
  const startTimer = useCallback(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setSession(prev => prev ? { ...prev, seconds: prev.seconds + 1 } : prev)
    }, 1000)
  }, [])

  const stopTimer = useCallback(() => clearInterval(timerRef.current), [])

  // ── Heartbeat every 30s ────────────────────────────────────
  useEffect(() => {
    if (!session || session.paused) return
    if (session.seconds > 0 && session.seconds % 30 === 0) {
      const delta = session.seconds - heartbeatSecondsRef.current
      if (delta >= 30) {
        heartbeatSecondsRef.current = session.seconds
        api.post('/activity/heartbeat', {
          classroom_id:  session.classroomId,
          website:       session.site,
          seconds:       delta,
          activity_type: session.activityType,
        }).catch(() => {})
      }
    }
  }, [session?.seconds])

  // ── Tab visibility pause / resume ─────────────────────────
  useEffect(() => {
    const handle = () => {
      const hidden = document.hidden
      setTabHidden(hidden)
      if (hidden) {
        stopTimer()
        setSession(prev => prev ? { ...prev, paused: true } : prev)
        showToast('⚠️ Tab hidden — timer paused', 'warning')
      } else if (sessionRef.current) {
        setSession(prev => prev ? { ...prev, paused: false } : prev)
        startTimer()
        showToast('✅ Timer resumed', 'success')
      }
    }
    document.addEventListener('visibilitychange', handle)
    return () => document.removeEventListener('visibilitychange', handle)
  }, [startTimer, stopTimer])

  // ── Flush session on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      stopTimer()
      const s = sessionRef.current
      if (s && s.seconds > heartbeatSecondsRef.current) {
        const remaining = s.seconds - heartbeatSecondsRef.current
        if (remaining >= 10) {
          api.post('/activity/heartbeat', {
            classroom_id:  s.classroomId,
            website:       s.site,
            seconds:       remaining,
            activity_type: s.activityType,
          }).catch(() => {})
        }
      }
    }
  }, [stopTimer])

  // ── Finalize current session before navigating to new site ─
  const finalizeSession = async () => {
    stopTimer()
    const s = sessionRef.current
    if (!s) return
    const remaining = s.seconds - heartbeatSecondsRef.current
    if (remaining >= 10) {
      await api.post('/activity/heartbeat', {
        classroom_id:  s.classroomId,
        website:       s.site,
        seconds:       remaining,
        activity_type: s.activityType,
      }).catch(() => {})
    }
    heartbeatSecondsRef.current = 0
    setSession(null)
  }

  // ── Check / visit URL ──────────────────────────────────────
  const handleCheck = async (e) => {
    e?.preventDefault()
    if (!urlInput.trim() || !classroomId) return

    await finalizeSession()

    setChecking(true)
    setBlocked(null)
    setAllowed(null)

    try {
      const res = await api.post('/activity/check-site', {
        classroom_id: parseInt(classroomId),
        website:      urlInput.trim(),
      })
      const domain = res.data.domain || normalize(urlInput)

      if (res.data.is_blocked) {
        setBlocked({ site: domain, ...res.data.blocked_site })
        showToast(`🚫 ${domain} is blocked by your teacher`, 'error')
      } else {
        // Determine activity type heuristically
        const eduKeywords = ['github','stackoverflow','docs','learn','tutorial','mdn','w3schools','edu','coursera','khan']
        const isEdu = eduKeywords.some(k => domain.includes(k))
        const actType = isEdu ? 'educational' : 'non-educational'
        setAllowed(domain)
        setSession({ site: domain, classroomId: parseInt(classroomId), seconds: 0, activityType: actType, paused: false })
        heartbeatSecondsRef.current = 0
        startTimer()
        showToast(`✅ ${domain} — ${isEdu ? 'Educational' : 'Non-educational'} session started`, 'success')
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const domain = normalize(urlInput)
        setBlocked({ site: domain })
        showToast(`🚫 ${domain} is blocked`, 'error')
      } else {
        showToast('Unable to check site. Check your connection.', 'error')
      }
    } finally {
      setChecking(false)
    }
  }

  const handleNewSite = async () => {
    await finalizeSession()
    setBlocked(null)
    setAllowed(null)
    setUrlInput('')
  }

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`

  const eduDomains = ['github.com','stackoverflow.com','w3schools.com','developer.mozilla.org','docs.python.org','reactjs.org','tailwindcss.com']

  return (
    <div className="animate-fade-in max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Monitored Browser</h1>
        <p className="page-subtitle">All websites you visit are automatically logged. Blocked sites are instantly reported to your teacher.</p>
      </div>

      {/* Active Session Banner */}
      <AnimatePresence>
        {session && (
          <motion.div
            initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-12 }}
            className={`card p-4 flex items-center gap-4 border-2 ${
              session.paused ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              session.paused ? 'bg-amber-100' : 'bg-emerald-100'
            }`}>
              {session.paused ? <WifiOff size={20} className="text-amber-600" /> : <Wifi size={20} className="text-emerald-600" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                {!session.paused && <div className="live-dot" />}
                <p className="font-semibold text-sm text-slate-800">
                  {session.paused ? 'Session Paused' : 'Browsing'}: <span className="text-indigo-600">{session.site}</span>
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 capitalize">
                {session.activityType} • {session.paused ? 'Switch back to resume timer' : 'Timer running'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-2xl font-mono font-bold text-slate-800">{fmt(session.seconds)}</p>
                <p className="text-xs text-slate-400">elapsed</p>
              </div>
              <span className={`badge ${session.activityType==='educational' ? 'badge-green' : 'badge-amber'}`}>
                {session.activityType==='educational' ? '📚 Educational' : '🎮 Non-Edu'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* URL Input Card */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center">
            <Globe size={20} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900">Website Checker</h2>
            <p className="text-xs text-slate-500">Enter a URL — your visit will be auto-logged</p>
          </div>
        </div>

        <form onSubmit={handleCheck} className="space-y-4">
          <div>
            <label className="label">Classroom</label>
            <select
              value={classroomId}
              onChange={e => setClassroomId(e.target.value)}
              className="input-field"
            >
              {classrooms.map(c => (
                <option key={c.id} value={c.id}>{c.classroom_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Website URL</label>
            <div className="relative">
              <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="e.g. github.com or https://stackoverflow.com"
                className="input-field pl-10"
              />
            </div>
          </div>

          <button type="submit" disabled={checking || !urlInput.trim() || !classroomId} className="btn-primary w-full">
            {checking ? <><Loader size={16} className="animate-spin" /> Checking…</> : <><Globe size={16} /> Check & Visit</>}
          </button>
        </form>
      </div>

      {/* Blocked Result */}
      <AnimatePresence>
        {blocked && (
          <motion.div
            initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.95 }}
            className="card overflow-hidden"
          >
            <div className="bg-danger-gradient p-8 text-center text-white">
              <motion.div
                animate={{ rotate:[0,-8,8,-8,8,0] }} transition={{ duration:.5, delay:.2 }}
                className="w-20 h-20 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-4"
              >
                <ShieldOff size={40} />
              </motion.div>
              <h2 className="text-2xl font-black mb-2">Access Blocked</h2>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2 mb-3">
                <Globe size={14} /><span className="font-mono font-bold">{blocked.site}</span>
              </div>
              <p className="text-white/80 text-sm max-w-xs mx-auto">
                This website is restricted by your classroom teacher.<br/>Your access attempt has been automatically logged.
              </p>
            </div>
            <div className="p-4 bg-rose-50 flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-700 text-sm font-medium">
                <AlertTriangle size={16} />
                Your teacher has been notified of this attempt.
              </div>
              <button onClick={handleNewSite} className="btn-secondary text-sm">
                <RotateCcw size={14} /> Try another site
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Allowed Result */}
      <AnimatePresence>
        {allowed && session && (
          <motion.div
            initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Access Allowed</p>
                  <p className="text-xs text-emerald-600 font-medium">{allowed} — activity being auto-logged</p>
                </div>
              </div>
              <button onClick={handleNewSite} className="btn-ghost text-sm">
                <RotateCcw size={14} /> New site
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label:'Time Elapsed', value: fmt(session.seconds), icon: Clock, color:'text-indigo-600' },
                { label:'Type', value: session.activityType==='educational' ? '📚 Educational' : '🎮 Non-Edu', icon: Globe, color:'text-emerald-600' },
                { label:'Auto-Saved', value: `Every 30s`, icon: CheckCircle, color:'text-cyan-600' },
              ].map(s => (
                <div key={s.label} className="bg-indigo-50/60 rounded-xl p-3 text-center">
                  <p className={`font-bold text-lg ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick access suggestions */}
      {!session && !blocked && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-slate-700 mb-3">📚 Suggested Educational Sites</p>
          <div className="flex flex-wrap gap-2">
            {eduDomains.map(d => (
              <button
                key={d}
                onClick={() => setUrlInput(d)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
