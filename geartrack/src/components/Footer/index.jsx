import { Package } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border py-6 px-4">
      <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-1.5">
          <Package size={14} className="text-primary" />
          <span className="font-heading font-semibold text-sm text-primary">GearTrack</span>
        </div>
        <p className="font-body text-xs text-text-muted">
          Multi-tenant inventory management for computer hardware stores
        </p>
        <p className="font-body text-xs text-text-muted mt-1">
          © {new Date().getFullYear()} GearTrack — All data shown is placeholder only
        </p>
      </div>
    </footer>
  )
}
