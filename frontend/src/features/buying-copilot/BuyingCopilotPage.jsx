import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../auth/useAuth'
import { fetchReorderSuggestions, createPODraftFromSuggestions } from './api'
import {
  Sparkles,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  Clock,
  TrendingDown,
  Info,
  CheckSquare,
  Square,
  ArrowRight,
  Database,
} from 'lucide-react'

export function BuyingCopilotPage() {
  const { activeStore, token } = useAuth()
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [urgencyFilter, setUrgencyFilter] = useState('all') // 'all' | 'critical' | 'warning'

  // Selected items for PO Draft: map of product_id -> { quantity, unit_cost }
  const [selectedItems, setSelectedItems] = useState({})
  const [creatingPO, setCreatingPO] = useState(false)
  const [poCreatedNotice, setPoCreatedNotice] = useState(null)

  const loadSuggestions = useCallback(async () => {
    if (!activeStore) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchReorderSuggestions(activeStore.id, urgencyFilter, token)
      setSuggestions(data)

      // Pre-select items with suggested_reorder_quantity > 0
      const initialSelection = {}
      for (const item of data) {
        if (item.suggested_reorder_quantity > 0) {
          initialSelection[item.product_id] = {
            quantity: item.suggested_reorder_quantity,
            unit_cost: item.estimated_unit_cost || 50.0,
          }
        }
      }
      setSelectedItems(initialSelection)
    } catch (err) {
      setError(err.message || 'Failed to load reorder suggestions')
    } finally {
      setLoading(false)
    }
  }, [activeStore, urgencyFilter, token])

  useEffect(() => {
    loadSuggestions()
  }, [loadSuggestions])

  const toggleItem = (prodId, defaultQty, defaultCost) => {
    setSelectedItems((prev) => {
      const copy = { ...prev }
      if (copy[prodId]) {
        delete copy[prodId]
      } else {
        copy[prodId] = {
          quantity: defaultQty > 0 ? defaultQty : 10,
          unit_cost: defaultCost || 50.0,
        }
      }
      return copy
    })
  }

  const updateItemQty = (prodId, newQty) => {
    const val = parseFloat(newQty)
    if (isNaN(val) || val <= 0) return
    setSelectedItems((prev) => ({
      ...prev,
      [prodId]: {
        ...prev[prodId],
        quantity: val,
      },
    }))
  }

  const handleCreatePODraft = async () => {
    const itemEntries = Object.entries(selectedItems)
    if (itemEntries.length === 0) {
      alert('Please select at least one item to generate a purchase order draft.')
      return
    }

    setCreatingPO(true)
    setPoCreatedNotice(null)
    try {
      const itemsPayload = itemEntries.map(([productId, cfg]) => ({
        product_id: productId,
        quantity: cfg.quantity,
        unit_cost: cfg.unit_cost,
      }))

      const draftRes = await createPODraftFromSuggestions(activeStore.id, itemsPayload, token)
      setPoCreatedNotice(`Purchase Order Draft #${draftRes.id.slice(0, 8)} created with ${draftRes.total_items} items!`)
      // After brief delay, redirect to Purchase Orders page
      setTimeout(() => {
        window.location.hash = '#/purchase-orders'
      }, 1200)
    } catch (err) {
      alert('Error creating PO draft: ' + err.message)
    } finally {
      setCreatingPO(false)
    }
  }

  const selectedCount = Object.keys(selectedItems).length
  const estimatedTotalCost = Object.entries(selectedItems).reduce((sum, [_, cfg]) => {
    return sum + (cfg.quantity || 0) * (cfg.unit_cost || 0)
  }, 0)

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">Buying Copilot</h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-primary-subtle text-primary px-2 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              Explainable AI
            </span>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Deterministic stock runway forecasts and transparent restock recommendations.
          </p>
        </div>
        <Button variant="secondary" onClick={loadSuggestions} className="flex items-center gap-1.5 self-start">
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Suggestions</span>
        </Button>
      </div>

      {poCreatedNotice && (
        <Alert variant="success" className="animate-fade-in">
          {poCreatedNotice} Redirecting to purchase order drafts...
        </Alert>
      )}

      {error && (
        <Alert variant="danger" title="Error loading suggestions">
          {error}
        </Alert>
      )}

      {/* Advisory Note per PRD Section 3.4 */}
      <Alert variant="info" className="text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-sky-900 mb-1">
          <Info className="w-4 h-4" />
          Transparent Deterministic Calculations
        </div>
        Reorder recommendations are calculated from current stock on hand and 30-day velocity. Calculations are advisory: you have final control over quantities before generating supplier orders.
      </Alert>

      {/* Urgency Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-border-default pb-3">
        <button
          onClick={() => setUrgencyFilter('all')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            urgencyFilter === 'all'
              ? 'bg-text-primary text-white'
              : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
          }`}
        >
          All Items ({suggestions.length})
        </button>
        <button
          onClick={() => setUrgencyFilter('critical')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            urgencyFilter === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-red-50 text-red-700 hover:bg-red-100'
          }`}
        >
          Critical Stockout (&lt;2 Days)
        </button>
        <button
          onClick={() => setUrgencyFilter('warning')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            urgencyFilter === 'warning'
              ? 'bg-amber-600 text-white'
              : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
        >
          Approaching Threshold (&lt;5 Days)
        </button>
      </div>

      {/* Suggestions List */}
      {loading ? (
        <Card className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Computing stock runways and reorder quantities...</p>
        </Card>
      ) : suggestions.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-emerald-500" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">All stock levels healthy</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
            None of your items are currently below their 5-day safety stock threshold.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {suggestions.map((item) => {
            const isSelected = !!selectedItems[item.product_id]
            const isCritical = item.urgency === 'critical'
            const isWarning = item.urgency === 'warning'

            return (
              <Card
                key={item.product_id}
                className={`transition-all border-2 ${
                  isSelected
                    ? 'border-primary/40 bg-surface-elevated shadow-sm'
                    : 'border-border-default bg-surface-subtle/50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: Product and Urgency */}
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        toggleItem(
                          item.product_id,
                          item.suggested_reorder_quantity,
                          item.estimated_unit_cost
                        )
                      }
                      className="mt-1 text-primary focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-primary" />
                      ) : (
                        <Square className="w-5 h-5 text-text-muted" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-text-primary">
                          {item.product_name}
                        </h3>
                        <Badge
                          variant={isCritical ? 'danger' : isWarning ? 'warning' : 'success'}
                          className="capitalize text-[10px]"
                        >
                          {item.urgency === 'critical' ? (
                            <span className="flex items-center gap-1">
                              <TrendingDown className="w-3 h-3" />
                              Critical Stockout
                            </span>
                          ) : item.urgency === 'warning' ? (
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Low Supply
                            </span>
                          ) : (
                            'Healthy'
                          )}
                        </Badge>
                        <span className="text-[10px] text-text-muted flex items-center gap-1 bg-surface-muted px-2 py-0.5 rounded border border-border-default">
                          <Database className="w-2.5 h-2.5" />
                          {item.data_source === 'real_sales' ? 'Verified Sales History' : 'Advisory Baseline'}
                        </span>
                      </div>

                      {item.brand && (
                        <p className="text-xs text-text-muted mt-0.5">{item.brand}</p>
                      )}

                      {/* Explanation box */}
                      <div className="mt-3 p-3 bg-surface-muted/60 rounded-md border border-border-default text-xs text-text-secondary leading-relaxed">
                        <span className="font-semibold text-text-primary block mb-0.5">
                          Deterministic Rationale:
                        </span>
                        {item.explanation}
                      </div>

                      {/* Metrics breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3 pt-3 border-t border-border-default text-xs">
                        <div>
                          <span className="text-text-muted block text-[10px] uppercase font-semibold">
                            On-Hand Stock
                          </span>
                          <span className="font-bold text-text-primary font-mono text-sm">
                            {item.quantity_on_hand} {item.unit}
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[10px] uppercase font-semibold">
                            Sales Velocity
                          </span>
                          <span className="font-bold text-text-primary font-mono text-sm">
                            ~{item.daily_sales_rate} {item.unit}/day
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[10px] uppercase font-semibold">
                            Runway Remaining
                          </span>
                          <span
                            className={`font-bold font-mono text-sm flex items-center gap-1 ${
                              isCritical
                                ? 'text-red-600'
                                : isWarning
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {item.days_of_stock_remaining} days
                          </span>
                        </div>
                        <div>
                          <span className="text-text-muted block text-[10px] uppercase font-semibold">
                            Safety Threshold
                          </span>
                          <span className="font-bold text-text-primary font-mono text-sm">
                            {item.reorder_threshold_days} days
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Suggested Reorder Quantity Adjuster */}
                  <div className="sm:text-right min-w-[150px] p-3 bg-surface-subtle rounded-lg border border-border-default">
                    <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                      Suggested Reorder
                    </span>
                    <div className="flex items-center sm:justify-end gap-1.5 mt-1">
                      <input
                        type="number"
                        min="1"
                        value={
                          selectedItems[item.product_id]?.quantity ??
                          item.suggested_reorder_quantity
                        }
                        onChange={(e) => updateItemQty(item.product_id, e.target.value)}
                        disabled={!isSelected}
                        className={`w-20 px-2 py-1 text-sm font-bold text-center border rounded font-mono focus:outline-none focus:ring-2 focus:ring-primary ${
                          isSelected
                            ? 'bg-white border-primary text-primary'
                            : 'bg-surface-muted border-border-default text-text-muted cursor-not-allowed'
                        }`}
                      />
                      <span className="text-xs text-text-secondary font-medium">{item.unit}</span>
                    </div>

                    {item.estimated_unit_cost && (
                      <div className="text-[11px] text-text-muted mt-2">
                        Est. ₹{item.estimated_unit_cost}/unit
                        {selectedItems[item.product_id] && (
                          <div className="font-bold text-text-primary font-mono">
                            Total: ₹
                            {(
                              selectedItems[item.product_id].quantity * item.estimated_unit_cost
                            ).toFixed(2)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Sticky Bottom Bar for Purchase Order Draft Creation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-border-default p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-subtle text-primary rounded-lg">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-text-primary">
                {selectedCount} item{selectedCount === 1 ? '' : 's'} selected for purchase
              </div>
              <div className="text-xs text-text-secondary">
                Estimated Order Total:{' '}
                <span className="font-bold text-text-primary font-mono">
                  ₹{estimatedTotalCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            disabled={selectedCount === 0}
            loading={creatingPO}
            onClick={handleCreatePODraft}
            className="flex items-center justify-center gap-2"
          >
            <span>Create Purchase Order Draft</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
