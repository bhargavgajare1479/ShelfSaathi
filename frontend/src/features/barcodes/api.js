import { apiRequest } from '../../lib/api-client'

export async function lookupBarcodeApi(storeId, barcode, token = null) {
  const query = new URLSearchParams({ barcode })
  return await apiRequest(`/stores/${storeId}/barcodes/lookup?${query.toString()}`, {}, token)
}

export async function generateBarcodeApi(storeId, token = null) {
  return await apiRequest(
    `/stores/${storeId}/barcodes/generate`,
    {
      method: 'POST',
    },
    token
  )
}

