import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../state/CartContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import axios from 'axios'

export default function Cart() {
  const { items, setQty, remove, totals, refreshPrices, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleBuy() {
    if (!user) {
      navigate('/login')
      return
    }

    if (items.length === 0) {
      setError('Your cart is empty')
      return
    }

    // Redirect to checkout page
    navigate('/checkout')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Your Cart</h1>
      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <div className="text-white/70 text-lg mb-2">Your cart is empty.</div>
          <a href="/products" className="text-brand-gold hover:underline">Continue Shopping</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-[1fr,380px] gap-8">
          <div className="space-y-4">
            {items.map(it => (
              <div key={it.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/30 transition-colors">
                <img src={it.image_url || 'https://placehold.co/120'} className="w-24 h-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <div className="font-semibold text-lg mb-1">{it.name}</div>
                  <div className="text-white/70 text-sm mb-2">{it.weight} g • {it.metal_type}</div>
                  {/* <div className="text-brand-gold font-semibold">₹ {((it.weight || 0) * 10497.43 * (it.qty || 1)).toFixed(2)}</div> */}
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setQty(it.id, Math.max(1, (it.qty || 1) - 1))}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input 
                    type="number" 
                    min="1" 
                    className="w-16 bg-white/10 rounded-lg p-2 text-center font-semibold" 
                    value={it.qty} 
                    onChange={e => setQty(it.id, Math.max(1, Number(e.target.value) || 1))} 
                  />
                  <button 
                    onClick={() => setQty(it.id, (it.qty || 1) + 1)}
                    className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button 
                  className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors" 
                  onClick={() => remove(it.id)}
                  title="Remove"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 h-fit sticky top-24">
            <div className="text-xl font-heading mb-4">Order Summary</div>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-white/70">Metal</span>
                <span className="font-semibold">₹ {totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/70">Making Charges</span>
                <span className="font-semibold">₹ {totals.making.toFixed(2)}</span>
              </div>
              {totals.boxCharges > 0 && (
                <div className="flex justify-between">
                  <span className="text-white/70">Box/Packing</span>
                  <span className="font-semibold">₹ {totals.boxCharges.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-white/70">GST (3%)</span>
                <span className="font-semibold">₹ {totals.gst.toFixed(2)}</span>
              </div>
              {totals.shippingCharges > 0 ? (
                <div className="flex justify-between">
                  <span className="text-white/70">Shipping Charges (0.5%)</span>
                  <span className="font-semibold">₹ {totals.shippingCharges.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs">Shipping</span>
                  <span className="text-green-400 text-xs font-semibold">Free (Order ≥ ₹50,000)</span>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-white/10 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-brand-gold">₹ {totals.total.toFixed(2)}</span>
              </div>
            </div>
            {error && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}
            <button 
              onClick={handleBuy}
              disabled={loading || items.length === 0}
              className="w-full btn flex items-center justify-center gap-2 mb-3 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5" />
              {loading ? 'Placing Order...' : 'Buy Now'}
            </button>
            <button 
              className="w-full px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-sm"
              onClick={refreshPrices}
            >
              Refresh Live Rates
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


