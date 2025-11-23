import { Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { User, LogOut, ShoppingBag, Heart, MapPin, KeyRound, ChevronDown, Shield } from 'lucide-react'
import { useAuth } from './state/AuthContext.jsx'
import { useCart } from './state/CartContext.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import Home from './pages/Home.jsx'
import Products from './pages/Products.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/Checkout.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Admin from './pages/Admin.jsx'
import ProtectedRoute from './shared/ProtectedRoute.jsx'

function Navbar() {
  const { user, setUser } = useAuth()
  const { items } = useCart()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [cartAnimation, setCartAnimation] = useState(false)
  const dropdownRef = useRef(null)
  
  const cartItemCount = items.reduce((sum, item) => sum + (item.qty || 1), 0)
  
  useEffect(() => {
    if (cartItemCount > 0) {
      setCartAnimation(true)
      const timer = setTimeout(() => setCartAnimation(false), 600)
      return () => clearTimeout(timer)
    }
  }, [cartItemCount])

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleLogout() {
    const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'
    try {
      await axios.post(`${base}/api/auth/logout`, {}, { withCredentials: true })
    } catch {}
    setUser(null)
    navigate('/')
    setDropdownOpen(false)
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
  }

  return (
    <nav className="sticky top-0 z-50 bg-[#0F0F0F]/80 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 h-16">
        <div />
        <NavLink to="/" className="text-2xl font-heading tracking-wide">
          <span className="text-white">S</span><span className="text-brand-gold">onaura</span>
        </NavLink>
        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/products">Shop</NavLink>
          <NavLink to="/cart" className="relative">
            <ShoppingBag className="w-5 h-5" />
            {cartItemCount > 0 && (
              <AnimatePresence>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={cartAnimation ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-brand-gold text-black rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </motion.div>
              </AnimatePresence>
            )}
          </NavLink>
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-brand-gold text-black font-semibold flex items-center justify-center text-xs">
                  {getInitials(user.name)}
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <div className="font-semibold">{user.name}</div>
                    <div className="text-xs text-white/60 mt-1">{user.email}</div>
                  </div>
                  <NavLink
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </NavLink>
                  {user.role === 'admin' && (
                    <NavLink
                      to="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors border-t border-white/10"
                    >
                      <Shield className="w-4 h-4 text-brand-gold" />
                      <span className="text-brand-gold">Admin Panel</span>
                    </NavLink>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <NavLink to="/login" className="hover:text-brand-gold transition-colors">Login</NavLink>
              <NavLink to="/signup" className="px-4 py-2 rounded-lg bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-colors">Sign Up</NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 text-sm text-white/70 flex flex-col gap-2">
        <div>© {new Date().getFullYear()} Sonaura – Shree Om Banna Jewellers</div>
        <div className="flex gap-4">
          <a href="#">Instagram</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  )
}


