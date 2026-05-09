import { Package, UserCircle } from 'lucide-react'

export default function TopNavbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-white h-14 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center gap-2">
        <Package size={20} className="text-accent" />
        <span className="font-heading font-semibold text-lg tracking-tight">GearTrack</span>
      </div>

      <button
        aria-label="User profile"
        className="p-1 rounded-full hover:bg-primary-light transition-colors"
      >
        <UserCircle size={28} strokeWidth={1.5} />
      </button>
    </header>
  )
}
