import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './nav-items'

export function DesktopNavigation() {
  return (
    <nav className="hidden md:flex items-center space-x-1 border-b border-border bg-surface px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-btn text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-primary-subtle text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}

export function MobileBottomNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex items-center justify-around py-2 px-1">
      {NAV_ITEMS.slice(0, 5).map((item) => {
        const Icon = item.icon
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-1 rounded-btn text-xs font-medium transition-colors min-w-[56px] ${
                isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-primary'
              }`
            }
          >
            <Icon className="w-5 h-5 mb-0.5" />
            <span className="truncate max-w-[64px]">{item.label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
