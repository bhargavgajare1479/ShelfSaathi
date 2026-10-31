import React from 'react'
import { Label } from './Label'
import { ErrorMessage } from './ErrorMessage'

export function FormField({
  id,
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) {
  return (
    <div className={`w-full ${className}`.trim()}>
      {label && (
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
      )}
      {children}
      <ErrorMessage id={id ? `${id}-error` : undefined}>{error}</ErrorMessage>
      {!error && helperText && (
        <p id={id ? `${id}-helper` : undefined} className="mt-1 text-xs text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
}

