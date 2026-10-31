import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Barcode, Camera, Printer } from 'lucide-react'

export function BarcodesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Barcodes & Label Printing</h1>
          <p className="text-sm text-text-secondary mt-1">
            Scan manufacturer barcodes using your device camera or print custom barcode stickers for unbarcoded items.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            <span>Scan Camera Barcode</span>
          </Button>
          <Button variant="primary" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Prepare Label Sheet</span>
          </Button>
        </div>
      </div>

      <Card className="text-center py-12">
        <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
          <Barcode className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">Barcode scanner ready</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
          Use camera scanning with manual fallback to lookup items or format printable EAN-13 / Code-128 sticker layouts.
        </p>
        <Button variant="secondary">Lookup Barcode Manually</Button>
      </Card>
    </div>
  )
}

