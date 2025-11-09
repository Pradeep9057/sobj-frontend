import { useEffect, useState } from 'react'
import axios from 'axios'
import { User, Mail, Shield, Calendar, ShoppingBag, Heart, MapPin, KeyRound, Sparkles } from 'lucide-react'

export default function Dashboard() {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
  const [tab, setTab] = useState('profile')
  const [profile, setProfile] = useState(null)
  const [orders, setOrders] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [addresses, setAddresses] = useState([])
  const [addrForm, setAddrForm] = useState({ full_name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: true })
  const [pw, setPw] = useState({ oldPassword: '', newPassword: '' })

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'
  }

  const getDaysSinceJoined = (createdAt) => {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    return days
  }

  useEffect(() => {
    axios.get(`${base}/api/user/me`, { withCredentials: true }).then(r => setProfile(r.data))
    axios.get(`${base}/api/user/me/orders`, { withCredentials: true }).then(r => setOrders(r.data))
    axios.get(`${base}/api/user/me/wishlist`, { withCredentials: true }).then(r => setWishlist(r.data))
    axios.get(`${base}/api/user/me/addresses`, { withCredentials: true }).then(r => setAddresses(r.data))
  }, [])

  function removeFromWishlist(id) {
    axios.delete(`${base}/api/user/me/wishlist/${id}`, { withCredentials: true }).then(() => {
      setWishlist(wishlist.filter(w => w.product_id !== Number(id)))
    })
  }

  function saveAddress(e) {
    e.preventDefault()
    axios.post(`${base}/api/user/me/addresses`, addrForm, { withCredentials: true }).then(() => {
      setAddrForm({ full_name: '', phone: '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: false })
      return axios.get(`${base}/api/user/me/addresses`, { withCredentials: true })
    }).then(r => setAddresses(r.data))
  }

  function deleteAddress(id) {
    axios.delete(`${base}/api/user/me/addresses/${id}`, { withCredentials: true }).then(() => setAddresses(addresses.filter(a => a.id !== id)))
  }

  function changePassword(e) {
    e.preventDefault()
    axios.post(`${base}/api/user/me/change-password`, pw, { withCredentials: true }).then(() => {
      alert('Password changed')
      setPw({ oldPassword: '', newPassword: '' })
    }).catch(err => alert(err?.response?.data?.message || 'Failed'))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-heading mb-2 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent">
          Your Dashboard
        </h1>
        <p className="text-white/60">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2 mb-8 flex-wrap">
        <button 
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            tab==='profile'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`} 
          onClick={()=>setTab('profile')}
        >
          <User className="w-4 h-4" />
          Profile
        </button>
        <button 
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            tab==='orders'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`} 
          onClick={()=>setTab('orders')}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders
        </button>
        <button 
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            tab==='wishlist'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`} 
          onClick={()=>setTab('wishlist')}
        >
          <Heart className="w-4 h-4" />
          Wishlist
        </button>
        <button 
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            tab==='addresses'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`} 
          onClick={()=>setTab('addresses')}
        >
          <MapPin className="w-4 h-4" />
          Addresses
        </button>
        <button 
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            tab==='password'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20' 
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`} 
          onClick={()=>setTab('password')}
        >
          <KeyRound className="w-4 h-4" />
          Password
        </button>
      </div>

      {tab === 'profile' && (
        <div className="space-y-6">
          {profile ? (
            <>
              {/* Profile Header Card */}
              <div className="relative rounded-2xl bg-gradient-to-br from-white/10 via-white/5 to-transparent p-8 border border-white/10 overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-gold to-yellow-400 flex items-center justify-center text-3xl font-bold text-black shadow-lg shadow-brand-gold/30">
                      {getInitials(profile.name)}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-brand-gold border-4 border-[#0F0F0F] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-black" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-heading mb-2">{profile.name}</h2>
                    <div className="flex flex-wrap gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span>{profile.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="capitalize">{profile.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details Cards */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-white/60 uppercase tracking-wide">Full Name</div>
                      <div className="font-semibold text-lg">{profile.name}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-white/60 uppercase tracking-wide">Email Address</div>
                      <div className="font-semibold text-lg">{profile.email}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-white/60 uppercase tracking-wide">Account Role</div>
                      <div className="font-semibold text-lg capitalize">{profile.role}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-gold/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-brand-gold" />
                    </div>
                    <div>
                      <div className="text-xs text-white/60 uppercase tracking-wide">Member Since</div>
                      <div className="font-semibold text-lg">{new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div className="text-xs text-white/50 mt-1">{getDaysSinceJoined(profile.created_at)} days ago</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 p-6 border border-brand-gold/20">
                  <div className="flex items-center gap-3 mb-2">
                    <ShoppingBag className="w-5 h-5 text-brand-gold" />
                    <div className="text-2xl font-bold">{orders.length}</div>
                  </div>
                  <div className="text-sm text-white/70">Total Orders</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 p-6 border border-brand-gold/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-5 h-5 text-brand-gold" />
                    <div className="text-2xl font-bold">{wishlist.length}</div>
                  </div>
                  <div className="text-sm text-white/70">Wishlist Items</div>
                </div>
                <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 p-6 border border-brand-gold/20">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                    <div className="text-2xl font-bold">{addresses.length}</div>
                  </div>
                  <div className="text-sm text-white/70">Saved Addresses</div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl bg-white/5 p-8 border border-white/10 text-center">
              <div className="animate-pulse text-white/60">Loading profile...</div>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {orders.map(o => (
            <div key={o.id} className="rounded-xl overflow-hidden bg-white/5">
              <img src={o.image_url || 'https://placehold.co/600x600'} className="w-full aspect-video object-cover" />
              <div className="p-3 text-sm">
                <div className="font-medium">{o.name}</div>
                <div className="text-white/70">Qty {o.quantity} • ₹ {Number(o.total_price).toFixed(2)}</div>
                <div className="text-white/60">{new Date(o.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="text-white/70">No orders yet.</div>}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {wishlist.map(w => (
            <div key={w.product_id} className="rounded-xl overflow-hidden bg-white/5">
              <img src={w.image_url || 'https://placehold.co/600x600'} className="w-full aspect-square object-cover" />
              <div className="p-3 text-sm">
                <div className="font-medium">{w.name}</div>
                <div className="text-white/70">{w.weight} g • {w.metal_type}</div>
                <button className="btn mt-2" onClick={()=>removeFromWishlist(w.product_id)}>Remove</button>
              </div>
            </div>
          ))}
          {wishlist.length === 0 && <div className="text-white/70">Your wishlist is empty.</div>}
        </div>
      )}

      {tab === 'addresses' && (
        <div className="grid md:grid-cols-[1fr,360px] gap-6">
          <div className="space-y-3">
            {addresses.map(a => (
              <div key={a.id} className="rounded-xl bg-white/5 p-4 text-sm">
                <div className="font-medium">{a.full_name} {a.is_default ? <span className="ml-2 text-brand-gold">(Default)</span>: null}</div>
                <div className="text-white/70">{a.phone}</div>
                <div>{a.line1}{a.line2 ? `, ${a.line2}`: ''}</div>
                <div>{a.city}, {a.state} {a.postal_code}</div>
                <div>{a.country}</div>
                <button className="btn mt-2" onClick={()=>deleteAddress(a.id)}>Delete</button>
              </div>
            ))}
            {addresses.length === 0 && <div className="text-white/70">No addresses yet.</div>}
          </div>
          <form onSubmit={saveAddress} className="rounded-xl bg-white/5 p-4 grid gap-2">
            <input className="bg-white/10 p-2 rounded" placeholder="Full name" value={addrForm.full_name} onChange={e=>setAddrForm({...addrForm,full_name:e.target.value})} />
            <input className="bg-white/10 p-2 rounded" placeholder="Phone" value={addrForm.phone} onChange={e=>setAddrForm({...addrForm,phone:e.target.value})} />
            <input className="bg-white/10 p-2 rounded" placeholder="Address line 1" value={addrForm.line1} onChange={e=>setAddrForm({...addrForm,line1:e.target.value})} />
            <input className="bg-white/10 p-2 rounded" placeholder="Address line 2" value={addrForm.line2} onChange={e=>setAddrForm({...addrForm,line2:e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input className="bg-white/10 p-2 rounded" placeholder="City" value={addrForm.city} onChange={e=>setAddrForm({...addrForm,city:e.target.value})} />
              <input className="bg-white/10 p-2 rounded" placeholder="State" value={addrForm.state} onChange={e=>setAddrForm({...addrForm,state:e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="bg-white/10 p-2 rounded" placeholder="Postal code" value={addrForm.postal_code} onChange={e=>setAddrForm({...addrForm,postal_code:e.target.value})} />
              <input className="bg-white/10 p-2 rounded" placeholder="Country" value={addrForm.country} onChange={e=>setAddrForm({...addrForm,country:e.target.value})} />
            </div>
            <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={addrForm.is_default} onChange={e=>setAddrForm({...addrForm,is_default:e.target.checked})} /> Set as default</label>
            <button className="btn">Save Address</button>
          </form>
        </div>
      )}

      {tab === 'password' && (
        <form onSubmit={changePassword} className="max-w-md rounded-xl bg-white/5 p-4 grid gap-2">
          <input className="bg-white/10 p-2 rounded" placeholder="Current password" type="password" value={pw.oldPassword} onChange={e=>setPw({...pw,oldPassword:e.target.value})} />
          <input className="bg-white/10 p-2 rounded" placeholder="New password" type="password" value={pw.newPassword} onChange={e=>setPw({...pw,newPassword:e.target.value})} />
          <button className="btn">Change Password</button>
        </form>
      )}
    </div>
  )
}


