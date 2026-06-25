import { useState, useEffect } from 'react'
import client from '../api/client'
import BookCard from '../components/BookCard'
import type { Book } from '../types'

interface Props {
  token: string
  username: string
  onLogout: () => void
}

export default function BookListPage({ token, username, onLogout }: Props) {
  const [books, setBooks] = useState<Book[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', author: '', isbn: '', price: '', description: '' })
  const [error, setError] = useState('')

  const loadBooks = async () => {
    try {
      const res = await client.get('/books')
      setBooks(res.data.books || [])
    } catch {
      setBooks([])
    }
  }

  useEffect(() => { loadBooks() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await client.post('/books', {
        title: form.title,
        author: form.author,
        isbn: form.isbn || undefined,
        price: form.price ? parseFloat(form.price) : 0,
        description: form.description || undefined,
      })
      setShowForm(false)
      setForm({ title: '', author: '', isbn: '', price: '', description: '' })
      loadBooks()
    } catch (err: any) {
      setError(err.response?.data?.error || '添加失败')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定删除？')) return
    try {
      await client.delete(`/books/${id}`)
      loadBooks()
    } catch {}
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* 导航栏 */}
      <nav className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-3 mb-6
        flex items-center justify-between">
        <h2 className="text-lg font-bold text-blue-600">图书管理系统</h2>
        <div className="flex items-center gap-4">
          {username && (
            <span className="text-sm text-gray-500">你好, {username}</span>
          )}
          <button onClick={onLogout}
            className="text-sm text-red-500 hover:text-red-700">
            退出
          </button>
        </div>
      </nav>

      {/* 统计卡片 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xs text-gray-500">图书总数</div>
          <div className="text-2xl font-bold text-blue-600">{books.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xs text-gray-500">微服务</div>
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-[10px] text-gray-400">Auth / Book / Gateway</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
          <div className="text-xs text-gray-500">API 端口</div>
          <div className="text-2xl font-bold text-purple-600">8088</div>
          <div className="text-[10px] text-gray-400">Gateway 入口</div>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">图书列表</h3>
        <button onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          {showForm ? '取消' : '+ 添加图书'}
        </button>
      </div>

      {/* 添加表单 */}
      {showForm && (
        <form onSubmit={handleAdd}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h4 className="font-medium mb-4">添加图书</h4>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="书名" required
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="作者" required
              value={form.author} onChange={e => setForm({ ...form, author: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input placeholder="ISBN"
              value={form.isbn} onChange={e => setForm({ ...form, isbn: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="number" step="0.01" placeholder="价格"
              value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <textarea placeholder="描述" rows={2}
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full mt-4 px-3 py-2 border border-gray-300 rounded-lg text-sm" />

          {error && (
            <div className="text-sm text-red-600 mt-2">{error}</div>
          )}
          <div className="flex gap-2 mt-4">
            <button type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              保存
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
              取消
            </button>
          </div>
        </form>
      )}

      {/* 图书列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {books.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-gray-400">
            暂无图书，点击上方按钮添加
          </div>
        ) : (
          books.map(book => (
            <BookCard key={book.id} book={book} onDelete={handleDelete} />
          ))
        )}
      </div>
    </div>
  )
}
