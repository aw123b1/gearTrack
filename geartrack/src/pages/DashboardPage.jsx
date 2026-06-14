import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Monitor, ShoppingCart, AlertTriangle, Camera, Trash2, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StatCard from '../components/StatCard'

function ScanCTA() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <p className="font-body text-xs font-semibold text-text-muted uppercase tracking-widest">
        Quick Action
      </p>

      <button
        onClick={() => navigate('/scanner')}
        aria-label="Scan new item"
        className="
          w-24 h-24 rounded-full
          bg-accent hover:bg-accent-dark
          active:scale-95
          text-white
          shadow-lg shadow-accent/30
          flex items-center justify-center
          transition-all duration-150
        "
      >
        <Camera size={36} strokeWidth={1.5} />
      </button>

      <p className="font-heading font-semibold text-text text-base">Scan New Item</p>
      <p className="font-body text-xs text-text-muted">Tap to open camera scanner</p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [computers, setComputers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchComputers()
  }, [])

  const fetchComputers = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('computers')
        .select('*')
        .order('updated_at', { ascending: false })

      if (fetchError) throw fetchError
      setComputers(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load computers')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (computerId) => {
    try {
      setDeleting(true)
      const { error: deleteError } = await supabase
        .from('computers')
        .delete()
        .eq('id', computerId)

      if (deleteError) throw deleteError
      setComputers(computers.filter(c => c.id !== computerId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete computer')
    } finally {
      setDeleting(false)
    }
  }

  const stats = [
    {
      label: 'Computers in Stock',
      value: computers.filter(c => c.status === 'in_stock').length,
      Icon: Monitor,
      colorClass: 'text-primary',
      bgClass: 'bg-primary/10',
    },
    {
      label: 'Sold Today',
      value: computers.filter(c => c.status === 'sold').length,
      Icon: ShoppingCart,
      colorClass: 'text-secondary',
      bgClass: 'bg-secondary/10',
    },
    {
      label: 'In Repair',
      value: computers.filter(c => c.status === 'repair').length,
      Icon: AlertTriangle,
      colorClass: 'text-accent',
      bgClass: 'bg-accent/10',
      className: 'col-span-2',
    },
  ]

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="font-body text-text-muted">Loading inventory...</p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-6 max-w-2xl mx-auto w-full pb-24">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">Dashboard</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">Your inventory at a glance</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-base p-3 text-sm font-body">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ className, ...props }) => (
          <StatCard key={props.label} className={className ?? ''} {...props} />
        ))}
      </div>

      <div className="border-t border-border" />

      <ScanCTA />

      {/* Computer List */}
      {computers.length > 0 && (
        <div className="flex flex-col gap-3 mt-4">
          <h3 className="font-heading font-semibold text-text">Inventory ({computers.length})</h3>
          <div className="space-y-2">
            {computers.map((computer) => (
              <div
                key={computer.id}
                className="bg-surface rounded-base border border-border p-3 flex items-start gap-3 justify-between"
              >
                {/* Image Thumbnail */}
                <div className="shrink-0">
                  {computer.image_url ? (
                    <img
                      src={computer.image_url}
                      alt={computer.model_name}
                      className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <ImageIcon size={24} className="text-text-muted" />
                    </div>
                  )}
                </div>

                {/* Computer Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-sm text-text truncate">
                    {computer.model_name}
                  </p>
                  <p className="font-body text-xs text-text-muted mt-0.5">
                    SN: {computer.serial_number}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded-sm ${
                        computer.status === 'in_stock'
                          ? 'bg-green-100 text-green-700'
                          : computer.status === 'sold'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {computer.status}
                    </span>
                    {computer.is_synced && (
                      <span className="text-xs text-primary font-semibold">✓ Synced</span>
                    )}
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => setDeleteConfirm(computer.id)}
                  disabled={deleting}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 shrink-0"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {computers.length === 0 && !error && (
        <div className="text-center py-8">
          <p className="font-body text-text-muted">No items in inventory yet</p>
          <p className="font-body text-xs text-text-muted mt-1">Use the scan button to add one</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-base shadow-lg p-6 max-w-sm w-full">
            <p className="font-heading font-semibold text-text mb-1">Delete Item?</p>
            <p className="font-body text-sm text-text-muted mb-4">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 border border-border rounded-base py-2.5 font-heading font-semibold text-sm hover:bg-background transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                className="flex-1 bg-red-600 text-white rounded-base py-2.5 font-heading font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
