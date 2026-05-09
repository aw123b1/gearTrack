import { useNavigate } from 'react-router-dom'
import { Monitor, ShoppingCart, AlertTriangle, Camera } from 'lucide-react'
import StatCard from '../components/StatCard'

const STATS = [
  {
    label: 'Computers in Stock',
    value: 14,
    Icon: Monitor,
    colorClass: 'text-primary',
    bgClass: 'bg-primary/10',
  },
  {
    label: 'Sold Today',
    value: 3,
    Icon: ShoppingCart,
    colorClass: 'text-secondary',
    bgClass: 'bg-secondary/10',
  },
  {
    label: 'Low Stock Alerts',
    value: 2,
    Icon: AlertTriangle,
    colorClass: 'text-accent',
    bgClass: 'bg-accent/10',
    className: 'col-span-2',
  },
]

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
  return (
    <div className="p-4 flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div>
        <h2 className="font-heading text-xl font-bold text-primary">Dashboard</h2>
        <p className="font-body text-sm text-text-muted mt-0.5">Your inventory at a glance</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {STATS.map(({ className, ...props }) => (
          <StatCard key={props.label} className={className ?? ''} {...props} />
        ))}
      </div>

      <div className="border-t border-border" />

      <ScanCTA />
    </div>
  )
}
