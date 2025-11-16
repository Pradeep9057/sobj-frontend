import { useEffect, useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { 
  Search, Filter, SlidersHorizontal, Grid3x3, List, X, 
  Sparkles, Gem, Star, Heart, ShoppingBag, ArrowUpDown,
  TrendingUp, Award, RefreshCw, ChevronLeft, ChevronRight, Eye
} from 'lucide-react'
import { useAuth } from '../state/AuthContext.jsx'
import QuickView from '../shared/QuickView.jsx'
import ProductImageGallery from '../components/ProductImageGallery.jsx'

export default function Products() {
  const [items, setItems] = useState([])
  const [allItems, setAllItems] = useState([])
  const [params, setParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [prices, setPrices] = useState([])
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [showQuickView, setShowQuickView] = useState(false)
  const { user } = useAuth()
  const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'

  // Get unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(allItems.map(p => p.category).filter(Boolean))]
    return cats
  }, [allItems])

  async function load() {
    setLoading(true)
    try {
      const { data } = await axios.get(`${base}/api/products`, { params: Object.fromEntries(params) })
      setItems(data)
      setAllItems(data)
    } catch (e) {
      console.error('Error loading products:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [params])

  useEffect(() => {
    async function loadPrices() {
      try {
        const { data } = await axios.get(`${base}/api/prices`)
        setPrices(data)
      } catch (e) {}
    }
    loadPrices()
  }, [])

  // Calculate price for product
  const calculatePrice = (product) => {
    if (!prices.length) return null
    const purityKey = product.purity || (product.metal_type === 'gold' ? '22K' : '999')
    const pickGoldKey = purityKey === '24K' ? 'gold_24k' : 'gold_22k'
    const metalKey = product.metal_type === 'gold' ? pickGoldKey : 'silver'
    const entry = prices.find(p => p.metal === metalKey)
    if (!entry) return null
    
    const metalRate = Number(entry.rate_per_gram)
    const weight = Number(product.weight) || 0
    const basePrice = metalRate * weight

    let makingCharges = 0
    const makingChargesType = product.making_charges_type || 'fixed'
    const makingChargesValue = Number(product.making_charges_value) || 0

    if (makingChargesType === 'percentage') {
      makingCharges = (makingChargesValue / 100) * basePrice
    } else if (makingChargesType === 'per_gram') {
      makingCharges = makingChargesValue * weight
    } else {
      makingCharges = makingChargesValue
    }

    // Box charges - 0 for now (would need API call to fetch)
    const boxCharges = 0

    // Subtotal = base + making + box (margin removed)
    const subtotal = basePrice + makingCharges + boxCharges
    
    // Shipping charges (0.5% for orders < ₹50,000)
    let shippingCharges = 0
    if (subtotal < 50000) {
      shippingCharges = (basePrice + makingCharges) * 0.005
    }
    
    const gst = subtotal * 0.03
    const total = subtotal + gst + shippingCharges

    return { total: Number(total.toFixed(2)), metalRate }
  }

  // Filtered products based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query)
    )
  }, [items, searchQuery])


  function updateFilter(key, value) {
    const newParams = new URLSearchParams(params)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setParams(newParams)
  }

  function clearFilters() {
    setParams({})
    setSearchQuery('')
  }

  const activeFilters = {
    metal: params.get('metal'),
    category: params.get('category'),
    sort: params.get('sort')
  }

  const hasActiveFilters = Object.values(activeFilters).some(v => v)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <Gem className="w-5 h-5 md:w-6 md:h-6 text-brand-gold" />
          <span className="text-sm md:text-base text-brand-gold uppercase tracking-wider">Our Collection</span>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent">
          Premium Jewellery
        </h1>
        <p className="text-base md:text-lg text-white/60 max-w-2xl">
          Discover our exquisite collection of handcrafted gold and silver jewellery
        </p>
      </motion.div>


      {/* Search and Filters Bar */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            placeholder="Search products, categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 focus:border-brand-gold/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 text-white placeholder-white/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/50 flex items-center gap-2 text-sm transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-brand-gold" />
              )}
            </button>

            {/* Metal Filters */}
            <div className="hidden md:flex gap-2">
              <button
                onClick={() => updateFilter('metal', activeFilters.metal === 'gold' ? null : 'gold')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeFilters.metal === 'gold'
                    ? 'bg-brand-gold text-black'
                    : 'bg-white/5 border border-white/10 hover:border-brand-gold/50 text-white'
                }`}
              >
                Gold
              </button>
              <button
                onClick={() => updateFilter('metal', activeFilters.metal === 'silver' ? null : 'silver')}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  activeFilters.metal === 'silver'
                    ? 'bg-brand-gold text-black'
                    : 'bg-white/5 border border-white/10 hover:border-brand-gold/50 text-white'
                }`}
              >
                Silver
              </button>
            </div>

            {/* Category Filter */}
            {categories.length > 0 && (
              <select
                value={activeFilters.category || ''}
                onChange={(e) => updateFilter('category', e.target.value || null)}
                className="hidden md:block px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                ))}
              </select>
            )}

            {/* Sort */}
            <select
              value={activeFilters.sort || ''}
              onChange={(e) => updateFilter('sort', e.target.value || null)}
              className="hidden md:block px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-brand-gold/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
            >
              <option value="">Sort By</option>
              <option value="price_asc" className="bg-[#1a1a1a]">Price: Low to High</option>
              <option value="price_desc" className="bg-[#1a1a1a]">Price: High to Low</option>
              <option value="" className="bg-[#1a1a1a]">Newest First</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 text-white text-sm flex items-center gap-2 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 rounded-xl bg-white/5 border border-white/10 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-brand-gold text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-brand-gold text-black' : 'text-white/60 hover:text-white'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden rounded-xl bg-white/5 border border-white/10 p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold mb-2">Metal</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateFilter('metal', activeFilters.metal === 'gold' ? null : 'gold')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeFilters.metal === 'gold'
                        ? 'bg-brand-gold text-black'
                        : 'bg-white/5 border border-white/10 text-white'
                    }`}
                  >
                    Gold
                  </button>
                  <button
                    onClick={() => updateFilter('metal', activeFilters.metal === 'silver' ? null : 'silver')}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeFilters.metal === 'silver'
                        ? 'bg-brand-gold text-black'
                        : 'bg-white/5 border border-white/10 text-white'
                    }`}
                  >
                    Silver
                  </button>
                </div>
              </div>
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Category</label>
                  <select
                    value={activeFilters.category || ''}
                    onChange={(e) => updateFilter('category', e.target.value || null)}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-2">Sort By</label>
                <select
                  value={activeFilters.sort || ''}
                  onChange={(e) => updateFilter('sort', e.target.value || null)}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/20"
                >
                  <option value="">Newest First</option>
                  <option value="price_asc" className="bg-[#1a1a1a]">Price: Low to High</option>
                  <option value="price_desc" className="bg-[#1a1a1a]">Price: High to Low</option>
                </select>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm md:text-base text-white/60">
          {loading ? 'Loading...' : `${filteredItems.length} product${filteredItems.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Products Grid/List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="w-8 h-8 text-brand-gold" />
          </motion.div>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <Gem className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No products found</h3>
          <p className="text-white/60 mb-6">Try adjusting your filters or search query</p>
          <button
            onClick={clearFilters}
            className="px-6 py-3 rounded-xl bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((product, index) => {
              const priceInfo = calculatePrice(product)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative"
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="block rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 backdrop-blur h-full"
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <ProductImageGallery
                        product={product}
                        onQuickView={(p) => {
                          setQuickViewProduct({ ...p, calculatedPrice: priceInfo })
                          setShowQuickView(true)
                        }}
                      />
                      
                      {product.category && (
                        <div className="absolute top-3 left-3 z-10 px-2 py-1 rounded-full bg-black/50 backdrop-blur text-xs font-semibold text-brand-gold border border-brand-gold/30">
                          {product.category}
                        </div>
                      )}
                      
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-red-500/90 backdrop-blur text-xs font-bold text-white">
                          Low Stock
                        </div>
                      )}
                      
                      {product.stock === 0 && (
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-gray-500/90 backdrop-blur text-xs font-bold text-white">
                          Out of Stock
                        </div>
                      )}
                    </div>

                    <div className="p-4 md:p-6">
                      <h3 className="font-semibold text-base md:text-lg mb-2 line-clamp-2 group-hover:text-brand-gold transition-colors">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs md:text-sm text-white/60">
                          {product.weight}g • {product.purity || 'N/A'} • {product.metal_type}
                        </p>
                      </div>
                      {priceInfo ? (
                        <div className="flex items-center justify-between mt-3">
                          <div>
                            <p className="text-brand-gold font-bold text-lg md:text-xl">
                              ₹{priceInfo.total.toLocaleString()}
                            </p>
                            {priceInfo.metalRate && (
                              <p className="text-xs text-white/50">
                                @ ₹{priceInfo.metalRate}/g
                              </p>
                            )}
                          </div>
                          {product.stock > 0 && (
                            <div className="px-3 py-1 rounded-lg bg-brand-gold/20 text-brand-gold text-xs font-semibold">
                              In Stock
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-white/60 text-sm mt-3">Price on calculation</p>
                      )}
                    </div>

                    {/* Shine Effect */}
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity" />
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredItems.map((product, index) => {
              const priceInfo = calculatePrice(product)
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  layout
                >
                  <Link
                    to={`/products/${product.id}`}
                    className="block rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 backdrop-blur"
                  >
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                      <div className="relative w-full md:w-48 h-48 md:h-auto aspect-square md:aspect-auto overflow-hidden flex-shrink-0 rounded-xl">
                        <ProductImageGallery 
                          product={product}
                          onQuickView={(p) => {
                            setQuickViewProduct(p)
                            setShowQuickView(true)
                          }}
                        />
                      </div>
                      <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-lg md:text-xl mb-2">
                                {product.name}
                              </h3>
                              <p className="text-sm md:text-base text-white/60">
                                {product.description || 'Premium quality jewellery piece'}
                              </p>
                            </div>
                            {product.category && (
                              <span className="px-3 py-1 rounded-full bg-brand-gold/20 text-brand-gold text-xs font-semibold whitespace-nowrap">
                                {product.category}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/60">
                            <span>{product.weight}g</span>
                            <span>•</span>
                            <span>{product.purity || 'N/A'}</span>
                            <span>•</span>
                            <span className="capitalize">{product.metal_type}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          {priceInfo ? (
                            <div>
                              <p className="text-brand-gold font-bold text-xl md:text-2xl">
                                ₹{priceInfo.total.toLocaleString()}
                              </p>
                              {priceInfo.metalRate && (
                                <p className="text-xs text-white/50 mt-1">
                                  @ ₹{priceInfo.metalRate}/g
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-white/60">Price on calculation</p>
                          )}
                          <div className="flex items-center gap-2">
                            {product.stock > 0 ? (
                              <span className="px-3 py-1 rounded-lg bg-brand-gold/20 text-brand-gold text-xs font-semibold">
                                In Stock
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-lg bg-gray-500/20 text-gray-400 text-xs font-semibold">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Quick View Modal */}
      <QuickView
        product={quickViewProduct}
        isOpen={showQuickView}
        onClose={() => {
          setShowQuickView(false)
          setQuickViewProduct(null)
        }}
      />
    </div>
  )
}
