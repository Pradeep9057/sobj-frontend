import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import axios from 'axios'
import { useCart } from '../state/CartContext.jsx'
import { Heart, ShoppingBag, Sparkles, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductImageGalleryDetail from '../components/ProductImageGalleryDetail.jsx'
import { useAuth } from '../state/AuthContext.jsx'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [prices, setPrices] = useState([])
  const [boxItem, setBoxItem] = useState(null)
  const [loading, setLoading] = useState(true)
  const { add } = useCart()
  const { user } = useAuth()
  const base = import.meta.env.VITE_API_BASE// || 'http://localhost:5000'

  useEffect(() => {
    async function loadProduct() {
      setLoading(true)
      try {
        const { data } = await axios.get(`${base}/api/products/${id}`)
        setProduct(data)
        // Ensure images array exists
        if (data && !data.images) {
          data.images = data.image_url ? [data.image_url] : []
        }
      } catch (e) {
        console.error('Error loading product:', e)
      } finally {
        setLoading(false)
      }
    }
    
    loadProduct()
    axios.get(`${base}/api/prices`).then(r => setPrices(r.data))
  }, [id, base])

  // Fetch box item if box_sku exists
  useEffect(() => {
    if (product && product.box_sku) {
      axios.get(`${base}/api/items/sku/${product.box_sku}`)
        .then(r => setBoxItem(r.data))
        .catch(() => setBoxItem(null))
    } else {
      setBoxItem(null)
    }
  }, [product, base])

  const computed = useMemo(() => {
    if (!product || !prices.length) return null
    const purityKey = product.purity || (product.metal_type === 'gold' ? '22K' : '999')
    const pickGoldKey = purityKey === '24K' ? 'gold_24k' : 'gold_22k'
    const metalKey = product.metal_type === 'gold' ? pickGoldKey : 'silver'
    const entry = prices.find(p => p.metal === metalKey) || prices[0]
    const metalRate = entry ? Number(entry.rate_per_gram) : 0
    const weight = Number(product.weight) || 0
    const basePrice = metalRate * weight

    // Calculate making charges based on type
    let makingCharges = 0
    const makingChargesType = product.making_charges_type || 'fixed'
    const makingChargesValue = Number(product.making_charges_value) || 0

    if (makingChargesType === 'percentage') {
      makingCharges = (makingChargesValue / 100) * basePrice
    } else if (makingChargesType === 'per_gram') {
      makingCharges = makingChargesValue * weight
    } else {
      makingCharges = makingChargesValue || Math.max(500, weight * 50)
    }

    // Box charges (fetched from API if box_sku exists)
    const boxCharges = boxItem && boxItem.rate ? Number(boxItem.rate) : 0

    // Subtotal = base + making + box
    const subtotal = basePrice + makingCharges + boxCharges

    // GST (3%)
    const gst = subtotal * 0.03

    // NOTE: shipping is intentionally NOT calculated here anymore.
    // Shipping will be calculated at cart level (order-level rule).

    // Total = subtotal + GST (no shipping here)
    const total = subtotal + gst

    return { 
      base: basePrice, 
      making: makingCharges, 
      box: boxCharges,
      gst, 
      subtotal,
      total, 
      rate: metalRate 
    }
  }, [product, prices, boxItem])

  async function addWishlist() {
    if (!user) {
      alert('Please login to add to wishlist')
      return
    }
    try {
      await axios.post(`${base}/api/user/me/wishlist`, { product_id: product.id }, { withCredentials: true })
      alert('Added to wishlist!')
    } catch (e) {
      alert('Error adding to wishlist: ' + (e.response?.data?.message || e.message))
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-brand-gold" />
        </motion.div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 text-center">
        <h2 className="text-2xl font-heading mb-4">Product Not Found</h2>
        <Link to="/products" className="btn inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
      </div>
    )
  }

  // Get primary image for cart
  const primaryImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : product.image_url || 'https://placehold.co/800x800'

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
      {/* Back Button */}
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-white/70 hover:text-brand-gold transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        {/* Image Gallery Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <ProductImageGalleryDetail product={product} />
        </motion.div>

        {/* Product Details Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Category Badge */}
          {product.category && (
            <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-sm font-semibold">
              {product.category}
            </span>
          )}

          {/* Product Name */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading">{product.name}</h1>

          {/* Description */}
          {product.description && (
            <p className="text-white/70 leading-relaxed text-base md:text-lg">{product.description}</p>
          )}

          {/* Product Specs */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div>
              <div className="text-sm text-white/60 mb-1">Weight</div>
              <div className="font-semibold">{product.weight}g</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Purity</div>
              <div className="font-semibold">{product.purity || 'N/A'}</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Metal Type</div>
              <div className="font-semibold capitalize">{product.metal_type}</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Stock</div>
              <div className={`font-semibold ${product.stock > 0 ? 'text-brand-gold' : 'text-red-400'}`}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
              </div>
            </div>
          </div>

          {/* Price Calculation */}
          {computed ? (
            <div className="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/20">
              <h3 className="font-semibold text-lg mb-4">Price Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/70">Metal Rate</span>
                  <span className="font-semibold">₹ {computed.rate.toFixed(2)} / g</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Base Price ({product.weight}g)</span>
                  <span className="font-semibold">₹ {computed.base.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Making Charges</span>
                  <span className="font-semibold">₹ {computed.making.toFixed(2)}</span>
                </div>
                {computed.box > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-white/70">Box/Packing Charges</span>
                    <span className="font-semibold">₹ {computed.box.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-white/70">GST (3%)</span>
                  <span className="font-semibold">₹ {computed.gst.toFixed(2)}</span>
                </div>

                {/* Shipping intentionally not shown here - cart-level calculation */}
                <div className="flex justify-between pt-3 border-t border-brand-gold/20">
                  <span className="text-lg font-bold">Total Price</span>
                  <span className="text-2xl font-bold text-brand-gold">₹ {computed.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <p className="text-white/60">Price will be calculated based on current metal rates</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => add({
                id: product.id,
                name: product.name,
                weight: product.weight,
                metal_type: product.metal_type,
                image_url: primaryImage,
                qty: 1
              })}
              disabled={product.stock === 0}
              className="flex-1 px-6 py-4 rounded-xl bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-gold/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <ShoppingBag className="w-5 h-5" />
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={addWishlist}
              className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white"
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t border-white/10 text-sm text-white/60">
            <p>• Free shipping on orders above ₹50,000</p>
            <p>• Certified purity with BIS hallmark</p>
            <p>• 30-day return policy</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
