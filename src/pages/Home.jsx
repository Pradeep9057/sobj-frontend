import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Sparkles, Award, Shield, Truck, Heart, ArrowRight, TrendingUp, Star, 
  Gem, CheckCircle, Clock, Users, Instagram, Mail, Phone, MapPin,
  Zap, Globe, Gift, Image as ImageIcon, Youtube, Facebook, Twitter,
  Package, ShoppingBag, Eye, Diamond, Crown, ScrollText
} from 'lucide-react'
import axios from 'axios'
import PriceTicker from '../shared/PriceTicker.jsx'
import FeaturedGrid from '../shared/FeaturedGrid.jsx'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden ">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-brand-gold/10 rounded-full blur-3xl transition-all duration-1000 ease-out"
            style={{
              left: `${mousePosition.x / 10}px`,
              top: `${mousePosition.y / 10}px`,
              transform: 'translate(-50%, -50%)'
            }}
          />
          <div className="absolute top-0 right-0 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-brand-gold/5 rounded-full blur-3xl" />
        </div>

        {/* Video Background */}
        <video 
          className="absolute inset-0 w-full h-full object-cover opacity-100" 
          autoPlay 
          muted 
          loop 
          playsInline
          src="https://res.cloudinary.com/do6qlkrgk/video/upload/v1762609743/6262804-uhd_2160_3840_25fps_phlpy5.mp4"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F0F0F]/80 via-[#0F0F0F]/60 to-[#0F0F0F]/90" />

        {/* Content */}
        <motion.div 
          className="relative z-10 text-center max-w-5xl px-4 md:px-6"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur mb-6 md:mb-8"
            variants={itemVariants}
            whileHover={{ scale: 1.05, borderColor: 'rgba(212, 175, 55, 0.5)' }}
          >
            <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-brand-gold" />
            <span className="text-xs md:text-sm text-white/80">Premium Jewellery Collection</span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-heading mb-4 md:mb-6 leading-tight px-2"
          >
            <span className="block bg-gradient-to-r from-white via-white to-brand-gold bg-clip-text text-transparent">
              Timeless Craft.
            </span>
            <span className="block text-brand-gold mt-1 md:mt-2">
              Modern Aura.
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
          >
            Experience the perfect blend of traditional Indian craftsmanship and contemporary elegance. 
            Each piece tells a story of heritage and sophistication.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center mb-8 md:mb-12 px-4"
            variants={itemVariants}
          >
            <Link
              to="/products?metal=gold"
              className="group relative w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-brand-gold text-black font-semibold text-base md:text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-gold/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Shop Gold Collection
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-brand-gold opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              to="/products?metal=silver"
              className="group relative w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-white font-semibold text-base md:text-lg overflow-hidden transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:border-brand-gold/50"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Explore Silver
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </motion.div>

          {/* Stats - Fixed spacing and mobile responsive */}
          <motion.div
            className="grid grid-cols-3 gap-4 md:gap-8 mt-8 md:mt-0 max-w-2xl mx-auto px-3"
            variants={itemVariants}
          >
            <div className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-gold mb-1 md:mb-2">100+</div>
              <div className="text-xs md:text-sm text-white/60">Exquisite Designs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-gold mb-1 md:mb-2">50K+</div>
              <div className="text-xs md:text-sm text-white/60">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-brand-gold mb-1 md:mb-2">25+</div>
              <div className="text-xs md:text-sm text-white/60">Years Legacy</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, repeat: Infinity, repeatType: 'reverse', duration: 1.5 }}
        >
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-brand-gold"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Price Ticker Section - Fixed negative margin overlap */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 mt-8 md:-mt-8 relative z-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <PriceTicker />
        </motion.div>
      </section>

      {/* Gallery Section - New */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 mt-12 md:mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
            <span className="text-xs md:text-sm text-brand-gold uppercase tracking-wider">Our Gallery</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            Craftsmanship Showcase
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            A glimpse into the artistry and elegance of our handcrafted jewellery
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[
            { img: 'https://images.pexels.com/photos/853663/pexels-photo-853663.jpeg', title: 'Gold Collection' },
            { img: 'https://images.pexels.com/photos/1457800/pexels-photo-1457800.jpeg', title: 'Silver Elegance' },
            { img: 'https://images.pexels.com/photos/863963/pexels-photo-863963.jpeg', title: 'Designer Rings' },
            { img: 'https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg', title: 'Handcrafted' },
            { img: 'https://images.pexels.com/photos/267301/pexels-photo-267301.jpeg', title: 'Premium Quality' },
            { img: 'https://images.pexels.com/photos/853663/pexels-photo-853663.jpeg', title: 'Elegant Designs' },
            { img: 'https://images.pexels.com/photos/1457800/pexels-photo-1457800.jpeg', title: 'Timeless Pieces' },
            { img: 'https://images.pexels.com/photos/863963/pexels-photo-863963.jpeg', title: 'Heritage Craft' }
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="group relative aspect-square overflow-hidden rounded-xl md:rounded-2xl border border-white/10 hover:border-brand-gold/50 transition-all duration-300"
            >
              <motion.img
                src={item.img}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                whileHover={{ scale: 1.2 }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100">
                <p className="text-white font-semibold text-sm">{item.title}</p>
              </div>
              {/* Hover Glow */}
              <div className="absolute inset-0 bg-brand-gold/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Gem className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
            <span className="text-xs md:text-sm text-brand-gold uppercase tracking-wider">Browse By</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            Shop By Category
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Discover our wide range of exquisite jewellery categories
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { name: 'Chains', icon: Sparkles, link: '/products?category=Chains', color: 'from-yellow-500/20 to-brand-gold/20' },
            { name: 'Rings', icon: Gem, link: '/products?category=Rings', color: 'from-brand-gold/20 to-yellow-400/20' },
            { name: 'Earrings', icon: Star, link: '/products?category=Earrings', color: 'from-brand-gold/20 to-yellow-500/20' },
            { name: 'Coins', icon: Award, link: '/products?category=Coins', color: 'from-yellow-400/20 to-brand-gold/20' }
          ].map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              <Link
                to={category.link}
                className="group block rounded-2xl bg-gradient-to-br from-white/5 to-white/0 p-6 md:p-8 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 backdrop-blur text-center relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <motion.div
                    className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-brand-gold/20 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-brand-gold/30 transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <category.icon className="w-8 h-8 md:w-10 md:h-10 text-brand-gold" />
                  </motion.div>
                  <h3 className="text-lg md:text-xl font-semibold group-hover:text-brand-gold transition-colors">
                    {category.name}
                  </h3>
                  <div className="mt-2 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-brand-gold">Explore</span>
                    <ArrowRight className="w-3 h-3 text-brand-gold" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Collection */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 md:w-5 md:h-5 text-brand-gold fill-brand-gold" />
            <span className="text-xs md:text-sm text-brand-gold uppercase tracking-wider">Featured</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            Featured Collection
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Handpicked treasures that exemplify our commitment to excellence and timeless beauty
          </p>
        </motion.div>
        <FeaturedGrid />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            Why Choose Sonaura
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Excellence in every detail, commitment in every piece
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              icon: Award,
              title: 'Authentic Quality',
              description: 'Certified purity and genuine craftsmanship in every piece'
            },
            {
              icon: Shield,
              title: 'Secure Purchase',
              description: '100% secure transactions with trusted payment methods'
            },
            {
              icon: Truck,
              title: 'Fast Delivery',
              description: 'Swift and safe delivery to your doorstep nationwide'
            },
            {
              icon: Heart,
              title: 'Customer Care',
              description: 'Dedicated support team available for all your needs'
            }
          ].map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="group relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 p-6 md:p-8 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 backdrop-blur"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <motion.div
                  className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-brand-gold/20 flex items-center justify-center mb-4 md:mb-6 group-hover:bg-brand-gold/30 transition-colors"
                  whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-brand-gold" />
                </motion.div>
                <h3 className="text-lg md:text-xl font-semibold mb-2 md:mb-3">{feature.title}</h3>
                <p className="text-sm md:text-base text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Benefits Section - New */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 bg-gradient-to-b from-transparent via-white/5 to-transparent">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <Diamond className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
              <span className="text-xs md:text-sm text-brand-gold uppercase tracking-wider">Benefits</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-6 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent">
              Premium Benefits
            </h2>
            <div className="space-y-4 md:space-y-6">
              {[
                'Certified purity with BIS hallmark',
                'Lifetime warranty on craftsmanship',
                'Free resizing within 30 days',
                'Professional cleaning service',
                'Trade-in program for upgrades',
                'Exclusive member discounts'
              ].map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-3 md:gap-4"
                >
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-brand-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
                  </div>
                  <p className="text-base md:text-lg text-white/80 leading-relaxed">{benefit}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
            <img 
              src="https://images.pexels.com/photos/853663/pexels-photo-853663.jpeg" 
              alt="Benefits" 
              className="relative rounded-3xl shadow-2xl object-cover w-full aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            Our Process
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            From design to delivery, we ensure perfection at every step
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {[
            { step: '01', title: 'Select Design', icon: Gem, desc: 'Choose from our curated collection' },
            { step: '02', title: 'Customize', icon: Sparkles, desc: 'Personalize your piece if needed' },
            { step: '03', title: 'Craft', icon: Award, desc: 'Master craftsmen bring it to life' },
            { step: '04', title: 'Deliver', icon: Gift, desc: 'Safe delivery to your doorstep' }
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative text-center group"
            >
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-brand-gold/20 border-2 border-brand-gold/30 flex items-center justify-center mx-auto mb-4 md:mb-6 group-hover:bg-brand-gold/30 transition-colors">
                  <item.icon className="w-10 h-10 md:w-12 md:h-12 text-brand-gold" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-brand-gold text-black font-bold text-sm md:text-base flex items-center justify-center">
                  {item.step}
                </div>
                <motion.div
                  className="absolute inset-0 bg-brand-gold/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-sm md:text-base text-white/60">{item.desc}</p>
              {index < 3 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-brand-gold/50 to-transparent -ml-6" />
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group order-2 lg:order-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-gold/20 to-transparent rounded-3xl blur-2xl group-hover:blur-3xl transition-all" />
            <img 
              className="relative rounded-2xl md:rounded-3xl shadow-2xl object-cover w-full aspect-[4/3] group-hover:scale-[1.02] transition-transform duration-500" 
              src="https://images.pexels.com/photos/1453005/pexels-photo-1453005.jpeg" 
              alt="About Sonaura" 
            />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 md:w-32 md:h-32 bg-brand-gold rounded-2xl opacity-20 blur-2xl" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4 md:space-y-6 order-1 lg:order-2"
          >
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur">
              <TrendingUp className="w-3 h-3 md:w-4 md:h-4 text-brand-gold" />
              <span className="text-xs md:text-sm text-brand-gold uppercase tracking-wider">Our Story</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-4 md:mb-6 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent">
              About Sonaura
            </h2>
            <p className="text-base md:text-lg text-white/80 leading-relaxed">
              A premium sub-brand by <span className="text-brand-gold font-semibold">Shree Om Banna Jewellers</span>, 
              blending Indian heritage with modern minimalism. Each piece is crafted to perfection, 
              reflecting our commitment to timeless elegance.
            </p>
            <p className="text-base md:text-lg text-white/70 leading-relaxed">
              With over 25 years of legacy, we've mastered the art of creating jewellery that speaks 
              to the contemporary customer while honoring traditional craftsmanship.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-gold/50 mt-4 md:mt-8"
            >
              Explore Collection
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-brand-gold" />
            <span className="text-xs md:text-sm text-brand-gold uppercase tracking-wider">Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            What Our Customers Say
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Trusted by thousands of satisfied customers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {[
            { 
              name: 'Priya Sharma', 
              role: 'Gold Chain Buyer', 
              comment: 'Exquisite craftsmanship and beautiful designs. Absolutely love my purchase!',
              rating: 5
            },
            { 
              name: 'Rajesh Kumar', 
              role: 'Silver Collector', 
              comment: 'Best quality and service. Highly recommend Sonaura for authentic jewellery.',
              rating: 5
            },
            { 
              name: 'Anjali Patel', 
              role: 'Jewellery Enthusiast', 
              comment: 'The attention to detail is incredible. Truly premium quality products.',
              rating: 5
            }
          ].map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="relative rounded-2xl bg-gradient-to-br from-white/5 to-white/0 p-6 md:p-8 border border-white/10 hover:border-brand-gold/50 transition-all duration-300 backdrop-blur"
            >
              <div className="absolute top-4 right-4">
                <Crown className="w-6 h-6 md:w-8 md:h-8 text-brand-gold/30" />
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 md:w-5 md:h-5 fill-brand-gold text-brand-gold" />
                ))}
              </div>
              <p className="text-sm md:text-base text-white/70 mb-6 leading-relaxed relative z-10">
                "{testimonial.comment}"
              </p>
              <div className="relative z-10">
                <div className="font-semibold text-base md:text-lg">{testimonial.name}</div>
                <div className="text-xs md:text-sm text-white/60">{testimonial.role}</div>
              </div>
              {/* Decorative Element */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Newsletter Section - New */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-brand-gold/20 via-brand-gold/10 to-transparent border border-brand-gold/30 p-8 md:p-12 lg:p-16 text-center"
        >
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 md:w-6 md:h-6 text-brand-gold" />
              <span className="text-sm md:text-base text-brand-gold uppercase tracking-wider">Stay Updated</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-3 md:mb-4">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-base md:text-lg text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto">
              Get exclusive offers, new arrivals, and jewellery care tips delivered to your inbox
            </p>
            <form onSubmit={handleNewsletter} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 md:px-6 py-3 md:py-4 rounded-xl bg-white/5 border border-white/10 focus:border-brand-gold/50 focus:outline-none focus:ring-2 focus:ring-brand-gold/20 text-white placeholder-white/40"
                required
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-all hover:shadow-lg hover:shadow-brand-gold/50"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
              </motion.button>
            </form>
            {subscribed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-brand-gold text-sm md:text-base"
              >
                Thank you for subscribing!
              </motion.div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Social Proof Section - New */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading mb-3 md:mb-4 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent px-4">
            Follow Our Journey
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/60 max-w-2xl mx-auto px-4">
            Connect with us on social media for daily inspiration and exclusive updates
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {[
            { icon: Instagram, name: 'Instagram', color: 'from-pink-500/20 to-purple-500/20', hover: 'hover:from-pink-500/30 hover:to-purple-500/30' },
            { icon: Facebook, name: 'Facebook', color: 'from-blue-500/20 to-blue-600/20', hover: 'hover:from-blue-500/30 hover:to-blue-600/30' },
            { icon: Youtube, name: 'YouTube', color: 'from-red-500/20 to-red-600/20', hover: 'hover:from-red-500/30 hover:to-red-600/30' },
            { icon: Twitter, name: 'Twitter', color: 'from-blue-400/20 to-cyan-500/20', hover: 'hover:from-blue-400/30 hover:to-cyan-500/30' }
          ].map((social, index) => (
            <motion.a
              key={social.name}
              href="#"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8, scale: 1.1 }}
              className={`relative w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${social.color} border border-white/10 hover:border-white/30 transition-all duration-300 flex items-center justify-center group`}
            >
              <social.icon className="w-8 h-8 md:w-10 md:h-10 text-white transition-transform group-hover:scale-110" />
              <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {social.name}
              </span>
            </motion.a>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-br from-brand-gold/20 via-brand-gold/10 to-transparent border border-brand-gold/30 p-8 md:p-12 lg:p-16 text-center"
        >
          <div 
            className="absolute inset-0 opacity-20" 
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-heading mb-3 md:mb-4">
              Ready to Find Your Perfect Piece?
            </h2>
            <p className="text-base md:text-lg lg:text-xl text-white/70 mb-6 md:mb-8 max-w-2xl mx-auto">
              Discover our curated collection of premium gold and silver jewellery, 
              each piece crafted with passion and precision.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 md:px-8 py-3 md:py-4 rounded-xl bg-brand-gold text-black font-semibold text-base md:text-lg hover:bg-yellow-400 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-brand-gold/50"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
