import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner'
import { StoreOnboardingModal } from './StoreOnboardingModal'

export function ProtectedRoute() {
  const { session, loading, stores, activeStore } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-medium text-text-secondary mt-3">Loading store context...</p>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // First-time merchant onboarding
  if (stores.length === 0 && !activeStore) {
    return <StoreOnboardingModal />
  }

  return <Outlet />
}
