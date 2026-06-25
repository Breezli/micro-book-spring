import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props { open: boolean; onClose: () => void; title: string; children: ReactNode; width?: string }

export default function Modal({ open, onClose, title, children, width = 'max-w-lg' }: Props) {
  useEffect(() => {
    if (open) { document.body.style.overflow = 'hidden' } else { document.body.style.overflow = '' }
    return () => { document.body.style.overflow = '' }
  }, [open])
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-xl w-full ${width} animate-fade-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-500 transition-colors rounded-lg p-1 hover:bg-slate-100">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
