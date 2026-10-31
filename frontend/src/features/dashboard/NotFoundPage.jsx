import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-text-primary mb-2">404</h1>
        <h2 className="text-lg font-semibold text-text-primary mb-1">Page not found</h2>
        <p className="text-sm text-text-secondary mb-6">
          The requested page does not exist or has been moved.
        </p>
        <Link to="/">
          <Button variant="primary">Return to Overview</Button>
        </Link>
      </div>
    </div>
  )
}

