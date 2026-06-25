import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import LoginPage from './pages/LoginPage'
import BookListPage from './pages/BookListPage'
import { ToastProvider } from './components/Toast'
import client from './api/client'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<string>('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (token) {
      client.get('/books')
        .then(() => setChecking(false))
        .catch(() => { localStorage.removeItem('token'); setToken(null); setChecking(false) })
    } else { setChecking(false) }
  }, [])

  const handleLogin = (newToken: string, username: string) => {
    localStorage.setItem('token', newToken); setToken(newToken); setUser(username)
  }
  const handleLogout = () => { localStorage.removeItem('token'); setToken(null); setUser('') }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-400 gap-2 text-sm">
        <Loader2 size={16} className="animate-spin" /> 加载中…
      </div>
    )
  }

  if (!token) return <ToastProvider><LoginPage onLogin={handleLogin} /></ToastProvider>
  return <ToastProvider><BookListPage token={token} username={user} onLogout={handleLogout} /></ToastProvider>
}
