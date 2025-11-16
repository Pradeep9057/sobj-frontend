import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Heart, ShoppingBag, ZoomIn } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext.jsx'
import axios from 'axios'

export default function QuickView({ product, isOpen, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const { user } = useAuth()
  const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'

  // Get product images from database - use images array if available, otherwise fallback to image_url
  const productImages = (() => {
    if (!product) return []
    
    // Use actual product images from database if available
    if (product.images && product.images.length > 0) {
      return product.images
    }
    
    // Fallback to image_url if no images array
    if (product.image_url) {
      return [product.image_url]
    }
    
    return ['https://placehold.co/600x600']
  })()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setCurrentImageIndex(0)
      setIsZoomed(false)
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') previousImage()
      if (e.key === 'ArrowRight') nextImage()
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const nextImage = () => {
    if (productImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % productImages.length)
    }
  }

  const previousImage = () => {
    if (productImages.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)
    }
  }

  // Auto-slide functionality (optional - can be enabled)
  useEffect(() => {
    if (!isOpen || productImages.length <= 1) return

    // Optional: Auto-advance images every 5 seconds
    // Uncomment below to enable auto-slide
    // const interval = setInterval(() => {
    //   nextImage()
    // }, 5000)
    
    // return () => clearInterval(interval)
  }, [isOpen, productImages.length])

  async function addToWishlist() {
    if (!user) {
      alert('Please login to add to wishlist')
      return
    }
    try {
      await axios.post(`${base}/api/user/me/wishlist`, { product_id: product.id }, { withCredentials: true })
      alert('Added to wishlist!')
    } catch (e) {
      alert('Error adding to wishlist')
    }
  }

  if (!product || !isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#1a1a1a] to-[#0F0F0F] rounded-3xl border border-white/10 overflow-hidden pointer-events-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur border border-white/10 hover:border-brand-gold/50 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid md:grid-cols-2 gap-6 md:gap-8 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
                {/* Image Gallery */}
                <div className="space-y-4">
                  {/* Main Image with Sliding Animation */}
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentImageIndex}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ 
                          duration: 0.4,
                          ease: [0.4, 0, 0.2, 1]
                        }}
                        className="absolute inset-0"
                      >
                        <motion.img
                          src={productImages[currentImageIndex]}
                          alt={`${product.name} - Image ${currentImageIndex + 1}`}
                          className={`w-full h-full object-cover cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
                          onClick={() => setIsZoomed(!isZoomed)}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        />
                      </motion.div>
                    </AnimatePresence>
                    
                    {/* Zoom Indicator */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Navigation Arrows - Always visible when multiple images */}
                    {productImages.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            previousImage()
                          }}
                          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all hover:scale-110 hover:bg-black/90 shadow-lg"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            nextImage()
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all hover:scale-110 hover:bg-black/90 shadow-lg"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-6 h-6" />
                        </button>
                      </>
                    )}

                    {/* Image Counter & Dots */}
                    {productImages.length > 1 && (
                      <>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
                          <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur text-sm text-white font-semibold shadow-lg">
                            {currentImageIndex + 1} / {productImages.length}
                          </div>
                          {/* Dot Indicators */}
                          <div className="flex gap-2">
                            {productImages.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentImageIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  currentImageIndex === index
                                    ? 'bg-brand-gold w-6'
                                    : 'bg-white/40 hover:bg-white/60'
                                }`}
                                aria-label={`Go to image ${index + 1}`}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Zoomed Overlay */}
                    {isZoomed && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-8"
                        onClick={() => setIsZoomed(false)}
                      >
                        <motion.img
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          src={productImages[currentImageIndex]}
                          alt={product.name}
                          className="max-w-full max-h-full object-contain rounded-xl"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Thumbnail Gallery with Smooth Transitions */}
                  {productImages.length > 1 && (
                    <div className="space-y-2">
                      <div className="text-xs text-white/60 mb-2">Click thumbnail to view</div>
                      <div className="grid grid-cols-5 gap-2">
                        {productImages.map((img, index) => (
                          <motion.button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              currentImageIndex === index
                                ? 'border-brand-gold scale-105 shadow-lg shadow-brand-gold/30'
                                : 'border-white/10 hover:border-white/30 hover:scale-105'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <img
                              src={img}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {currentImageIndex === index && (
                              <motion.div 
                                className="absolute inset-0 bg-brand-gold/30 border-2 border-brand-gold"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex flex-col space-y-6">
                  <div>
                    {product.category && (
                      <span className="inline-block px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-semibold mb-3">
                        {product.category}
                      </span>
                    )}
                    <h2 className="text-3xl md:text-4xl font-heading mb-4">{product.name}</h2>
                    {product.description && (
                      <p className="text-white/70 leading-relaxed mb-4">{product.description}</p>
                    )}
                  </div>

                  {/* Product Specs */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Weight</span>
                      <span className="font-semibold">{product.weight}g</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Purity</span>
                      <span className="font-semibold">{product.purity || 'N/A'}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-white/10">
                      <span className="text-white/60">Metal Type</span>
                      <span className="font-semibold capitalize">{product.metal_type}</span>
                    </div>
                    {product.stock !== undefined && (
                      <div className="flex items-center justify-between py-2 border-b border-white/10">
                        <span className="text-white/60">Stock</span>
                        <span className={`font-semibold ${product.stock > 0 ? 'text-brand-gold' : 'text-red-400'}`}>
                          {product.stock > 0 ? `${product.stock} available` : 'Out of Stock'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="rounded-2xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/20 p-6">
                    <p className="text-white/60 text-sm mb-2">Starting from</p>
                    {product.calculatedPrice ? (
                      <div>
                        <p className="text-3xl md:text-4xl font-bold text-brand-gold">
                          ₹{product.calculatedPrice.total.toLocaleString()}
                        </p>
                        {product.calculatedPrice.metalRate && (
                          <p className="text-xs text-white/50 mt-1">
                            @ ₹{product.calculatedPrice.metalRate}/g
                          </p>
                        )}
                      </div>
                    ) : product.price ? (
                      <p className="text-3xl md:text-4xl font-bold text-brand-gold">
                        ₹{Number(product.price).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-xl md:text-2xl font-semibold text-brand-gold">
                        Price calculated on selection
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/products/${product.id}`}
                      onClick={onClose}
                      className="flex-1 px-6 py-4 rounded-xl bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-gold/50 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-5 h-5" />
                      View Full Details
                    </Link>
                    <button
                      onClick={addToWishlist}
                      className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/50 hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-white"
                    >
                      <Heart className="w-5 h-5" />
                      <span className="hidden sm:inline">Wishlist</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

