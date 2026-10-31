import { apiRequest } from '../../lib/api-client'

export const inventoryApi = {
  /**
   * List on-hand inventory levels for store products.
   */
  async listInventory(storeId, q = null, token) {
    const query = q ? `?q=${encodeURIComponent(q)}` : ''
    return apiRequest(`/stores/${storeId}/inventory${query}`, { method: 'GET' }, token)
  },

  /**
   * Get stock movement audit trail for a product.
   */
  async getProductMovements(storeId, productId, token) {
    return apiRequest(
      `/stores/${storeId}/inventory/${productId}/movements`,
      { method: 'GET' },
      token
    )
  },
}

