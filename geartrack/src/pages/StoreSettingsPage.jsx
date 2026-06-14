import { useEffect, useState } from 'react'
import { Save, X, Loader } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function StoreSettingsPage() {
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [storeName, setStoreName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [storeId, setStoreId] = useState(null)

  useEffect(() => {
    getStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchStore()
    }
  }, [storeId])

  const getStoreId = async () => {
    try {
      const { data: user } = await supabase.auth.getUser()
      if (!user?.user) throw new Error('Not authenticated')

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('store_id')
        .eq('id', user.user.id)
        .single()

      if (userError) throw userError
      setStoreId(userData.store_id)
    } catch (err) {
      console.error('Error getting store:', err)
      setError('Failed to load store information')
    }
  }

  const fetchStore = async () => {
    try {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single()

      if (fetchError) throw fetchError
      setStore(data)
      setStoreName(data.name || '')
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load store settings')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setStoreName(store?.name || '')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!storeName.trim()) throw new Error('Store name is required')

      const { error: updateError } = await supabase
        .from('stores')
        .update({ name: storeName.trim() })
        .eq('id', storeId)

      if (updateError) throw updateError

      setStore({ ...store, name: storeName.trim() })
      setIsEditing(false)
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to update store')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="font-body text-text-muted">Loading store settings...</p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-6 max-w-2xl mx-auto w-full pb-24">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">Store Settings</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">Manage your store information</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-base p-3 text-sm font-body">
          {error}
        </div>
      )}

      {store && (
        <div className="bg-surface rounded-base border border-border shadow-sm">
          {/* Store Name Section */}
          <div className="p-6 border-b border-border">
            <h3 className="font-heading font-semibold text-lg text-text mb-4">Store Name</h3>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="store-name" className="font-body text-sm font-semibold text-text">
                    Name
                  </label>
                  <input
                    id="store-name"
                    type="text"
                    placeholder="Your Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    disabled={submitting}
                    required
                    className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 flex-1 border border-border rounded-base py-2.5 font-heading font-semibold text-sm hover:bg-background transition-colors disabled:opacity-50"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center justify-center gap-2 flex-1 bg-primary hover:bg-primary-dark text-white rounded-base py-2.5 font-heading font-semibold text-sm transition-colors disabled:opacity-50"
                  >
                    {submitting && <Loader size={16} className="animate-spin" />}
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-body text-sm text-text-muted">Current name:</p>
                  <p className="font-heading text-lg font-semibold text-text mt-1">
                    {store.name}
                  </p>
                </div>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-base font-heading font-semibold text-sm transition-colors whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Store Info Section */}
          <div className="p-6">
            <h3 className="font-heading font-semibold text-lg text-text mb-4">Store Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-body text-sm text-text-muted">Store ID</p>
                <p className="font-body font-mono text-xs text-text mt-1 break-all">
                  {store.id}
                </p>
              </div>
              <div>
                <p className="font-body text-sm text-text-muted">Created</p>
                <p className="font-body text-sm text-text mt-1">
                  {new Date(store.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-base p-4">
        <p className="font-body text-sm text-blue-900">
          💡 <span className="font-semibold">Tip:</span> Your store settings are synced across all your team
          members. Changes are applied immediately.
        </p>
      </div>
    </div>
  )
}
