import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, LogOut, ChevronDown, Check } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { useAuth } from '../../features/auth/useAuth'

export function Header() {
  const { activeStore, stores, switchStore, signOut, user } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const storeName = activeStore?.name || 'My Kirana Store'
  const userRole = activeStore?.role || 'owner'

  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
            <span className="p-1.5 bg-primary-subtle text-primary rounded-btn">
              <Store className="w-5 h-5" />
            </span>
            <span>ShelfSaathi</span>
          </Link>
          <Badge variant="primary" className="hidden sm:inline-flex">
            Kirana Assistant
          </Badge>
        </div>

        {/* Store & Account Controls */}
        <div className="flex items-center gap-3">
          {/* Store Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 text-left px-3 py-1.5 rounded-btn border border-border hover:bg-surface-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="hidden sm:block text-right">
                <span className="text-[11px] text-text-muted block leading-none">Active Store</span>
                <span className="text-sm font-semibold text-text-primary truncate max-w-[140px] block mt-0.5">
                  {storeName}
                </span>
              </div>
              <Badge
                variant={userRole === 'owner' ? 'primary' : 'neutral'}
                className="text-[10px] py-0 px-1.5 uppercase font-bold tracking-wider"
              >
                {userRole === 'owner' ? 'Owner' : 'Staff'}
              </Badge>
              {stores.length > 1 && <ChevronDown className="w-3.5 h-3.5 text-text-muted" />}
            </button>

            {dropdownOpen && stores.length > 1 && (
              <div className="absolute right-0 mt-1.5 w-56 bg-surface border border-border rounded-card shadow-lg py-1 z-40">
                <div className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                  Switch Store
                </div>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      switchStore(s.id)
                      setDropdownOpen(false)
                    }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-surface-muted transition-colors"
                  >
                    <span className="font-medium truncate">{s.name}</span>
                    {s.id === activeStore?.id && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Sign Out */}
          {user && (
            <button
              type="button"
              onClick={signOut}
              title={`Sign out (${user.email || 'Merchant'})`}
              className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-danger px-2.5 py-1.5 rounded-btn hover:bg-danger-subtle transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
