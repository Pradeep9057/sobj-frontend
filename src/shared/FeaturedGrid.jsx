import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { ArrowRight, Sparkles, Eye } from 'lucide-react'
import QuickView from './QuickView.jsx'

export default function FeaturedGrid() {
  const [products, setProducts] = useState([])
  const [prices, setPrices] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [showQuickView, setShowQuickView] = useState(false)
  const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'

  useEffect(() => {
    async function load() {
      try {
        const [productsRes, pricesRes] = await Promise.all([
          axios.get(`${base}/api/products`),
          axios.get(`${base}/api/prices`)
        ])
        
        const data = productsRes.data
        setPrices(pricesRes.data)
        
        // Filter out products with ₹0 price and get first 4 products with valid prices
        const productsWithPrice = data.filter(p => {
          // Calculate approximate price - products with weight and metal_type should have price > 0
          // Filter out products where price is explicitly 0 or null and no weight
          return (p.price && Number(p.price) > 0) || (p.weight && Number(p.weight) > 0 && p.metal_type)
        })
        setProducts(productsWithPrice.slice(0, 4))
      } catch (e) {
        setProducts([
          { id: 1, name: 'Gold Chain', image_url: 'https://placehold.co/600x600?text=Gold+1', category: 'Chains', weight: 20, metal_type: 'gold', purity: '22K', description: 'Elegant handcrafted gold chain', price: 50000 },
          { id: 2, name: 'Silver Coin', image_url: 'https://placehold.co/600x600?text=Silver+1', category: 'Coins', weight: 25, metal_type: 'silver', purity: '999', description: '999 purity silver coin', price: 2500 },
          { id: 3, name: 'Gold Ring', image_url: 'https://placehold.co/600x600?text=Gold+2', category: 'Rings', weight: 8, metal_type: 'gold', purity: '22K', description: 'Beautiful gold ring', price: 20000 },
          { id: 4, name: 'Earrings', image_url: 'https://placehold.co/600x600?text=Gold+3', category: 'Earrings', weight: 5, metal_type: 'gold', purity: '22K', description: 'Elegant gold earrings', price: 15000 }
        ])
      }
    }
    load()
  }, [base])

  // Calculate price for a product
  const calculatePrice = (product) => {
    if (product.price && Number(product.price) > 0) {
      return Number(product.price)
    }
    
    if (!product.weight || !product.metal_type || !prices.length) {
      return null
    }

    const purityKey = product.purity || (product.metal_type === 'gold' ? '22K' : '999')
    const pickGoldKey = purityKey === '24K' ? 'gold_24k' : 'gold_22k'
    const metalKey = product.metal_type === 'gold' ? pickGoldKey : 'silver'
    const entry = prices.find(p => p.metal === metalKey) || prices[0]
    const metalRate = entry ? Number(entry.rate_per_gram) : 0
    const weight = Number(product.weight) || 0
    const basePrice = metalRate * weight

    // Calculate making charges
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

    // Subtotal = base + making
    const subtotal = basePrice + makingCharges

    // GST (3%)
    const gst = subtotal * 0.03

    // Total = subtotal + GST
    const total = subtotal + gst

    return Math.round(total)
  }

  const handleQuickView = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    setQuickViewProduct(product)
    setShowQuickView(true)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group relative"
          >
            <Link
              to={`/products/${product.id}`}
              className="block rounded-xl md:rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 backdrop-blur"
            >
              <div className="relative aspect-square overflow-hidden">
                <motion.img
                  src={product.image_url || 'https://placehold.co/600x600'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  whileHover={{ scale: 1.1 }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Quick View Button */}
                <motion.button
                  onClick={(e) => handleQuickView(e, product)}
                  initial={{ opacity: 0, y: 10 }}
                  whileHover={{ opacity: 1, y: 0 }}
                  className="absolute top-4 right-4 px-3 py-2 rounded-lg bg-brand-gold/90 backdrop-blur text-black font-semibold text-xs md:text-sm flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-brand-gold hover:scale-105 shadow-lg"
                >
                  <Eye className="w-3 h-3 md:w-4 md:h-4" />
                  Quick View
                </motion.button>
                
                {/* Hover Overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="px-4 md:px-6 py-2 md:py-3 rounded-full bg-brand-gold/90 backdrop-blur text-black font-semibold text-sm md:text-base flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    View Details
                    <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                  </div>
                </motion.div>

                {/* Category Badge */}
                <div className="absolute top-3 md:top-4 left-3 md:left-4 px-2 md:px-3 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-semibold text-brand-gold border border-brand-gold/30">
                  {product.category || 'Featured'}
                </div>
              </div>

              <div className="p-4 md:p-6">
                <h3 className="font-semibold text-base md:text-lg mb-2 group-hover:text-brand-gold transition-colors">
                  {product.name}
                </h3>
                {product.weight && (
                  <p className="text-xs md:text-sm text-white/60">
                    {product.weight}g • {product.metal_type || 'Premium'}
                  </p>
                )}
                
                {/* Price */}
                {(() => {
                  const calculatedPrice = calculatePrice(product)
                  if (calculatedPrice !== null && calculatedPrice > 0) {
                    return (
                      <div className="mt-2 md:mt-3 text-brand-gold font-semibold text-sm md:text-base">
                        Starting from ₹{calculatedPrice.toLocaleString()}
                      </div>
                    )
                  }
                  return null
                })()}
              </div>

              {/* Shine Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity" />
            </Link>
          </motion.div>
        ))}
      </div>

      <QuickView
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false)
          setQuickViewProduct(null)
        }}
      />
    </>
  )
}
