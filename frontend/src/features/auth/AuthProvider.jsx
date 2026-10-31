import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './context'
import { supabase } from '../../lib/supabase-client'
import { apiRequest } from '../../lib/api-client'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [stores, setStores] = useState([])
  const [activeStore, setActiveStore] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = session?.access_token ?? null

  const fetchStoreContext = useCallback(async (authToken) => {
    if (!authToken) {
      setStores([])
      setActiveStore(null)
      return
    }

    try {
      const meData = await apiRequest('/me', {}, authToken)
      const userStores = meData?.stores || []
      setStores(userStores)

      if (userStores.length > 0) {
        const savedStoreId = localStorage.getItem('shelfsaathi_active_store_id')
        const matched = userStores.find((s) => s.id === savedStoreId)
        const selected = matched || userStores[0]
        setActiveStore(selected)
        localStorage.setItem('shelfsaathi_active_store_id', selected.id)
      } else {
        setActiveStore(null)
      }
    } catch (err) {
      console.warn('Could not fetch store context from API:', err.message)
    }
  }, [])

  useEffect(() => {
    let mounted = true

    async function initAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession()
        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
          if (initialSession?.access_token) {
            await fetchStoreContext(initialSession.access_token)
          }
          setLoading(false)
        }
      } catch (err) {
        if (mounted) {
          setError(err.message)
          setLoading(false)
        }
      }
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, updatedSession) => {
      if (mounted) {
        setSession(updatedSession)
        setUser(updatedSession?.user ?? null)
        if (updatedSession?.access_token) {
          await fetchStoreContext(updatedSession.access_token)
        } else {
          setStores([])
          setActiveStore(null)
        }
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [fetchStoreContext])

  const createStore = async (name) => {
    if (!token) throw new Error('Not authenticated')
    const newStore = await apiRequest(
      '/stores',
      {
        method: 'POST',
        body: JSON.stringify({ name }),
      },
      token
    )
    const updatedStores = [...stores, newStore]
    setStores(updatedStores)
    setActiveStore(newStore)
    localStorage.setItem('shelfsaathi_active_store_id', newStore.id)
    return newStore
  }

  const switchStore = (storeId) => {
    const store = stores.find((s) => s.id === storeId)
    if (store) {
      setActiveStore(store)
      localStorage.setItem('shelfsaathi_active_store_id', store.id)
    }
  }

  const signIn = async (email, password) => {
    setError(null)
    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (authErr) throw authErr
    return data
  }

  const signUp = async (email, password) => {
    setError(null)
    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    })
    if (authErr) throw authErr
    return data
  }

  const signOut = async () => {
    localStorage.removeItem('shelfsaathi_active_store_id')
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setStores([])
    setActiveStore(null)
  }

  const value = {
    session,
    user,
    token,
    stores,
    activeStore,
    loading,
    error,
    createStore,
    switchStore,
    signIn,
    signUp,
    signOut,
    refreshStores: () => fetchStoreContext(token),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

