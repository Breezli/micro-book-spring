import Modal from './Modal'

interface Props {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; message: string; confirmText?: string; loading?: boolean
}

export default function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = '确定', loading }: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <button onClick={onClose}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors">取消</button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50">
          {loading ? '处理中…' : confirmText}
        </button>
      </div>
    </Modal>
  )
}
