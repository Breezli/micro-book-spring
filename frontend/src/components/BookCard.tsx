import { Pencil, Trash2 } from 'lucide-react'
import type { Book } from '../types'

interface Props { book: Book; onDelete: (book: Book) => void; onEdit: (book: Book) => void }

function bookTint(title: string) {
  let h = 0; for (const c of title) h = c.charCodeAt(0) + ((h << 5) - h)
  const hue = [165, 175, 185, 195, 170, 180, 190, 160][Math.abs(h) % 8]
  return `hsl(${hue}, 22%, 58%)`
}

export default function BookCard({ book, onDelete, onEdit }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/70 shadow-sm
      transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      {/* 顶部色条 */}
      <div className="h-2 rounded-t-xl" style={{ backgroundColor: bookTint(book.title) }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-[15px] leading-snug text-slate-800 line-clamp-1">{book.title}</h3>
          {book.isbn && (
            <span className="shrink-0 text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 font-mono rounded">{book.isbn}</span>
          )}
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="w-10 shrink-0 text-slate-400">作者</span>
            <span className="text-slate-700">{book.author}</span>
          </div>
          <div className="flex gap-2">
            <span className="w-10 shrink-0 text-slate-400">价格</span>
            <span className="font-semibold text-slate-800">
              ¥{book.price ? Number(book.price).toFixed(2) : '0.00'}
            </span>
          </div>
        </div>

        {book.description && (
          <p className="text-sm text-slate-400 mt-2.5 leading-relaxed line-clamp-2">{book.description}</p>
        )}

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
          <button onClick={() => onEdit(book)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-lg
              text-slate-500 hover:text-accent-600 hover:bg-accent-50 transition-colors">
            <Pencil size={14} /> 编辑
          </button>
          <button onClick={() => onDelete(book)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm rounded-lg
              text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
            <Trash2 size={14} /> 删除
          </button>
        </div>
      </div>
    </div>
  )
}
