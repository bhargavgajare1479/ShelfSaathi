import React from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'

const ALERT_CONFIG = {
  info: {
    containerClass: 'bg-info-subtle border-info/30 text-info',
    Icon: Info,
  },
  success: {
    containerClass: 'bg-success-subtle border-success/30 text-success',
    Icon: CheckCircle2,
  },
  warning: {
    containerClass: 'bg-warning-subtle border-warning/30 text-warning',
    Icon: AlertTriangle,
  },
  danger: {
    containerClass: 'bg-danger-subtle border-danger/30 text-danger',
    Icon: AlertCircle,
  },
}

export function Alert({
  variant = 'info',
  title,
  children,
  className = '',
  ...props
}) {
  const config = ALERT_CONFIG[variant] || ALERT_CONFIG.info
  const Icon = config.Icon

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-3.5 rounded-btn border ${config.containerClass} ${className}`.trim()}
      {...props}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="text-sm">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div className="opacity-95">{children}</div>
      </div>
    </div>
  )
}

