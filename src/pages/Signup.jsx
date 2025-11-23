import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [step, setStep] = useState('form')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { refresh } = useAuth()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'
      await axios.post(`${base}/api/auth/register`, { name, email, password }, { withCredentials: true })
      setMsg('Registered! Please enter the OTP sent to your email')
      setStep('otp')
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message || 'Registration failed'
      // eslint-disable-next-line no-console
      console.error('Signup error:', e)
      setMsg(serverMsg)
    }
    setLoading(false)
  }

  async function verify(e) {
    e.preventDefault()
    setLoading(true)
    try {
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
      const res = await axios.post(`${base}/api/auth/verify-otp`, { email, code }, { withCredentials: true })
      
      // Save token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
      }
      
      // Refresh auth context
      await refresh()
      
      setMsg('Verified! Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (e) {
      const serverMsg = e?.response?.data?.message || 'Invalid or expired code'
      // eslint-disable-next-line no-console
      console.error('OTP verify error:', e)
      setMsg(serverMsg)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Create Account</h1>
      {step === 'form' && (
        <form onSubmit={onSubmit} className="space-y-4">
          <input required className="w-full bg-white/5 rounded p-3" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input required type="email" className="w-full bg-white/5 rounded p-3" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input required minLength={6} className="w-full bg-white/5 rounded p-3" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button disabled={loading} className="btn w-full">{loading ? 'Please wait…' : 'Sign Up'}</button>
        </form>
      )}
      {step === 'otp' && (
        <form onSubmit={verify} className="space-y-4">
          <input required className="w-full bg-white/5 rounded p-3" placeholder="Enter OTP" value={code} onChange={e=>setCode(e.target.value)} />
          <button disabled={loading} className="btn w-full">{loading ? 'Verifying…' : 'Verify'}</button>
        </form>
      )}
      {msg && <div className="mt-4 text-sm text-white/80">{msg}</div>}
    </div>
  )
}


