import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Save, X, Loader, Upload, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ProductFormPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [serialNumber, setSerialNumber] = useState(location.state?.serial_number ?? '')
  const [modelName, setModelName] = useState(location.state?.model_name ?? '')
  const [status, setStatus] = useState('in_stock')
  const [syncEnabled, setSyncEnabled] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storeId, setStoreId] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // Image upload state
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const getStoreId = async () => {
      try {
        const { data: userAuth } = await supabase.auth.getUser()
        if (!userAuth?.user) throw new Error('Not authenticated')

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('store_id')
          .eq('id', userAuth.user.id)
          .single()

        if (userError) throw userError
        setStoreId(userData.store_id)
      } catch (err) {
        console.error('Store lookup error:', err)
        setError('Failed to get store information: ' + err.message)
      } finally {
        setUserLoading(false)
      }
    }

    getStoreId()
  }, [])

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError('File too large (max 5MB)')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const uploadImage = async (file) => {
    try {
      setUploading(true)

      const fileExt = file.name.split('.').pop()
      const fileName = `${storeId}/${Date.now()}.${fileExt}`

      const { data, error: uploadError } = await supabase.storage
        .from('computer-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('computer-images')
        .getPublicUrl(data.path)

      return publicUrlData.publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      throw new Error('Failed to upload image: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!storeId) throw new Error('Store ID not loaded')
      if (!serialNumber.trim()) throw new Error('Serial Number is required')
      if (!modelName.trim()) throw new Error('Model Name is required')

      // Upload image if selected
      let imageUrl = null
      if (imageFile) {
        imageUrl = await uploadImage(imageFile)
      }

      const { error: insertError } = await supabase
        .from('computers')
        .insert([
          {
            store_id: storeId,
            serial_number: serialNumber.trim(),
            model_name: modelName.trim(),
            status: status,
            is_synced: syncEnabled,
            image_url: imageUrl,
          },
        ])

      if (insertError) throw insertError

      setSerialNumber('')
      setModelName('')
      setStatus('in_stock')
      setSyncEnabled(false)
      setImageFile(null)
      setImagePreview(null)
      navigate('/')
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to save product')
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto w-full pb-24">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">New Product</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">
          Add a scanned computer to inventory
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-base p-3 text-sm font-body">
          {error}
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        {/* Image Upload Section */}
        <div className="bg-surface rounded-base shadow-sm p-4">
          <label className="font-body text-sm font-semibold text-text block mb-3">
            Product Image (Optional)
          </label>

          {imagePreview ? (
            <div className="flex flex-col gap-3">
              <div className="relative w-full h-40 bg-gray-100 rounded-base overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader size={24} className="text-white animate-spin" />
                      <p className="font-body text-xs text-white">Uploading...</p>
                    </div>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                disabled={uploading || loading}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-base text-sm font-body transition-colors disabled:opacity-50"
              >
                <X size={16} />
                Remove Image
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-border rounded-base p-6 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <Upload size={32} className="text-text-muted" />
              <div className="text-center">
                <p className="font-body font-semibold text-sm text-text">
                  Click to upload image
                </p>
                <p className="font-body text-xs text-text-muted mt-1">
                  or drag and drop (max 5MB)
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading || userLoading}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Fields card */}
        <div className="bg-surface rounded-base shadow-sm p-4 flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="sn" className="font-body text-sm font-semibold text-text">
              Serial Number (SN)
            </label>
            <input
              id="sn"
              type="text"
              placeholder="e.g. SN-2024-ABCD123"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              disabled={loading || userLoading || uploading}
              required
              className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
            />
            <p className="font-body text-xs text-text-muted">
              Found on the device label or BIOS screen
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="model" className="font-body text-sm font-semibold text-text">
              Model
            </label>
            <input
              id="model"
              type="text"
              placeholder="e.g. Dell Inspiron 15 3520"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              disabled={loading || userLoading || uploading}
              required
              className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className="font-body text-sm font-semibold text-text">
              Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              disabled={loading || userLoading || uploading}
              className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
            >
              <option value="in_stock">In Stock</option>
              <option value="sold">Sold</option>
              <option value="repair">Repair</option>
            </select>
          </div>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Toggle row */}
          <label
            htmlFor="sync"
            className="flex items-center justify-between gap-4 cursor-pointer"
          >
            <div className="flex flex-col gap-0.5">
              <p className="font-body font-semibold text-sm text-text">
                Sync to E-commerce Site
              </p>
              <p className="font-body text-xs text-text-muted">
                Automatically publish this item when saved
              </p>
            </div>
            <div className="relative inline-flex items-center shrink-0">
              <input
                type="checkbox"
                id="sync"
                className="sr-only peer"
                checked={syncEnabled}
                onChange={(e) => setSyncEnabled(e.target.checked)}
                disabled={loading || userLoading || uploading}
              />
              <div className="w-12 h-6 bg-border rounded-full transition-colors duration-200 peer-checked:bg-secondary" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-6" />
            </div>
          </label>

          {syncEnabled && (
            <p className="font-body text-xs text-secondary bg-secondary/10 rounded-lg px-3 py-2">
              This item will be listed on your connected store once saved.
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            disabled={loading || userLoading || uploading}
            className="flex-1 flex items-center justify-center gap-2 border border-border bg-surface text-text font-heading font-semibold text-sm py-3.5 rounded-base hover:bg-background active:scale-95 transition-all duration-150 disabled:opacity-50"
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || userLoading || uploading || !storeId}
            className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-heading font-semibold text-sm py-3.5 rounded-base active:scale-95 transition-all duration-150 shadow-md shadow-primary/20 disabled:opacity-50"
          >
            {(loading || uploading) && <Loader size={16} className="animate-spin" />}
            <Save size={16} />
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
