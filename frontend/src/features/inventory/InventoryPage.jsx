import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import {
  Boxes,
  Search,
  History,
  UploadCloud,
  Loader2,
  X,
  TrendingUp,
} from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { inventoryApi } from './api'

export function InventoryPage() {
  const { activeStore, token } = useAuth()
  const [inventory, setInventory] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [movements, setMovements] = useState([])
  const [isLoadingMovements, setIsLoadingMovements] = useState(false)

  const fetchInventory = useCallback(async () => {
    if (!activeStore?.id) return
    setIsLoading(true)
    setError(null)
    try {
      const response = await inventoryApi.listInventory(activeStore.id, searchQuery, token)
      setInventory(response || [])
    } catch (err) {
      setError(err.message || 'Failed to load inventory.')
    } finally {
      setIsLoading(false)
    }
  }, [activeStore?.id, searchQuery, token])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const handleViewMovements = async (item) => {
    setSelectedProduct(item)
    setIsLoadingMovements(true)
    try {
      const history = await inventoryApi.getProductMovements(activeStore.id, item.product_id, token)
      setMovements(history || [])
    } catch {
      setMovements([])
    } finally {
      setIsLoadingMovements(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Current Inventory</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time on-hand stock balances and verified stock movement audit records.
          </p>
        </div>
        <Link to="/invoices">
          <Button variant="primary" className="flex items-center gap-2">
            <UploadCloud className="w-4 h-4" />
            <span>Intake From Invoice</span>
          </Button>
        </Link>
      </div>

      <Alert variant="info" title="Auditable Stock Ledger">
        Inventory is only modified through confirmed transactions such as supplier invoice intake. Every change is logged with an append-only stock movement record.
      </Alert>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search inventory by product name..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      {error && (
        <Alert variant="danger" title="Error">
          {error}
        </Alert>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Loading stock levels...</p>
        </div>
      ) : inventory.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
            <Boxes className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No inventory recorded</h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
            Stock levels will appear here as soon as supplier invoices are confirmed or products are created.
          </p>
          <Link to="/invoices">
            <Button variant="primary" className="inline-flex items-center gap-2">
              <UploadCloud className="w-4 h-4" />
              <span>Upload Supplier Bill</span>
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => (
            <Card
              key={item.id}
              className="p-4 hover:border-primary/50 hover:shadow-elevation-1 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-text-primary truncate">
                      {item.product_name}
                    </h3>
                    {item.brand && (
                      <span className="text-xs text-text-muted">Brand: {item.brand}</span>
                    )}
                  </div>
                  {item.barcode && (
                    <Badge variant="neutral" className="text-[10px] font-mono">
                      {item.barcode}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 p-3 bg-surface-muted rounded-xl flex items-baseline justify-between">
                  <span className="text-xs font-semibold text-text-secondary">On Hand</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-text-primary">
                      {item.quantity_on_hand}
                    </span>
                    <span className="text-xs font-medium text-text-secondary ml-1.5">
                      {item.unit}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted text-[11px]">
                  Updated {new Date(item.updated_at).toLocaleDateString()}
                </span>
                <button
                  type="button"
                  onClick={() => handleViewMovements(item)}
                  className="inline-flex items-center gap-1 text-primary hover:text-primary-hover font-semibold"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit History</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Movements Audit Modal */}
      {selectedProduct && (
        <div
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-surface rounded-xl border border-border shadow-elevation-3 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-subtle text-primary rounded-lg">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-text-primary">Stock Movements Audit</h3>
                  <p className="text-xs text-text-secondary truncate max-w-xs">
                    {selectedProduct.product_name}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 text-text-muted hover:text-text-primary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
              {isLoadingMovements ? (
                <div className="py-8 text-center text-text-muted">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-xs">Loading movement history...</p>
                </div>
              ) : movements.length === 0 ? (
                <p className="text-center py-6 text-xs text-text-muted">
                  No stock movements recorded for this item.
                </p>
              ) : (
                movements.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 rounded-lg border border-border bg-surface-muted flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-text-primary uppercase">
                          {m.movement_type.replace('_', ' ')}
                        </span>
                        {m.reference_key && (
                          <span className="text-[10px] text-text-muted font-mono">
                            ({m.reference_key})
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-text-muted">
                        {new Date(m.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 font-bold text-success text-sm">
                      <TrendingUp className="w-4 h-4" />
                      <span>+{m.quantity_delta}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
