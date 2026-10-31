import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Receipt, UploadCloud } from 'lucide-react'

export function InvoicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Supplier Invoices</h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload supplier bills, review extracted line items, and confirm stock updates.
          </p>
        </div>
        <Button variant="primary" className="flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          <span>Upload Invoice Image</span>
        </Button>
      </div>

      <Alert variant="info" title="Human Review Boundary">
        AI extracts candidate quantities and products. Inventory changes are only applied when you review and confirm the lines.
      </Alert>

      {/* Empty State */}
      <Card className="text-center py-12">
        <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
          <Receipt className="w-8 h-8" />
        </div>
        <h3 className="text-base font-semibold text-text-primary">No invoices uploaded yet</h3>
        <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
          Capture or upload your first supplier invoice to convert line items into catalogue products and stock.
        </p>
        <Button variant="primary" className="inline-flex items-center gap-2">
          <UploadCloud className="w-4 h-4" />
          <span>Select Invoice File</span>
        </Button>
      </Card>
    </div>
  )
}
