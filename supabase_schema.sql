BEGIN;
-- ==============================================================================
-- MEAT GHAR - SUPABASE COMPLETE DATABASE SCHEMA & RLS POLICIES
-- Run this in your Supabase Dashboard -> SQL Editor -> Click 'Run'
-- Apply only after backup and review. Existing demo records are not deleted.
-- ==============================================================================

-- 1. EXTENSIONS
-- gen_random_uuid() is built into supported PostgreSQL versions.

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    original_price NUMERIC,
    weight TEXT DEFAULT '500g',
    pieces TEXT,
    serves TEXT,
    description TEXT,
    image TEXT,
    in_stock BOOLEAN DEFAULT true,
    badge TEXT,
    rating NUMERIC DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    delivery_time TEXT DEFAULT '25 Mins',
    sales_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    icon TEXT,
    image TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BANNERS TABLE (Home carousel)
CREATE TABLE IF NOT EXISTS public.banners (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    tag TEXT,
    image TEXT NOT NULL,
    link_category TEXT,
    bg_gradient TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FLASH DEALS TABLE
CREATE TABLE IF NOT EXISTS public.flash_deals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    discount TEXT NOT NULL,
    image TEXT NOT NULL,
    tag TEXT,
    end_time TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE (User orders & Admin fulfillment)
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address JSONB NOT NULL,
    items JSONB NOT NULL,
    total_amount NUMERIC NOT NULL,
    subtotal NUMERIC,
    delivery_fee NUMERIC DEFAULT 0,
    discount NUMERIC DEFAULT 0,
    payment_method TEXT DEFAULT 'COD',
    payment_status TEXT DEFAULT 'Pending',
    status TEXT DEFAULT 'Placed', -- 'Placed', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'
    delivery_partner JSONB,
    special_instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Can store Auth UID or phone number
    type TEXT DEFAULT 'Home',
    full_name TEXT NOT NULL,
    phone TEXT,
    alt_phone TEXT,
    house_flat TEXT NOT NULL,
    street_road TEXT NOT NULL,
    locality TEXT NOT NULL,
    city TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SUPPORT TICKETS & CHAT
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_phone TEXT,
    subject TEXT,
    status TEXT DEFAULT 'Open',
    messages JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8.5. USER PROFILES TABLE (Maps phone numbers to authenticating emails)
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT,
    phone TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. USER WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.user_wallets (
    user_id TEXT PRIMARY KEY,
    balance NUMERIC DEFAULT 0 NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WALLET TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    customer_name TEXT,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    qr_reference TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================

-- Upgrade existing tables without silently assigning legacy records to customers.
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS category_id TEXT;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_category_fk;
ALTER TABLE public.products ADD CONSTRAINT products_category_fk FOREIGN KEY(category_id) REFERENCES public.categories(id) ON DELETE RESTRICT NOT VALID;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS unit_kg NUMERIC;
ALTER TABLE public.products ALTER COLUMN stock_quantity TYPE NUMERIC;
ALTER TABLE public.products ALTER COLUMN sales_count TYPE NUMERIC;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_price_valid;
ALTER TABLE public.products ADD CONSTRAINT products_price_valid CHECK(price>0 AND price<> 'NaN'::numeric) NOT VALID;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_stock_valid;
ALTER TABLE public.products ADD CONSTRAINT products_stock_valid CHECK(stock_quantity>=0 AND stock_quantity<>'NaN'::numeric) NOT VALID;
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_unit_valid;
ALTER TABLE public.products ADD CONSTRAINT products_unit_valid CHECK(unit_kg IS NULL OR (unit_kg>0 AND unit_kg<>'NaN'::numeric)) NOT VALID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS request_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS taxes NUMERIC NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS status_history JSONB NOT NULL DEFAULT '[]';
CREATE UNIQUE INDEX IF NOT EXISTS orders_user_request ON public.orders(user_id,request_id);
ALTER TABLE public.addresses ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.support_tickets ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}';
ALTER TABLE public.flash_deals ADD COLUMN IF NOT EXISTS details JSONB NOT NULL DEFAULT '{}';
CREATE TABLE IF NOT EXISTS public.offers (id TEXT PRIMARY KEY, details JSONB NOT NULL, is_active BOOLEAN NOT NULL DEFAULT true);
CREATE UNIQUE INDEX IF NOT EXISTS offers_unique_coupon ON public.offers(upper(trim(details->>'couponCode'))) WHERE NULLIF(trim(details->>'couponCode'),'') IS NOT NULL;
CREATE TABLE IF NOT EXISTS public.notifications (id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text, user_id UUID REFERENCES auth.users(id), title TEXT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS public.reviews (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), order_id TEXT NOT NULL UNIQUE REFERENCES public.orders(id), user_id UUID NOT NULL REFERENCES auth.users(id), rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at TIMESTAMPTZ DEFAULT now());
CREATE TABLE IF NOT EXISTS public.admin_users (user_id UUID PRIMARY KEY REFERENCES auth.users(id));
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM anon,authenticated;

CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT EXISTS(SELECT 1 FROM public.admin_users WHERE user_id=auth.uid());
$$;
CREATE OR REPLACE FUNCTION public.is_active_user() RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path=public AS $$
 SELECT auth.uid() IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=auth.uid()::text AND is_blocked);
$$;

-- Remove all prior permissive policies on application tables. RLS policies combine
-- with OR: leaving even one old USING(true) policy would defeat the new boundary.
DO $$ DECLARE r RECORD; BEGIN
 FOR r IN SELECT schemaname,tablename,policyname FROM pg_policies WHERE schemaname='public' AND tablename IN ('products','categories','banners','flash_deals','orders','addresses','support_tickets','profiles','user_wallets','wallet_transactions','offers','notifications','reviews') LOOP
  EXECUTE format('DROP POLICY %I ON %I.%I',r.policyname,r.schemaname,r.tablename);
 END LOOP;
END $$;
DO $$ DECLARE t TEXT; BEGIN
 FOREACH t IN ARRAY ARRAY['products','categories','banners','flash_deals','offers'] LOOP
  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
  EXECUTE format('CREATE POLICY catalog_read ON public.%I FOR SELECT USING (true)',t);
  EXECUTE format('CREATE POLICY admin_write ON public.%I FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())',t);
 END LOOP;
END $$;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_read ON public.orders FOR SELECT TO authenticated USING (public.is_admin() OR (user_id=auth.uid() AND public.is_active_user()));
-- Orders and financial tables may only be mutated through restricted RPCs.
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY addresses_owned ON public.addresses FOR ALL TO authenticated USING (user_id=auth.uid()::text AND public.is_active_user()) WITH CHECK (user_id=auth.uid()::text AND public.is_active_user());
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid()::text OR public.is_admin());
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY tickets_read ON public.support_tickets FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.is_admin());
CREATE POLICY tickets_create ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND public.is_active_user() AND status='Open' AND messages='[]'::jsonb);
CREATE POLICY tickets_admin_update ON public.support_tickets FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_read ON public.user_wallets FOR SELECT TO authenticated USING (user_id=auth.uid()::text OR public.is_admin());
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY transactions_read ON public.wallet_transactions FOR SELECT TO authenticated USING (user_id=auth.uid()::text OR public.is_admin());
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_read ON public.notifications FOR SELECT TO authenticated USING (user_id IS NULL OR user_id=auth.uid() OR public.is_admin());
CREATE POLICY notifications_admin ON public.notifications FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_read ON public.reviews FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.is_admin());
CREATE POLICY reviews_insert ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid() AND EXISTS(SELECT 1 FROM public.orders WHERE id=order_id AND orders.user_id=auth.uid() AND status='Delivered'));

CREATE OR REPLACE FUNCTION public.sync_my_profile(p_name TEXT, p_phone TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE email_value TEXT; BEGIN
 IF NOT public.is_active_user() THEN RAISE EXCEPTION 'Sign-in required or account blocked'; END IF;
 IF length(trim(p_name))<2 OR p_phone !~ '^[+]?[0-9]{10,15}$' THEN RAISE EXCEPTION 'Valid name and phone required'; END IF;
 SELECT email INTO email_value FROM auth.users WHERE id=auth.uid();
 IF EXISTS(SELECT 1 FROM profiles WHERE phone=p_phone AND id IS DISTINCT FROM auth.uid()::text) THEN RAISE EXCEPTION 'Phone already registered'; END IF;
 DELETE FROM profiles WHERE id=auth.uid()::text AND phone<>p_phone;
 INSERT INTO profiles(id,phone,email,full_name) VALUES(auth.uid()::text,p_phone,email_value,trim(p_name)) ON CONFLICT(phone) DO UPDATE SET email=EXCLUDED.email,full_name=EXCLUDED.full_name;
END $$;

CREATE OR REPLACE FUNCTION public.set_user_blocked(p_id TEXT,p_blocked BOOLEAN) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 IF EXISTS(SELECT 1 FROM admin_users WHERE user_id::text=p_id) THEN RAISE EXCEPTION 'Manage administrator access through admin_users, not customer blocking'; END IF;
 UPDATE profiles SET is_blocked=p_blocked WHERE id=p_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'User not found'; END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.store_settings (id BOOLEAN PRIMARY KEY DEFAULT true CHECK(id), delivery_fee NUMERIC NOT NULL DEFAULT 40 CHECK(delivery_fee>=0), free_delivery_threshold NUMERIC NOT NULL DEFAULT 500 CHECK(free_delivery_threshold>=0), tax_percent NUMERIC NOT NULL DEFAULT 5 CHECK(tax_percent BETWEEN 0 AND 100), is_open BOOLEAN NOT NULL DEFAULT true);
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS service_city TEXT NOT NULL DEFAULT 'Guwahati';
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS service_areas JSONB NOT NULL DEFAULT '["Boko","Dhupdhara"]';
INSERT INTO public.store_settings(id) VALUES(true) ON CONFLICT(id) DO NOTHING;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS store_read ON public.store_settings;
DROP POLICY IF EXISTS store_write ON public.store_settings;
CREATE POLICY store_read ON public.store_settings FOR SELECT USING(true);
CREATE POLICY store_write ON public.store_settings FOR ALL TO authenticated USING(public.is_admin()) WITH CHECK(public.is_admin());
CREATE OR REPLACE FUNCTION public.coupon_discount(p_code TEXT,p_subtotal NUMERIC) RETURNS NUMERIC LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
DECLARE offer public.offers; val NUMERIC; BEGIN
 IF NOT public.is_active_user() THEN RAISE EXCEPTION 'Sign-in required'; END IF;
 IF p_code IS NULL OR trim(p_code)='' THEN RETURN 0; END IF;
 IF p_subtotal IS NULL OR p_subtotal<=0 OR p_subtotal='NaN'::numeric THEN RAISE EXCEPTION 'Invalid subtotal'; END IF;
 SELECT * INTO offer FROM offers WHERE is_active AND upper(details->>'couponCode')=upper(trim(p_code)) LIMIT 1;
 IF NOT FOUND THEN RAISE EXCEPTION 'Invalid or inactive coupon'; END IF;
 IF NULLIF(offer.details->>'validTill','') IS NOT NULL AND (offer.details->>'validTill')::date<current_date THEN RAISE EXCEPTION 'Coupon has expired'; END IF;
 val:=(offer.details->>'discountValue')::numeric;
 IF val IS NULL OR val<=0 THEN RAISE EXCEPTION 'Coupon is not configured'; END IF;
 IF offer.details->>'discountType'='percentage' THEN RETURN round(least(p_subtotal,p_subtotal*least(val,100)/100),2);
 ELSIF offer.details->>'discountType'='flat' THEN RETURN least(p_subtotal,val);
 ELSE RAISE EXCEPTION 'This offer cannot be redeemed as a coupon'; END IF;
END $$;
REVOKE ALL ON FUNCTION public.coupon_discount(TEXT,NUMERIC) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.coupon_discount(TEXT,NUMERIC) TO authenticated;

-- Server-calculated totals, locked stock, idempotent request IDs and atomic wallet payment.
CREATE OR REPLACE FUNCTION public.place_order(p_request UUID,p_address TEXT,p_items JSONB,p_payment TEXT,p_coupon TEXT DEFAULT NULL,p_expected_total NUMERIC DEFAULT NULL) RETURNS public.orders LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE result public.orders; addr public.addresses; profile public.profiles; item JSONB; prod public.products; q INTEGER; kg NUMERIC; multiplier NUMERIC; cost NUMERIC; sub NUMERIC:=0; fee NUMERIC; tax NUMERIC; total NUMERIC; order_items JSONB:='[]'; settings public.store_settings; discount_value NUMERIC:=0;
BEGIN
 IF NOT public.is_active_user() THEN RAISE EXCEPTION 'Sign-in required or account blocked'; END IF;
 IF p_request IS NULL THEN RAISE EXCEPTION 'Request ID required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(auth.uid()::text||p_request::text,0));
 SELECT * INTO result FROM orders WHERE user_id=auth.uid() AND request_id=p_request;
 IF FOUND THEN RETURN result; END IF;
 IF p_payment IS NULL OR p_payment NOT IN ('COD','WALLET') THEN RAISE EXCEPTION 'Online gateway is not configured; choose COD or wallet'; END IF;
 SELECT * INTO settings FROM store_settings WHERE id=true;
 IF NOT settings.is_open THEN RAISE EXCEPTION 'The store is currently closed'; END IF;
 SELECT * INTO addr FROM addresses WHERE id=p_address AND user_id=auth.uid()::text;
 IF NOT FOUND THEN RAISE EXCEPTION 'Select your saved delivery address'; END IF;
 IF lower(trim(split_part(addr.city,'(',1)))<>lower(trim(settings.service_city)) OR NOT EXISTS(SELECT 1 FROM jsonb_array_elements_text(settings.service_areas) area WHERE lower(trim(area))=lower(trim(addr.locality)) OR lower(trim(area))=lower(trim(split_part(split_part(addr.city,'(',2),')',1)))) THEN RAISE EXCEPTION 'Delivery is not available at this address'; END IF;
 SELECT * INTO profile FROM profiles WHERE id=auth.uid()::text;
 IF NOT FOUND THEN RAISE EXCEPTION 'Complete your profile first'; END IF;
 IF p_items IS NULL OR jsonb_typeof(p_items)<>'array' OR jsonb_array_length(p_items) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Cart must contain 1 to 100 lines'; END IF;
 -- Lock in product ID order to avoid deadlocks for concurrent carts.
 FOR item IN SELECT value FROM jsonb_array_elements(p_items) ORDER BY value->>'productId' LOOP
  IF item->>'quantity' IS NULL OR (item->>'quantity') !~ '^[0-9]+$' THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  q:=(item->>'quantity')::integer;
  IF q NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Invalid quantity'; END IF;
  SELECT * INTO prod FROM products WHERE id=item->>'productId' FOR UPDATE;
  IF NOT FOUND OR NOT prod.in_stock  THEN RAISE EXCEPTION 'Product unavailable or insufficient stock'; END IF;
  kg:=NULLIF(item->>'quantityKg','')::numeric;
  multiplier:=1;
  IF kg IS NOT NULL THEN
   IF prod.unit_kg IS NULL OR prod.unit_kg<=0 OR kg<0.25 OR kg>10 OR mod(kg,0.25)<>0 THEN RAISE EXCEPTION 'Invalid product weight'; END IF;
   multiplier:=kg/prod.unit_kg;
  END IF;
  IF prod.stock_quantity < multiplier*q THEN RAISE EXCEPTION 'Insufficient stock'; END IF;
  cost:=round(prod.price*multiplier,2); sub:=sub+cost*q;
  order_items:=order_items||jsonb_build_array(jsonb_build_object('productId',prod.id,'name',prod.name,'price',cost,'quantity',q,'unit',CASE WHEN kg IS NULL THEN prod.weight ELSE kg::text||' KG' END,'quantityKg',kg,'stockUnits',multiplier*q,'image',prod.image,'cut',left(item->>'cut',200),'notes',left(item->>'notes',1000)));
  UPDATE products SET stock_quantity=stock_quantity-multiplier*q WHERE id=prod.id;
 END LOOP;
 discount_value:=public.coupon_discount(p_coupon,sub);
 fee:=CASE WHEN sub<settings.free_delivery_threshold THEN settings.delivery_fee ELSE 0 END; tax:=round((sub-discount_value)*settings.tax_percent/100); total:=sub-discount_value+fee+tax;
 IF p_expected_total IS NOT NULL AND round(p_expected_total,2)<>total THEN RAISE EXCEPTION 'Prices or fees have changed. Refresh your cart before ordering.'; END IF;
 IF p_payment='WALLET' THEN
  UPDATE user_wallets SET balance=balance-total,updated_at=now() WHERE user_id=auth.uid()::text AND balance>=total;
  IF NOT FOUND THEN RAISE EXCEPTION 'Insufficient wallet balance'; END IF;
 END IF;
 INSERT INTO orders(id,user_id,request_id,customer_name,customer_phone,customer_email,delivery_address,items,subtotal,delivery_fee,taxes,discount,coupon_code,total_amount,payment_method,payment_status,status,status_history)
 VALUES('MTG-'||gen_random_uuid()::text,auth.uid(),p_request,profile.full_name,profile.phone,profile.email,jsonb_build_object('address',concat_ws(', ',addr.house_flat,addr.street_road,addr.locality,addr.city),'name',addr.full_name,'phone',addr.phone),order_items,sub,fee,tax,discount_value,upper(trim(p_coupon)),total,p_payment,CASE WHEN p_payment='WALLET' THEN 'Paid' ELSE 'Pending' END,'Pending',jsonb_build_array(jsonb_build_object('status','Pending','at',now()))) RETURNING * INTO result;
 IF p_payment='WALLET' THEN INSERT INTO wallet_transactions(id,user_id,amount,type,status,notes) VALUES(gen_random_uuid()::text,auth.uid()::text,total,'payment','Approved',result.id); END IF;
 RETURN result;
END $$;

CREATE OR REPLACE FUNCTION public.request_wallet_deposit(p_amount NUMERIC,p_reference TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.is_active_user() THEN RAISE EXCEPTION 'Sign-in required'; END IF;
 IF p_amount IS NULL OR p_amount<1 OR p_amount>50000 OR length(trim(p_reference))<6 THEN RAISE EXCEPTION 'Invalid deposit amount or reference'; END IF;
 IF EXISTS(SELECT 1 FROM wallet_transactions WHERE qr_reference=trim(p_reference)) THEN RAISE EXCEPTION 'Reference already submitted'; END IF;
 INSERT INTO wallet_transactions(id,user_id,amount,type,status,qr_reference) VALUES(gen_random_uuid()::text,auth.uid()::text,round(p_amount,2),'deposit','Pending',trim(p_reference));
END $$;
CREATE UNIQUE INDEX IF NOT EXISTS wallet_unique_reference ON public.wallet_transactions(qr_reference) WHERE qr_reference IS NOT NULL;
CREATE OR REPLACE FUNCTION public.review_wallet_deposit(p_id TEXT,p_approve BOOLEAN) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE tx public.wallet_transactions; BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT * INTO tx FROM wallet_transactions WHERE id=p_id FOR UPDATE;
 IF NOT FOUND OR tx.type<>'deposit' OR tx.status<>'Pending' THEN RAISE EXCEPTION 'Only pending deposits may be reviewed'; END IF;
 UPDATE wallet_transactions SET status=CASE WHEN p_approve THEN 'Approved' ELSE 'Rejected' END WHERE id=p_id;
 IF p_approve THEN INSERT INTO user_wallets(user_id,balance) VALUES(tx.user_id,tx.amount) ON CONFLICT(user_id) DO UPDATE SET balance=user_wallets.balance+EXCLUDED.balance,updated_at=now(); END IF;
END $$;
CREATE OR REPLACE FUNCTION public.set_order_status(p_id TEXT,p_status TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE o public.orders; item JSONB; BEGIN
 IF NOT public.is_admin() THEN RAISE EXCEPTION 'Administrator required'; END IF;
 SELECT * INTO o FROM orders WHERE id=p_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Order not found'; END IF;
 IF NOT ((o.status='Pending' AND p_status IN ('Preparing','Cancelled')) OR (o.status='Preparing' AND p_status IN ('On the Way','Cancelled')) OR (o.status='On the Way' AND p_status='Delivered')) THEN RAISE EXCEPTION 'Invalid order status transition'; END IF;
 IF p_status='Cancelled' THEN
  FOR item IN SELECT value FROM jsonb_array_elements(o.items) LOOP UPDATE products SET stock_quantity=stock_quantity+COALESCE((item->>'stockUnits')::numeric,(item->>'quantity')::numeric) WHERE id=item->>'productId'; END LOOP;
  IF o.payment_method='WALLET' AND o.payment_status='Paid' THEN
   INSERT INTO user_wallets(user_id,balance) VALUES(o.user_id::text,o.total_amount) ON CONFLICT(user_id) DO UPDATE SET balance=user_wallets.balance+EXCLUDED.balance;
   INSERT INTO wallet_transactions(id,user_id,amount,type,status,notes) VALUES(gen_random_uuid()::text,o.user_id::text,o.total_amount,'refund','Approved',o.id);
  END IF;
 END IF;
 IF p_status='Delivered' THEN FOR item IN SELECT value FROM jsonb_array_elements(o.items) LOOP UPDATE products SET sales_count=sales_count+COALESCE((item->>'stockUnits')::numeric,(item->>'quantity')::numeric) WHERE id=item->>'productId'; END LOOP; END IF;
 UPDATE orders SET status=p_status,updated_at=now(),delivered_at=CASE WHEN p_status='Delivered' THEN now() ELSE delivered_at END,payment_status=CASE WHEN p_status='Cancelled' AND payment_method='WALLET' THEN 'Refunded' WHEN p_status='Delivered' AND payment_method='COD' THEN 'Paid' ELSE payment_status END,status_history=status_history||jsonb_build_array(jsonb_build_object('status',p_status,'at',now())) WHERE id=p_id;
END $$;
CREATE OR REPLACE FUNCTION public.reply_to_ticket(p_id TEXT,p_text TEXT) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF auth.uid() IS NULL OR length(trim(p_text)) NOT BETWEEN 1 AND 4000 THEN RAISE EXCEPTION 'Invalid message'; END IF;
 UPDATE support_tickets SET messages=messages||jsonb_build_array(jsonb_build_object('id',gen_random_uuid(),'sender',CASE WHEN public.is_admin() THEN 'admin' ELSE 'customer' END,'text',trim(p_text),'time',now())),updated_at=now() WHERE id=p_id AND (public.is_admin() OR (user_id=auth.uid() AND public.is_active_user()));
 IF NOT FOUND THEN RAISE EXCEPTION 'Ticket not found'; END IF;
END $$;
-- Never leave security-definer routines executable by unauthenticated visitors.
DO $$ DECLARE r RECORD; BEGIN
 FOR r IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid WHERE n.nspname='public' AND p.proname IN ('is_admin','is_active_user','sync_my_profile','set_user_blocked','place_order','request_wallet_deposit','review_wallet_deposit','set_order_status','reply_to_ticket') LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon',r.signature);
  EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated',r.signature);
 END LOOP;
END $$;
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('meatghar-images','meatghar-images',true,5242880,ARRAY['image/jpeg','image/png','image/webp','image/gif']) ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=5242880,allowed_mime_types=EXCLUDED.allowed_mime_types;
-- Remove the unsafe policies shipped with the archive; do not affect other buckets.
DROP POLICY IF EXISTS "Public Read MeatGhar Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Upload to MeatGhar Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Update MeatGhar Images" ON storage.objects;
DROP POLICY IF EXISTS "Allow Delete MeatGhar Images" ON storage.objects;
DROP POLICY IF EXISTS meatghar_images_read ON storage.objects;
DROP POLICY IF EXISTS meatghar_images_write ON storage.objects;
CREATE POLICY meatghar_images_read ON storage.objects FOR SELECT USING(bucket_id='meatghar-images');
CREATE POLICY meatghar_images_write ON storage.objects FOR ALL TO authenticated USING(bucket_id='meatghar-images' AND public.is_admin()) WITH CHECK(bucket_id='meatghar-images' AND public.is_admin());
-- Provision an existing Auth account as admin from the SQL editor only:
-- INSERT INTO public.admin_users(user_id) SELECT id FROM auth.users WHERE email='YOUR_ADMIN_EMAIL' ON CONFLICT DO NOTHING;

COMMIT;
