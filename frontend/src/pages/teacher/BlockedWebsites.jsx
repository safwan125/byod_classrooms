import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShieldOff, Plus, Trash2, Globe, BookOpen } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function BlockedWebsites() {
  const { showToast } = useToast()
  const [classrooms, setClassrooms] = useState([])
  const [classroomId, setClassroomId] = useState('')
  const [sites, setSites]           = useState([])
  const [url, setUrl]               = useState('')
  const [adding, setAdding]         = useState(false)
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
    api.get(`/classrooms/${classroomId}/blocked-sites`)
      .then(r => setSites(r.data))
      .catch(() => showToast('Failed to load sites','error'))
      .finally(() => setLoading(false))
  }, [classroomId])

  const handleAdd = async (e) => {
    e.preventDefault()
    const domain = url.replace(/^(https?:\/\/)?(www\.)?/,'').split('/')[0].toLowerCase().trim()
    if (!domain) return showToast('Enter a valid domain','error')
    setAdding(true)
    try {
      const r = await api.post('/block-site', { classroom_id: parseInt(classroomId), website_url: domain })
      setSites(p => [r.data, ...p])
      setUrl('')
      showToast(`${domain} blocked ✓`,'success')
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to block site','error')
    } finally { setAdding(false) }
  }

  const handleRemove = async (id, site) => {
    try {
      await api.delete(`/blocked-sites/${id}`)
      setSites(p => p.filter(s => s.id !== id))
      showToast(`${site} unblocked`,'success')
    } catch { showToast('Failed','error') }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div>
        <h1 className="page-title flex items-center gap-2"><ShieldOff size={22} className="text-rose-500"/>Blocked Websites</h1>
        <p className="page-subtitle">Block distracting websites per classroom. Students are automatically stopped and you're notified.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        {/* Left: controls */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <label className="label flex items-center gap-2"><BookOpen size={14}/>Select Classroom</label>
            <select value={classroomId} onChange={e => setClassroomId(e.target.value)} className="input-field">
              {classrooms.map(c => <option key={c.id} value={c.id}>{c.classroom_name}</option>)}
            </select>
          </div>

          <form onSubmit={handleAdd} className="card p-5 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Plus size={16} className="text-indigo-500"/>Block a Website
            </h3>
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input
                value={url} onChange={e => setUrl(e.target.value)}
                placeholder="youtube.com"
                className="input-field pl-9"
              />
            </div>
            <p className="text-xs text-slate-400">Enter domain only — subdomains are auto-stripped</p>
            <button type="submit" disabled={adding||!url.trim()} className="btn-danger w-full">
              {adding ? 'Blocking…' : <><ShieldOff size={15}/> Block Website</>}
            </button>
          </form>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger-gradient flex items-center justify-center">
              <ShieldOff size={18} className="text-white"/>
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{sites.length}</p>
              <p className="text-xs text-slate-500">Sites blocked</p>
            </div>
          </div>
        </div>

        {/* Right: list */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-5 py-4 border-b border-indigo-50">
            <h3 className="font-bold text-slate-800">Blocked Sites</h3>
          </div>
          {loading ? (
            <div className="flex justify-center py-12"><div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin"/></div>
          ) : sites.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              <ShieldOff size={36} className="mx-auto mb-3 text-slate-200"/>
              <p className="text-sm">No sites blocked yet</p>
            </div>
          ) : (
            <div className="divide-y divide-indigo-50">
              {sites.map((s, i) => (
                <motion.div key={s.id} initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-rose-50/30 transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center shrink-0">
                    <ShieldOff size={14} className="text-rose-500"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-mono font-semibold text-slate-800 text-sm">{s.website_url}</p>
                    <p className="text-xs text-slate-400">{new Date(s.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleRemove(s.id, s.website_url)}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-rose-500 transition-all">
                    <Trash2 size={14}/>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
