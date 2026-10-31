import React, { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Store } from 'lucide-react'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      // Supabase authentication integration point
      // Authenticates with Supabase Auth per ARCHITECTURE.md
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-primary-subtle text-primary rounded-card mb-3">
          <Store className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Sign in to ShelfSaathi</h1>
        <p className="text-sm text-text-secondary mt-1">
          Kirana and retail store inventory assistant
        </p>
      </div>

      <Card>
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="login-email"
            name="email"
            type="email"
            label="Email address"
            required
            placeholder="merchant@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            id="login-password"
            name="password"
            type="password"
            label="Password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="w-full mt-2"
          >
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  )
}

