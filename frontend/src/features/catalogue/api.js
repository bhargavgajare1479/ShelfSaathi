import { apiRequest } from '../../lib/api-client'

export async function fetchStoreProducts(storeId, searchOrToken = '', limitOrOptions = 50, token = null) {
  let search = ''
  let limit = 50
  let authToken = token

  if (typeof searchOrToken === 'string' && (searchOrToken.startsWith('eyJ') || searchOrToken.length > 50)) {
    // Called as (storeId, token, options)
    authToken = searchOrToken
    if (typeof limitOrOptions === 'object' && limitOrOptions !== null) {
      search = limitOrOptions.search || ''
      limit = limitOrOptions.limit || 50
    }
  } else if (typeof searchOrToken === 'object' && searchOrToken !== null) {
    search = searchOrToken.search || ''
    limit = searchOrToken.limit || 50
    authToken = limitOrOptions
  } else {
    search = searchOrToken || ''
    limit = typeof limitOrOptions === 'number' ? limitOrOptions : 50
  }

  const query = new URLSearchParams()
  if (search) query.set('search', search)
  query.set('limit', limit)

  const res = await apiRequest(`/stores/${storeId}/products?${query.toString()}`, {}, authToken)
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

