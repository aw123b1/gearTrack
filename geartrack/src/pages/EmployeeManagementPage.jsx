import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Loader, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function EmployeeManagementPage() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [storeId, setStoreId] = useState(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'staff',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getStoreId()
  }, [])

  useEffect(() => {
    if (storeId) {
      fetchEmployees()
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

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setEmployees(data || [])
    } catch (err) {
      console.error('Fetch error:', err)
      setError(err.message || 'Failed to load employees')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenForm = (employee = null) => {
    if (employee) {
      setEditingId(employee.id)
      setFormData({
        full_name: employee.full_name || '',
        email: employee.email || '',
        role: employee.role || 'staff',
      })
    } else {
      setEditingId(null)
      setFormData({
        full_name: '',
        email: '',
        role: 'staff',
      })
    }
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({ full_name: '', email: '', role: 'staff' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (!formData.full_name.trim()) throw new Error('Full name is required')
      if (!formData.email.trim()) throw new Error('Email is required')

      if (editingId) {
        // UPDATE
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: formData.full_name.trim(),
            email: formData.email.trim(),
            role: formData.role,
          })
          .eq('id', editingId)

        if (updateError) throw updateError
      } else {
        // CREATE
        const { error: insertError } = await supabase
          .from('users')
          .insert([
            {
              full_name: formData.full_name.trim(),
              email: formData.email.trim(),
              role: formData.role,
              store_id: storeId,
            },
          ])

        if (insertError) throw insertError
      }

      handleCloseForm()
      fetchEmployees()
    } catch (err) {
      console.error('Submit error:', err)
      setError(err.message || 'Failed to save employee')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (employeeId) => {
    try {
      setDeleting(true)
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', employeeId)

      if (deleteError) throw deleteError
      setEmployees(employees.filter(e => e.id !== employeeId))
      setDeleteConfirm(null)
    } catch (err) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete employee')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-screen">
        <p className="font-body text-text-muted">Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="p-4 flex flex-col gap-6 max-w-4xl mx-auto w-full pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-primary">Employees</h2>
          <p className="font-body text-sm text-text-muted mt-0.5">Manage your team members</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-base font-heading font-semibold text-sm transition-colors"
        >
          <Plus size={18} />
          Add Employee
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-base p-3 text-sm font-body">
          {error}
        </div>
      )}

      {/* Employee List */}
      <div className="space-y-3">
        {employees.length === 0 ? (
          <div className="text-center py-8 bg-surface rounded-base border border-border">
            <p className="font-body text-text-muted">No employees yet</p>
            <p className="font-body text-xs text-text-muted mt-1">Add your first team member</p>
          </div>
        ) : (
          employees.map(employee => (
            <div
              key={employee.id}
              className="bg-surface rounded-base border border-border p-4 flex items-start justify-between"
            >
              <div className="flex-1 min-w-0">
                <p className="font-body font-semibold text-text">{employee.full_name}</p>
                <p className="font-body text-sm text-text-muted mt-0.5">{employee.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-sm bg-primary/10 text-primary">
                    {employee.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4 shrink-0">
                <button
                  onClick={() => handleOpenForm(employee)}
                  className="p-2 text-primary hover:bg-primary/10 rounded transition-colors"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => setDeleteConfirm(employee.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-base shadow-lg p-6 max-w-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg text-text">
                {editingId ? 'Edit Employee' : 'Add Employee'}
              </h3>
              <button
                onClick={handleCloseForm}
                disabled={submitting}
                className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              >
                <X size={20} className="text-text-muted" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="full_name" className="font-body text-sm font-semibold text-text">
                  Full Name
                </label>
                <input
                  id="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  disabled={submitting}
                  required
                  className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="email" className="font-body text-sm font-semibold text-text">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={submitting}
                  required
                  className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="role" className="font-body text-sm font-semibold text-text">
                  Role
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  disabled={submitting}
                  className="border border-border rounded-base px-4 py-2.5 text-sm font-body text-text focus:outline-none focus:ring-2 focus:ring-secondary transition disabled:opacity-50"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  disabled={submitting}
                  className="flex-1 border border-border rounded-base py-2.5 font-heading font-semibold text-sm hover:bg-background transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-base py-2.5 font-heading font-semibold text-sm transition-colors disabled:opacity-50"
                >
                  {submitting && <Loader size={16} className="animate-spin" />}
                  {editingId ? 'Save Changes' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-surface rounded-base shadow-lg p-6 max-w-sm w-full">
            <p className="font-heading font-semibold text-text mb-1">Delete Employee?</p>
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
