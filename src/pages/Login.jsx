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
<<<<<<< HEAD
      if (!email || !password) {
        throw new Error('Email and password are required')
      }

      const base = import.meta.env.VITE_API_BASE

      const res = await axios.post(
        `${base}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      )

      if (res.data.otp_sent) {
        setMsg('OTP sent to your email. Please check your inbox and enter the code.')
=======
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
      const r = await axios.post(`${base}/api/auth/login`, { email, password }, { withCredentials: true })
      if (r.data?.otp_sent) {
>>>>>>> 3aac940a8df3a1074f2a4b5a1561e74d72c3e79c
        setStep('otp')
        setMsg('OTP sent to your email')
      } else {
        await refresh()
        navigate('/dashboard')
      }
<<<<<<< HEAD
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || 'Invalid credentials'
      setMsg(serverMsg)
      console.error('Login error:', err)
    } finally {
      setLoading(false)
=======
    } catch (e) {
      setMsg('Invalid credentials')
>>>>>>> 3aac940a8df3a1074f2a4b5a1561e74d72c3e79c
    }
  }

  async function verify(e) {
    e.preventDefault()
    try {
<<<<<<< HEAD
      if (!code) {
        throw new Error('Please enter the OTP')
      }

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
      console.error('OTP verification error:', err)
    } finally {
      setLoading(false)
=======
      const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
      await axios.post(`${base}/api/auth/verify-otp`, { email, code }, { withCredentials: true })
      await refresh()
      navigate('/dashboard')
    } catch {
      setMsg('Invalid or expired code')
>>>>>>> 3aac940a8df3a1074f2a4b5a1561e74d72c3e79c
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


