import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Alert } from '../../components/ui/Alert'
import { Receipt, Sparkles, ArrowRight, Package, TrendingDown } from 'lucide-react'
import { useAuth } from '../auth/useAuth'
import { invoicesApi } from '../invoices/api'
import { fetchStoreProducts } from '../catalogue/api'
import { fetchReorderSuggestions } from '../buying-copilot/api'

export function DashboardPage() {
  const { activeStore, token } = useAuth()
  const [stats, setStats] = useState({
    pendingInvoices: 0,
    totalProducts: 0,
    lowStockCount: 0,
    reorderCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeStore) return

    async function loadStats() {
      setLoading(true)
      try {
        const [invoices, products, suggestions] = await Promise.allSettled([
          invoicesApi.listInvoices(activeStore.id, null, token),
          fetchStoreProducts(activeStore.id, '', 100, token),
          fetchReorderSuggestions(activeStore.id, 'all', token),
        ])

        const invData = invoices.status === 'fulfilled' ? invoices.value : []
        const prodData = products.status === 'fulfilled' ? products.value : []
        const sugData = suggestions.status === 'fulfilled' ? suggestions.value : []

        const pending = invData.filter((i) =>
          ['uploaded', 'processing', 'review_required'].includes(i.status)
        ).length

        const lowStock = prodData.filter((p) => (p.quantity_on_hand ?? 0) <= 3).length
        const reorderNeeds = sugData.filter((s) => s.suggested_reorder_quantity > 0).length

        setStats({
          pendingInvoices: pending,
          totalProducts: prodData.length,
          lowStockCount: lowStock,
          reorderCount: reorderNeeds,
        })
      } catch (err) {
        console.error('Could not load dashboard stats:', err)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [activeStore, token])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {activeStore?.name ? `${activeStore.name} Overview` : 'Store Overview'}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Convert supplier bills, track live inventory, scan barcodes, and execute purchasing decisions.
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

      {stats.pendingInvoices > 0 ? (
        <Alert variant="warning" title="Action Required">
          You have {stats.pendingInvoices} supplier invoice{stats.pendingInvoices === 1 ? '' : 's'} waiting for your review. Stock quantities will not update until you confirm.
        </Alert>
      ) : (
        <Alert variant="info" title="Kirana Assistant Ready">
          Upload supplier bills to restock items automatically, or review explainable reorder suggestions below.
        </Alert>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/invoices">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Invoices To Review
              </span>
              <Badge variant={stats.pendingInvoices > 0 ? 'warning' : 'neutral'}>
                {stats.pendingInvoices > 0 ? 'Action Needed' : 'All Clear'}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-text-primary mt-2 font-mono">
              {loading ? '—' : stats.pendingInvoices}
            </p>
            <p className="text-xs text-text-secondary mt-1">Pending merchant review</p>
          </Card>
        </Link>

        <Link to="/catalogue">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Catalogue Items
              </span>
              <Package className="w-4 h-4 text-text-muted" />
            </div>
            <p className="text-3xl font-bold text-text-primary mt-2 font-mono">
              {loading ? '—' : stats.totalProducts}
            </p>
            <p className="text-xs text-text-secondary mt-1">Registered products</p>
          </Card>
        </Link>

        <Link to="/inventory">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Low Stock Items
              </span>
              <Badge variant={stats.lowStockCount > 0 ? 'danger' : 'success'}>
                {stats.lowStockCount > 0 ? (
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Low Stock
                  </span>
                ) : (
                  'Optimal'
                )}
              </Badge>
            </div>
            <p className="text-3xl font-bold text-text-primary mt-2 font-mono">
              {loading ? '—' : stats.lowStockCount}
            </p>
            <p className="text-xs text-text-secondary mt-1">Below minimum safety stock</p>
          </Card>
        </Link>

        <Link to="/buying-copilot">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Reorder Suggestions
              </span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-bold text-text-primary mt-2 font-mono">
              {loading ? '—' : stats.reorderCount}
            </p>
            <p className="text-xs text-text-secondary mt-1">Advisory replenishment items</p>
          </Card>
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Invoice Intake & OCR"
          subtitle="Turn supplier bill photos into reviewable stock updates"
          footer={
            <Link
              to="/invoices"
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <span>Go to Invoices</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        >
          <p className="text-sm text-text-secondary">
            Take a photo or upload a paper bill. AI extracts line items, matches catalogue items, and awaits your final confirmation.
          </p>
        </Card>

        <Card
          title="Barcodes & Label Printing"
          subtitle="Scan camera barcodes and generate printable stickers"
          footer={
            <Link
              to="/barcodes"
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <span>Open Scanner & Labels</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        >
          <p className="text-sm text-text-secondary">
            Look up products using your device camera or print crisp 24-up A4 label sheets with custom Code-128 barcodes for loose kirana items.
          </p>
        </Card>

        <Card
          title="Buying Copilot & Drafts"
          subtitle="Deterministic reorder calculations with WhatsApp sharing"
          footer={
            <Link
              to="/buying-copilot"
              className="inline-flex items-center text-sm font-semibold text-primary hover:text-primary-hover"
            >
              <span>View Suggestions</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          }
        >
          <p className="text-sm text-text-secondary">
            Transparent stock replenishment calculations with inspectable math, preventing stockouts and letting you dispatch POs via WhatsApp.
          </p>
        </Card>
      </div>
    </div>
  )
}
