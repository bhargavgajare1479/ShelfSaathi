import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { Receipt, UploadCloud, ChevronRight, Loader2, Sparkles } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { invoicesApi } from './api'
import { UploadInvoiceModal } from './UploadInvoiceModal'
import { InvoiceReviewView } from './InvoiceReviewView'

export function InvoicesPage() {
  const { activeStore, token } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [error, setError] = useState(null)

  const fetchInvoices = useCallback(async () => {
    if (!activeStore?.id) return
    setIsLoading(true)
    setError(null)
    try {
      const filter = statusFilter === 'all' ? null : statusFilter
      const response = await invoicesApi.listInvoices(activeStore.id, filter, token)
      setInvoices(response || [])
    } catch (err) {
      setError(err.message || 'Failed to load invoices.')
    } finally {
      setIsLoading(false)
    }
  }, [activeStore?.id, statusFilter, token])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const handleUploadSuccess = (newInvoice) => {
    setInvoices((prev) => [newInvoice, ...prev])
    setSelectedInvoice(newInvoice)
  }

  // If an invoice is currently selected for review, display review view
  if (selectedInvoice) {
    return (
      <InvoiceReviewView
        invoice={selectedInvoice}
        onBack={() => {
          setSelectedInvoice(null)
          fetchInvoices()
        }}
        onInvoiceUpdated={() => {
          fetchInvoices()
        }}
      />
    )
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return <Badge variant="success">CONFIRMED</Badge>
      case 'review_required':
        return <Badge variant="warning">NEEDS REVIEW</Badge>
      case 'processing':
        return <Badge variant="info">PROCESSING</Badge>
      case 'failed':
        return <Badge variant="danger">FAILED</Badge>
      default:
        return <Badge variant="neutral">{status.toUpperCase()}</Badge>
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Supplier Invoices</h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload supplier bills, review extracted line items, and confirm stock updates.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload Invoice</span>
        </Button>
      </div>

      <Alert variant="info" title="Human Review Boundary">
        Google Gemini Vision and RapidFuzz catalogue matching suggest candidate quantities and products. Inventory changes are only applied upon explicit merchant confirmation.
      </Alert>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        {[
          { id: 'all', label: 'All Invoices' },
          { id: 'review_required', label: 'Needs Review' },
          { id: 'confirmed', label: 'Confirmed' },
          { id: 'failed', label: 'Failed' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              statusFilter === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <Alert variant="danger" title="Load Error">
          {error}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Loading store invoices...</p>
        </div>
      ) : invoices.length === 0 ? (
        /* Empty State */
        <Card className="text-center py-12">
          <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
            <Receipt className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No invoices found</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
            Capture or upload your first supplier invoice to extract items, match catalogue products, and update inventory.
          </p>
          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Select Invoice File</span>
          </Button>
        </Card>
      ) : (
        /* Invoices List */
        <div className="grid grid-cols-1 gap-3">
          {invoices.map((inv) => (
            <Card
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className="p-4 hover:border-primary/50 hover:shadow-elevation-1 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-xl bg-primary-subtle text-primary flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text-primary truncate">
                      {inv.original_filename || `Bill ${inv.id.slice(0, 8)}`}
                    </span>
                    {getStatusBadge(inv.status)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary mt-1">
                    <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{inv.lines?.length || 0} line items</span>
                    {inv.extraction_provider && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Sparkles className="w-3 h-3" />
                          <span>{inv.extraction_provider}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:inline-flex group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-colors"
                >
                  Review Lines
                </Button>
                <ChevronRight className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <UploadInvoiceModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}
