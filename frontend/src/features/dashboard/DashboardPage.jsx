import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { Receipt, Sparkles, ArrowRight, Package } from 'lucide-react'

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Store Overview</h1>
          <p className="text-sm text-text-secondary mt-1">
            Welcome to ShelfSaathi. Convert supplier invoices, manage stock, and review reorder suggestions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/invoices">
            <Button variant="primary" className="flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              <span>Upload Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      <Alert variant="info" title="Kirana Assistant Ready">
        Review unconfirmed invoices and low-stock alerts below. Inventory is only modified upon explicit confirmation.
      </Alert>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Invoices To Review</span>
            <Badge variant="warning">Action Needed</Badge>
          </div>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
          <p className="text-xs text-text-secondary mt-1">Pending merchant review</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Catalogue Items</span>
            <Package className="w-4 h-4 text-text-muted" />
          </div>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
          <p className="text-xs text-text-secondary mt-1">Registered products</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Low Stock Items</span>
            <Badge variant="danger">Low Stock</Badge>
          </div>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
          <p className="text-xs text-text-secondary mt-1">Below minimum threshold</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Reorder Suggestions</span>
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <p className="text-3xl font-bold text-text-primary mt-2">0</p>
          <p className="text-xs text-text-secondary mt-1">Explainable draft items</p>
        </Card>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Invoice Intake"
          subtitle="Turn invoice photos into reviewable stock updates"
          footer={
            <Link to="/invoices" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover">
              <span>Go to Invoices</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        >
          <p className="text-sm text-text-secondary">
            Take a photo or upload a supplier bill. Our extraction parses lines and matches catalogue items for your confirmation.
          </p>
        </Card>

        <Card
          title="Barcode & Labels"
          subtitle="Scan camera barcodes and generate printable stickers"
          footer={
            <Link to="/barcodes" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover">
              <span>Open Scanner</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        >
          <p className="text-sm text-text-secondary">
            Lookup existing manufacturer barcodes or produce standard EAN-13 / Code-128 label sheets for unbarcoded items.
          </p>
        </Card>

        <Card
          title="Buying Copilot"
          subtitle="Deterministic reorder calculations with full explanations"
          footer={
            <Link to="/buying-copilot" className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover">
              <span>View Suggestions</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        >
          <p className="text-sm text-text-secondary">
            Transparent stock replenishment calculations with inspectable inputs, preventing stockouts and overstocking.
          </p>
        </Card>
      </div>
    </div>
  )
}
