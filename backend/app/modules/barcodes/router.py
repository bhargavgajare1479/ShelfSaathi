from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_current_user, get_request_id
from app.core.security import AuthenticatedUser
from app.schemas.common import SuccessResponse

router = APIRouter(prefix="/barcodes", tags=["Barcodes & Labels"])


@router.get("/lookup", response_model=SuccessResponse[dict])
async def lookup_barcode(
    barcode: str = Query(..., description="Barcode string"),
    store_id: str = Query(..., description="Store UUID"),
    user: AuthenticatedUser = Depends(get_current_user),
    request_id: str = Depends(get_request_id),
):
    """Lookup product details by barcode."""
    return SuccessResponse(
        data={
            "barcode": barcode,
            "product": None,
            "found_in_catalogue": False,
        },
        request_id=request_id,
    )
