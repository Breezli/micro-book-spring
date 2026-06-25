import { useState } from 'react'
import client from '../api/client'

interface Props {
  onLogin: (token: string, username: string) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const res = await client.post(endpoint, { username, password })
      const { token, username: name } = res.data
      onLogin(token, username || name)
    } catch (err: any) {
      setError(err.response?.data?.error || '操作失败，请检查网络或后端服务')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-center mb-1">图书管理系统</h1>
          <p className="text-sm text-gray-500 text-center mb-6">
            SpringBoot 微服务版
          </p>

          <div className="space-y-4">
            <input type="text" placeholder="用户名" required
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500" />

            <input type="password" placeholder="密码" required
              value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500" />

            {error && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded-lg
                hover:bg-blue-700 text-sm font-medium disabled:opacity-50">
              {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {mode === 'login' ? (
                <>测试账号：admin / admin123<br />
                  <button type="button" onClick={() => setMode('register')}
                    className="text-blue-600 hover:underline">注册账号</button>
                </>
              ) : (
                <button type="button" onClick={() => setMode('login')}
                  className="text-blue-600 hover:underline">已有账号？去登录</button>
              )}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
