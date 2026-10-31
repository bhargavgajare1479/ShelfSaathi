import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../auth/useAuth'
import {
  fetchPurchaseOrders,
  fetchPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder,
} from './api'
import {
  ClipboardList,
  RefreshCw,
  Share2,
  Trash2,
  Ban,
  Clock,
  CheckCircle,
  X,
  FileText,
} from 'lucide-react'

export function PurchaseOrdersPage() {
  const { activeStore, token } = useAuth()
  const [drafts, setDrafts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Selected draft view modal
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [shareSuccess, setShareSuccess] = useState(false)

  const loadDrafts = useCallback(async () => {
    if (!activeStore) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPurchaseOrders(activeStore.id, 50, token)
      setDrafts(data)
    } catch (err) {
      setError(err.message || 'Failed to load purchase order drafts')
    } finally {
      setLoading(false)
    }
  }, [activeStore, token])

  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  const openDraftDetails = async (draftId) => {
    setShareSuccess(false)
    try {
      const fullDraft = await fetchPurchaseOrder(activeStore.id, draftId, token)
      setSelectedDraft(fullDraft)
    } catch (err) {
      alert('Could not open draft: ' + err.message)
    }
  }

  const handleCancelDraft = async (draftId) => {
    if (!window.confirm('Cancel this purchase order draft?')) return
    try {
      await updatePurchaseOrder(activeStore.id, draftId, { status: 'cancelled' }, token)
      loadDrafts()
      if (selectedDraft?.id === draftId) {
        setSelectedDraft((prev) => ({ ...prev, status: 'cancelled' }))
      }
    } catch (err) {
      alert('Failed to cancel draft: ' + err.message)
    }
  }

  const handleDeleteDraft = async (draftId) => {
    if (!window.confirm('Permanently delete this purchase order draft?')) return
    try {
      await deletePurchaseOrder(activeStore.id, draftId, token)
      setSelectedDraft(null)
      loadDrafts()
    } catch (err) {
      alert('Failed to delete draft: ' + err.message)
    }
  }

  // Format draft for WhatsApp sharing
  const generateWhatsAppMessage = (draft) => {
    const storeName = activeStore?.name || 'Kirana Store'
    const dateStr = new Date(draft.created_at).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    let linesText = ''
    draft.lines.forEach((l, idx) => {
      linesText += `${idx + 1}. *${l.product_name}* - ${l.quantity} ${l.unit}`
      if (l.unit_cost) {
        linesText += ` (Est. ₹${l.unit_cost})`
      }
      linesText += '\n'
    })

    const totalText = draft.total_estimated_amount
      ? `\n*Estimated Total:* ₹${draft.total_estimated_amount}\n`
      : ''

    return `📦 *PURCHASE ORDER DRAFT*\n🏪 *${storeName}*\n📅 *Date:* ${dateStr}\n\n*Items to Supply:*\n${linesText}${totalText}\nPlease confirm delivery availability. Thank you!`
  }

  const handleShareWhatsApp = (draft) => {
    const msg = generateWhatsAppMessage(draft)
    const encoded = encodeURIComponent(msg)
    window.open(`https://wa.me/?text=${encoded}`, '_blank')
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 3000)
  }

  const handleCopyOrderText = (draft) => {
    const msg = generateWhatsAppMessage(draft)
    navigator.clipboard.writeText(msg)
    setShareSuccess(true)
    setTimeout(() => setShareSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Purchase Order Drafts
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review, edit, and share purchasing drafts with your suppliers and distributors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={loadDrafts} className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              window.location.hash = '#/buying-copilot'
            }}
            className="flex items-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            <span>Generate from Copilot</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading drafts">
          {error}
        </Alert>
      )}

      {/* Drafts List */}
      {loading ? (
        <Card className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Loading purchase orders...</p>
        </Card>
      ) : drafts.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No purchase order drafts yet</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
            Generate your first draft from Buying Copilot reorder suggestions or convert items after reviewing invoices.
          </p>
          <Button
            variant="primary"
            onClick={() => {
              window.location.hash = '#/buying-copilot'
            }}
            className="mx-auto"
          >
            Open Buying Copilot
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drafts.map((draft) => {
            const isCancelled = draft.status === 'cancelled'
            return (
              <Card
                key={draft.id}
                className="hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
                onClick={() => openDraftDetails(draft.id)}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-xs font-bold text-text-primary bg-surface-muted px-2 py-0.5 rounded border border-border-default">
                      PO-#{draft.id.slice(0, 8)}
                    </span>
                    <Badge variant={isCancelled ? 'danger' : 'warning'} className="capitalize text-[10px]">
                      {draft.status}
                    </Badge>
                  </div>

                  <div className="text-sm font-semibold text-text-primary mt-2">
                    {draft.total_items} items in order
                  </div>

                  {draft.total_estimated_amount && (
                    <div className="text-xs text-text-secondary mt-0.5">
                      Est. Total:{' '}
                      <span className="font-bold text-text-primary font-mono">
                        ₹{draft.total_estimated_amount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-[11px] text-text-muted mt-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Created {new Date(draft.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-default mt-4 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>View & Share Draft &rarr;</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* PO Draft Details Modal */}
      {selectedDraft && (
        <div className="fixed inset-0 z-50 bg-text-primary/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <Card className="shadow-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 border-b border-border-default flex items-center justify-between bg-surface-subtle">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-text-primary">
                      Purchase Order Draft #{selectedDraft.id.slice(0, 8)}
                    </h3>
                    <span className="text-xs text-text-muted">
                      Created on {new Date(selectedDraft.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDraft(null)}
                  className="p-1 text-text-muted hover:text-text-primary rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {shareSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-2 border-b border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Order formatted! Copied to clipboard and WhatsApp initiated.</span>
                </div>
              )}

              {/* Items List */}
              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                <div className="border border-border-default rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-subtle uppercase text-[10px] text-text-secondary font-semibold border-b border-border-default">
                      <tr>
                        <th className="px-3 py-2">Item</th>
                        <th className="px-3 py-2 text-right">Quantity</th>
                        <th className="px-3 py-2 text-right">Est. Unit Cost</th>
                        <th className="px-3 py-2 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-default">
                      {selectedDraft.lines.map((l) => (
                        <tr key={l.id} className="hover:bg-surface-subtle/40">
                          <td className="px-3 py-2 font-medium text-text-primary">
                            <div>{l.product_name}</div>
                            {l.brand && <div className="text-[10px] text-text-muted">{l.brand}</div>}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold">
                            {l.quantity} {l.unit}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-text-secondary">
                            {l.unit_cost ? `₹${l.unit_cost.toFixed(2)}` : '—'}
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-text-primary">
                            {l.line_total ? `₹${l.line_total.toFixed(2)}` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {selectedDraft.total_estimated_amount && (
                      <tfoot className="bg-surface-subtle border-t border-border-default font-bold text-text-primary">
                        <tr>
                          <td colSpan={3} className="px-3 py-2 text-right text-xs">
                            Estimated Total:
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-sm text-primary">
                            ₹{selectedDraft.total_estimated_amount.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-4 border-t border-border-default bg-surface-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {selectedDraft.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelDraft(selectedDraft.id)}
                      className="text-amber-700 hover:bg-amber-50 text-xs flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel PO</span>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteDraft(selectedDraft.id)}
                    className="text-red-600 hover:bg-red-50 text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleCopyOrderText(selectedDraft)}
                    className="flex-1 sm:flex-initial text-xs"
                  >
                    Copy Text
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleShareWhatsApp(selectedDraft)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Supplier</span>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
