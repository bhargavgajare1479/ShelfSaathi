import React from 'react'

const BADGE_VARIANTS = {
  primary: 'bg-primary-subtle text-primary border-primary/20',
  success: 'bg-success-subtle text-success border-success/20',
  warning: 'bg-warning-subtle text-warning border-warning/20',
  danger: 'bg-danger-subtle text-danger border-danger/20',
  info: 'bg-info-subtle text-info border-info/20',
  neutral: 'bg-surface-muted text-text-secondary border-border',
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
  ...props
}) {
  const variantClass = BADGE_VARIANTS[variant] || BADGE_VARIANTS.neutral

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-badge border ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  )
}

