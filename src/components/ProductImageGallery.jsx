import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Eye } from 'lucide-react'

export default function ProductImageGallery({ product, onQuickView }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  
  // Get product images - use images array if available, otherwise fallback to image_url
  const images = product?.images && product.images.length > 0
    ? product.images
    : product?.image_url
      ? [product.image_url]
      : ['https://placehold.co/600x600']

  useEffect(() => {
    if (!isHovering || images.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length)
    }, 2000) // Change image every 2 seconds on hover

    return () => clearInterval(interval)
  }, [isHovering, images.length])

  const goToPrevious = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const handleQuickViewClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onQuickView) {
      onQuickView(product)
    }
  }

  return (
    <div 
      className="relative aspect-square overflow-hidden group"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Image Carousel with Smooth Sliding */}
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ 
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className="absolute inset-0"
          >
            <motion.img
              src={images[currentIndex]}
              alt={`${product?.name || 'Product'} - Image ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              whileHover={{ scale: 1.05 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Show on hover */}
      {images.length > 1 && isHovering && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all hover:scale-110"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </>
      )}

      {/* Quick View Button */}
      {isHovering && onQuickView && (
        <button
          onClick={handleQuickViewClick}
          className="absolute top-2 right-2 z-10 px-3 py-1.5 rounded-lg bg-brand-gold/90 backdrop-blur text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-brand-gold transition-all hover:scale-105"
        >
          <Eye className="w-3 h-3" />
          Quick View
        </button>
      )}

      {/* Image Counter & Multiple Images Indicator */}
      {images.length > 1 && (
        <>
          {isHovering && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur text-xs text-white font-semibold shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
          )}
          {/* Always visible indicator when not hovering */}
          {!isHovering && (
            <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-full bg-brand-gold/90 text-black text-xs font-bold shadow-lg">
              {images.length} Images
            </div>
          )}
        </>
      )}

      {/* Image Indicators (dots) */}
      {images.length > 1 && images.length <= 5 && isHovering && (
        <div className="absolute bottom-2 right-2 flex gap-1.5 z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setCurrentIndex(index)
              }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                currentIndex === index
                  ? 'bg-brand-gold w-4'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

