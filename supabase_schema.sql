-- ==============================================================================
-- HERBAL GUIDE (Prince Emmanuel) - HARDENED SUPABASE POSTGRESQL SCHEMA
-- ==============================================================================
-- Security Model:
--   * Public/anonymous (anon) and authenticated browser roles have ZERO access
--     to orders, customers, webhook_events, download_logs, or support_inquiries.
--   * Only the backend Express server using SUPABASE_SERVICE_ROLE_KEY can read,
--     insert, or update orders, mark transactions completed, or log downloads.
--   * No card numbers, CVVs, or Paystack secret keys are ever stored.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. ORDERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_ref TEXT UNIQUE NOT NULL,
    product_id TEXT NOT NULL DEFAULT 'herbal-guide-pdf',
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL DEFAULT '',
    amount NUMERIC(10, 2) NOT NULL DEFAULT 3000.00 CHECK (amount = 3000.00),
    currency TEXT NOT NULL DEFAULT 'NGN' CHECK (currency = 'NGN'),
    payment_gateway TEXT NOT NULL DEFAULT 'paystack' CHECK (payment_gateway IN ('paystack', 'selar')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    paystack_reference TEXT UNIQUE,
    paystack_transaction_id TEXT,
    channel TEXT DEFAULT 'card',
    pdf_download_count INTEGER NOT NULL DEFAULT 0 CHECK (pdf_download_count >= 0),
    last_download_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Ensure columns exist if upgrading from an older schema
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS product_id TEXT NOT NULL DEFAULT 'herbal-guide-pdf';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS last_download_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_amount_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_amount_check CHECK (amount = 3000.00);
ALTER TABLE public.orders ALTER COLUMN amount SET DEFAULT 3000.00;

-- Indexes for fast server-side lookups
CREATE INDEX IF NOT EXISTS idx_orders_order_ref ON public.orders(order_ref);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref ON public.orders(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_product_id ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- ==============================================================================
-- 3. CUSTOMERS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    total_orders INTEGER NOT NULL DEFAULT 1 CHECK (total_orders >= 0),
    total_spent NUMERIC(10, 2) NOT NULL DEFAULT 3000.00 CHECK (total_spent >= 0),
    first_purchase_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    last_purchase_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- ==============================================================================
-- 4. WEBHOOK IDEMPOTENCY EVENTS TABLE
-- Prevents duplicate fulfillment if Paystack retries a webhook event
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_key TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    order_ref TEXT NOT NULL,
    paystack_event_id TEXT,
    status TEXT NOT NULL DEFAULT 'processed',
    processed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_order_ref ON public.webhook_events(order_ref);

-- ==============================================================================
-- 5. PDF DOWNLOAD AUDIT LOGS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.download_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    order_ref TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    token_jti TEXT,
    ip_hash TEXT,
    user_agent TEXT,
    downloaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.download_logs ADD COLUMN IF NOT EXISTS token_jti TEXT;
ALTER TABLE public.download_logs ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_download_logs_order_ref ON public.download_logs(order_ref);
CREATE INDEX IF NOT EXISTS idx_download_logs_downloaded_at ON public.download_logs(downloaded_at DESC);

-- ==============================================================================
-- 6. SUPPORT INQUIRIES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.support_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    contact TEXT NOT NULL,
    message TEXT,
    source TEXT DEFAULT 'web_faq',
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 7. SAFE TRIGGERS (Pinned search_path)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_orders_updated_at ON public.orders;
CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trigger_customers_updated_at ON public.customers;
CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.sync_order_customer()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.payment_status = 'completed' AND (TG_OP = 'INSERT' OR OLD.payment_status IS DISTINCT FROM 'completed') THEN
        INSERT INTO public.customers (
            email,
            full_name,
            phone,
            total_orders,
            total_spent,
            first_purchase_at,
            last_purchase_at
        )
        VALUES (
            NEW.customer_email,
            NEW.customer_name,
            NEW.customer_phone,
            1,
            NEW.amount,
            NEW.created_at,
            NEW.created_at
        )
        ON CONFLICT (email) DO UPDATE SET
            full_name = EXCLUDED.full_name,
            phone = CASE WHEN EXCLUDED.phone <> '' THEN EXCLUDED.phone ELSE public.customers.phone END,
            total_orders = public.customers.total_orders + 1,
            total_spent = public.customers.total_spent + EXCLUDED.total_spent,
            last_purchase_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_order_customer ON public.orders;
CREATE TRIGGER trigger_sync_order_customer
    AFTER INSERT OR UPDATE OF payment_status ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_order_customer();

-- ==============================================================================
-- 8. LOCKED-DOWN ROW LEVEL SECURITY (DENY PUBLIC READ & WRITE BY DEFAULT)
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_inquiries ENABLE ROW LEVEL SECURITY;

-- Drop any legacy permissive policies
DROP POLICY IF EXISTS "Allow anonymous order creation" ON public.orders;
DROP POLICY IF EXISTS "Allow customer to read own order" ON public.orders;
DROP POLICY IF EXISTS "Allow updating order on payment" ON public.orders;
DROP POLICY IF EXISTS "Allow logging downloads" ON public.download_logs;
DROP POLICY IF EXISTS "Allow submitting support inquiries" ON public.support_inquiries;

-- Explicitly revoke all public/browser table, sequence, and function permissions
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, PUBLIC;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated, PUBLIC;

-- Explicit Deny-All policies for anon and authenticated client roles
DROP POLICY IF EXISTS "Deny all client access to orders" ON public.orders;
CREATE POLICY "Deny all client access to orders"
    ON public.orders
    FOR ALL
    TO anon, authenticated
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all client access to customers" ON public.customers;
CREATE POLICY "Deny all client access to customers"
    ON public.customers
    FOR ALL
    TO anon, authenticated
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all client access to webhook_events" ON public.webhook_events;
CREATE POLICY "Deny all client access to webhook_events"
    ON public.webhook_events
    FOR ALL
    TO anon, authenticated
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all client access to download_logs" ON public.download_logs;
CREATE POLICY "Deny all client access to download_logs"
    ON public.download_logs
    FOR ALL
    TO anon, authenticated
    USING (false)
    WITH CHECK (false);

DROP POLICY IF EXISTS "Deny all client access to support_inquiries" ON public.support_inquiries;
CREATE POLICY "Deny all client access to support_inquiries"
    ON public.support_inquiries
    FOR ALL
    TO anon, authenticated
    USING (false)
    WITH CHECK (false);

-- Grant full operational permissions ONLY to trusted server-side service_role
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;

-- ==============================================================================
-- 9. PRIVATE STORAGE BUCKET RECOMMENDATION (for PDF Handbook)
-- Make sure your Supabase Storage bucket for the PDF has public = false!
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('private-ebooks', 'private-ebooks', false)
ON CONFLICT (id) DO UPDATE SET public = false;
