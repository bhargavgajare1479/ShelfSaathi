from fastapi import APIRouter

from app.modules.auth.router import router as auth_router
from app.modules.barcodes.router import router as barcodes_router
from app.modules.buying_copilot.router import router as buying_copilot_router
from app.modules.catalogue.router import router as catalogue_router
from app.modules.inventory.router import router as inventory_router
from app.modules.invoices.router import router as invoices_router
from app.modules.purchase_orders.router import router as purchase_orders_router
from app.modules.stores.router import router as stores_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(stores_router)
api_v1_router.include_router(catalogue_router)
api_v1_router.include_router(invoices_router)
api_v1_router.include_router(inventory_router)
api_v1_router.include_router(barcodes_router)
api_v1_router.include_router(buying_copilot_router)
api_v1_router.include_router(purchase_orders_router)
