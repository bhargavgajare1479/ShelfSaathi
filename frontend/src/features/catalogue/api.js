import { apiRequest } from '../../lib/api-client'

export async function fetchStoreProducts(storeId, search = '', limit = 50, token = null) {
  const query = new URLSearchParams()
  if (search) query.set('search', search)
  query.set('limit', limit)

  const res = await apiRequest(`/stores/${storeId}/products?${query.toString()}`, {}, token)
  return res || []
}

export async function createStoreProduct(storeId, payload, token = null) {
  return await apiRequest(
    `/stores/${storeId}/products`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    token
  )
}

export async function updateStoreProduct(storeId, productId, payload, token = null) {
  return await apiRequest(
    `/stores/${storeId}/products/${productId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
    token
  )
}

export async function deleteStoreProduct(storeId, productId, token = null) {
  return await apiRequest(
    `/stores/${storeId}/products/${productId}`,
    {
      method: 'DELETE',
    },
    token
  )
}

export async function seedStoreDemoDataApi(storeId, token = null) {
  return await apiRequest(
    `/stores/${storeId}/seed`,
    {
      method: 'POST',
    },
    token
  )
}

