import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState('')
  const [step, setStep] = useState('form')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refresh } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const base = import.meta.env.VITE_API_BASE

      const res = await axios.post(
        `${base}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      )

      if (res.data.otp_sent) {
        setMsg('OTP sent to your email. Please enter the code.')
        setStep('otp')
      } else {
        setMsg("Login failed: OTP not sent")
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || 'Invalid credentials'
      setMsg(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  async function verify(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')

    try {
      const base = import.meta.env.VITE_API_BASE

      const res = await axios.post(
        `${base}/api/auth/verify-otp`,
        { email, code },
        { withCredentials: true }
      )

      // Save token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)

        // Refresh auth context
        await refresh()

        setMsg('Verified! Redirecting...')
        setTimeout(() => navigate('/dashboard'), 500)
      } else {
        setMsg("Verification failed: No token returned")
      }
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || 'Invalid or expired code'
      setMsg(serverMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Login</h1>

      {step === 'form' && (
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            required
            type="email"
            className="w-full bg-white/5 rounded p-3"
            placeholder="Email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
          />

          <input
            required
            className="w-full bg-white/5 rounded p-3"
            placeholder="Password"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
          />

          <button disabled={loading} className="btn w-full" type="submit">
            {loading ? 'Please wait…' : 'Login'}
          </button>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={verify} className="space-y-4">
          <input
            required
            className="w-full bg-white/5 rounded p-3"
            placeholder="Enter OTP"
            value={code}
            onChange={e=>setCode(e.target.value)}
          />
          <button disabled={loading} className="btn w-full" type="submit">
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>
      )}

      {msg && <div className="mt-4 text-sm text-white/80">{msg}</div>}
    </div>
  )
}
