import datetime
import uuid
from decimal import Decimal

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.db.models import (
    Inventory,
    Invoice,
    Product,
    PurchaseOrderDraft,
    SalesRecord,
    StockMovement,
    Store,
)

KIRANA_DEMO_PRODUCTS = [
    {
        "name": "Tata Salt Iodized 1kg",
        "brand": "Tata Consumer",
        "barcode": "8901030000001",
        "unit": "packet",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("2.0"),
        "unit_cost": Decimal("22.0"),
        "daily_sales": Decimal("1.5"),
    },
    {
        "name": "Fortune Sunlite Refined Sunflower Oil 1L",
        "brand": "Fortune",
        "barcode": "8906007280014",
        "unit": "pouch",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("0.0"),
        "unit_cost": Decimal("115.0"),
        "daily_sales": Decimal("2.0"),
    },
    {
        "name": "Aashirvaad Shudh Chakki Atta 5kg",
        "brand": "ITC Aashirvaad",
        "barcode": "8901725131238",
        "unit": "bag",
        "pack_size": Decimal("5.0"),
        "stock": Decimal("0.0"),
        "unit_cost": Decimal("215.0"),
        "daily_sales": Decimal("1.8"),
    },
    {
        "name": "Maggi 2-Minute Masala Noodles 70g",
        "brand": "Nestlé Maggi",
        "barcode": "8901058852446",
        "unit": "packet",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("3.0"),
        "unit_cost": Decimal("12.0"),
        "daily_sales": Decimal("4.0"),
    },
    {
        "name": "Parle-G Original Gluco Biscuits 800g",
        "brand": "Parle",
        "barcode": "8901719101032",
        "unit": "packet",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("45.0"),
        "unit_cost": Decimal("65.0"),
        "daily_sales": Decimal("2.5"),
    },
    {
        "name": "Britannia Good Day Cashew Cookies 200g",
        "brand": "Britannia",
        "barcode": "8901063012118",
        "unit": "packet",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("28.0"),
        "unit_cost": Decimal("38.0"),
        "daily_sales": Decimal("1.2"),
    },
    {
        "name": "Amul Taaza Homogenised Toned Milk 1L",
        "brand": "Amul",
        "barcode": "8901262010052",
        "unit": "carton",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("4.0"),
        "unit_cost": Decimal("64.0"),
        "daily_sales": Decimal("3.0"),
    },
    {
        "name": "Surf Excel Easy Wash Detergent Powder 1kg",
        "brand": "Surf Excel",
        "barcode": "8901030704411",
        "unit": "packet",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("18.0"),
        "unit_cost": Decimal("135.0"),
        "daily_sales": Decimal("0.8"),
    },
    {
        "name": "Dettol Original Bathing Soap 75g (Pack of 4)",
        "brand": "Dettol",
        "barcode": "8901396388481",
        "unit": "pack",
        "pack_size": Decimal("4.0"),
        "stock": Decimal("12.0"),
        "unit_cost": Decimal("110.0"),
        "daily_sales": Decimal("0.5"),
    },
    {
        "name": "Loose Premium Toor Dal 1kg",
        "brand": "Kirana Mandi",
        "barcode": "20990001001",
        "unit": "kg",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("1.0"),
        "unit_cost": Decimal("145.0"),
        "daily_sales": Decimal("1.5"),
    },
    {
        "name": "India Gate Basmati Rice Feast Rozzana 1kg",
        "brand": "India Gate",
        "barcode": "8901499008204",
        "unit": "bag",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("22.0"),
        "unit_cost": Decimal("95.0"),
        "daily_sales": Decimal("1.0"),
    },
    {
        "name": "MDH Deggi Mirch Red Chilli Powder 100g",
        "brand": "MDH",
        "barcode": "8901170010014",
        "unit": "box",
        "pack_size": Decimal("1.0"),
        "stock": Decimal("8.0"),
        "unit_cost": Decimal("72.0"),
        "daily_sales": Decimal("0.6"),
    },
]


def seed_store_demo_data(store_id: uuid.UUID, db: Session, clear_existing: bool = False) -> dict:
    """
    Populate realistic Indian Kirana retail data for an authorized store workspace.
    Conforms to DATABASE.md Section 11 (Seed Data Strategy).
    """
    store = db.get(Store, store_id)
    if not store:
        raise ValueError(f"Store {store_id} not found")

    if clear_existing:
        db.execute(delete(SalesRecord).where(SalesRecord.store_id == store_id))
        db.execute(delete(StockMovement).where(StockMovement.store_id == store_id))
        db.execute(delete(PurchaseOrderDraft).where(PurchaseOrderDraft.store_id == store_id))
        db.execute(delete(Invoice).where(Invoice.store_id == store_id))
        db.execute(delete(Inventory).where(Inventory.store_id == store_id))
        db.execute(delete(Product).where(Product.store_id == store_id))
        db.flush()

    created_products = []
    now = datetime.datetime.now(datetime.timezone.utc)

    for item in KIRANA_DEMO_PRODUCTS:
        existing_prod = db.scalars(
            select(Product).where(
                Product.store_id == store_id,
                Product.barcode == item["barcode"],
            )
        ).first()

        if existing_prod:
            prod = existing_prod
        else:
            prod = Product(
                store_id=store_id,
                name=item["name"],
                brand=item["brand"],
                barcode=item["barcode"],
                unit=item["unit"],
                pack_size=item["pack_size"],
            )
            db.add(prod)
            db.flush()

        # Create or update Inventory
        inv = db.scalars(
            select(Inventory).where(
                Inventory.store_id == store_id,
                Inventory.product_id == prod.id,
            )
        ).first()

        if not inv:
            inv = Inventory(
                store_id=store_id,
                product_id=prod.id,
                quantity_on_hand=item["stock"],
            )
            db.add(inv)
            db.flush()
        else:
            inv.quantity_on_hand = item["stock"]

        # Seed 30-day sales history records (3 observations: 5 days ago, 15 days ago, 25 days ago)
        # Total sales matches: daily_sales * 30 days
        total_30d_sales = item["daily_sales"] * Decimal("30")
        batch_qty = total_30d_sales / Decimal("3")

        # Check if sales records already exist
        has_sales = db.scalars(
            select(SalesRecord.id).where(
                SalesRecord.store_id == store_id,
                SalesRecord.product_id == prod.id,
            )
        ).first()

        if not has_sales:
            for days_back in [5, 15, 25]:
                sold_time = now - datetime.timedelta(days=days_back)
                sale = SalesRecord(
                    store_id=store_id,
                    product_id=prod.id,
                    quantity_sold=batch_qty,
                    sold_at=sold_time,
                    source="demo",
                )
                db.add(sale)

        created_products.append(prod.name)

    db.commit()

    return {
        "store_id": str(store_id),
        "products_seeded": len(created_products),
        "sample_catalogue": created_products,
        "status": "ready",
    }
