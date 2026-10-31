/**
 * Zero-dependency Code-128B barcode SVG generator.
 * Produces crisp, resolution-independent SVG barcodes suitable for on-screen display and high-DPI label printing.
 */

// Code 128 pattern table: 107 symbols (patterns of 6 bar/space widths)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
]

const START_CODE_B = 104
const STOP_CODE = 106

/**
 * Generate Code 128B bar sequence string ('1' = black, '0' = white)
 * @param {string} text
 * @returns {string} Binary string representing bars and spaces
 */
export function encodeCode128B(text) {
  const safeText = String(text || '').replace(/[^\x20-\x7E]/g, '')
  if (!safeText) return ''

  const codes = [START_CODE_B]
  let checksum = START_CODE_B

  for (let i = 0; i < safeText.length; i++) {
    const charCode = safeText.charCodeAt(i) - 32
    codes.push(charCode)
    checksum += charCode * (i + 1)
  }

  const checkSymbol = checksum % 103
  codes.push(checkSymbol)
  codes.push(STOP_CODE)

  let barString = ''
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code]
    if (!pattern) continue
    for (let j = 0; j < pattern.length; j++) {
      const width = parseInt(pattern[j], 10)
      const isBar = j % 2 === 0
      barString += (isBar ? '1' : '0').repeat(width)
    }
  }

  return barString
}

/**
 * Generate SVG paths for a Code-128 barcode
 * @param {string} text - Alphanumeric barcode value
 * @param {object} options - Customization options
 * @returns {object} { svgXml, viewBox, width, height }
 */
export function generateBarcodeSvg(text, options = {}) {
  const {
    barWidth = 2,
    height = 50,
    showText = true,
    fontSize = 12,
  } = options

  const bars = encodeCode128B(text)
  if (!bars) return null

  const quietZone = barWidth * 10
  const barcodeWidth = bars.length * barWidth
  const totalWidth = barcodeWidth + quietZone * 2
  const totalHeight = showText ? height + fontSize + 6 : height

  let rects = []
  let x = quietZone

  for (let i = 0; i < bars.length; i++) {
    if (bars[i] === '1') {
      rects.push(`<rect x="${x}" y="0" width="${barWidth}" height="${height}" fill="black" />`)
    }
    x += barWidth
  }

  const textElement = showText
    ? `<text x="${totalWidth / 2}" y="${height + fontSize + 2}" text-anchor="middle" font-family="monospace" font-size="${fontSize}" fill="#111827">${text}</text>`
    : ''

  const svgXml = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="100%" height="100%">
      ${rects.join('\n')}
      ${textElement}
    </svg>
  `.trim()

  return {
    svgXml,
    totalWidth,
    totalHeight,
  }
}

