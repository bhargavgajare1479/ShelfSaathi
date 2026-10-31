import { apiRequest } from '../../lib/api-client'

export const invoicesApi = {
  /**
   * Upload an invoice file (image or PDF) and initiate extraction with RapidFuzz matching.
   */
  async uploadInvoice(storeId, file, token) {
    const formData = new FormData()
    formData.append('file', file)

    return apiRequest(
      `/stores/${storeId}/invoices`,
      {
        method: 'POST',
        body: formData,
      },
      token
    )
  },

  /**
   * List recent invoices for a store.
   */
  async listInvoices(storeId, status = null, token) {
    const query = status ? `?status=${encodeURIComponent(status)}` : ''
    return apiRequest(`/stores/${storeId}/invoices${query}`, { method: 'GET' }, token)
  },

  /**
   * Retrieve a single invoice with its line items.
   */
  async getInvoice(storeId, invoiceId, token) {
    return apiRequest(`/stores/${storeId}/invoices/${invoiceId}`, { method: 'GET' }, token)
  },

  /**
   * Update an extracted invoice line item during merchant review.
   */
  async updateInvoiceLine(storeId, invoiceId, lineId, updates, token) {
    return apiRequest(
      `/stores/${storeId}/invoices/${invoiceId}/lines/${lineId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      },
      token
    )
  },

  /**
   * Reprocess extraction for an invoice.
   */
  async reprocessInvoice(storeId, invoiceId, token) {
    return apiRequest(
      `/stores/${storeId}/invoices/${invoiceId}/process`,
      {
        method: 'POST',
      },
      token
    )
  },
}

