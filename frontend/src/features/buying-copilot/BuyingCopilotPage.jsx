import React from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Sparkles, FilePlus2 } from 'lucide-react'

export function BuyingCopilotPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Buying Copilot</h1>
          <p className="text-sm text-text-secondary mt-1">
            Explainable reorder recommendations calculated from stock levels and demand thresholds.
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <FilePlus2 className="w-4 h-4" />
          <span>Create Purchase Order Draft</span>
        </Button>
      </div>

      <Alert variant="info" title="Explainable Logic">
        Suggestions are advisory. The calculation formula, days of stock remaining, and input data are transparently displayed before you decide to generate an editable purchase order draft.
      </Alert>

      <Card className="text-center py-12">
        <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No reorder suggestions pending</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
          Suggestions will appear here when inventory records indicate items approaching reorder thresholds.
        </p>
      </Card>
    </div>
  )
}

