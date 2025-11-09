import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { Upload, X, Trash2, Edit2, Save, Plus, Eye, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function ImageManager({ productId, productName, onImagesChange }) {
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:5000'
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editingImageId, setEditingImageId] = useState(null)
  const [editUrl, setEditUrl] = useState('')
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadStatus, setUploadStatus] = useState('')
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (productId) {
      loadImages()
    }
  }, [productId])

  async function loadImages() {
    try {
      const { data } = await axios.get(`${base}/api/images/products/${productId}`)
      const sorted = data.sort((a, b) => {
        if (a.display_order !== b.display_order) {
          return a.display_order - b.display_order
        }
        return a.id - b.id
      })
      setImages(sorted)
      console.log(`✅ Loaded ${sorted.length} images for product ${productId}`)
    } catch (e) {
      console.error('Error loading images:', e)
      setImages([])
    }
  }

  // Simple function to add a single image
  async function addSingleImage(imageUrl) {
    // Get current images count for display_order
    const { data: currentImages } = await axios.get(`${base}/api/images/products/${productId}`)
    const displayOrder = currentImages.length

    // Add the image
    const response = await axios.post(
      `${base}/api/images/products/${productId}`,
      { image_url: imageUrl, display_order: displayOrder },
      { withCredentials: true }
    )

    if (!response.data || !response.data.id) {
      throw new Error('Failed to add image - invalid response')
    }

    return response.data
  }

  // Handle multiple file upload
  async function handleMultipleFiles(files) {
    if (!files || files.length === 0) return

    setUploading(true)
    setUploadStatus(`Uploading ${files.length} image(s)...`)

    const uploadedUrls = []
    const errors = []

    try {
      // Step 1: Upload all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        setUploadStatus(`Uploading file ${i + 1} of ${files.length}...`)

        try {
          const formData = new FormData()
          formData.append('file', file)
          const { data } = await axios.post(`${base}/api/uploads/image`, formData, { withCredentials: true })
          uploadedUrls.push(data.url)
          console.log(`✅ File ${i + 1} uploaded: ${data.url}`)
        } catch (error) {
          errors.push(`File ${i + 1}: ${error.response?.data?.message || error.message}`)
          console.error(`❌ Error uploading file ${i + 1}:`, error)
        }
      }

      // Step 2: Add all uploaded URLs to database
      if (uploadedUrls.length > 0) {
        setUploadStatus(`Adding ${uploadedUrls.length} image(s) to product...`)

        const { data: currentImages } = await axios.get(`${base}/api/images/products/${productId}`)
        let displayOrder = currentImages.length

        for (let i = 0; i < uploadedUrls.length; i++) {
          const imageUrl = uploadedUrls[i]
          setUploadStatus(`Adding image ${i + 1} of ${uploadedUrls.length}...`)

          try {
            await axios.post(
              `${base}/api/images/products/${productId}`,
              { image_url: imageUrl, display_order: displayOrder },
              { withCredentials: true }
            )
            displayOrder++
            console.log(`✅ Image ${i + 1} added to database`)
          } catch (error) {
            errors.push(`Image ${i + 1}: ${error.response?.data?.message || error.message}`)
            console.error(`❌ Error adding image ${i + 1}:`, error)
          }
        }
      }

      // Step 3: Reload images
      await loadImages()
      if (onImagesChange) onImagesChange()

      // Show results
      if (errors.length > 0) {
        alert(`Uploaded ${uploadedUrls.length} image(s) successfully.\nErrors: ${errors.join('\n')}`)
      } else {
        alert(`✅ Successfully added ${uploadedUrls.length} image(s)!`)
      }

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Upload error:', error)
      alert('Error uploading images: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
      setUploadStatus('')
    }
  }

  // Handle single URL upload
  async function handleUrlUpload() {
    if (!uploadUrl || !uploadUrl.trim()) {
      alert('Please enter an image URL')
      return
    }

    setLoading(true)
    setUploadStatus('Adding image from URL...')

    try {
      // Get current images to check duplicates
      const { data: currentImages } = await axios.get(`${base}/api/images/products/${productId}`)
      
      const isDuplicate = currentImages.some(img => img.image_url === uploadUrl.trim())
      if (isDuplicate) {
        alert('This image URL is already added to this product.')
        setLoading(false)
        setUploadStatus('')
        return
      }

      // Add the image
      await addSingleImage(uploadUrl.trim())

      // Reload images
      await loadImages()
      if (onImagesChange) onImagesChange()

      alert('✅ Image added successfully!')
      setUploadUrl('')
      setUploadStatus('')

    } catch (error) {
      console.error('Error adding image:', error)
      const errorMsg = error.response?.data?.message || error.message
      
      if (error.response?.status === 401) {
        alert('Unauthorized: Please log in again.')
      } else if (error.response?.status === 403) {
        alert('Forbidden: Admin access required.')
      } else {
        alert('Error adding image: ' + errorMsg)
      }
    } finally {
      setLoading(false)
      setUploadStatus('')
    }
  }

  async function handleUpdate(imageId) {
    setLoading(true)
    try {
      await axios.put(
        `${base}/api/images/products/${imageId}`,
        { image_url: editUrl },
        { withCredentials: true }
      )
      await loadImages()
      setEditingImageId(null)
      setEditUrl('')
      if (onImagesChange) onImagesChange()
      alert('✅ Image updated successfully!')
    } catch (e) {
      alert('Error updating image: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(imageId) {
    if (!confirm('Are you sure you want to delete this image?')) return
    setLoading(true)
    try {
      await axios.delete(`${base}/api/images/products/${imageId}`, { withCredentials: true })
      await loadImages()
      if (onImagesChange) onImagesChange()
      alert('✅ Image deleted successfully!')
    } catch (e) {
      alert('Error deleting image: ' + (e.response?.data?.message || e.message))
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleMultipleFiles(files)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Product Images ({images.length})
        </h4>
      </div>

      {/* Upload Section - Simple and Clear */}
      <div className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4">
        <div className="text-sm font-medium">Add Images</div>
        
        {/* Option 1: Upload Multiple Files */}
        <div className="space-y-2">
          <label className="block text-xs mb-2">Upload Files (Select Multiple)</label>
          <div className="border-2 border-dashed border-white/20 rounded-lg p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="multiple-image-upload"
              disabled={uploading}
            />
            <label 
              htmlFor="multiple-image-upload" 
              className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Upload className="w-8 h-8 text-white/60" />
              <span className="text-sm text-white/70">
                {uploading ? 'Uploading...' : 'Click to select multiple images'}
              </span>
              <span className="text-xs text-white/50">You can select 2, 3, 4, 5 or more images at once</span>
            </label>
            {uploadStatus && (
              <div className="mt-3 text-xs text-brand-gold text-center">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>

        {/* Option 2: Add by URL */}
        <div className="space-y-2">
          <label className="block text-xs mb-2">Or Add by Image URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
              placeholder="https://example.com/image.jpg"
              value={uploadUrl}
              onChange={(e) => setUploadUrl(e.target.value)}
              disabled={loading || uploading}
            />
            <button
              onClick={handleUrlUpload}
              disabled={loading || uploading || !uploadUrl.trim()}
              className="px-4 py-2 rounded-lg bg-brand-gold text-black font-semibold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Plus className="w-4 h-4" />
                  </motion.div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div>
          <div className="mb-3 text-sm text-white/60">
            {images.length} image{images.length !== 1 ? 's' : ''} total
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group rounded-lg overflow-hidden bg-white/5 border border-white/10"
              >
                <div className="aspect-square relative">
                  <img
                    src={image.image_url}
                    alt={`${productName} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {editingImageId === image.id ? (
                      <div className="p-2 space-y-2 w-full px-3">
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="w-full px-2 py-1 rounded text-sm bg-black/80 text-white border border-white/20"
                          placeholder="New image URL"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdate(image.id)}
                            className="flex-1 px-2 py-1 rounded bg-brand-gold text-black text-xs font-semibold hover:bg-yellow-400"
                          >
                            <Save className="w-3 h-3 mx-auto" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingImageId(null)
                              setEditUrl('')
                            }}
                            className="px-2 py-1 rounded bg-white/20 text-white text-xs hover:bg-white/30"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingImageId(image.id)
                            setEditUrl(image.image_url)
                          }}
                          className="p-2 rounded-lg bg-black/70 hover:bg-black/90 backdrop-blur"
                        >
                          <Edit2 className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="p-2 rounded-lg bg-red-500/70 hover:bg-red-500/90 backdrop-blur"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="absolute top-2 left-2 px-2 py-1 rounded bg-black/70 backdrop-blur text-xs text-white font-semibold">
                    #{index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-white/60 text-sm">
          No images yet. Add images using the options above.
        </div>
      )}
    </div>
  )
}
