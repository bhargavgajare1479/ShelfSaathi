import { useState, useEffect, useCallback } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { BarcodeWidget } from '../../components/ui/BarcodeWidget'
import { useAuth } from '../auth/useAuth'
import {
  fetchStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  seedStoreDemoDataApi,
} from './api'
import { generateBarcodeApi } from '../barcodes/api'
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Barcode as BarcodeIcon,
  Sparkles,
  X,
} from 'lucide-react'

export function CataloguePage() {
  const { activeStore, token } = useAuth()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formError, setFormError] = useState(null)
  const [generatingBarcode, setGeneratingBarcode] = useState(false)
  const [seeding, setSeeding] = useState(false)

  // Form inputs
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    barcode: '',
    unit: 'piece',
    pack_size: '',
    initial_stock: '0',
  })

  const loadProducts = useCallback(async () => {
    if (!activeStore) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchStoreProducts(activeStore.id, search, 50, token)
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [activeStore, search, token])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts()
    }, 250)
    return () => clearTimeout(timer)
  }, [loadProducts])

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      brand: '',
      barcode: '',
      unit: 'piece',
      pack_size: '',
      initial_stock: '0',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditModal = (prod) => {
    setEditingProduct(prod)
    setFormData({
      name: prod.name || '',
      brand: prod.brand || '',
      barcode: prod.barcode || '',
      unit: prod.unit || 'piece',
      pack_size: prod.pack_size ? String(prod.pack_size) : '',
      initial_stock: '0',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const handleGenerateBarcode = async () => {
    if (!activeStore) return
    setGeneratingBarcode(true)
    try {
      const res = await generateBarcodeApi(activeStore.id, token)
      setFormData((prev) => ({ ...prev, barcode: res.barcode }))
    } catch (err) {
      setFormError('Could not generate barcode: ' + err.message)
    } finally {
      setGeneratingBarcode(false)
    }
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setFormError('Product name is required')
      return
    }

    setFormSubmitting(true)
    setFormError(null)

    try {
      const payload = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || null,
        barcode: formData.barcode.trim() || null,
        unit: formData.unit.trim().toLowerCase() || 'piece',
        pack_size: formData.pack_size ? parseFloat(formData.pack_size) : null,
      }

      if (editingProduct) {
        await updateStoreProduct(activeStore.id, editingProduct.id, payload, token)
      } else {
        payload.initial_stock = parseFloat(formData.initial_stock) || 0
        await createStoreProduct(activeStore.id, payload, token)
      }

      setIsModalOpen(false)
      loadProducts()
    } catch (err) {
      setFormError(err.message || 'Operation failed')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleSeedDemoData = async () => {
    if (!activeStore) return
    if (!window.confirm('Load 12 realistic Indian Kirana retail products (Atta, Oil, Salt, Maggi, Parle-G, Milk, Soap) with barcodes and sales history?')) {
      return
    }
    setSeeding(true)
    try {
      await seedStoreDemoDataApi(activeStore.id, token)
      await loadProducts()
    } catch (err) {
      alert('Could not seed demo data: ' + err.message)
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async (prod) => {
    if (!window.confirm(`Delete "${prod.name}" from catalogue? This will also remove its inventory history.`)) {
      return
    }
    try {
      await deleteStoreProduct(activeStore.id, prod.id, token)
      loadProducts()
    } catch (err) {
      alert('Delete failed: ' + err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Product Catalogue</h1>
          <p className="text-sm text-text-secondary mt-1">
            Registered Kirana catalogue items, packaging units, and barcodes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={handleSeedDemoData}
            loading={seeding}
            className="flex items-center gap-1.5 text-primary border-primary/30 hover:bg-primary-subtle"
            title="Populate authentic Indian Kirana products with barcodes"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Load Kirana Demo Data</span>
          </Button>
          <Button variant="secondary" onClick={loadProducts} className="flex items-center gap-1.5">
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
          <Button variant="primary" onClick={openAddModal} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" title="Error loading catalogue">
          {error}
        </Alert>
      )}

      {/* Filter / Search Bar */}
      <Card className="p-3">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search catalogue by product name, brand, or barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border-default rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-surface-subtle"
          />
        </div>
      </Card>

      {/* Products Table */}
      {loading && products.length === 0 ? (
        <Card className="text-center py-12">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-text-secondary">Loading catalogue items...</p>
        </Card>
      ) : products.length === 0 ? (
        <Card className="text-center py-12">
          <div className="inline-flex p-3 bg-surface-muted text-text-muted rounded-full mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">
            {search ? 'No products match your search' : 'No products in catalogue yet'}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mx-auto mt-1 mb-6">
            {search
              ? 'Try adjusting your search terms or register this item now.'
              : 'Add products manually or confirm your first supplier invoice to automatically populate your catalogue.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="secondary"
              onClick={handleSeedDemoData}
              loading={seeding}
              className="flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Load 12 Realistic Kirana Items</span>
            </Button>
            <Button variant="primary" onClick={openAddModal} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Add First Product Manually</span>
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden p-0 border border-border-default">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-subtle border-b border-border-default text-xs uppercase font-medium text-text-secondary tracking-wider">
                <tr>
                  <th className="px-4 py-3">Product Name & Brand</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Unit / Pack</th>
                  <th className="px-4 py-3 text-right">Current Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {products.map((p) => {
                  const stock = p.quantity_on_hand ?? 0
                  return (
                    <tr key={p.id} className="hover:bg-surface-subtle/60 transition-colors">
                      <td className="px-4 py-3 font-medium text-text-primary">
                        <div>{p.name}</div>
                        {p.brand && (
                          <span className="text-xs text-text-muted">{p.brand}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {p.barcode ? (
                          <div className="space-y-1">
                            <span className="font-mono text-xs text-text-secondary bg-surface-muted px-2 py-0.5 rounded border border-border-default">
                              {p.barcode}
                            </span>
                            <div className="w-24 h-6 overflow-hidden">
                              <BarcodeWidget value={p.barcode} height={20} showText={false} barWidth={1} />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-text-muted italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-text-secondary capitalize">
                        {p.unit}
                        {p.pack_size ? ` (${p.pack_size}x)` : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        <Badge
                          variant={stock <= 0 ? 'danger' : stock <= 3 ? 'warning' : 'success'}
                          className="font-mono"
                        >
                          {stock} {p.unit}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(p)}
                          className="h-8 w-8 p-0"
                          title="Edit Product"
                        >
                          <Edit2 className="w-4 h-4 text-text-secondary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(p)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-text-primary/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full">
            <Card className="shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-border-default mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-md">
                    <Package className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    {editingProduct ? 'Edit Catalogue Product' : 'Add New Catalogue Product'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-text-muted hover:text-text-primary p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {formError && (
                <Alert variant="danger" className="mb-4">
                  {formError}
                </Alert>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <Input
                  label="Product Title *"
                  placeholder="e.g. Fortune Sunlite Refined Sunflower Oil 1L"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Brand"
                    placeholder="e.g. Fortune"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Stock Unit *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-3 py-2 border border-border-default rounded-md text-sm bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="piece">piece (pc)</option>
                      <option value="packet">packet (pkt)</option>
                      <option value="kg">kilogram (kg)</option>
                      <option value="gram">gram (g)</option>
                      <option value="litre">litre (L)</option>
                      <option value="bottle">bottle (btl)</option>
                      <option value="can">can</option>
                      <option value="box">box</option>
                    </select>
                  </div>
                </div>

                {/* Barcode with Auto-Generate Action */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-text-secondary">
                      Barcode (EAN / UPC / Internal)
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateBarcode}
                      disabled={generatingBarcode}
                      className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingBarcode ? 'Generating...' : 'Auto-Generate Barcode'}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <BarcodeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                    <input
                      type="text"
                      placeholder="e.g. 8901234567890"
                      value={formData.barcode}
                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full pl-9 pr-4 py-2 border border-border-default rounded-md text-sm bg-surface-subtle font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  {formData.barcode && (
                    <div className="mt-2 p-2 bg-surface-subtle border border-border-default rounded flex items-center justify-center h-12">
                      <BarcodeWidget value={formData.barcode} height={24} showText={false} />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Pack Size (Optional)"
                    type="number"
                    step="0.01"
                    placeholder="e.g. 1.0 or 12"
                    value={formData.pack_size}
                    onChange={(e) => setFormData({ ...formData, pack_size: e.target.value })}
                  />
                  {!editingProduct && (
                    <Input
                      label="Opening Stock Qty"
                      type="number"
                      step="0.01"
                      placeholder="0.0"
                      value={formData.initial_stock}
                      onChange={(e) => setFormData({ ...formData, initial_stock: e.target.value })}
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-border-default">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsModalOpen(false)}
                    disabled={formSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" loading={formSubmitting}>
                    {editingProduct ? 'Save Changes' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
