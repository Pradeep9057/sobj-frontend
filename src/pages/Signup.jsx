import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [step, setStep] = useState('form')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
<<<<<<< HEAD
      if (!name || !email || !password) {
        throw new Error('All fields are required')
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      const base = import.meta.env.VITE_API_BASE
=======
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
>>>>>>> 3aac940a8df3a1074f2a4b5a1561e74d72c3e79c
      await axios.post(`${base}/api/auth/register`, { name, email, password }, { withCredentials: true })
      setMsg('Registered! Check your email for the OTP.')
      setStep('otp')
    } catch (e) {
      const serverMsg = e?.response?.data?.message || e?.message || 'Registration failed'
      console.error('Signup error:', e)
      setMsg(serverMsg)
    }
    setLoading(false)
  }

  async function verify(e) {
    e.preventDefault()
    setLoading(true)
    try {
<<<<<<< HEAD
      if (!code) {
        throw new Error('Please enter the OTP')
      }

      const base = import.meta.env.VITE_API_BASE
      const res = await axios.post(`${base}/api/auth/verify-otp`, { email, code }, { withCredentials: true })
      
      // Save token in localStorage
      if (res.data.token) {
        localStorage.setItem("token", res.data.token)
      }
      
      // Refresh auth context
      await refresh()
      
=======
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
      await axios.post(`${base}/api/auth/verify-otp`, { email, code }, { withCredentials: true })
>>>>>>> 3aac940a8df3a1074f2a4b5a1561e74d72c3e79c
      setMsg('Verified! Redirecting to dashboard...')
      setTimeout(() => navigate('/dashboard'), 500)
    } catch (e) {
      const serverMsg = e?.response?.data?.message || 'Invalid or expired code'
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


