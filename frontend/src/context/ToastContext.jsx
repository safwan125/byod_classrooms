import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react'

const ToastContext = createContext(null)

const CONFIGS = {
  success: { icon: CheckCircle,   style: 'bg-emerald-50 border-emerald-200 text-emerald-800', iconStyle: 'text-emerald-500' },
  error:   { icon: XCircle,       style: 'bg-rose-50 border-rose-200 text-rose-800',           iconStyle: 'text-rose-500' },
  warning: { icon: AlertTriangle, style: 'bg-amber-50 border-amber-200 text-amber-800',        iconStyle: 'text-amber-500' },
  info:    { icon: Info,          style: 'bg-indigo-50 border-indigo-200 text-indigo-800',     iconStyle: 'text-indigo-500' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
  }, [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
        {toasts.map(t => {
          const cfg = CONFIGS[t.type] || CONFIGS.info
          const Icon = cfg.icon
          return (
            <div key={t.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border shadow-card-hover toast-enter text-sm font-medium pointer-events-auto ${cfg.style}`}
            >
              <Icon size={17} className={`shrink-0 mt-0.5 ${cfg.iconStyle}`} />
              <span className="flex-1 leading-snug">{t.message}</span>
              <button onClick={() => dismiss(t.id)} className="opacity-50 hover:opacity-100 transition-opacity ml-1">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
