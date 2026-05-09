import { Outlet } from 'react-router-dom'
import TopNavbar from './TopNavbar'
import BottomNav from './BottomNav'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavbar />

      {/* pt-14 clears TopNavbar (h-14), pb-16 clears BottomNav (h-16) */}
      <main className="flex-1 pt-14 pb-16 overflow-y-auto">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
