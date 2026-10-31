import React from 'react'

export function Providers({ children }) {
  // Provider boundaries for future global context, notifications, query client, etc.
  return <>{children}</>
}

