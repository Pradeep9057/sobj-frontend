import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import axios from 'axios'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [step, setStep] = useState('credentials')
  const [code, setCode] = useState('')
  const navigate = useNavigate()
  const { refresh } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    try {
      const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'
      const r = await axios.post(`${base}/api/auth/login`, { email, password }, { withCredentials: true })
      if (r.data?.otp_sent) {
        setStep('otp')
        setMsg('OTP sent to your email')
      } else {
        await refresh()
        navigate('/dashboard')
      }
    } catch (e) {
      setMsg('Invalid credentials')
    }
  }

  async function verify(e) {
    e.preventDefault()
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
      await axios.post(`${base}/api/auth/verify-otp`, { email, code }, { withCredentials: true })
      await refresh()
      navigate('/dashboard')
    } catch {
      setMsg('Invalid or expired code')
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Login</h1>
      {step === 'credentials' && (
        <form onSubmit={onSubmit} className="space-y-4">
          <input className="w-full bg-white/5 rounded p-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full bg-white/5 rounded p-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="btn w-full">Login</button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={verify} className="space-y-4">
          <input className="w-full bg-white/5 rounded p-3" placeholder="Enter OTP" value={code} onChange={e=>setCode(e.target.value)} />
          <button className="btn w-full">Verify</button>
        </form>
      )}
      {msg && <div className="mt-4 text-sm text-white/80">{msg}</div>}
    </div>
  )
}


