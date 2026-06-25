import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

type ToastType = 'success' | 'error'
interface Toast { id: number; type: ToastType; message: string }
interface ToastContextValue { showToast: (type: ToastType, message: string) => void }

const ToastContext = createContext<ToastContextValue | null>(null)
let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const showToast = useCallback((type: ToastType, message: string) => {
    const id = nextId++; setToasts(p => [...p, { id, type, message }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000)
  }, [])
  const remove = (id: number) => setToasts(p => p.filter(t => t.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 min-w-[300px]">
        {toasts.map(t => (
          <div key={t.id}
            className={`flex items-start gap-3 px-4 py-3 text-sm rounded-lg shadow-lg border animate-slide-in backdrop-blur-sm
              ${t.type === 'success' ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-red-50/95 border-red-200 text-red-700'}`}>
            {t.type === 'success'
              ? <CheckCircle size={16} className="mt-0.5 shrink-0 text-accent-500" />
              : <XCircle size={16} className="mt-0.5 shrink-0 text-red-400" />
            }
            <span className="flex-1">{t.message}</span>
            <button onClick={() => remove(t.id)} className="shrink-0 opacity-40 hover:opacity-80 transition-opacity">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
