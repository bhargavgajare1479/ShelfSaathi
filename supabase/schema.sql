-- ==============================================================================
-- ShelfSaathi - Production PostgreSQL Schema for Supabase
-- Version: 1.0.0
-- Conforms to: docs/DATABASE.md, docs/ARCHITECTURE.md, docs/PRD.md
-- ==============================================================================
-- Instructions:
-- 1. Open your Supabase Dashboard: https://supabase.com/dashboard/project/_/sql
-- 2. Open the SQL Editor and click "New Query"
-- 3. Paste this entire script and click "Run" (Cmd+Enter or Ctrl+Enter)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. SCHEMAS & TABLES

-- 2.1 Stores
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2.2 Store Members (Multi-user roles linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.store_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'staff',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_store_members_store_user UNIQUE (store_id, user_id),
    CONSTRAINT ck_store_members_role CHECK (role IN ('owner', 'staff'))
);

-- 2.3 Products Catalogue
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    brand TEXT,
    barcode TEXT,
    unit TEXT NOT NULL,
    pack_size NUMERIC(12, 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_products_store_barcode UNIQUE (store_id, barcode),
    CONSTRAINT ck_products_pack_size_positive CHECK (pack_size IS NULL OR pack_size > 0)
);

-- 2.4 Inventory
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_on_hand NUMERIC(14, 3) NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_inventory_store_product UNIQUE (store_id, product_id),
    CONSTRAINT ck_inventory_quantity_non_negative CHECK (quantity_on_hand >= 0)
);

-- 2.5 Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    storage_key TEXT NOT NULL UNIQUE,
    original_filename TEXT,
    mime_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded',
    extraction_provider TEXT,
    extraction_error_code TEXT,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_invoices_status CHECK (
        status IN ('uploaded', 'processing', 'review_required', 'confirmed', 'failed')
    )
);

-- 2.6 Invoice Lines
CREATE TABLE IF NOT EXISTS public.invoice_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    line_number INTEGER NOT NULL,
    raw_description TEXT NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity NUMERIC(14, 3),
    unit TEXT,
    unit_cost NUMERIC(14, 2),
    line_total NUMERIC(14, 2),
    confidence NUMERIC(5, 4),
    review_status TEXT NOT NULL DEFAULT 'needs_review',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_invoice_lines_invoice_line_num UNIQUE (invoice_id, line_number),
    CONSTRAINT ck_invoice_lines_line_number_positive CHECK (line_number > 0),
    CONSTRAINT ck_invoice_lines_review_status CHECK (
        review_status IN ('needs_review', 'matched', 'new_product', 'ignored')
    ),
    CONSTRAINT ck_invoice_lines_quantity_positive CHECK (quantity IS NULL OR quantity > 0),
    CONSTRAINT ck_invoice_lines_unit_cost_non_negative CHECK (unit_cost IS NULL OR unit_cost >= 0),
    CONSTRAINT ck_invoice_lines_line_total_non_negative CHECK (line_total IS NULL OR line_total >= 0),
    CONSTRAINT ck_invoice_lines_confidence_range CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

-- 2.7 Stock Movements (Audit Log)
CREATE TABLE IF NOT EXISTS public.stock_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    invoice_line_id UUID UNIQUE REFERENCES public.invoice_lines(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL,
    quantity_delta NUMERIC(14, 3) NOT NULL,
    reference_key TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_stock_movements_type CHECK (
        movement_type IN ('invoice_restock', 'manual_adjustment')
    ),
    CONSTRAINT ck_stock_movements_delta_non_zero CHECK (quantity_delta != 0)
);

-- 2.8 Purchase Order Drafts
CREATE TABLE IF NOT EXISTS public.purchase_order_drafts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_po_drafts_status CHECK (status IN ('draft', 'cancelled'))
);

-- 2.9 Purchase Order Lines
CREATE TABLE IF NOT EXISTS public.purchase_order_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_order_draft_id UUID NOT NULL REFERENCES public.purchase_order_drafts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    quantity NUMERIC(14, 3) NOT NULL,
    unit_cost NUMERIC(14, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_po_lines_quantity_positive CHECK (quantity > 0),
    CONSTRAINT ck_po_lines_unit_cost_non_negative CHECK (unit_cost IS NULL OR unit_cost >= 0)
);

-- 2.10 Sales Records (Sample / Observation Data)
CREATE TABLE IF NOT EXISTS public.sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quantity_sold NUMERIC(14, 3) NOT NULL,
    sold_at TIMESTAMPTZ NOT NULL,
    source TEXT NOT NULL DEFAULT 'demo',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT ck_sales_records_quantity_sold_positive CHECK (quantity_sold > 0),
    CONSTRAINT ck_sales_records_source CHECK (source IN ('imported', 'manual', 'demo'))
);

-- 3. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_store_members_store_id ON public.store_members (store_id);
CREATE INDEX IF NOT EXISTS idx_store_members_user_id ON public.store_members (user_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON public.products (store_id);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products (barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);
CREATE INDEX IF NOT EXISTS idx_inventory_store_id ON public.inventory (store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON public.inventory (product_id);
CREATE INDEX IF NOT EXISTS idx_invoices_store_id ON public.invoices (store_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices (status);
CREATE INDEX IF NOT EXISTS idx_invoices_store_created ON public.invoices (store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_invoice_id ON public.invoice_lines (invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_lines_product_id ON public.invoice_lines (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_store_id ON public.stock_movements (store_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON public.stock_movements (product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_invoice_id ON public.stock_movements (invoice_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_store_product_created ON public.stock_movements (store_id, product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_po_drafts_store_id ON public.purchase_order_drafts (store_id);
CREATE INDEX IF NOT EXISTS idx_po_drafts_store_created ON public.purchase_order_drafts (store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_po_lines_draft_id ON public.purchase_order_lines (purchase_order_draft_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_store_id ON public.sales_records (store_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_product_id ON public.sales_records (product_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_store_product_time ON public.sales_records (store_id, product_id, sold_at DESC);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_order_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_records ENABLE ROW LEVEL SECURITY;

-- 5. SERVICE ROLE UNRESTRICTED ACCESS (FastAPI Backend Access)
DROP POLICY IF EXISTS "service_role_all_stores" ON public.stores;
CREATE POLICY "service_role_all_stores" ON public.stores FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_store_members" ON public.store_members;
CREATE POLICY "service_role_all_store_members" ON public.store_members FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_products" ON public.products;
CREATE POLICY "service_role_all_products" ON public.products FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_inventory" ON public.inventory;
CREATE POLICY "service_role_all_inventory" ON public.inventory FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_invoices" ON public.invoices;
CREATE POLICY "service_role_all_invoices" ON public.invoices FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_invoice_lines" ON public.invoice_lines;
CREATE POLICY "service_role_all_invoice_lines" ON public.invoice_lines FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_stock_movements" ON public.stock_movements;
CREATE POLICY "service_role_all_stock_movements" ON public.stock_movements FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_po_drafts" ON public.purchase_order_drafts;
CREATE POLICY "service_role_all_po_drafts" ON public.purchase_order_drafts FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_po_lines" ON public.purchase_order_lines;
CREATE POLICY "service_role_all_po_lines" ON public.purchase_order_lines FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_all_sales_records" ON public.sales_records;
CREATE POLICY "service_role_all_sales_records" ON public.sales_records FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 6. AUTHENTICATED USER STORE POLICIES (Client-Safe Defense in Depth)

-- Stores
DROP POLICY IF EXISTS "users_read_assigned_stores" ON public.stores;
CREATE POLICY "users_read_assigned_stores" ON public.stores
    FOR SELECT TO authenticated
    USING (id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "users_create_store" ON public.stores;
CREATE POLICY "users_create_store" ON public.stores
    FOR INSERT TO authenticated
    WITH CHECK (true);

DROP POLICY IF EXISTS "owners_update_store" ON public.stores;
CREATE POLICY "owners_update_store" ON public.stores
    FOR UPDATE TO authenticated
    USING (id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid() AND role = 'owner'));

-- Store Members
DROP POLICY IF EXISTS "members_read_store_members" ON public.store_members;
CREATE POLICY "members_read_store_members" ON public.store_members
    FOR SELECT TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "owners_manage_store_members" ON public.store_members;
CREATE POLICY "owners_manage_store_members" ON public.store_members
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid() AND role = 'owner'));

DROP POLICY IF EXISTS "users_insert_initial_membership" ON public.store_members;
CREATE POLICY "users_insert_initial_membership" ON public.store_members
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Products
DROP POLICY IF EXISTS "members_access_products" ON public.products;
CREATE POLICY "members_access_products" ON public.products
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

-- Inventory
DROP POLICY IF EXISTS "members_access_inventory" ON public.inventory;
CREATE POLICY "members_access_inventory" ON public.inventory
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

-- Invoices
DROP POLICY IF EXISTS "members_access_invoices" ON public.invoices;
CREATE POLICY "members_access_invoices" ON public.invoices
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

-- Invoice Lines
DROP POLICY IF EXISTS "members_access_invoice_lines" ON public.invoice_lines;
CREATE POLICY "members_access_invoice_lines" ON public.invoice_lines
    FOR ALL TO authenticated
    USING (invoice_id IN (
        SELECT i.id FROM public.invoices i
        JOIN public.store_members sm ON i.store_id = sm.store_id
        WHERE sm.user_id = auth.uid()
    ))
    WITH CHECK (invoice_id IN (
        SELECT i.id FROM public.invoices i
        JOIN public.store_members sm ON i.store_id = sm.store_id
        WHERE sm.user_id = auth.uid()
    ));

-- Stock Movements
DROP POLICY IF EXISTS "members_access_stock_movements" ON public.stock_movements;
CREATE POLICY "members_access_stock_movements" ON public.stock_movements
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

-- Purchase Order Drafts
DROP POLICY IF EXISTS "members_access_po_drafts" ON public.purchase_order_drafts;
CREATE POLICY "members_access_po_drafts" ON public.purchase_order_drafts
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

-- Purchase Order Lines
DROP POLICY IF EXISTS "members_access_po_lines" ON public.purchase_order_lines;
CREATE POLICY "members_access_po_lines" ON public.purchase_order_lines
    FOR ALL TO authenticated
    USING (purchase_order_draft_id IN (
        SELECT pod.id FROM public.purchase_order_drafts pod
        JOIN public.store_members sm ON pod.store_id = sm.store_id
        WHERE sm.user_id = auth.uid()
    ))
    WITH CHECK (purchase_order_draft_id IN (
        SELECT pod.id FROM public.purchase_order_drafts pod
        JOIN public.store_members sm ON pod.store_id = sm.store_id
        WHERE sm.user_id = auth.uid()
    ));

-- Sales Records
DROP POLICY IF EXISTS "members_access_sales_records" ON public.sales_records;
CREATE POLICY "members_access_sales_records" ON public.sales_records
    FOR ALL TO authenticated
    USING (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()))
    WITH CHECK (store_id IN (SELECT store_id FROM public.store_members WHERE user_id = auth.uid()));

-- 7. SUPABASE STORAGE BUCKET CONFIGURATION (Private 'invoices' Bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'invoices',
    'invoices',
    false, -- Private bucket: access only via signed URLs or service role
    10485760, -- 10MB limit per invoice file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Storage Security Policies
DROP POLICY IF EXISTS "service_role_all_invoices_storage" ON storage.objects;
CREATE POLICY "service_role_all_invoices_storage" ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'invoices')
    WITH CHECK (bucket_id = 'invoices');

DROP POLICY IF EXISTS "authenticated_upload_invoices_storage" ON storage.objects;
CREATE POLICY "authenticated_upload_invoices_storage" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'invoices');

DROP POLICY IF EXISTS "authenticated_select_invoices_storage" ON storage.objects;
CREATE POLICY "authenticated_select_invoices_storage" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'invoices');

