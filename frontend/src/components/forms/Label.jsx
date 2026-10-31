import React from 'react'

export function Label({
  htmlFor,
  children,
  required = false,
  className = '',
  ...props
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-text-primary mb-1 ${className}`.trim()}
      {...props}
    >
      {children}
      {required && <span className="text-danger ml-0.5" aria-hidden="true">*</span>}
    </label>
  )
}

