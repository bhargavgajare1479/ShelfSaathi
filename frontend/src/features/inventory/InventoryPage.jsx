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

      {/* Search Bar & Summary Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search inventory by product name..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-border bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {!isLoading && inventory.length > 0 && (
          <div className="flex items-center gap-3 text-xs text-text-secondary">
            <span className="font-semibold text-text-primary">{inventory.length}</span> items listed
            <span className="inline-block w-1 h-1 rounded-full bg-border" />
            <span className="text-success font-medium">
              {inventory.filter((i) => (i.quantity_on_hand ?? 0) > 3).length} Healthy
            </span>
            <span className="inline-block w-1 h-1 rounded-full bg-border" />
            <span className="text-warning font-medium">
              {inventory.filter((i) => (i.quantity_on_hand ?? 0) > 0 && (i.quantity_on_hand ?? 0) <= 3).length} Low
            </span>
          </div>
        )}
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
        <Card className="overflow-hidden p-0 border border-border shadow-elevation-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-muted/60 border-b border-border text-xs uppercase font-semibold text-text-secondary tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product Name &amp; Brand</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3 text-right">On-Hand Stock</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3 text-right">Audit Trail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {inventory.map((item) => {
                  const stock = item.quantity_on_hand ?? 0
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-surface-muted/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <div className="font-semibold text-text-primary">{item.product_name}</div>
                        {item.brand && (
                          <span className="text-xs text-text-muted">Brand: {item.brand}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {item.barcode ? (
                          <span className="font-mono text-xs text-text-secondary bg-surface-muted px-2 py-0.5 rounded border border-border">
                            {item.barcode}
                          </span>
                        ) : (
                          <span className="text-xs text-text-muted italic">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary capitalize">
                        {item.unit || 'piece'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <Badge
                          variant={stock <= 0 ? 'danger' : stock <= 3 ? 'warning' : 'success'}
                          className="font-mono font-bold text-xs"
                        >
                          {stock} {item.unit || 'pcs'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-text-muted whitespace-nowrap">
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewMovements(item)}
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-hover font-semibold"
                          title="View Stock Movement Audit Trail"
                        >
                          <History className="w-3.5 h-3.5" />
                          <span>Audit History</span>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
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
