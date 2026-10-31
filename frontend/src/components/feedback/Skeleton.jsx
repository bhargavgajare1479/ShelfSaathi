import React from 'react'

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-surface-muted rounded-btn ${className}`.trim()}
      aria-hidden="true"
      {...props}
    />
  )
}

