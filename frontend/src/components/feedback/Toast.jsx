import React from 'react'
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertCircle,
  info: Info,
}

export function Toast({
  type = 'info',
  message,
  onClose,
  className = '',
}) {
  const Icon = ICONS[type] || ICONS.info

  return (
    <div
      role="status"
      className={`flex items-center justify-between gap-3 px-4 py-3 bg-surface border border-border shadow-md rounded-btn text-text-primary ${className}`.trim()}
    >
      <div className="flex items-center gap-2.5">
        <Icon className="w-5 h-5 text-primary" aria-hidden="true" />
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-text-secondary hover:text-text-primary p-1 rounded-btn focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

