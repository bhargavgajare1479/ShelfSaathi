import React from 'react'
import { Link } from 'react-router-dom'
import { Store, User } from 'lucide-react'
import { Badge } from '../ui/Badge'

export function Header({ storeName = 'My Kirana Store' }) {
  return (
    <header className="sticky top-0 z-30 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-text-muted block">Active Store</span>
            <span className="text-sm font-semibold text-text-primary block">{storeName}</span>
          </div>
          <Link
            to="/auth/login"
            className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-btn hover:bg-surface-muted transition-colors"
          >
            <User className="w-4 h-4" />
            <span>Account</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

