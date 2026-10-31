import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import {
  ArrowLeft,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Eye,
  Save,
  Check,
} from 'lucide-react'
import { invoicesApi } from './api'
import { useAuth } from '../auth/useAuth'

export function InvoiceReviewView({ invoice, onBack, onInvoiceUpdated }) {
  const { activeStore, token } = useAuth()
  const [lines, setLines] = useState(invoice.lines || [])
  const [editedLines, setEditedLines] = useState({})
  const [savingLineId, setSavingLineId] = useState(null)
  const [saveSuccessLineId, setSaveSuccessLineId] = useState(null)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [error, setError] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)

  const handleFieldChange = (lineId, field, value) => {
    setLines((prev) =>
      prev.map((l) => (l.id === lineId ? { ...l, [field]: value } : l))
    )
    setEditedLines((prev) => ({
      ...prev,
      [lineId]: {
        ...(prev[lineId] || {}),
        [field]: value,
      },
    }))
  }

  const handleSaveLine = async (line) => {
    const updates = editedLines[line.id]
    if (!updates) return

    setSavingLineId(line.id)
    setError(null)

    try {
      const payload = { ...updates }
      if (payload.quantity !== undefined) payload.quantity = parseFloat(payload.quantity) || null
      if (payload.unit_cost !== undefined) payload.unit_cost = parseFloat(payload.unit_cost) || null
      if (payload.line_total !== undefined) payload.line_total = parseFloat(payload.line_total) || null

      const updatedLine = await invoicesApi.updateInvoiceLine(
        activeStore.id,
        invoice.id,
        line.id,
        payload,
        token
      )

      setLines((prev) => prev.map((l) => (l.id === line.id ? updatedLine : l)))
      setEditedLines((prev) => {
        const next = { ...prev }
        delete next[line.id]
        return next
      })

      setSaveSuccessLineId(line.id)
      setTimeout(() => setSaveSuccessLineId(null), 2000)

      if (onInvoiceUpdated) {
        onInvoiceUpdated()
      }
    } catch (err) {
      setError(err.message || 'Failed to save line item changes.')
    } finally {
      setSavingLineId(null)
    }
  }

  const handleQuickStatusChange = (lineId, newStatus) => {
    handleFieldChange(lineId, 'review_status', newStatus)
  }

  const handleReprocess = async () => {
    setIsReprocessing(true)
    setError(null)
    try {
      const updated = await invoicesApi.reprocessInvoice(activeStore.id, invoice.id, token)
      setLines(updated.lines || [])
      setEditedLines({})
      if (onInvoiceUpdated) onInvoiceUpdated(updated)
    } catch (err) {
      setError(err.message || 'Reprocessing failed.')
    } finally {
      setIsReprocessing(false)
    }
  }

  const getStatusBadge = (reviewStatus, confidence) => {
    const confPercent = confidence ? Math.round(confidence * 100) : null
    switch (reviewStatus) {
      case 'matched':
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Matched {confPercent ? `(${confPercent}%)` : ''}</span>
          </Badge>
        )
      case 'needs_review':
        return (
          <Badge variant="warning" className="gap-1">
            <HelpCircle className="w-3 h-3" />
            <span>Needs Review {confPercent ? `(${confPercent}%)` : ''}</span>
          </Badge>
        )
      case 'new_product':
        return (
          <Badge variant="primary" className="gap-1">
            <Sparkles className="w-3 h-3" />
            <span>New Catalogue Product</span>
          </Badge>
        )
      case 'ignored':
        return (
          <Badge variant="neutral" className="gap-1">
            <span>Ignored</span>
          </Badge>
        )
      default:
        return <Badge variant="neutral">{reviewStatus}</Badge>
    }
  }

  const totalInvoiceAmount = lines.reduce((sum, l) => sum + (parseFloat(l.line_total) || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Navigation & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-text-primary">
                {invoice.original_filename || `Invoice ${invoice.id.slice(0, 8)}`}
              </h1>
              <Badge
                variant={
                  invoice.status === 'confirmed'
                    ? 'success'
                    : invoice.status === 'review_required'
                    ? 'warning'
                    : invoice.status === 'failed'
                    ? 'danger'
                    : 'info'
                }
              >
                {invoice.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-text-secondary mt-0.5">
              Uploaded {new Date(invoice.created_at).toLocaleString()} • AI Provider: {invoice.extraction_provider || 'Gemini'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {invoice.signed_url && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImageModal(true)}
              className="flex items-center gap-1.5"
            >
              <Eye className="w-4 h-4" />
              <span>View Original Bill</span>
            </Button>
          )}

          {invoice.status !== 'confirmed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReprocess}
              disabled={isReprocessing}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isReprocessing ? 'animate-spin' : ''}`} />
              <span>{isReprocessing ? 'Reprocessing...' : 'Re-extract'}</span>
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
      )}

      {/* Human Review Boundary Notice */}
      <Alert variant="info" title="Human Review Boundary">
        AI extraction &amp; RapidFuzz candidate matches are suggestions. Check descriptions, quantities, and prices before confirmation. Stock updates will apply atomically only upon explicit merchant confirmation.
      </Alert>

      {/* Main Review Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Invoice Summary & Document Preview */}
        <div className="space-y-4 lg:col-span-1">
          <Card className="p-4 space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">Invoice Details</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-secondary">Extracted Total</span>
                <span className="font-semibold text-text-primary text-sm">
                  ₹{totalInvoiceAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-secondary">Line Items Count</span>
                <span className="font-medium text-text-primary">{lines.length} lines</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="text-text-secondary">Catalogue Matches</span>
                <span className="font-medium text-success">
                  {lines.filter((l) => l.review_status === 'matched').length} matched
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-text-secondary">Pending Review</span>
                <span className="font-medium text-warning">
                  {lines.filter((l) => l.review_status === 'needs_review').length} lines
                </span>
              </div>
            </div>

            {invoice.signed_url && (
              <div className="mt-4 pt-3 border-t border-border">
                <p className="text-xs font-medium text-text-secondary mb-2">Original Document</p>
                <div
                  onClick={() => setShowImageModal(true)}
                  className="relative rounded-lg overflow-hidden border border-border bg-black/5 cursor-pointer group"
                >
                  <img
                    src={invoice.signed_url}
                    alt="Invoice Document"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5">
                    <Eye className="w-4 h-4" />
                    <span>Click to Zoom</span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Side: Extracted Lines Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary">
              Extracted Line Items ({lines.length})
            </h2>
            <span className="text-xs text-text-secondary">
              Edit values inline and save per line
            </span>
          </div>

          <div className="space-y-3">
            {lines.map((line) => {
              const hasUnsavedChanges = Boolean(editedLines[line.id])
              const isSaving = savingLineId === line.id
              const isSaved = saveSuccessLineId === line.id

              return (
                <Card
                  key={line.id}
                  className={`p-4 transition-all ${
                    hasUnsavedChanges
                      ? 'border-primary ring-1 ring-primary/20'
                      : line.review_status === 'needs_review'
                      ? 'border-warning/50 bg-warning-subtle/10'
                      : 'border-border'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-bold rounded bg-surface-muted text-text-secondary">
                        #{line.line_number}
                      </span>
                      {getStatusBadge(line.review_status, line.confidence)}
                      {line.product_name && (
                        <span className="text-xs text-text-muted truncate max-w-xs">
                          Catalogue: <strong className="text-text-primary">{line.product_name}</strong>
                        </span>
                      )}
                    </div>

                    {/* Quick Review Status Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(line.id, 'matched')}
                        className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                          line.review_status === 'matched'
                            ? 'bg-success text-white border-success'
                            : 'text-text-secondary hover:bg-surface-muted border-border'
                        }`}
                      >
                        Match
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(line.id, 'new_product')}
                        className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                          line.review_status === 'new_product'
                            ? 'bg-primary text-white border-primary'
                            : 'text-text-secondary hover:bg-surface-muted border-border'
                        }`}
                      >
                        New Product
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickStatusChange(line.id, 'ignored')}
                        className={`px-2 py-0.5 text-xs rounded border transition-colors ${
                          line.review_status === 'ignored'
                            ? 'bg-text-secondary text-white border-text-secondary'
                            : 'text-text-secondary hover:bg-surface-muted border-border'
                        }`}
                      >
                        Ignore
                      </button>
                    </div>
                  </div>

                  {/* Editable Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                    {/* Description */}
                    <div className="sm:col-span-5">
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                        Item Description
                      </label>
                      <input
                        type="text"
                        value={line.raw_description}
                        onChange={(e) => handleFieldChange(line.id, 'raw_description', e.target.value)}
                        className="w-full text-xs font-medium px-2.5 py-1.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        step="any"
                        value={line.quantity ?? ''}
                        onChange={(e) => handleFieldChange(line.id, 'quantity', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Unit */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={line.unit ?? ''}
                        onChange={(e) => handleFieldChange(line.id, 'unit', e.target.value)}
                        placeholder="pack / kg"
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Unit Cost */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                        Cost (₹)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={line.unit_cost ?? ''}
                        onChange={(e) => handleFieldChange(line.id, 'unit_cost', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 rounded-lg border border-border bg-surface text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {/* Total & Save */}
                    <div className="sm:col-span-1 flex flex-col items-end justify-center">
                      <label className="block text-[11px] font-semibold text-text-secondary mb-1">
                        Save
                      </label>
                      <button
                        type="button"
                        onClick={() => handleSaveLine(line)}
                        disabled={!hasUnsavedChanges || isSaving}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'bg-success text-white border-success'
                            : hasUnsavedChanges
                            ? 'bg-primary text-white border-primary hover:bg-primary-hover shadow-sm'
                            : 'bg-surface-muted text-text-muted border-border cursor-not-allowed opacity-50'
                        }`}
                        title={hasUnsavedChanges ? 'Save changes to line' : 'No changes'}
                      >
                        {isSaved ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Full Document View Modal */}
      {showImageModal && invoice.signed_url && (
        <div
          onClick={() => setShowImageModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-surface rounded-xl overflow-hidden shadow-elevation-3 flex flex-col"
          >
            <div className="flex items-center justify-between p-3 border-b border-border bg-surface">
              <span className="text-sm font-semibold text-text-primary">
                {invoice.original_filename || 'Original Invoice'}
              </span>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                ✕
              </button>
            </div>
            <div className="overflow-auto p-2 bg-black/10 flex items-center justify-center">
              <img
                src={invoice.signed_url}
                alt="Full Invoice"
                className="max-h-[80vh] object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
