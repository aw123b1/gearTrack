import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, UserCircle, LogOut } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data.session?.user || null)
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setShowMenu(false)
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-white h-14 flex items-center justify-between px-4 shadow-md">
      <div className="flex items-center gap-2">
        <Package size={20} className="text-accent" />
        <span className="font-heading font-semibold text-lg tracking-tight">GearTrack</span>
      </div>

      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          aria-label="User menu"
          className="p-1 rounded-full hover:bg-primary-light transition-colors"
        >
          <UserCircle size={28} strokeWidth={1.5} />
        </button>

        {showMenu && user && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-base shadow-lg py-1 border border-border">
            <div className="px-4 py-2 border-b border-border">
              <p className="font-body font-semibold text-sm text-text truncate">
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-body text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
