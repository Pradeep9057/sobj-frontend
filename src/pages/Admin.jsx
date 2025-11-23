import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'
import axiosInstance from '../utils/axios.js'
import { 
  Package, 
  DollarSign, 
  ShoppingBag, 
  BarChart3, 
  Plus, 
  Edit2, 
  Trash2, 
  Upload, 
  X, 
  Save,
  RefreshCw,
  TrendingUp,
  Users,
  Image as ImageIcon,
  Search,
  Filter,
  Settings,
  Download,
  CheckSquare,
  Square,
  Tag
} from 'lucide-react'
import ImageManager from '../components/ImageManager.jsx'

export default function Admin() {
  const base = import.meta.env.VITE_API_BASE //|| 'http://localhost:5000'
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [metalPrices, setMetalPrices] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [showProductForm, setShowProductForm] = useState(false)
  const [form, setForm] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    metal_type: 'gold',
    purity: '22K',
    weight: '',
    stock: 0,
    margin_percent: 5,
    making_charges_type: 'fixed',
    making_charges_value: 500,
    box_sku: '',
    image_url: ''
  })
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [pricePreview, setPricePreview] = useState(null)
  const [metalPriceForm, setMetalPriceForm] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterMetal, setFilterMetal] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [boxItems, setBoxItems] = useState([])
  const [editingItem, setEditingItem] = useState(null)
  const [showItemForm, setShowItemForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderStatusForm, setOrderStatusForm] = useState({ status: '', tracking_number: '', notes: '' })
  const [itemForm, setItemForm] = useState({
    sku: '',
    name: '',
    item_type: 'box',
    rate: '',
    description: '',
    is_active: true
  })

  useEffect(() => {
    loadData()
  }, [activeTab])

  async function loadData() {
    setLoading(true)
    try {
      if (activeTab === 'products') {
        const { data } = await axios.get(`${base}/api/products`)
        setProducts(data)
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))].sort()
        setCategories(uniqueCategories)
      }
      if (activeTab === 'metal-prices' || activeTab === 'products') {
        const { data } = await axios.get(`${base}/api/prices`)
        setMetalPrices(data)
      }
      if (activeTab === 'orders') {
        const { data } = await axiosInstance.get(`${base}/api/admin/orders`)
        setOrders(data)
      }
      if (activeTab === 'users') {
        try {
          const { data } = await axiosInstance.get(`${base}/api/admin/users`)
          setAllUsers(data)
        } catch (e) {
          console.error('Error loading users:', e)
          setAllUsers([])
        }
      }
      if (activeTab === 'items') {
        const { data } = await axios.get(`${base}/api/items`)
        setItems(data)
        // Load box items for product form dropdown
        const { data: boxData } = await axios.get(`${base}/api/items?item_type=box&is_active=true`)
        setBoxItems(boxData)
      }
      // Also load box items when in products tab
      if (activeTab === 'products') {
        try {
          const { data: boxData } = await axios.get(`${base}/api/items?item_type=box&is_active=true`)
          setBoxItems(boxData)
        } catch (e) {
          console.error('Error loading box items:', e)
        }
      }
    } catch (e) {
      console.error('Error loading data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    calculatePricePreview()
  }, [form.weight, form.metal_type, form.purity, form.margin_percent, form.making_charges_type, form.making_charges_value, form.box_sku, metalPrices, boxItems])

  async function calculatePricePreview() {
    if (!form.weight || form.weight <= 0) {
      setPricePreview(null)
      return
    }

    try {
      // Calculate price preview using current metal prices
      const metalKey = form.metal_type === 'gold' 
        ? (form.purity === '24K' ? 'gold_24k' : 'gold_22k')
        : 'silver'
      const metalPrice = metalPrices.find(p => p.metal === metalKey)
      if (!metalPrice) return

      const metalRate = Number(metalPrice.rate_per_gram)
      const weight = Number(form.weight)
      const basePrice = metalRate * weight

      let makingCharges = 0
      if (form.making_charges_type === 'percentage') {
        makingCharges = (Number(form.making_charges_value) / 100) * basePrice
      } else if (form.making_charges_type === 'per_gram') {
        makingCharges = Number(form.making_charges_value) * weight
      } else {
        makingCharges = Number(form.making_charges_value)
      }

      // Box charges (if box_sku selected)
      let boxCharges = 0
      if (form.box_sku) {
        const boxItem = boxItems.find(b => b.sku === form.box_sku)
        if (boxItem) {
          boxCharges = Number(boxItem.rate) || 0
        }
      }

      // Subtotal before shipping
      const subtotalBeforeShipping = basePrice + makingCharges + boxCharges
      
      // Shipping charges (0.5% for orders < ₹50,000)
      let shippingCharges = 0
      if (subtotalBeforeShipping < 50000) {
        shippingCharges = (basePrice + makingCharges) * 0.005
      }

      // Subtotal = base + making + box (margin removed)
      const subtotal = basePrice + makingCharges + boxCharges
      const gst = subtotal * 0.03
      const finalPrice = subtotal + gst + shippingCharges

      setPricePreview({
        metalRate,
        basePrice: Number(basePrice.toFixed(2)),
        makingCharges: Number(makingCharges.toFixed(2)),
        boxCharges: Number(boxCharges.toFixed(2)),
        shippingCharges: Number(shippingCharges.toFixed(2)),
        subtotal: Number(subtotal.toFixed(2)),
        gst: Number(gst.toFixed(2)),
        finalPrice: Number(finalPrice.toFixed(2))
      })
    } catch (e) {
      console.error('Error calculating price:', e)
    }
  }

  function handleFileChange(e) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      const reader = new FileReader()
      reader.onload = (event) => setPreviewUrl(event.target.result)
      reader.readAsDataURL(selectedFile)
    }
  }

  async function handleProductSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      let imageUrl = form.image_url
      
      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        const { data } = await axiosInstance.post(`${base}/api/uploads/image`, formData)
        imageUrl = data.url
      }

      const productData = {
        ...form,
        weight: Number(form.weight),
        stock: Number(form.stock),
        margin_percent: Number(form.margin_percent),
        making_charges_value: Number(form.making_charges_value),
        box_sku: form.box_sku || null,
        image_url: imageUrl || ''
      }

      const wasNewProduct = !editingProduct || !editingProduct.id
      let savedProduct
      
      if (editingProduct && editingProduct.id) {
        const { data } = await axiosInstance.put(`${base}/api/products/${editingProduct.id}`, productData)
        savedProduct = data
      } else {
        const { data } = await axiosInstance.post(`${base}/api/products`, productData)
        savedProduct = data
        // After creating, set it as editingProduct so ImageManager shows
        setEditingProduct(savedProduct)
      }

      // Reload products list
      await loadData()
      
      // Keep form open after creation so user can add images
      if (wasNewProduct) {
        // Don't reset form for new products - keep it open for image upload
        setFile(null)
        setPreviewUrl('')
        alert('Product saved successfully! You can now add images below.')
      } else {
        // For updates, optionally reset or keep open
        alert('Product updated successfully!')
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || 'Unknown error'
      console.error('Product save error:', e)
      alert(`Error saving product: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setForm({
      sku: '',
      name: '',
      description: '',
      category: '',
      metal_type: 'gold',
      purity: '22K',
      weight: '',
      stock: 0,
      margin_percent: 5,
      making_charges_type: 'fixed',
      making_charges_value: 500,
      box_sku: '',
      image_url: ''
    })
    setFile(null)
    setPreviewUrl('')
    setEditingProduct(null)
    setShowProductForm(false)
  }

  function handleEdit(product) {
    setEditingProduct(product)
    setForm({
      sku: product.sku || '',
      name: product.name || '',
      description: product.description || '',
      category: product.category || '',
      metal_type: product.metal_type || 'gold',
      purity: product.purity || '22K',
      weight: product.weight || '',
      stock: product.stock || 0,
      margin_percent: product.margin_percent || 5,
      making_charges_type: product.making_charges_type || 'fixed',
      making_charges_value: product.making_charges_value || 500,
      box_sku: product.box_sku || '',
      image_url: product.image_url || ''
    })
    setPreviewUrl(product.image_url || '')
    setShowProductForm(true)
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await axiosInstance.delete(`${base}/api/products/${id}`)
      loadData()
    } catch (e) {
      alert('Error deleting product')
    }
  }

  async function handleMetalPriceUpdate(metal, rate) {
    try {
      await axiosInstance.post(`${base}/api/prices/update`, { metal, rate_per_gram: Number(rate) })
      loadData()
    } catch (e) {
      alert('Error updating metal price')
    }
  }

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (filterCategory) {
      filtered = filtered.filter(p => p.category === filterCategory)
    }

    // Metal filter
    if (filterMetal) {
      filtered = filtered.filter(p => p.metal_type === filterMetal)
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '')
        case 'price':
          return (Number(b.price) || 0) - (Number(a.price) || 0)
        case 'stock':
          return (Number(b.stock) || 0) - (Number(a.stock) || 0)
        case 'category':
          return (a.category || '').localeCompare(b.category || '')
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchQuery, filterCategory, filterMetal, sortBy])

  const stats = useMemo(() => {
    const totalProducts = products.length
    const totalOrders = orders.length
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0)
    const lowStockProducts = products.filter(p => (p.stock || 0) < 5).length

    return {
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts
    }
  }, [products, orders])

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-heading mb-2 bg-gradient-to-r from-white to-brand-gold bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-white/60">Manage products, prices, orders, and more</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 p-6 border border-brand-gold/20">
          <div className="flex items-center gap-3 mb-2">
            <Package className="w-5 h-5 text-brand-gold" />
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </div>
          <div className="text-sm text-white/70">Total Products</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 p-6 border border-brand-gold/20">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-5 h-5 text-brand-gold" />
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </div>
          <div className="text-sm text-white/70">Total Orders</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 p-6 border border-brand-gold/20">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-brand-gold" />
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
          </div>
          <div className="text-sm text-white/70">Total Revenue</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-red-500/20 to-red-500/5 p-6 border border-red-500/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-red-400" />
            <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
          </div>
          <div className="text-sm text-white/70">Low Stock</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'products'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('products')}
        >
          <Package className="w-4 h-4" />
          Products
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'metal-prices'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('metal-prices')}
        >
          <DollarSign className="w-4 h-4" />
          Metal Prices
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('orders')}
        >
          <ShoppingBag className="w-4 h-4" />
          Orders
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'analytics'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('analytics')}
        >
          <BarChart3 className="w-4 h-4" />
          Analytics
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'images'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('images')}
        >
          <ImageIcon className="w-4 h-4" />
          Images
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'users'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-4 h-4" />
          Users
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'items'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('items')}
        >
          <Tag className="w-4 h-4" />
          Items/SKUs
        </button>
        <button
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-brand-gold text-black shadow-lg shadow-brand-gold/20'
              : 'bg-white/5 text-white/70 hover:bg-white/10'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-heading">Product Management</h2>
            <div className="flex gap-2">
              {selectedProducts.length > 0 && (
                <button
                  onClick={async () => {
                    if (confirm(`Delete ${selectedProducts.length} selected products?`)) {
                      try {
                        await Promise.all(
                          selectedProducts.map(id => 
                            axiosInstance.delete(`${base}/api/products/${id}`)
                          )
                        )
                        setSelectedProducts([])
                        loadData()
                        alert(`${selectedProducts.length} products deleted successfully!`)
                      } catch (e) {
                        alert('Error deleting products')
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedProducts.length})
                </button>
              )}
              <button
                className="btn flex items-center gap-2"
                onClick={() => {
                  resetForm()
                  setShowProductForm(true)
                }}
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              value={filterMetal}
              onChange={(e) => setFilterMetal(e.target.value)}
            >
              <option value="">All Metals</option>
              <option value="gold">Gold</option>
              <option value="silver">Silver</option>
            </select>
            <select
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>
          </div>

          {showProductForm && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <button onClick={resetForm} className="text-white/60 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      placeholder="e.g., PROD-001"
                    />
                    <p className="text-xs text-white/50 mt-1">Unique identifier for this product</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      placeholder="e.g., Chains, Rings, Coins"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Box/Packing SKU</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.box_sku}
                      onChange={(e) => setForm({ ...form, box_sku: e.target.value })}
                    >
                      <option value="">No Box/Packing</option>
                      {boxItems.map(box => (
                        <option key={box.sku} value={box.sku}>
                          {box.name} (SKU: {box.sku}) - ₹{Number(box.rate).toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-white/50 mt-1">Select a box from Items/SKUs tab</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Metal Type *</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.metal_type}
                      onChange={(e) => {
                        const newType = e.target.value
                        setForm({
                          ...form,
                          metal_type: newType,
                          purity: newType === 'gold' ? '22K' : '999'
                        })
                      }}
                    >
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Purity *</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.purity}
                      onChange={(e) => setForm({ ...form, purity: e.target.value })}
                    >
                      {form.metal_type === 'gold' ? (
                        <>
                          <option value="24K">24K</option>
                          <option value="22K">22K</option>
                          <option value="18K">18K</option>
                        </>
                      ) : (
                        <>
                          <option value="999">999</option>
                          <option value="995">995</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Weight (grams) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Making Charges Type</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.making_charges_type}
                      onChange={(e) => setForm({ ...form, making_charges_type: e.target.value })}
                    >
                      <option value="fixed">Fixed Amount</option>
                      <option value="percentage">Percentage</option>
                      <option value="per_gram">Per Gram</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Making Charges Value
                      {form.making_charges_type === 'percentage' && ' (%)'}
                      {(form.making_charges_type === 'fixed' || form.making_charges_type === 'per_gram') && ' (₹)'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.making_charges_value}
                      onChange={(e) => setForm({ ...form, making_charges_value: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Image Upload</label>
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-white/60" />
                        <span className="text-sm text-white/70">Click to upload image</span>
                      </label>
                      {previewUrl && (
                        <img src={previewUrl} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg" />
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Or Image URL</label>
                    <input
                      type="url"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                    {form.image_url && !previewUrl && (
                      <img src={form.image_url} alt="Preview" className="mt-4 w-full h-48 object-cover rounded-lg" onError={() => setForm({ ...form, image_url: '' })} />
                    )}
                  </div>
                </div>

                {/* Price Preview */}
                {pricePreview && (
                  <div className="rounded-xl bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/20 p-6">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-brand-gold" />
                      Price Calculation Preview
                    </h4>
                    <div className="space-y-3">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-white/60">Metal Rate</div>
                          <div className="font-semibold">₹{pricePreview.metalRate}/gram</div>
                        </div>
                        <div>
                          <div className="text-white/60">Base Price</div>
                          <div className="font-semibold">₹{pricePreview.basePrice}</div>
                        </div>
                        <div>
                          <div className="text-white/60">Making Charges</div>
                          <div className="font-semibold">₹{pricePreview.makingCharges}</div>
                        </div>
                        {pricePreview.boxCharges > 0 && (
                          <div>
                            <div className="text-white/60">Box/Packing Charges</div>
                            <div className="font-semibold">₹{pricePreview.boxCharges}</div>
                          </div>
                        )}
                        <div>
                          <div className="text-white/60">Subtotal</div>
                          <div className="font-semibold">₹{pricePreview.subtotal}</div>
                        </div>
                        <div>
                          <div className="text-white/60">GST (3%)</div>
                          <div className="font-semibold">₹{pricePreview.gst}</div>
                        </div>
                        {pricePreview.shippingCharges > 0 ? (
                          <div>
                            <div className="text-white/60">Shipping Charges (0.5%)</div>
                            <div className="font-semibold">₹{pricePreview.shippingCharges}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-white/60">Shipping</div>
                            <div className="font-semibold text-green-400">Free (≥₹50,000)</div>
                          </div>
                        )}
                      </div>
                      <div className="pt-3 border-t border-brand-gold/20">
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-semibold">Final Price</div>
                          <div className="font-bold text-brand-gold text-2xl">₹{pricePreview.finalPrice}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Manager - Show when editing or after creating */}
                {editingProduct && editingProduct.id && (
                  <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                    <ImageManager
                      productId={editingProduct.id}
                      productName={editingProduct.name || form.name}
                      onImagesChange={() => {
                        loadData()
                      }}
                    />
                  </div>
                )}

                <div className="flex gap-4">
                  <button type="submit" className="btn flex items-center gap-2" disabled={loading}>
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Products List */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-white/60">
              Showing {filteredProducts.length} of {products.length} products
            </div>
            <button
              onClick={() => {
                if (selectedProducts.length === filteredProducts.length) {
                  setSelectedProducts([])
                } else {
                  setSelectedProducts(filteredProducts.map(p => p.id))
                }
              }}
              className="text-sm text-white/60 hover:text-white flex items-center gap-2"
            >
              {selectedProducts.length === filteredProducts.length && filteredProducts.length > 0 ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
              Select All
            </button>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-center py-10 text-white/60">Loading products...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-10 text-white/60">
                {searchQuery || filterCategory || filterMetal 
                  ? 'No products match your filters. Try adjusting your search.'
                  : 'No products yet. Add your first product!'}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div 
                  key={product.id} 
                  className={`rounded-xl overflow-hidden border transition-colors ${
                    selectedProducts.includes(product.id)
                      ? 'bg-brand-gold/20 border-brand-gold'
                      : 'bg-white/5 border-white/10 hover:border-brand-gold/50'
                  }`}
                >
                  <div className="relative aspect-square">
                    <button
                      onClick={() => {
                        if (selectedProducts.includes(product.id)) {
                          setSelectedProducts(selectedProducts.filter(id => id !== product.id))
                        } else {
                          setSelectedProducts([...selectedProducts, product.id])
                        }
                      }}
                      className="absolute top-2 left-2 z-10 p-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur"
                    >
                      {selectedProducts.includes(product.id) ? (
                        <CheckSquare className="w-4 h-4 text-brand-gold" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <img
                      src={product.image_url || 'https://placehold.co/600x600'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 rounded-lg bg-black/50 hover:bg-black/70 backdrop-blur"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 rounded-lg bg-black/50 hover:bg-red-500/70 backdrop-blur"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {product.stock < 5 && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-red-500/80 text-xs font-semibold">
                        Low Stock
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="font-semibold mb-1">{product.name}</div>
                    {product.sku && (
                      <div className="text-xs text-brand-gold/70 mb-1 font-mono">SKU: {product.sku}</div>
                    )}
                    <div className="text-sm text-white/70 mb-2 flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {product.category}
                    </div>
                    <div className="text-xs text-white/60 space-y-1">
                      <div>{product.weight}g • {product.purity || 'N/A'} • {product.metal_type}</div>
                      <div>Stock: {product.stock || 0}</div>
                      {product.box_sku && (
                        <div className="text-xs text-white/50">Box: {product.box_sku}</div>
                      )}
                      <div className="text-brand-gold font-semibold">₹{Number(product.price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Metal Prices Tab */}
      {activeTab === 'metal-prices' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-heading">Metal Prices Management</h2>
            <div className="flex gap-2">
              <button 
                onClick={async () => {
                  try {
                    setLoading(true)
                    // Force refresh from API
                    const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
                    await axiosInstance.post(`${base}/api/prices/refresh`, {})
                    await loadData()
                    alert('Prices refreshed successfully!')
                  } catch (e) {
                    alert('Error refreshing prices: ' + (e.response?.data?.message || e.message))
                  } finally {
                    setLoading(false)
                  }
                }}
                className="btn flex items-center gap-2"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh Prices Now'}
              </button>
              <button onClick={loadData} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reload
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {['gold_24k', 'gold_22k', 'silver'].map((metal) => {
              const price = metalPrices.find(p => p.metal === metal)
              const rate = metalPriceForm[metal] || price?.rate_per_gram || 0
              
              return (
                <div key={metal} className="rounded-xl bg-white/5 border border-white/10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-semibold text-lg capitalize">{metal.replace('_', ' ')}</div>
                      <div className="text-sm text-white/60">Rate per gram</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold text-brand-gold mb-1">₹{Number(rate).toFixed(2)}</div>
                      {price?.updated_at && (
                        <div className="text-xs text-white/50">
                          Updated: {new Date(price.updated_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step="0.01"
                        className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                        placeholder="Enter new rate"
                        value={metalPriceForm[metal] || ''}
                        onChange={(e) => setMetalPriceForm({ ...metalPriceForm, [metal]: e.target.value })}
                      />
                      <button
                        onClick={() => {
                          if (metalPriceForm[metal]) {
                            handleMetalPriceUpdate(metal, metalPriceForm[metal])
                            setMetalPriceForm({ ...metalPriceForm, [metal]: '' })
                          }
                        }}
                        className="btn px-4"
                        disabled={!metalPriceForm[metal]}
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-heading">Orders Management</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-white/60">Loading orders...</td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-white/60">No orders yet</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">#{order.id}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>{order.user_name || 'Guest'}</div>
                          <div className="text-xs text-white/60">{order.user_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{order.item_count || 1} item(s)</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-gold">
                          ₹{Number(order.total_price || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                            order.status === 'confirmed' ? 'bg-brand-gold/20 text-brand-gold' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            order.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.payment_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedOrder(order)
                              setOrderStatusForm({ status: order.status || 'pending', tracking_number: order.tracking_number || '', notes: '' })
                            }}
                            className="text-brand-gold hover:text-yellow-400 text-sm"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Order Management Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-[#1a1a1a] rounded-2xl border border-white/10 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-heading">Manage Order #{selectedOrder.id}</h3>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-white/60 hover:text-white text-2xl"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Order Status</label>
                    <select
                      value={orderStatusForm.status}
                      onChange={e => setOrderStatusForm({...orderStatusForm, status: e.target.value})}
                      className="w-full bg-white/10 p-3 rounded-lg border border-white/10"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Tracking Number</label>
                    <input
                      type="text"
                      value={orderStatusForm.tracking_number}
                      onChange={e => setOrderStatusForm({...orderStatusForm, tracking_number: e.target.value})}
                      placeholder="Enter tracking number"
                      className="w-full bg-white/10 p-3 rounded-lg border border-white/10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2">Notes</label>
                    <textarea
                      value={orderStatusForm.notes}
                      onChange={e => setOrderStatusForm({...orderStatusForm, notes: e.target.value})}
                      placeholder="Optional notes"
                      className="w-full bg-white/10 p-3 rounded-lg border border-white/10"
                      rows="3"
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        try {
                          await axiosInstance.put(`${base}/api/admin/orders/${selectedOrder.id}/status`, orderStatusForm)
                          alert('Order updated successfully!')
                          setSelectedOrder(null)
                          await loadData()
                        } catch (err) {
                          alert(err?.response?.data?.message || 'Failed to update order')
                        }
                      }}
                      className="btn flex-1"
                    >
                      Update Order
                    </button>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-heading">Analytics & Insights</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-brand-gold" />
                Product Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Products</span>
                  <span className="font-semibold">{stats.totalProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Low Stock Items</span>
                  <span className="font-semibold text-red-400">{stats.lowStockProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">In Stock Items</span>
                  <span className="font-semibold text-brand-gold">{stats.totalProducts - stats.lowStockProducts}</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-gold" />
                Order Statistics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/70">Total Orders</span>
                  <span className="font-semibold">{stats.totalOrders}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Total Revenue</span>
                  <span className="font-semibold text-brand-gold">₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Average Order Value</span>
                  <span className="font-semibold">
                    ₹{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Images Tab */}
      {activeTab === 'images' && (
        <ImageManagementTab />
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-heading">Customer Management</h2>
          <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-white/60">Loading users...</td>
                    </tr>
                  ) : allUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-white/60">No users found</td>
                    </tr>
                  ) : (
                    allUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">#{user.id}</td>
                        <td className="px-6 py-4 text-sm font-semibold">{user.name}</td>
                        <td className="px-6 py-4 text-sm">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.role === 'admin' ? 'bg-brand-gold/20 text-brand-gold' : 'bg-white/10 text-white/70'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">{user.order_count || 0}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-gold">
                          ₹{Number(user.total_spent || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Items/SKUs Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-heading">Items/SKUs Management</h2>
              <p className="text-white/60 text-sm mt-1">Manage box, packing, and other item SKUs with predefined rates</p>
            </div>
            <button
              className="btn flex items-center gap-2"
              onClick={() => {
                setItemForm({
                  sku: '',
                  name: '',
                  item_type: 'box',
                  rate: '',
                  description: '',
                  is_active: true
                })
                setEditingItem(null)
                setShowItemForm(true)
              }}
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {showItemForm && (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">{editingItem ? 'Edit Item' : 'Add New Item'}</h3>
                <button
                  onClick={() => {
                    setShowItemForm(false)
                    setEditingItem(null)
                  }}
                  className="text-white/60 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  setLoading(true)
                  try {
                    const itemData = {
                      ...itemForm,
                      rate: Number(itemForm.rate),
                      is_active: itemForm.is_active
                    }

                    if (editingItem && editingItem.id) {
                      await axiosInstance.put(`${base}/api/items/${editingItem.id}`, itemData)
                      alert('Item updated successfully!')
                    } else {
                      await axiosInstance.post(`${base}/api/items`, itemData)
                      alert('Item created successfully!')
                    }

                    setShowItemForm(false)
                    setEditingItem(null)
                    await loadData()
                  } catch (e) {
                    const errorMsg = e.response?.data?.message || e.message || 'Unknown error'
                    alert(`Error saving item: ${errorMsg}`)
                  } finally {
                    setLoading(false)
                  }
                }}
                className="space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">SKU *</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={itemForm.sku}
                      onChange={(e) => setItemForm({ ...itemForm, sku: e.target.value.toUpperCase() })}
                      placeholder="e.g., BOX-001"
                      required
                      disabled={!!editingItem}
                    />
                    <p className="text-xs text-white/50 mt-1">Unique identifier (cannot be changed after creation)</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Name *</label>
                    <input
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={itemForm.name}
                      onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                      placeholder="e.g., Premium Gift Box"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Item Type *</label>
                    <select
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={itemForm.item_type}
                      onChange={(e) => setItemForm({ ...itemForm, item_type: e.target.value })}
                      required
                    >
                      <option value="box">Box</option>
                      <option value="packing">Packing</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rate (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={itemForm.rate}
                      onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                      value={itemForm.description}
                      onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                      rows={3}
                      placeholder="Optional description..."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={itemForm.is_active}
                        onChange={(e) => setItemForm({ ...itemForm, is_active: e.target.checked })}
                        className="w-4 h-4 rounded bg-white/10 border-white/20 text-brand-gold focus:ring-brand-gold"
                      />
                      <span className="text-sm font-medium">Active (visible in product dropdowns)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button type="submit" className="btn flex items-center gap-2" disabled={loading}>
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : editingItem ? 'Update Item' : 'Add Item'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowItemForm(false)
                      setEditingItem(null)
                    }}
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Items List */}
          {loading && !showItemForm ? (
            <div className="text-center py-10 text-white/60">Loading items...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-white/60 rounded-xl bg-white/5 border border-white/10">
              No items yet. Add your first item above.
            </div>
          ) : (
            <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Rate</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-brand-gold">{item.sku}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-white/60 mt-1 line-clamp-1">{item.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-brand-gold/20 text-brand-gold capitalize">
                            {item.item_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold">₹{Number(item.rate).toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.is_active
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {item.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item)
                                setItemForm({
                                  sku: item.sku,
                                  name: item.name,
                                  item_type: item.item_type,
                                  rate: item.rate,
                                  description: item.description || '',
                                  is_active: item.is_active
                                })
                                setShowItemForm(true)
                              }}
                              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete "${item.name}" (${item.sku})?`)) {
                                  try {
                                    await axiosInstance.delete(`${base}/api/items/${item.id}`)
                                    alert('Item deleted successfully!')
                                    await loadData()
                                  } catch (e) {
                                    const errorMsg = e.response?.data?.message || e.message
                                    alert(`Error deleting item: ${errorMsg}`)
                                  }
                                }
                              }}
                              className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-2xl font-heading">Settings & Configuration</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-brand-gold" />
                General Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2">Default Margin (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue="5"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">Low Stock Threshold</label>
                  <input
                    type="number"
                    defaultValue="5"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-2">GST Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    defaultValue="3"
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>
                <button className="btn w-full">Save Settings</button>
              </div>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Download className="w-5 h-5 text-brand-gold" />
                Data Export
              </h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    const csv = [
                      ['ID', 'Name', 'Category', 'Price', 'Stock', 'Weight', 'Metal Type', 'Purity'].join(','),
                      ...products.map(p => [
                        p.id,
                        `"${p.name}"`,
                        p.category,
                        p.price,
                        p.stock,
                        p.weight,
                        p.metal_type,
                        p.purity
                      ].join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `products-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    alert('Products exported successfully!')
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Products (CSV)
                </button>
                <button
                  onClick={() => {
                    const csv = [
                      ['ID', 'Product', 'Quantity', 'Total Price', 'Date'].join(','),
                      ...orders.map(o => [
                        o.id,
                        `"${o.product_name || 'N/A'}"`,
                        o.quantity,
                        o.total_price,
                        o.created_at
                      ].join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    alert('Orders exported successfully!')
                  }}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Orders (CSV)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Website Image Management Component
function ImageManagementTab() {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
  const [sections, setSections] = useState(['hero', 'gallery', 'category', 'featured', 'testimonials'])
  const [activeSection, setActiveSection] = useState('gallery')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDescription, setUploadDescription] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if (activeSection) {
      loadImages()
    }
  }, [activeSection])

  async function loadImages() {
    setLoading(true)
    try {
      const { data } = await axios.get(`${base}/api/images/website?section=${activeSection}`)
      setImages(data.sort((a, b) => a.display_order - b.display_order))
    } catch (e) {
      console.error('Error loading images:', e)
      setImages([])
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) {
      setUploadFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setPreviewUrl(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  async function handleUpload() {
    setLoading(true)
    try {
      let imageUrl = uploadUrl

      if (uploadFile) {
        try {
          const formData = new FormData()
          formData.append('file', uploadFile)
          const { data } = await axiosInstance.post(`${base}/api/uploads/image`, formData)
          imageUrl = data.url
        } catch (uploadError) {
          const errorMsg = uploadError.response?.data?.message || uploadError.message
          if (uploadError.response?.status === 401 || uploadError.response?.status === 403) {
            alert('Authentication error: Please make sure you are logged in as admin. Error: ' + errorMsg)
          } else {
            alert('Error uploading file: ' + errorMsg)
          }
          setLoading(false)
          return
        }
      }

      if (!imageUrl) {
        alert('Please provide an image URL or upload a file')
        setLoading(false)
        return
      }

      const displayOrder = images.length
      try {
        await axios.post(
          `${base}/api/images/website`,
          {
            section: activeSection,
            image_url: imageUrl,
            title: uploadTitle || null,
            description: uploadDescription || null,
            display_order: displayOrder
          },
          { withCredentials: true }
        )

        await loadImages()
        setShowUpload(false)
        setUploadFile(null)
        setUploadUrl('')
        setUploadTitle('')
        setUploadDescription('')
        setPreviewUrl('')
        alert('Image added successfully!')
      } catch (postError) {
        const errorMsg = postError.response?.data?.message || postError.message
        if (postError.response?.status === 401) {
          alert('Unauthorized: Please log in again.')
        } else if (postError.response?.status === 403) {
          alert('Forbidden: You need admin access to add images. Please make sure you are logged in as admin.')
        } else {
          alert('Error saving image: ' + errorMsg)
        }
      }
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message
      console.error('Upload error:', e)
      alert('Error uploading image: ' + errorMsg)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return
    setLoading(true)
    try {
      await axiosInstance.delete(`${base}/api/images/website/${imageId}`)
      await loadImages()
      alert('Image deleted successfully!')
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message
      if (e.response?.status === 403) {
        alert('Forbidden: Admin access required to delete images.')
      } else {
        alert('Error deleting image: ' + errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(imageId, isActive) {
    setLoading(true)
    try {
      await axios.put(
        `${base}/api/images/website/${imageId}`,
        { is_active: !isActive },
        { withCredentials: true }
      )
      await loadImages()
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message
      if (e.response?.status === 403) {
        alert('Forbidden: Admin access required to update images.')
      } else {
        alert('Error updating image: ' + errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-heading">Website Image Management</h2>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="btn flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Image
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 flex-wrap">
        {sections.map((section) => (
          <button
            key={section}
            onClick={() => setActiveSection(section)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all capitalize ${
              activeSection === section
                ? 'bg-brand-gold text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            {section}
          </button>
        ))}
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Add Image to {activeSection}</h3>
            <button onClick={() => setShowUpload(false)} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">Upload File</label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="upload-file"
                />
                <label htmlFor="upload-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-6 h-6 text-white/60" />
                  <span className="text-sm text-white/70">Click to upload</span>
                </label>
                {previewUrl && (
                  <img src={previewUrl} alt="Preview" className="mt-4 w-full h-32 object-cover rounded" />
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Or Image URL</label>
                <input
                  type="url"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  placeholder="https://example.com/image.jpg"
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Title (optional)</label>
                <input
                  type="text"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Description (optional)</label>
                <textarea
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <button
            onClick={handleUpload}
            disabled={loading || (!uploadFile && !uploadUrl)}
            className="btn w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Uploading...' : 'Add Image'}
          </button>
        </div>
      )}

      {/* Images Grid */}
      {loading ? (
        <div className="text-center py-10 text-white/60">Loading images...</div>
      ) : images.length === 0 ? (
        <div className="text-center py-10 text-white/60">
          No images in {activeSection} section. Add your first image above.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group rounded-xl overflow-hidden bg-white/5 border border-white/10">
              <div className="aspect-square relative">
                <img
                  src={image.image_url}
                  alt={image.title || `Image ${image.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleToggleActive(image.id, image.is_active)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                      image.is_active
                        ? 'bg-green-500/70 hover:bg-green-500/90'
                        : 'bg-gray-500/70 hover:bg-gray-500/90'
                    }`}
                  >
                    {image.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="p-2 rounded-lg bg-red-500/70 hover:bg-red-500/90 backdrop-blur"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </button>
                </div>
                {!image.is_active && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-red-500/80 backdrop-blur text-xs font-semibold">
                    Inactive
                  </div>
                )}
                <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-xs text-white">
                  #{image.display_order + 1}
                </div>
              </div>
              {(image.title || image.description) && (
                <div className="p-3">
                  {image.title && <div className="font-semibold text-sm mb-1">{image.title}</div>}
                  {image.description && <div className="text-xs text-white/60 line-clamp-2">{image.description}</div>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
