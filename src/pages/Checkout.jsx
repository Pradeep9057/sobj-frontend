import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../state/CartContext.jsx'
import { useAuth } from '../state/AuthContext.jsx'
import axiosInstance from '../utils/axios.js'
import { MapPin, CreditCard, CheckCircle, AlertCircle } from 'lucide-react'

export default function Checkout() {
  const { items, totals, clear } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [addressForm, setAddressForm] = useState({
    full_name: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
    is_default: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const base = import.meta.env.VITE_API_BASE

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    if (items.length === 0) {
      navigate('/cart')
      return
    }

    loadAddresses()
  }, [user, items.length, navigate])

  async function loadAddresses() {
    try {
      const { data } = await axiosInstance.get(`${base}/api/user/me/addresses`)
      setAddresses(data)
      const defaultAddr = data.find(a => a.is_default) || data[0]
      if (defaultAddr) setSelectedAddress(defaultAddr.id)
    } catch (err) {
      console.error('Failed to load addresses:', err)
    }
  }

  async function saveAddress(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await axiosInstance.post(`${base}/api/user/me/addresses`, addressForm)
      setAddressForm({
        full_name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        is_default: false
      })
      setShowAddressForm(false)
      await loadAddresses()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save address')
    } finally {
      setLoading(false)
    }
  }

  async function handlePayment() {
    if (!selectedAddress) {
      setError('Please select a shipping address')
      return
    }

    const address = addresses.find(a => a.id === selectedAddress)
    if (!address) {
      setError('Invalid address selected')
      return
    }

    setPaymentLoading(true)
    setError('')

    try {
      // Step 1: Create order in database first (with pending payment)
      const orderResponse = await axiosInstance.post(`${base}/api/user/me/orders`, {
        items,
        shipping_address: address,
        razorpay_order_id: null
      })

      const orderId = orderResponse.data.id

      // Step 2: Create Razorpay order
      const razorpayResponse = await axiosInstance.post(`${base}/api/payments/create-order`, {
        amount: totals.total,
        receipt: `order_${orderId}_${Date.now()}`
      })

      const razorpayOrderId = razorpayResponse.data.id

      // Step 3: Update order with Razorpay order ID
      await axiosInstance.put(`${base}/api/user/me/orders/${orderId}`, {
        razorpay_order_id: razorpayOrderId
      })

      // Step 4: Initialize Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(totals.total * 100), // Convert to paise
        currency: 'INR',
        name: 'Sonaura',
        description: 'Jewellery Purchase',
        order_id: razorpayOrderId,
        handler: async function (response) {
          try {
            // Step 5: Verify payment and update order
            await axiosInstance.post(`${base}/api/payments/verify`, {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              orderId: orderId
            })

            // Clear cart and redirect
            clear()
            navigate(`/dashboard?order=${orderId}&success=true`)
          } catch (err) {
            setError(err?.response?.data?.message || 'Payment verification failed')
            setPaymentLoading(false)
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone
        },
        theme: {
          color: '#D4AF37'
        },
        modal: {
          ondismiss: function() {
            setPaymentLoading(false)
            setError('Payment cancelled')
          }
        }
      }

      const razorpay = window.Razorpay(options)
      razorpay.open()
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to initialize payment')
      setPaymentLoading(false)
    }
  }

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (items.length === 0) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-heading mb-6">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-[1fr,400px] gap-8">
        {/* Left Column - Address Selection */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white/5 p-6 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-gold" />
              Shipping Address
            </h2>

            {addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map(addr => (
                  <label
                    key={addr.id}
                    className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedAddress === addr.id
                        ? 'border-brand-gold bg-brand-gold/10'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold">{addr.full_name}</div>
                      <div className="text-sm text-white/70">{addr.phone}</div>
                      <div className="text-sm text-white/70">
                        {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}
                      </div>
                      <div className="text-sm text-white/70">
                        {addr.city}, {addr.state} {addr.postal_code}
                      </div>
                      {addr.is_default && (
                        <span className="text-xs text-brand-gold">(Default)</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm ? (
              <form onSubmit={saveAddress} className="space-y-3">
                <input
                  required
                  className="w-full bg-white/10 p-3 rounded-lg"
                  placeholder="Full Name"
                  value={addressForm.full_name}
                  onChange={e => setAddressForm({...addressForm, full_name: e.target.value})}
                />
                <input
                  required
                  className="w-full bg-white/10 p-3 rounded-lg"
                  placeholder="Phone"
                  value={addressForm.phone}
                  onChange={e => setAddressForm({...addressForm, phone: e.target.value})}
                />
                <input
                  required
                  className="w-full bg-white/10 p-3 rounded-lg"
                  placeholder="Address Line 1"
                  value={addressForm.line1}
                  onChange={e => setAddressForm({...addressForm, line1: e.target.value})}
                />
                <input
                  className="w-full bg-white/10 p-3 rounded-lg"
                  placeholder="Address Line 2"
                  value={addressForm.line2}
                  onChange={e => setAddressForm({...addressForm, line2: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    className="bg-white/10 p-3 rounded-lg"
                    placeholder="City"
                    value={addressForm.city}
                    onChange={e => setAddressForm({...addressForm, city: e.target.value})}
                  />
                  <input
                    required
                    className="bg-white/10 p-3 rounded-lg"
                    placeholder="State"
                    value={addressForm.state}
                    onChange={e => setAddressForm({...addressForm, state: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    className="bg-white/10 p-3 rounded-lg"
                    placeholder="Postal Code"
                    value={addressForm.postal_code}
                    onChange={e => setAddressForm({...addressForm, postal_code: e.target.value})}
                  />
                  <input
                    required
                    className="bg-white/10 p-3 rounded-lg"
                    placeholder="Country"
                    value={addressForm.country}
                    onChange={e => setAddressForm({...addressForm, country: e.target.value})}
                  />
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={addressForm.is_default}
                    onChange={e => setAddressForm({...addressForm, is_default: e.target.checked})}
                  />
                  Set as default address
                </label>
                <div className="flex gap-3">
                  <button type="submit" disabled={loading} className="btn flex-1">
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddressForm(true)}
                className="w-full px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
              >
                + Add New Address
              </button>
            )}
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="rounded-xl bg-white/5 p-6 border border-white/10 sticky top-24">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-white/70">Subtotal</span>
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
                  <span className="text-white/70">Shipping</span>
                  <span className="font-semibold">₹ {totals.shippingCharges.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-white/60 text-xs">Shipping</span>
                  <span className="text-green-400 text-xs font-semibold">Free (Order ≥ ₹50,000)</span>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-white/10 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-brand-gold">₹ {totals.total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handlePayment}
              disabled={!selectedAddress || paymentLoading}
              className="w-full btn flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CreditCard className="w-5 h-5" />
              {paymentLoading ? 'Processing...' : 'Proceed to Payment'}
            </button>
            {!selectedAddress && (
              <p className="text-xs text-red-400 mt-2 text-center">Please select a shipping address</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

