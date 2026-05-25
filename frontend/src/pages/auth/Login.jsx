import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldAlert, Eye, EyeOff, Loader, BookOpen, Monitor, BarChart3 } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function Login() {
  const { login }         = useAuth()
  const { showToast }     = useToast()
  const navigate          = useNavigate()
  const [form, setForm]   = useState({ email:'', password:'' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      showToast('Welcome back! 👋','success')
      navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard')
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid credentials','error')
    } finally { setLoading(false) }
  }

  const FEATURES = [
    { icon: Monitor,   label: 'Auto-detection',  desc: 'Every website visit is automatically logged' },
    { icon: ShieldAlert,label:'Real-time blocking',desc: 'Blocked sites trigger instant teacher alerts' },
    { icon: BarChart3, label: 'Rich analytics',  desc: 'Track productivity with detailed reports' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background:'#0f0c29' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden sidebar-dots">
        <div style={{ background:'linear-gradient(180deg,#0f0c29 0%,#302b63 60%,#24243e 100%)', position:'absolute', inset:0 }}/>

        {/* Glowing orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background:'radial-gradient(circle,#4f46e5,transparent)' }}/>
        <div className="absolute bottom-32 right-16 w-48 h-48 rounded-full opacity-15 blur-3xl"
          style={{ background:'radial-gradient(circle,#7c3aed,transparent)' }}/>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center">
              <ShieldAlert size={20} className="text-white"/>
            </div>
            <div>
              <p className="text-white font-black text-lg leading-none">SecureClass BYOD</p>
              <p className="text-white/40 text-xs">Academic Management Platform</p>
            </div>
          </div>

          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Take control of your<br/>
            <span className="text-transparent bg-clip-text" style={{ backgroundImage:'linear-gradient(135deg,#818cf8,#a78bfa)' }}>
              digital classroom
            </span>
          </h1>
          <p className="text-white/60 text-base leading-relaxed mb-10">
            Monitor student activity, block distracting websites, and measure productivity — all automatically.
          </p>

          <div className="space-y-4">
            {FEATURES.map((f,i) => (
              <motion.div key={f.label} initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ delay:.3+i*.15 }}
                className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
                <div className="w-9 h-9 rounded-xl bg-primary-gradient flex items-center justify-center shrink-0">
                  <f.icon size={16} className="text-white"/>
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.label}</p>
                  <p className="text-white/50 text-xs">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/20 text-xs">© 2026 SecureClass BYOD. College BYOD Management Platform.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface">
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-primary-gradient flex items-center justify-center">
              <ShieldAlert size={16} className="text-white"/>
            </div>
            <p className="font-black text-slate-900">SecureClass BYOD</p>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-7">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Email address</label>
                <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}
                  className="input-field" placeholder="you@example.com" required/>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPw?'text':'password'} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}
                    className="input-field pr-10" placeholder="••••••••" required/>
                  <button type="button" onClick={()=>setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                {loading ? <><Loader size={16} className="animate-spin"/>Signing in…</> : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
            </p>

            {/* Demo credentials */}
            <div className="mt-5 p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs space-y-1">
              <p className="font-bold text-indigo-700">Demo Credentials</p>
              <p className="text-indigo-600">Teacher: <span className="font-mono">teacher@example.com / password</span></p>
              <p className="text-indigo-600">Student: <span className="font-mono">student1@example.com / password</span></p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
