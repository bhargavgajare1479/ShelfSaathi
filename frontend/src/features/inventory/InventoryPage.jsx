import React from 'react'
import { Card } from '../../components/ui/Card'
import { Boxes } from 'lucide-react'

export function InventoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Current Inventory</h1>
        <p className="text-sm text-text-secondary mt-1">
          Inspect on-hand quantities and verified stock movements.
        </p>
      </div>

      <Card className="text-center py-12">
        <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
          <Boxes className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No inventory recorded</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1">
          Stock levels will be established once products are added or confirmed from supplier invoices.
        </p>
      </Card>
    </div>
  )
}

