import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Megaphone, Plus, Trash2, X, BookOpen } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Announcements() {
  const { showToast } = useToast()
  const [classrooms, setClassrooms]   = useState([])
  const [classroomId, setClassroomId] = useState('')
  const [items, setItems]             = useState([])
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm]               = useState({ title:'', message:'' })
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    api.get('/classrooms').then(r => { setClassrooms(r.data); if(r.data.length) setClassroomId(String(r.data[0].id)) })
  }, [])

  useEffect(() => {
    if (!classroomId) return
    api.get(`/classrooms/${classroomId}/announcements`).then(r => setItems(r.data)).catch(()=>{})
  }, [classroomId])

  const handlePost = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.message.trim()) return showToast('Title and message required','error')
    setSaving(true)
    try {
      const r = await api.post('/announcements', { classroom_id:parseInt(classroomId), ...form })
      setItems(p => [r.data, ...p])
      setForm({ title:'', message:'' })
      setShowForm(false)
      showToast('Announcement posted ✓','success')
    } catch { showToast('Failed to post','error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    try { await api.delete(`/announcements/${id}`); setItems(p=>p.filter(a=>a.id!==id)); showToast('Deleted','success') }
    catch { showToast('Failed','error') }
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="page-title flex items-center gap-2"><Megaphone size={22} className="text-violet-500"/>Announcements</h1>
          <p className="page-subtitle">Broadcast messages to your students.</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={classroomId} onChange={e => setClassroomId(e.target.value)} className="input-field max-w-xs">
            {classrooms.map(c => <option key={c.id} value={c.id}>{c.classroom_name}</option>)}
          </select>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary whitespace-nowrap">
            <Plus size={16}/> New
          </button>
        </div>
      </div>

      {showForm && (
        <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
          className="card p-5 border-2 border-violet-200 bg-violet-50/30">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">New Announcement</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-violet-100 rounded-xl"><X size={16}/></button>
          </div>
          <form onSubmit={handlePost} className="space-y-3">
            <div>
              <label className="label">Title</label>
              <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="input-field" placeholder="Announcement title"/>
            </div>
            <div>
              <label className="label">Message</label>
              <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={4} className="input-field resize-none" placeholder="Write your message here…"/>
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Posting…' : <><Megaphone size={15}/> Post Announcement</>}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="card p-16 text-center">
            <Megaphone size={36} className="mx-auto mb-3 text-slate-200"/>
            <p className="text-slate-400 text-sm">No announcements yet. Post one above.</p>
          </div>
        ) : items.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
            className="card p-5 flex gap-4 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)' }}>
              <Megaphone size={18} className="text-white"/>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-slate-900">{a.title}</h3>
                <button onClick={() => handleDelete(a.id)}
                  className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-rose-100 text-rose-500 transition-all shrink-0">
                  <Trash2 size={14}/>
                </button>
              </div>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">{a.message}</p>
              <p className="text-xs text-slate-400 mt-2">{new Date(a.created_at).toLocaleDateString('en-US',{ weekday:'short', month:'short', day:'numeric', year:'numeric' })}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
