import { useMemo } from 'react'
import { generateBarcodeSvg } from '../../lib/barcode'

export function BarcodeWidget({
  value,
  barWidth = 2,
  height = 44,
  showText = true,
  fontSize = 11,
  className = '',
}) {
  const result = useMemo(() => {
    if (!value) return null
    return generateBarcodeSvg(value, { barWidth, height, showText, fontSize })
  }, [value, barWidth, height, showText, fontSize])

  if (!result) {
    return <div className="text-xs text-text-muted italic">No barcode</div>
  }

  return (
    <div
      className={`inline-block ${className}`}
      dangerouslySetInnerHTML={{ __html: result.svgXml }}
    />
  )
}

