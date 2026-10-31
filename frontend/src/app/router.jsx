import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { NotFoundPage } from '../features/dashboard/NotFoundPage'
import { LoginPage } from '../features/auth/LoginPage'
import { InvoicesPage } from '../features/invoices/InvoicesPage'
import { CataloguePage } from '../features/catalogue/CataloguePage'
import { InventoryPage } from '../features/inventory/InventoryPage'
import { BarcodesPage } from '../features/barcodes/BarcodesPage'
import { BuyingCopilotPage } from '../features/buying-copilot/BuyingCopilotPage'
import { PurchaseOrdersPage } from '../features/purchase-orders/PurchaseOrdersPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'catalogue', element: <CataloguePage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'barcodes', element: <BarcodesPage /> },
      { path: 'buying-copilot', element: <BuyingCopilotPage /> },
      { path: 'purchase-orders', element: <PurchaseOrdersPage /> },
    ],
  },
  {
    path: '/auth/login',
    element: <LoginPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
