import { useState, useEffect, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { Badge } from '../../components/ui/Badge'
import { BarcodeWidget } from '../../components/ui/BarcodeWidget'
import { useAuth } from '../auth/useAuth'
import { lookupBarcodeApi } from './api'
import { fetchStoreProducts } from '../catalogue/api'
import {
  Barcode as BarcodeIcon,
  Camera,
  Printer,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  PlusCircle,
} from 'lucide-react'

export function BarcodesPage() {
  const { activeStore, token } = useAuth()
  const [activeTab, setActiveTab] = useState('scanner') // 'scanner' | 'labels'

  // Scanner state
  const [barcodeInput, setBarcodeInput] = useState('')
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  // Label Printing state
  const [products, setProducts] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [labelCount, setLabelCount] = useState(24)
  const [customPrice, setCustomPrice] = useState('99.00')

  // Load products for label printing
  useEffect(() => {
    if (!activeStore) return
    async function load() {
      try {
        const prods = await fetchStoreProducts(activeStore.id, '', 100, token)
        setProducts(prods)
        if (prods.length > 0 && !selectedProduct) {
          setSelectedProduct(prods[0])
        }
      } catch (err) {
        console.error('Error fetching products for labels:', err)
      }
    }
    load()
  }, [activeStore, token, selectedProduct])

  // Camera scanner handlers
  const startCamera = async () => {
    setCameraError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setCameraActive(true)

      // Check if browser supports native BarcodeDetector API
      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e'],
        })
        const interval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return
          try {
            const barcodes = await detector.detect(videoRef.current)
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue
              clearInterval(interval)
              stopCamera()
              handleLookup(code)
            }
          } catch {
            // detection frame error
          }
        }, 300)
      }
    } catch (err) {
      setCameraError(
        'Camera access unavailable. You can enter or scan the barcode using the input below.'
      )
      setCameraActive(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const handleLookup = async (codeToLookup) => {
    const code = (codeToLookup || barcodeInput).trim()
    if (!code || !activeStore) return

    setScanning(true)
    setScanResult(null)
    try {
      const result = await lookupBarcodeApi(activeStore.id, code, token)
      setScanResult(result)
    } catch (err) {
      setScanResult({
        barcode: code,
        found_in_catalogue: false,
        error: err.message,
      })
    } finally {
      setScanning(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Print-only CSS style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-label-sheet, #printable-label-sheet * {
            visibility: visible;
          }
          #printable-label-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Barcodes & Label Printing
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Scan manufacturer barcodes or print custom sticker sheets for loose items.
          </p>
        </div>
        {/* Tab switchers */}
        <div className="inline-flex p-1 bg-surface-subtle border border-border-default rounded-lg">
          <button
            onClick={() => {
              setActiveTab('scanner')
              stopCamera()
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'scanner'
                ? 'bg-surface-elevated text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scanner</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('labels')
              stopCamera()
            }}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'labels'
                ? 'bg-surface-elevated text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Label Sheet Printer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SCANNER & LOOKUP */}
      {activeTab === 'scanner' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
          {/* Scanner Viewport Card */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-text-primary">Camera Barcode Scanner</h3>
              </div>
              {cameraActive ? (
                <Button variant="secondary" size="sm" onClick={stopCamera}>
                  Stop Camera
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={startCamera}>
                  Start Camera
                </Button>
              )}
            </div>

            {cameraError && (
              <Alert variant="warning" className="text-xs">
                {cameraError}
              </Alert>
            )}

            {/* Viewfinder */}
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
              {cameraActive ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Scanner overlay frame */}
                  <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-lg pointer-events-none flex flex-col items-center justify-center">
                    <div className="w-48 h-0.5 bg-red-500 animate-pulse shadow-sm" />
                    <span className="text-[11px] text-white/80 bg-black/50 px-2 py-0.5 rounded mt-4">
                      Align barcode within frame
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-6 text-white/70">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Camera is inactive</p>
                  <p className="text-[11px] text-white/50 mt-1">
                    Click &apos;Start Camera&apos; or type barcode manually below
                  </p>
                </div>
              )}
            </div>

            {/* Manual input bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleLookup()
              }}
              className="flex items-center gap-2 pt-2"
            >
              <div className="relative flex-1">
                <BarcodeIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  placeholder="Enter or paste barcode number..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-border-default rounded-md text-sm font-mono bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" variant="primary" loading={scanning}>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Lookup</span>
              </Button>
            </form>
          </Card>

          {/* Lookup Result Card */}
          <Card className="flex flex-col justify-center">
            {scanning ? (
              <div className="text-center py-12">
                <RefreshCw className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
                <p className="text-sm text-text-secondary">Looking up barcode in catalogue...</p>
              </div>
            ) : scanResult ? (
              scanResult.found_in_catalogue && scanResult.product ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider">
                        Catalogue Match Found
                      </div>
                      <div className="text-xs text-emerald-700 font-mono">
                        Barcode: {scanResult.barcode}
                      </div>
                    </div>
                  </div>

                  <div className="border border-border-default rounded-lg p-4 space-y-3 bg-surface-subtle">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-text-primary">
                          {scanResult.product.name}
                        </h4>
                        {scanResult.product.brand && (
                          <p className="text-xs text-text-muted">{scanResult.product.brand}</p>
                        )}
                      </div>
                      <Badge
                        variant={
                          scanResult.product.quantity_on_hand <= 0
                            ? 'danger'
                            : scanResult.product.quantity_on_hand <= 3
                            ? 'warning'
                            : 'success'
                        }
                      >
                        {scanResult.product.quantity_on_hand} {scanResult.product.unit} on hand
                      </Badge>
                    </div>

                    <div className="pt-2 border-t border-border-default flex items-center justify-between text-xs text-text-secondary">
                      <span>Unit: {scanResult.product.unit}</span>
                      {scanResult.product.pack_size && (
                        <span>Pack: {scanResult.product.pack_size}x</span>
                      )}
                    </div>

                    <div className="py-2 bg-white rounded border border-border-default flex items-center justify-center">
                      <BarcodeWidget value={scanResult.barcode} height={36} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 space-y-3">
                  <div className="inline-flex p-3 bg-amber-50 text-amber-600 rounded-full">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-text-primary">
                    Barcode Not in Catalogue
                  </h4>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    Barcode <span className="font-mono font-semibold">{scanResult.barcode}</span> was
                    not found in your registered store products.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      window.location.hash = '#/catalogue'
                    }}
                    className="flex items-center gap-1.5 mx-auto text-xs"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Register New Product</span>
                  </Button>
                </div>
              )
            ) : (
              <div className="text-center py-12 text-text-muted">
                <BarcodeIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <h4 className="text-sm font-semibold text-text-primary">Ready to Scan</h4>
                <p className="text-xs text-text-secondary max-w-xs mx-auto mt-1">
                  Point your camera at a barcode sticker or type the barcode number to look up inventory.
                </p>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* TAB 2: LABEL SHEET PRINTER */}
      {activeTab === 'labels' && (
        <div className="space-y-6">
          {/* Controls Bar (no-print) */}
          <Card className="p-4 no-print space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Select Product for Labels
                </label>
                <select
                  value={selectedProduct?.id || ''}
                  onChange={(e) => {
                    const found = products.find((p) => p.id === e.target.value)
                    setSelectedProduct(found || null)
                  }}
                  className="w-full px-3 py-2 border border-border-default rounded-md text-sm bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.barcode ? `(${p.barcode})` : '(No barcode)'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Label Stickers Count
                </label>
                <select
                  value={labelCount}
                  onChange={(e) => setLabelCount(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-border-default rounded-md text-sm bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value={1}>1 Sticker (Single)</option>
                  <option value={6}>6 Stickers (Quarter Sheet)</option>
                  <option value={12}>12 Stickers (Half Sheet)</option>
                  <option value={24}>24 Stickers (Full A4 Sheet 3x8)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-secondary mb-1">
                  Display Price / MRP (₹)
                </label>
                <input
                  type="text"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  placeholder="e.g. 50.00"
                  className="w-full px-3 py-2 border border-border-default rounded-md text-sm bg-surface-subtle font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border-default">
              <span className="text-xs text-text-secondary">
                Standard Avery A4 Layout (3 columns × 8 rows) • Ready for desktop label printers
              </span>
              <Button variant="primary" onClick={handlePrint} className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                <span>Print Label Sheet</span>
              </Button>
            </div>
          </Card>

          {/* Label Sheet Preview */}
          <div className="bg-surface-muted p-6 rounded-xl border border-border-default overflow-x-auto">
            <div
              id="printable-label-sheet"
              className="bg-white mx-auto shadow-md p-6 max-w-4xl"
              style={{ minHeight: '297mm' }}
            >
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: labelCount }).map((_, idx) => (
                  <div
                    key={idx}
                    className="border border-dashed border-gray-300 p-2.5 rounded text-center flex flex-col justify-between h-32 bg-white"
                  >
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider truncate">
                      {activeStore?.name || 'ShelfSaathi Kirana'}
                    </div>

                    <div className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight">
                      {selectedProduct?.name || 'Sample Product Label'}
                    </div>

                    <div className="w-full h-12 flex items-center justify-center my-0.5">
                      <BarcodeWidget
                        value={selectedProduct?.barcode || '2000000001'}
                        height={26}
                        barWidth={1.2}
                        fontSize={9}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-bold text-gray-900 pt-0.5 border-t border-gray-100">
                      <span>{selectedProduct?.unit || 'pc'}</span>
                      <span>MRP ₹{customPrice}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
