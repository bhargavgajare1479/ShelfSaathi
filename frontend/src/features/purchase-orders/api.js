import { apiRequest } from '../../lib/api-client'

export async function fetchPurchaseOrders(storeId, limit = 50, token = null) {
  const query = new URLSearchParams({ limit })
  const res = await apiRequest(`/stores/${storeId}/purchase-orders?${query.toString()}`, {}, token)
  return res || []
}

export async function fetchPurchaseOrder(storeId, draftId, token = null) {
  return await apiRequest(`/stores/${storeId}/purchase-orders/${draftId}`, {}, token)
}

export async function createPurchaseOrder(storeId, payload, token = null) {
  return await apiRequest(
    `/stores/${storeId}/purchase-orders`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  )
}

export async function updatePurchaseOrder(storeId, draftId, payload, token = null) {
  return await apiRequest(
    `/stores/${storeId}/purchase-orders/${draftId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token
  )
}

export async function deletePurchaseOrder(storeId, draftId, token = null) {
  return await apiRequest(
    `/stores/${storeId}/purchase-orders/${draftId}`,
    {
      method: 'DELETE',
    },
    token
  )
}

