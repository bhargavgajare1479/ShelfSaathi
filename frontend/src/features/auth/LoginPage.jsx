import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Store, UserPlus, LogIn } from 'lucide-react'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { signIn, signUp, createStore } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [storeName, setStoreName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        await signIn(email, password)
        navigate(from, { replace: true })
      } else {
        const data = await signUp(email, password)
        if (data.session) {
          if (storeName.trim()) {
            try {
              await createStore(storeName.trim())
            } catch (storeErr) {
              console.warn('Initial store creation deferred:', storeErr.message)
            }
          }
          navigate(from, { replace: true })
        } else {
          setSuccessMessage(
            'Account created! If email confirmation is enabled on your Supabase project, check your inbox.'
          )
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <div className="inline-flex p-3 bg-primary-subtle text-primary rounded-card mb-3">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">ShelfSaathi</h1>
          <p className="text-sm text-text-secondary mt-1">
            Mobile-first Kirana and retail inventory operating assistant
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="shadow-md">
          {/* Tabs */}
          <div className="flex border-b border-border mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setError(null)
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setError(null)
              }}
              className={`flex-1 pb-3 text-sm font-semibold text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                mode === 'signup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text-primary'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="mb-4">
              {successMessage}
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
              helperText={mode === 'signup' ? 'At least 6 characters' : undefined}
            />

            {mode === 'signup' && (
              <Input
                id="signup-store-name"
                name="storeName"
                label="Store Name (Optional)"
                placeholder="e.g. Balaji Kirana Store"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                helperText="You can also set this after registration."
              />
            )}

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              {mode === 'login' ? 'Sign in to Store' : 'Create Merchant Account'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  )
}
