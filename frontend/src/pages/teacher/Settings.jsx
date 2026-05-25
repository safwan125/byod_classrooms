import React, { useState } from 'react'
import { Settings, User, Lock, Bell, Loader, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

export default function TeacherSettings() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setSaved(true)
    showToast('Settings saved ✓', 'success')
    setTimeout(() => setSaved(false), 2000)
  }

  const initials = user?.name?.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase() || 'T'

  return (
    <div className="animate-fade-in space-y-5 max-w-2xl">
      <div>
        <h1 className="page-title flex items-center gap-2"><Settings size={22} className="text-indigo-500"/>Settings</h1>
        <p className="page-subtitle">Manage your account preferences.</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><User size={16}/>Profile</h3>
        <div className="flex items-center gap-4 mb-5 p-4 bg-indigo-50 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-primary-gradient flex items-center justify-center text-white text-xl font-black">
            {initials}
          </div>
          <div>
            <p className="font-bold text-slate-900 text-lg">{user?.name}</p>
            <p className="text-slate-500 text-sm">{user?.email}</p>
            <span className="badge badge-indigo mt-1 capitalize">{user?.role}</span>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name</label>
            <input defaultValue={user?.name} className="input-field"/>
          </div>
          <div>
            <label className="label">Email</label>
            <input defaultValue={user?.email} type="email" className="input-field"/>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={16}/>Notifications</h3>
        <div className="space-y-3">
          {[
            { label:'Blocked site alerts', desc:'Get notified when a student tries to access a blocked site', def:true },
            { label:'New student joined', desc:'Alert when a student joins your classroom', def:true },
            { label:'Activity reports',   desc:'Weekly email summary of classroom activity', def:false },
          ].map((n,i) => (
            <label key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 cursor-pointer transition-colors">
              <div>
                <p className="font-semibold text-sm text-slate-800">{n.label}</p>
                <p className="text-xs text-slate-400">{n.desc}</p>
              </div>
              <input type="checkbox" defaultChecked={n.def} className="w-4 h-4 accent-indigo-600 rounded"/>
            </label>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="card p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Lock size={16}/>Security</h3>
        <div className="space-y-3">
          <div>
            <label className="label">Current Password</label>
            <input type="password" className="input-field" placeholder="••••••••"/>
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input-field" placeholder="••••••••"/>
          </div>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary">
        {saved ? <><CheckCircle size={16}/> Saved!</> : <><Settings size={16}/> Save Changes</>}
      </button>
    </div>
  )
}
