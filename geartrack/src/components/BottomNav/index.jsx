import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ScanLine, PlusSquare } from 'lucide-react'

const NAV_ITEMS = [
  { to: '/',            label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/scanner',     label: 'Scanner',   Icon: ScanLine },
  { to: '/product/new', label: 'Add Item',  Icon: PlusSquare },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface border-t border-border h-16 flex">
      {NAV_ITEMS.map(({ to, label, Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
              isActive ? 'text-primary' : 'text-text-muted hover:text-primary'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`font-body ${isActive ? 'font-semibold' : 'font-normal'}`}>
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
