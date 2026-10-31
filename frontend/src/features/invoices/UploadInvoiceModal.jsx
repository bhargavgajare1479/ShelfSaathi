import { useState, useRef } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'
import { UploadCloud, Camera, X, FileText, Loader2 } from 'lucide-react'
import { invoicesApi } from './api'
import { useAuth } from '../auth/useAuth'

const MAX_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export function UploadInvoiceModal({ isOpen, onClose, onUploadSuccess }) {
  const { activeStore, token } = useAuth()
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)

  if (!isOpen) return null

  const handleFileChange = (file) => {
    setError(null)
    if (!file) return

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload a valid image (JPG, PNG, WebP) or PDF invoice document.')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${MAX_SIZE_MB}MB.`)
      return
    }

    setSelectedFile(file)
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFile || !activeStore?.id) return

    setIsUploading(true)
    setError(null)

    try {
      const result = await invoicesApi.uploadInvoice(activeStore.id, selectedFile, token)
      onUploadSuccess(result)
      handleClose()
    } catch (err) {
      setError(err.message || 'Failed to process invoice. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setError(null)
    setIsUploading(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg bg-surface border-border shadow-elevation-3 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary-subtle text-primary rounded-lg">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Upload Supplier Invoice</h2>
              <p className="text-xs text-text-secondary">
                Private storage &amp; Gemini 1.5 Flash line extraction
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="p-1 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <Alert variant="danger" title="Upload Failed">
              {error}
            </Alert>
          )}

          {!selectedFile ? (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 hover:bg-surface-muted/50 transition-all cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="inline-flex p-3 bg-surface-muted text-primary rounded-full mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-text-primary">
                Click to browse or drag &amp; drop invoice bill
              </p>
              <p className="text-xs text-text-muted mt-1">
                Supports JPG, PNG, WebP, or PDF up to 10MB
              </p>

              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    fileInputRef.current?.click()
                  }}
                  className="flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  <span>Choose File</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    cameraInputRef.current?.click()
                  }}
                  className="flex items-center gap-1.5"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Photo</span>
                </Button>
              </div>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0])}
              />
            </div>
          ) : (
            <div className="border border-border rounded-xl p-3 bg-surface-muted space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium text-text-primary truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-text-muted whitespace-nowrap">
                    ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
                {!isUploading && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null)
                      if (previewUrl) URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(null)
                    }}
                    className="text-xs text-danger hover:underline ml-2"
                  >
                    Change
                  </button>
                )}
              </div>

              {previewUrl && (
                <div className="max-h-48 rounded-lg overflow-hidden border border-border bg-black/5 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Invoice Preview"
                    className="max-h-48 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          <div className="bg-primary-subtle/50 rounded-lg p-3 text-xs text-text-secondary border border-primary/10">
            <span className="font-semibold text-primary">Intelligent Extraction:</span> Google Gemini Vision reads the bill, extracts item names, quantities, and prices, and automatically matches against your existing catalogue using RapidFuzz.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!selectedFile || isUploading}
              className="flex items-center gap-2 min-w-[130px]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload &amp; Extract</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

