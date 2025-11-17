import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const navigate = useNavigate()
  const { refresh } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()

    try {
      const base = import.meta.env.VITE_API_BASE

      const res = await axios.post(
        `${base}/api/auth/login`,
        { email, password },
        { withCredentials: false } // DO NOT USE COOKIES; using tokens now
      )

      // Save token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)

        // Refresh auth context
        await refresh()

        navigate('/dashboard')
      } else {
        setMsg("Login failed: No token returned")
      }
    } catch (err) {
      setMsg("Invalid credentials")
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Login</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          className="w-full bg-white/5 rounded p-3"
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        <input
          className="w-full bg-white/5 rounded p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        <button className="btn w-full" type="submit">
          Login
        </button>
      </form>

      {msg && <div className="mt-4 text-sm text-white/80">{msg}</div>}
    </div>
  )
}
