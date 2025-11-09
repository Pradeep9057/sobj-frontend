import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

export default function ProductImageGalleryDetail({ product }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  
  // Get product images - use images array if available, otherwise fallback to image_url
  const images = product?.images && product.images.length > 0
    ? product.images
    : product?.image_url
      ? [product.image_url]
      : ['https://placehold.co/800x800']

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [images.length])

  if (images.length === 0) {
    return (
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10">
        <img
          src="https://placehold.co/800x800"
          alt="No image"
          className="w-full h-full object-cover"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display with Sliding Animation */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 group">
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
                className="w-full h-full object-cover cursor-zoom-in"
                onClick={() => setIsZoomed(true)}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Arrows - Show when multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter & Dot Indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
            <div className="px-4 py-2 rounded-full bg-black/70 backdrop-blur text-sm text-white font-semibold shadow-lg">
              {currentIndex + 1} / {images.length}
            </div>
            {/* Dot Indicators */}
            <div className="flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index
                      ? 'bg-brand-gold w-6'
                      : 'bg-white/40 hover:bg-white/60 w-2'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Zoom Indicator */}
        {images.length === 1 && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur flex items-center justify-center border border-white/20">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </div>
        )}

        {/* Zoomed Overlay */}
        <AnimatePresence>
          {isZoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-8 cursor-zoom-out"
              onClick={() => setIsZoomed(false)}
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                src={images[currentIndex]}
                alt={product?.name}
                className="max-w-full max-h-full object-contain rounded-xl"
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={() => setIsZoomed(false)}
                className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/70 backdrop-blur border border-white/20 hover:border-brand-gold/50 flex items-center justify-center text-white transition-all"
              >
                <ZoomOut className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnail Gallery - Show when multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-5 gap-3">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === index
                  ? 'border-brand-gold scale-105 shadow-lg shadow-brand-gold/20'
                  : 'border-white/10 hover:border-white/30 hover:scale-105'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {currentIndex === index && (
                <div className="absolute inset-0 bg-brand-gold/30 border-2 border-brand-gold" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

