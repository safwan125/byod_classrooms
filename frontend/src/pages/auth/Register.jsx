import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, Eye, EyeOff, Loader, GraduationCap, BookOpen } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Register() {
  const { register }  = useAuth()
  const { showToast } = useToast()
  const navigate      = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', password_confirmation:'', role:'student' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.password_confirmation) return showToast('Passwords do not match','error')
    setLoading(true)
    try {
      const user = await register(form.name, form.email, form.password, form.password_confirmation, form.role)
      showToast('Account created! Welcome 🎉','success')
      navigate(user.role==='teacher' ? '/teacher/dashboard' : '/student/dashboard')
    } catch (err) {
      const errors = err.response?.data?.errors
      const msg = errors ? Object.values(errors).flat()[0] : (err.response?.data?.message || 'Registration failed')
      showToast(msg,'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface">
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-7">
          <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center">
            <ShieldAlert size={18} className="text-white"/>
          </div>
          <p className="font-black text-slate-900">SecureClass BYOD</p>
        </div>

        <div className="card p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-1">Create account</h2>
          <p className="text-slate-500 text-sm mb-6">Join SecureClass to get started</p>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-2 mb-5 p-1.5 bg-indigo-50 rounded-2xl">
            {[
              { value:'student', icon: GraduationCap, label:'Student' },
              { value:'teacher', icon: BookOpen,      label:'Teacher' },
            ].map(r => (
              <button key={r.value} type="button" onClick={() => setForm({...form,role:r.value})}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  form.role===r.value
                    ? 'bg-white text-primary shadow-card'
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                <r.icon size={15}/>{r.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="input-field" placeholder="Your full name" required/>
            </div>
            <div>
              <label className="label">Email address</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="input-field" placeholder="you@example.com" required/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="input-field pr-10" placeholder="Min 8 characters" required/>
                <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" value={form.password_confirmation} onChange={e=>setForm({...form,password_confirmation:e.target.value})} className="input-field" placeholder="Repeat password" required/>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <><Loader size={16} className="animate-spin"/>Creating account…</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-5">
            Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
