import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import BookListPage from './pages/BookListPage'
import client from './api/client'

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [user, setUser] = useState<string>('')
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (token) {
      client.get('/books')
        .then(() => setChecking(false))
        .catch(() => {
          localStorage.removeItem('token')
          setToken(null)
          setChecking(false)
        })
    } else {
      setChecking(false)
    }
  }, [])

  const handleLogin = (newToken: string, username: string) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(username)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser('')
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-400">
        加载中...
      </div>
    )
  }

  if (!token) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <BookListPage token={token} username={user} onLogout={handleLogout} />
}
