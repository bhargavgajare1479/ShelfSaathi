import { AuthProvider } from '../features/auth/AuthProvider'

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>
}
