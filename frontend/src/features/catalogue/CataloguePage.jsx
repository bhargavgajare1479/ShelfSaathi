import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Package, Plus } from 'lucide-react'

export function CataloguePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Product Catalogue</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage your store&apos;s registered items, pack sizes, and manufacturer barcodes.
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </Button>
      </div>

      <Card className="text-center py-12">
        <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No products in catalogue</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
          Add items manually or confirm your first supplier invoice to populate your catalogue automatically.
        </p>
        <Button variant="secondary">Add First Product</Button>
      </Card>
    </div>
  )
}

