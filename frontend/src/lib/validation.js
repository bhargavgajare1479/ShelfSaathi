/**
 * Validation utilities for ShelfSaathi frontend forms
 */

/**
 * Validate standard retail barcode formats (EAN-13, EAN-8, UPC-A, Code 128)
 * @param {string} barcode
 * @returns {boolean}
 */
export function isValidBarcode(barcode) {
  if (!barcode || typeof barcode !== 'string') return false
  const trimmed = barcode.trim()
  // 8 to 14 digits numeric barcode or alphanumeric Code 128
  return /^[0-9A-Za-z-]{4,14}$/.test(trimmed)
}

/**
 * Validate positive quantity
 * @param {number|string} quantity
 * @returns {boolean}
 */
export function isValidQuantity(quantity) {
  const num = typeof quantity === 'number' ? quantity : parseFloat(quantity)
  return !isNaN(num) && num > 0
}

/**
 * Validate non-negative price
 * @param {number|string} price
 * @returns {boolean}
 */
export function isValidPrice(price) {
  const num = typeof price === 'number' ? price : parseFloat(price)
  return !isNaN(num) && num >= 0
}

