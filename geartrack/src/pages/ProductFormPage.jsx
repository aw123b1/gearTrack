import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X } from 'lucide-react'

function Field({ label, id, type = 'text', placeholder, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="font-body text-sm font-semibold text-text">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className="
          border border-border rounded-base
          px-4 py-3
          text-base font-body text-text
          placeholder:text-text-muted
          focus:outline-none focus:ring-2 focus:ring-secondary
          bg-white transition
        "
      />
      {hint && <p className="font-body text-xs text-text-muted">{hint}</p>}
    </div>
  )
}

function ToggleSwitch({ id, checked, onChange }) {
  return (
    <div className="relative inline-flex items-center shrink-0">
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      {/* track */}
      <div className="w-12 h-6 bg-border rounded-full transition-colors duration-200 peer-checked:bg-secondary" />
      {/* thumb */}
      <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-6" />
    </div>
  )
}

export default function ProductFormPage() {
  const navigate = useNavigate()
  const [syncEnabled, setSyncEnabled] = useState(false)

  return (
    <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">New Product</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">
          Add a scanned computer to inventory
        </p>
      </div>

      <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
        {/* Fields card */}
        <div className="bg-surface rounded-base shadow-sm p-4 flex flex-col gap-5">
          <Field
            label="Serial Number (SN)"
            id="sn"
            placeholder="e.g. SN-2024-ABCD123"
            hint="Found on the device label or BIOS screen"
          />

          <Field
            label="Model"
            id="model"
            placeholder="e.g. Dell Inspiron 15 3520"
          />

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
            <ToggleSwitch
              id="sync"
              checked={syncEnabled}
              onChange={e => setSyncEnabled(e.target.checked)}
            />
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
            className="
              flex-1 flex items-center justify-center gap-2
              border border-border bg-surface text-text
              font-heading font-semibold text-sm
              py-3.5 rounded-base
              hover:bg-background active:scale-95
              transition-all duration-150
            "
          >
            <X size={16} />
            Cancel
          </button>

          <button
            type="submit"
            className="
              flex-1 flex items-center justify-center gap-2
              bg-primary hover:bg-primary-dark text-white
              font-heading font-semibold text-sm
              py-3.5 rounded-base
              active:scale-95
              transition-all duration-150
              shadow-md shadow-primary/20
            "
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </form>
    </div>
  )
}
