import { apiRequest } from '../../lib/api-client'

export async function fetchReorderSuggestions(storeId, urgency = null, token = null) {
  const query = new URLSearchParams()
  if (urgency && urgency !== 'all') query.set('urgency_filter', urgency)
  const res = await apiRequest(`/stores/${storeId}/reorder-suggestions?${query.toString()}`, {}, token)
  return res || []
}

export async function createPODraftFromSuggestions(storeId, items, token = null) {
  return await apiRequest(
    `/stores/${storeId}/reorder-suggestions/create-po`,
    {
      method: 'POST',
      body: JSON.stringify({ items }),
    },
    token
  )
}

