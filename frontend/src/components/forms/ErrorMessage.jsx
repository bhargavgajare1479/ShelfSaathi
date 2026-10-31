import React from 'react'

export function ErrorMessage({ id, children, className = '' }) {
  if (!children) return null

  return (
    <p id={id} className={`mt-1 text-xs text-danger font-medium ${className}`.trim()}>
      {children}
    </p>
  )
}

