import {
  LayoutDashboard,
  Receipt,
  Package,
  Boxes,
  Barcode,
  Sparkles,
  ClipboardList,
} from 'lucide-react'

export const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/invoices', label: 'Invoices', icon: Receipt },
  { to: '/catalogue', label: 'Catalogue', icon: Package },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/barcodes', label: 'Barcodes', icon: Barcode },
  { to: '/buying-copilot', label: 'Buying Copilot', icon: Sparkles },
  { to: '/purchase-orders', label: 'PO Drafts', icon: ClipboardList },
]

