import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Store, ArrowRight } from 'lucide-react'
import { useAuth } from './useAuth'

export function StoreOnboardingModal() {
  const { createStore } = useAuth()
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!storeName.trim()) {
      setError('Please enter a store name')
      return
    }

    setError(null)
    setLoading(true)
    try {
      await createStore(storeName.trim())
    } catch (err) {
      setError(err.message || 'Failed to create store workspace. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <div className="text-center mb-6">
            <div className="inline-flex p-3 bg-primary-subtle text-primary rounded-card mb-3">
              <Store className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-text-primary">Welcome to ShelfSaathi</h2>
            <p className="text-sm text-text-secondary mt-1">
              Let&apos;s create your Kirana store workspace. You will be set as the Store Owner.
            </p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            <Input
              id="onboarding-store-name"
              label="Kirana / Retail Store Name"
              placeholder="e.g. Laxmi Provision & General Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
              helperText="You can invite staff members to your store once created."
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full flex items-center justify-center gap-2 mt-2"
            >
              <span>Create Store Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
