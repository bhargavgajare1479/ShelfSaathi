import React from 'react'

export function Card({
  children,
  className = '',
  title,
  subtitle,
  footer,
  ...props
}) {
  return (
    <div
      className={`bg-surface border border-border rounded-card p-4 sm:p-6 shadow-sm ${className}`.trim()}
      {...props}
    >
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="text-lg font-semibold text-text-primary">{title}</h3>}
          {subtitle && <p className="text-sm text-text-secondary mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div>{children}</div>
      {footer && <div className="mt-4 pt-4 border-t border-border">{footer}</div>}
    </div>
  )
}

