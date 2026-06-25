import { useState, useEffect, useMemo } from 'react'
import { Search, LayoutGrid, List, Plus, LogOut, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'
import client from '../api/client'
import BookCard from '../components/BookCard'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import type { Book } from '../types'

interface Props { token: string; username: string; onLogout: () => void }
interface BookForm { title: string; author: string; isbn: string; price: string; description: string }
const emptyForm: BookForm = { title: '', author: '', isbn: '', price: '', description: '' }
const PAGE_SIZE = 6

export default function BookListPage({ token, username, onLogout }: Props) {
  const { showToast } = useToast()
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [form, setForm] = useState<BookForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const loadBooks = async () => {
    try { const r = await client.get('/books'); setBooks(r.data.books || []) }
    catch { setBooks([]) }
  }
  useEffect(() => { loadBooks() }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return books
    const q = search.trim().toLowerCase()
    return books.filter(b =>
      b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.isbn?.toLowerCase().includes(q) ?? false))
  }, [books, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const openAddForm = () => { setEditingBook(null); setForm(emptyForm); setShowForm(true) }
  const openEditForm = (b: Book) => {
    setEditingBook(b); setForm({ title: b.title, author: b.author, isbn: b.isbn || '', price: b.price ? String(b.price) : '', description: b.description || '' }); setShowForm(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setFormLoading(true)
    try {
      const body = { title: form.title, author: form.author, isbn: form.isbn || undefined, price: form.price ? parseFloat(form.price) : 0, description: form.description || undefined }
      if (editingBook) { await client.put(`/books/${editingBook.id}`, body); showToast('success', '图书更新成功') }
      else { await client.post('/books', body); showToast('success', '图书添加成功') }
      setShowForm(false); setEditingBook(null); setForm(emptyForm); loadBooks()
    } catch (err: any) { showToast('error', err.response?.data?.error || '操作失败') }
    finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return; setDeleteLoading(true)
    try { await client.delete(`/books/${deleteTarget.id}`); showToast('success', `《${deleteTarget.title}》已删除`); setDeleteTarget(null); loadBooks() }
    catch { showToast('error', '删除失败') } finally { setDeleteLoading(false) }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      {/* 导航 */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <BookOpen size={18} className="text-accent-600" />
              <span className="font-semibold text-sm text-slate-800">图书管理系统</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:inline">你好，<span className="text-slate-600">{username}</span></span>
              <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
                <LogOut size={15} /> 退出
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '图书总数', value: String(books.length), color: 'text-accent-600', bg: 'bg-accent-50' },
            { label: '微服务', value: '3', sub: 'Auth / Book / Gateway', color: 'text-accent-600', bg: 'bg-accent-50' },
            { label: 'API 入口', value: '8088', sub: 'Gateway 端口', color: 'text-accent-600', bg: 'bg-accent-50' },
          ].map((item, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-slate-400 mb-1">{item.label}</div>
                  <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                  {item.sub && <div className="text-xs text-slate-400 mt-1">{item.sub}</div>}
                </div>
                <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                  <BookOpen size={15} className={item.color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 工具栏 */}
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="搜索书名、作者或 ISBN…"
                value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700
                  placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
                  transition-all" />
            </div>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button onClick={() => setViewMode('card')}
                className={`p-2 transition-colors ${viewMode === 'card' ? 'bg-accent-600 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                <LayoutGrid size={16} />
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-accent-600 text-white' : 'text-slate-400 hover:bg-slate-100'}`}>
                <List size={16} />
              </button>
            </div>
            <button onClick={openAddForm}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent-600 text-white text-sm font-medium
                hover:bg-accent-700 active:scale-[0.98] transition-all">
              <Plus size={16} /> 添加图书
            </button>
          </div>
        </div>

        {/* 图书区域 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? '没有匹配的图书' : '暂无图书，点击上方按钮添加'}</p>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paged.map(b => <BookCard key={b.id} book={b} onDelete={x => setDeleteTarget(x)} onEdit={openEditForm} />)}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wider">书名</th>
                      <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wider">作者</th>
                      <th className="text-left px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wider hidden sm:table-cell">ISBN</th>
                      <th className="text-right px-5 py-3.5 font-medium text-slate-500 text-xs uppercase tracking-wider">价格</th>
                      <th className="px-5 py-3.5 text-xs text-slate-500 w-24">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paged.map(b => (
                      <tr key={b.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5 font-medium text-slate-800">{b.title}</td>
                        <td className="px-5 py-3.5 text-slate-500">{b.author}</td>
                        <td className="px-5 py-3.5 text-slate-400 font-mono text-xs hidden sm:table-cell">{b.isbn || '—'}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-slate-700">¥{b.price ? Number(b.price).toFixed(2) : '0.00'}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex gap-1">
                            <button onClick={() => openEditForm(b)} className="px-2.5 py-1 text-sm text-slate-400 hover:text-accent-600 hover:bg-accent-50 rounded-lg transition-colors">编辑</button>
                            <button onClick={() => setDeleteTarget(b)} className="px-2.5 py-1 text-sm text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">删除</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-default transition-colors">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i)}
                    className={`w-8 h-8 rounded-lg text-sm transition-colors
                      ${i === page ? 'bg-accent-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-default transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <Modal open={showForm} onClose={() => { setShowForm(false); setEditingBook(null) }} title={editingBook ? '编辑图书' : '添加图书'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">书名 *</label>
              <input placeholder="请输入书名" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-slate-700 mb-1">作者 *</label>
              <input placeholder="请输入作者" required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ISBN</label>
              <input placeholder="选填" value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">价格</label>
              <input type="number" step="0.01" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">描述</label>
            <textarea placeholder="选填" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500 transition-all resize-none" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowForm(false); setEditingBook(null) }}
              className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 transition-colors rounded-lg">取消</button>
            <button type="submit" disabled={formLoading}
              className="px-5 py-2 text-sm rounded-lg bg-accent-600 text-white hover:bg-accent-700 transition-all disabled:opacity-50">
              {formLoading ? '保存中…' : '保存'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="确认删除" message={deleteTarget ? `确定要删除《${deleteTarget.title}》吗？此操作不可恢复。` : ''}
        confirmText="删除" loading={deleteLoading} />
    </div>
  )
}
