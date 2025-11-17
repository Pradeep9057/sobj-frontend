import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refresh } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)

    try {
      const base = import.meta.env.VITE_API_BASE

      const res = await axios.post(
        `${base}/api/auth/register`,
        { name, email, password },
        { withCredentials: false }
      )

      if (!res.data.token) {
        setMsg("Registration failed: No token returned")
        setLoading(false)
        return
      }

      // Save token
      localStorage.setItem("token", res.data.token)

      // Update auth context
      await refresh()

      navigate('/dashboard')

    } catch (e) {
      const serverMsg =
        e?.response?.data?.message || e?.message || 'Registration failed'

      console.error('Signup error:', e)
      setMsg(serverMsg)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Create Account</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          required
          className="w-full bg-white/5 rounded p-3"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <input
          required
          type="email"
          className="w-full bg-white/5 rounded p-3"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          required
          minLength={6}
          className="w-full bg-white/5 rounded p-3"
          placeholder="Password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button disabled={loading} className="btn w-full">
          {loading ? 'Please wait…' : 'Sign Up'}
        </button>
      </form>

      {msg && <div className="mt-4 text-sm text-white/80">{msg}</div>}
    </div>
  )
}
