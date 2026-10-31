import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { ClipboardList, Plus } from 'lucide-react'

export function PurchaseOrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Purchase Order Drafts</h1>
          <p className="text-sm text-text-secondary mt-1">
            Review and edit draft supplier orders created from approved reorder recommendations.
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>New PO Draft</span>
        </Button>
      </div>

      <Card className="text-center py-12">
        <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
          <ClipboardList className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No purchase order drafts</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
          Draft orders allow reviewing supplier items and quantities before sharing. No automated purchasing is performed in MVP.
        </p>
        <Button variant="secondary">Create Empty Draft</Button>
      </Card>
    </div>
  )
}

