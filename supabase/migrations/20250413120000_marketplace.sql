-- Marketplace schema: restaurants, order extensions, addresses, order events.
-- Run against your Supabase project (SQL editor or CLI). Safe to re-run where noted.

-- ─── Restaurants ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.restaurants (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  tagline text,
  hero_image_url text,
  cuisines text[] NOT NULL DEFAULT '{}',
  rating numeric(3, 1) NOT NULL DEFAULT 4.5,
  eta_min integer NOT NULL DEFAULT 30,
  delivery_fee integer NOT NULL DEFAULT 30,
  free_delivery_above integer NOT NULL DEFAULT 300,
  is_open boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "restaurants_select_public" ON public.restaurants;
CREATE POLICY "restaurants_select_public"
  ON public.restaurants FOR SELECT
  USING (true);

-- Seed default rows (upsert)
INSERT INTO public.restaurants (id, slug, name, tagline, hero_image_url, cuisines, rating, eta_min, delivery_fee, free_delivery_above, is_open, sort_order)
VALUES
  (
    'meghna-momos',
    'meghna-momos',
    'Meghna''s Momos',
    'Steam, fried & kurkure favourites',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
    ARRAY['Momos', 'Indian', 'Healthy'],
    4.8,
    28,
    30,
    300,
    true,
    0
  ),
  (
    'wok-express',
    'wok-express',
    'Wok Express',
    'Asian bowls, noodles & pasta',
    'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80',
    ARRAY['Chinese', 'Asian', 'Pasta'],
    4.5,
    32,
    40,
    350,
    true,
    1
  ),
  (
    'slice-run',
    'slice-run',
    'Slice Run',
    'Pizza & fast food',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    ARRAY['Pizza', 'Fast food'],
    4.3,
    35,
    45,
    400,
    true,
    2
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  hero_image_url = EXCLUDED.hero_image_url,
  cuisines = EXCLUDED.cuisines,
  rating = EXCLUDED.rating,
  eta_min = EXCLUDED.eta_min,
  delivery_fee = EXCLUDED.delivery_fee,
  free_delivery_above = EXCLUDED.free_delivery_above,
  is_open = EXCLUDED.is_open,
  sort_order = EXCLUDED.sort_order;

-- ─── Products: link to restaurant ──────────────────────────────────────────
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS restaurant_id text REFERENCES public.restaurants (id);

-- Default existing rows; adjust in dashboard or a follow-up migration if you use category columns.
UPDATE public.products SET restaurant_id = 'meghna-momos' WHERE restaurant_id IS NULL;

-- ─── Orders: fee breakdown & payments ───────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS restaurant_id text REFERENCES public.restaurants (id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee numeric(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal numeric(12, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_savings numeric(12, 2) DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users (id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_order_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS razorpay_payment_id text;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS latitude numeric(10, 7);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS longitude numeric(10, 7);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS place_id text;

-- ─── Saved addresses (authenticated users) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  label text NOT NULL DEFAULT 'Home',
  formatted_address text NOT NULL,
  area text,
  place_id text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS user_addresses_user_id_idx ON public.user_addresses (user_id);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_addresses_select_own" ON public.user_addresses;
CREATE POLICY "user_addresses_select_own"
  ON public.user_addresses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_addresses_insert_own" ON public.user_addresses;
CREATE POLICY "user_addresses_insert_own"
  ON public.user_addresses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_addresses_update_own" ON public.user_addresses;
CREATE POLICY "user_addresses_update_own"
  ON public.user_addresses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_addresses_delete_own" ON public.user_addresses;
CREATE POLICY "user_addresses_delete_own"
  ON public.user_addresses FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Order timeline events (optional; app can poll orders.order_status) ─────
CREATE TABLE IF NOT EXISTS public.order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id text NOT NULL,
  status text NOT NULL,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS order_events_order_id_idx ON public.order_events (order_id);

ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS; anon users read via API only. Optional policy for authenticated customer:
DROP POLICY IF EXISTS "order_events_select_own_order" ON public.order_events;
CREATE POLICY "order_events_select_own_order"
  ON public.order_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_events.order_id
        AND o.user_id IS NOT NULL
        AND o.user_id = auth.uid()
    )
  );

COMMENT ON TABLE public.restaurants IS 'Marketplace restaurants; public read.';
COMMENT ON TABLE public.user_addresses IS 'Saved delivery addresses; owner RLS.';
COMMENT ON TABLE public.order_events IS 'Timeline rows for order status history.';
