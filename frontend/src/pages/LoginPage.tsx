import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import client from '../api/client'

interface Props { onLogin: (token: string, username: string) => void }

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await client.post(endpoint, { username, password })
      onLogin(res.data.token, res.data.username || username)
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 to-slate-100/70">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-8 pt-10 pb-8">
            <div className="text-center mb-8">
              <div className="w-10 h-10 rounded-xl bg-accent-600/10 flex items-center justify-center mx-auto mb-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent-600">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z"/>
                  <path d="M8 7h8M8 11h6"/>
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-slate-900">图书管理系统</h1>
              <p className="text-sm text-slate-400 mt-1">SpringBoot 微服务架构</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">用户名</label>
                <input type="text" placeholder="请输入用户名" required
                  value={username} onChange={e => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800
                    placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
                    transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">密码</label>
                <input type="password" placeholder="请输入密码" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-800
                    placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-accent-500/20 focus:border-accent-500
                    transition-all" />
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3.5 py-2.5 border border-red-100">{error}</div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg bg-accent-600 text-white text-sm font-medium
                  hover:bg-accent-700 active:scale-[0.98] transition-all disabled:opacity-50
                  flex items-center justify-center gap-2">
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? '处理中…' : mode === 'login' ? '登录' : '注册'}
              </button>

              <div className="text-sm text-slate-400 text-center pt-2">
                {mode === 'login' ? (
                  <span>
                    测试账号 <code className="text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded text-xs font-mono">admin</code>
                    {' / '}
                    <code className="text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded text-xs font-mono">admin123</code>
                    <br />
                    <button type="button" onClick={() => setMode('register')}
                      className="text-accent-600 hover:text-accent-700 mt-2 inline-block transition-colors">
                      注册账号 →
                    </button>
                  </span>
                ) : (
                  <button type="button" onClick={() => setMode('login')}
                    className="text-accent-600 hover:text-accent-700 transition-colors">
                    ← 返回登录
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
