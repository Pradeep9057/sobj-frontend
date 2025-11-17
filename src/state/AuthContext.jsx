import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    try {
      const base = import.meta.env.VITE_API_BASE

      const { data } = await axios.get(`${base}/api/auth/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      setUser(data)
    } catch (err) {
      console.error("Auth refresh failed:", err)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  useEffect(() => {
    refresh()
  }, [])

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, refresh, logout }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  return useContext(AuthCtx)
}
