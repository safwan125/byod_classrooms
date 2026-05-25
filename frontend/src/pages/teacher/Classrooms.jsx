import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Plus, Copy, Check, Pencil, Trash2, X, Users } from 'lucide-react'
import api from '../../services/api'
import { useToast } from '../../context/ToastContext'

export default function Classrooms() {
  const { showToast } = useToast()
  const [classrooms, setClassrooms] = useState([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null) // null | 'create' | {editing classroom}
  const [form, setForm]             = useState({ classroom_name:'', description:'' })
  const [saving, setSaving]         = useState(false)
  const [deleting, setDeleting]     = useState(null)
  const [copied, setCopied]         = useState(null)

  const load = async () => {
    try { const r = await api.get('/classrooms'); setClassrooms(r.data) }
    catch { showToast('Failed to load classrooms','error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  const openCreate = () => { setForm({ classroom_name:'', description:'' }); setModal('create') }
  const openEdit   = c  => { setForm({ classroom_name:c.classroom_name, description:c.description||'' }); setModal(c) }
  const closeModal = () => setModal(null)

  const handleSave = async () => {
    if (!form.classroom_name.trim()) return showToast('Name is required','error')
    setSaving(true)
    try {
      if (modal === 'create') {
        const r = await api.post('/classrooms', form)
        setClassrooms(p => [r.data, ...p])
        showToast('Classroom created!','success')
      } else {
        const r = await api.put(`/classrooms/${modal.id}`, form)
        setClassrooms(p => p.map(c => c.id===modal.id ? r.data : c))
        showToast('Classroom updated!','success')
      }
      closeModal()
    } catch { showToast('Save failed','error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (deleting !== id) return setDeleting(id)
    try {
      await api.delete(`/classrooms/${id}`)
      setClassrooms(p => p.filter(c => c.id !== id))
      showToast('Classroom deleted','success')
    } catch { showToast('Delete failed','error') }
    finally { setDeleting(null) }
  }

  const copyCode = async (code) => {
    await navigator.clipboard.writeText(code).catch(()=>{})
    setCopied(code); setTimeout(() => setCopied(null), 2000)
    showToast('Code copied!','success')
  }

  return (
    <div className="animate-fade-in space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Classrooms</h1>
          <p className="page-subtitle">Manage classrooms and share join codes.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New Classroom
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : classrooms.length === 0 ? (
        <div className="card p-16 text-center">
          <BookOpen size={40} className="text-indigo-200 mx-auto mb-4" />
          <h3 className="font-bold text-slate-700 mb-1">No classrooms yet</h3>
          <p className="text-slate-400 text-sm mb-4">Create your first classroom to get started.</p>
          <button onClick={openCreate} className="btn-primary mx-auto">
            <Plus size={16} /> Create Classroom
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {classrooms.map((c, i) => (
              <motion.div key={c.id} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                className="card p-5 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-primary-gradient flex items-center justify-center shrink-0">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <span className={`badge ${c.status==='active' ? 'badge-green' : 'badge-gray'}`}>{c.status}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{c.classroom_name}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{c.description || 'No description'}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <Users size={14} />
                  <span>{c.students_count ?? 0} students enrolled</span>
                </div>
                <button
                  onClick={() => copyCode(c.classroom_code)}
                  className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-colors group"
                >
                  <span className="font-mono font-bold text-indigo-700 tracking-widest text-sm"># {c.classroom_code}</span>
                  {copied===c.classroom_code
                    ? <Check size={14} className="text-emerald-500" />
                    : <Copy size={14} className="text-indigo-400 group-hover:text-indigo-600" />
                  }
                </button>
                <div className="flex gap-2 pt-1 border-t border-indigo-50">
                  <button onClick={() => openEdit(c)} className="btn-ghost flex-1 text-sm py-2">
                    <Pencil size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className={`flex-1 text-sm py-2 flex items-center justify-center gap-1.5 rounded-xl font-semibold transition-all ${
                      deleting===c.id ? 'bg-rose-500 text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    }`}
                  >
                    <Trash2 size={14} /> {deleting===c.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={closeModal}>
            <motion.div initial={{ scale:.94, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.94, opacity:0 }}
              className="bg-white rounded-3xl shadow-card-hover w-full max-w-md p-6"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-xl text-slate-900">{modal==='create' ? 'New Classroom' : 'Edit Classroom'}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-indigo-50 rounded-xl"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label">Classroom Name</label>
                  <input value={form.classroom_name} onChange={e => setForm({...form, classroom_name:e.target.value})}
                    className="input-field" placeholder="e.g. Computer Science 101" />
                </div>
                <div>
                  <label className="label">Description <span className="text-slate-400 font-normal">(optional)</span></label>
                  <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})}
                    rows={3} className="input-field resize-none" placeholder="Brief description of the class…" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={closeModal} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving…' : modal==='create' ? 'Create' : 'Save changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
