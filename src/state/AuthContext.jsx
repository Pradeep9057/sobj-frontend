import { createContext, useContext, useEffect, useState } from 'react'
import axios from 'axios'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  async function refresh() {
    try {
      const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'
      const { data } = await axios.get(`${base}/api/auth/profile`, { withCredentials: true })
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { refresh() }, [])

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, refresh }}>
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() { return useContext(AuthCtx) }


