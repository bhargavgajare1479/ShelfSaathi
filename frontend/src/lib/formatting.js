/**
 * Formatting Utilities for ShelfSaathi
 * Complies with DESIGN.md and kirana store currency/date formatting standards.
 */

/**
 * Format an amount in Indian Rupees (₹)
 * @param {number|string} amount
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  const num = typeof amount === 'number' ? amount : parseFloat(amount)
  if (isNaN(num)) return '₹0.00'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

/**
 * Format a quantity with optional unit label
 * @param {number|string} quantity
 * @param {string} [unit='']
 * @returns {string}
 */
export function formatQuantity(quantity, unit = '') {
  const num = typeof quantity === 'number' ? quantity : parseFloat(quantity)
  if (isNaN(num)) return `0 ${unit}`.trim()
  return `${num % 1 === 0 ? num : num.toFixed(2)} ${unit}`.trim()
}

/**
 * Format ISO UTC timestamp to localized human-readable date/time
 * @param {string} isoString
 * @returns {string}
 */
export function formatDateTime(isoString) {
  if (!isoString) return '—'
  const date = new Date(isoString)
  if (isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date)
}

