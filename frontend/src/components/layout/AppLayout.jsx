import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { DesktopNavigation, MobileBottomNavigation } from './Navigation'

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <DesktopNavigation />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-8">
        <Outlet />
      </main>
      <MobileBottomNavigation />
    </div>
  )
}

