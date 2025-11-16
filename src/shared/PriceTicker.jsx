import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import axios from 'axios'
import { TrendingUp, RefreshCw, DollarSign } from 'lucide-react'

export default function PriceTicker() {
  const [prices, setPrices] = useState([])
  const [ts, setTs] = useState('')
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  async function load(manualRefresh = false) {
    try {
      setLoading(true)
      const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'
      const { data } = await axios.get(`${base}/api/prices`)
      setPrices(data)
      
      // Get the actual updated_at timestamp from the API response
      if (data.length > 0) {
        // Find the most recent updated_at from all prices
        const latestUpdate = data.reduce((latest, price) => {
          if (price.updated_at) {
            const updateTime = new Date(price.updated_at).getTime()
            return updateTime > latest ? updateTime : latest
          }
          return latest
        }, 0)
        
        if (latestUpdate > 0) {
          setLastUpdate(latestUpdate)
          setTs(new Date(latestUpdate).toLocaleString())
        } else {
          // Fallback to current time only if no updated_at available
          setTs(new Date().toLocaleString())
        }
      } else {
        setTs(new Date().toLocaleString())
      }
    } catch (e) {
      // ignore in demo
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Auto-refresh hourly (60 * 60 * 1000 ms)
    const id = setInterval(() => {
      load(false)
    }, 60 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const priceVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl border border-white/10 p-6 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-lg shadow-2xl overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-brand-gold/5 via-transparent to-brand-gold/5 opacity-50" />
      <div className="absolute top-0 left-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl -translate-x-16 -translate-y-16" />
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-brand-gold/10 rounded-full blur-3xl translate-x-16 translate-y-16" />

      <div className="relative z-10">
        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-gold/20 flex items-center justify-center flex-shrink-0">
              <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-brand-gold" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-base md:text-lg flex items-center gap-2">
                  Live Metal Prices
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={loading ? 'opacity-100' : 'opacity-0'}
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4 text-brand-gold" />
                  </motion.div>
                </h3>
              </div>
              <p className="text-xs md:text-sm text-white/60 truncate">
                Last updated {ts || '—'}
              </p>
            </div>
          </div>

          {/* Prices - Better mobile layout */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
            {prices.length > 0 ? (
              prices.map((price, index) => (
                <motion.div
                  key={price.metal}
                  initial="initial"
                  animate="animate"
                  variants={priceVariants}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <div className="relative px-4 py-3 md:px-4 md:py-2 rounded-lg bg-white/5 border border-white/10 group-hover:border-brand-gold/50 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-brand-gold flex-shrink-0" />
                      <span className="text-xs text-white/60 uppercase tracking-wider truncate">
                        {price.metal.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-lg md:text-xl font-bold text-brand-gold">
                      ₹{Number(price.rate_per_gram).toFixed(2)}
                      <span className="text-xs md:text-sm text-white/60 font-normal ml-1">/g</span>
                    </div>
                    
                    {/* Hover Glow */}
                    <div className="absolute inset-0 rounded-lg bg-brand-gold/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-white/60 text-sm text-center py-4">Loading prices...</div>
            )}
          </div>

          {/* Info Footer */}
          <div className="pt-4 md:pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-white/50 text-center sm:text-left">
              Prices updated hourly • Live market rates
            </p>
            <motion.button
              onClick={() => load(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="text-xs text-brand-gold hover:text-yellow-400 flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
