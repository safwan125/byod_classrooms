import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Hash, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function JoinClassroom() {
  const { showToast } = useToast()
  const [code, setCode]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [joined, setJoined]     = useState(null)
  const [error, setError]       = useState('')

  const chars = Array(6).fill(0)

  const handleJoin = async (e) => {
    e.preventDefault()
    if (code.trim().length !== 6) return setError('Enter the full 6-character code')
    setError(''); setLoading(true)
    try {
      const r = await api.post('/classrooms/join', { classroom_code: code.toUpperCase() })
      setJoined(r.data.classroom)
      showToast('Joined classroom! 🎉','success')
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid code'
      setError(msg)
      showToast(msg,'error')
    } finally { setLoading(false) }
  }

  const handleInput = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'')
    if (val.length <= 6) setCode(val)
    setError('')
    setJoined(null)
  }

  return (
    <div className="animate-fade-in max-w-md mx-auto space-y-5">
      <div>
        <h1 className="page-title">Join a Classroom</h1>
        <p className="page-subtitle">Enter the 6-character code given by your teacher.</p>
      </div>

      <AnimatePresence mode="wait">
        {joined ? (
          <motion.div key="success" initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ opacity:0 }}
            className="card p-8 text-center">
            <div className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,#10b981,#06b6d4)' }}>
              <CheckCircle size={40} className="text-white"/>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-1">Joined!</h2>
            <p className="text-indigo-600 font-bold mb-1">{joined.classroom_name}</p>
            <p className="text-sm text-slate-500 mb-2">Taught by {joined.teacher?.name}</p>
            <span className="badge badge-cyan font-mono text-sm"># {joined.classroom_code}</span>
            <div className="mt-6">
              <button onClick={() => { setJoined(null); setCode('') }} className="btn-secondary w-full">
                Join another classroom
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}>
            <div className="card p-6 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#4f46e5,#7c3aed)' }}>
                  <BookOpen size={22} className="text-white"/>
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Classroom Code</h2>
                  <p className="text-xs text-slate-400">All uppercase letters and numbers</p>
                </div>
              </div>

              <form onSubmit={handleJoin} className="space-y-4">
                {/* Visual char input */}
                <div className="flex gap-2 justify-center">
                  {chars.map((_, i) => (
                    <div key={i} className={`w-11 h-14 rounded-xl border-2 flex items-center justify-center font-mono text-xl font-bold transition-all ${
                      code[i] ? 'border-primary bg-indigo-50 text-primary' : 'border-indigo-100 bg-white text-transparent'
                    }`}>
                      {code[i] || '·'}
                    </div>
                  ))}
                </div>

                <div className="relative">
                  <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input
                    value={code} onChange={handleInput}
                    maxLength={6} autoFocus
                    className="input-field pl-10 font-mono text-lg tracking-widest text-center uppercase"
                    placeholder="XXXXXX"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-600 text-sm">
                    <AlertCircle size={15}/>{error}
                  </div>
                )}

                <button type="submit" disabled={loading || code.length!==6} className="btn-primary w-full">
                  {loading ? <><Loader size={16} className="animate-spin"/> Joining…</> : <>Join Classroom</>}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
