-- =============================================
-- Bey Airlines — Eksik Kolon Düzeltmeleri
-- Oluşturulma: 2026-03-14
-- Amaç: migration.sql (referans şema) ile production DB (update-sql-editor.sql
--        üzerinden kurulmuş) arasındaki kolon farklarını kapatmak.
--
-- Rollback: dosya sonundaki ROLLBACK bloğunu çalıştır.
-- Breaking change: YOK — sadece kolon ekleme (ADD COLUMN IF NOT EXISTS).
--   Mevcut satırlar NULL değerle gelir, uygulama bunu zaten handle ediyor.
-- =============================================

-- =============================================
-- 1. RESERVATIONS — 3 eksik kolon
-- =============================================

-- payment_method / payment_card_last4:
--   useReservations.ts satır 53-54, 83, 116, 183-184'te kullanılıyor.
--   INSERT ve SELECT sorgularında aktif — production'da eksik olması
--   rezervasyon oluşturma ve listeleme sorgularını kırmaktadır.
--
-- baggage_info:
--   migration.sql'de tanımlı ancak frontend kodunda kullanılmıyor.
--   Yine de şema bütünlüğü için ekleniyor.
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS payment_method    VARCHAR(30),
  ADD COLUMN IF NOT EXISTS payment_card_last4 VARCHAR(4),
  ADD COLUMN IF NOT EXISTS baggage_info       TEXT;

-- =============================================
-- 2. PASSENGERS — 1 eksik kolon
-- =============================================

-- checked_in:
--   check-in/page.tsx satır 23, 101, 111'de kullanılıyor.
--   .update({ checked_in: true }) çağrısı production'da hata veriyor.
ALTER TABLE public.passengers
  ADD COLUMN IF NOT EXISTS checked_in BOOLEAN DEFAULT false;

-- =============================================
-- 3. SAVED_PASSENGERS — 1 eksik kolon
-- =============================================

-- gender:
--   useReservations.ts satır 203'te passengers.gender yazılıyor.
--   payment/page.tsx ve reservation-confirmation/page.tsx'te de kullanılıyor.
--   NOT: passengers tablosundaki gender zaten mevcut (update-sql-editor.sql'de var).
--   saved_passengers'da ise eksik — upsert sırasında hata verebilir.
ALTER TABLE public.saved_passengers
  ADD COLUMN IF NOT EXISTS gender VARCHAR(10);

-- =============================================
-- 4. CAMPAIGNS — 1 eksik kolon
-- =============================================

-- slug:
--   Kampanya detay sayfaları /kampanyalar/:slug rotasını kullanıyor.
--   useCampaigns.ts .eq('slug', slug) sorgusu yapıyor — kolon olmadan 400 hatası.
--   UNIQUE kısıtı: add-slugs.sql'de sonradan eklenmişti, burada da ekliyoruz.
ALTER TABLE public.campaigns
  ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- Slug değerleri mevcut kampanyalar için güncelle (eğer henüz yoksa)
UPDATE public.campaigns SET slug = 'dubai-ucus-agi'    WHERE title = 'Dubai Uçuş Ağı'    AND slug IS NULL;
UPDATE public.campaigns SET slug = 'vip-deneyimi'      WHERE title = 'VIP Deneyimi'       AND slug IS NULL;
UPDATE public.campaigns SET slug = 'erken-rezervasyon' WHERE title = 'Erken Rezervasyon'  AND slug IS NULL;

-- UNIQUE kısıtı — zaten varsa sessizce geç
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name   = 'campaigns'
      AND constraint_name = 'campaigns_slug_key'
  ) THEN
    ALTER TABLE public.campaigns ADD CONSTRAINT campaigns_slug_key UNIQUE (slug);
  END IF;
END;
$$;

-- =============================================
-- 5. DESTINATIONS — 1 eksik kolon
-- =============================================

-- slug:
--   destination-detail, home/PopularDestinations ve CampaignsSection'da
--   /destinasyonlar/:slug rotasına yönlendirmede kullanılıyor.
--   UNIQUE kısıt migration.sql'de tanımlı — production'da eksik.
ALTER TABLE public.destinations
  ADD COLUMN IF NOT EXISTS slug VARCHAR(200);

-- Slug değerleri mevcut destinasyonlar için güncelle (eğer henüz yoksa)
UPDATE public.destinations SET slug = 'dubai'    WHERE city = 'Dubai'    AND slug IS NULL;
UPDATE public.destinations SET slug = 'istanbul' WHERE city = 'İstanbul' AND slug IS NULL;
UPDATE public.destinations SET slug = 'ankara'   WHERE city = 'Ankara'   AND slug IS NULL;
UPDATE public.destinations SET slug = 'izmir'    WHERE city = 'İzmir'    AND slug IS NULL;

-- UNIQUE kısıtı
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public'
      AND table_name   = 'destinations'
      AND constraint_name = 'destinations_slug_key'
  ) THEN
    ALTER TABLE public.destinations ADD CONSTRAINT destinations_slug_key UNIQUE (slug);
  END IF;
END;
$$;

-- =============================================
-- 6. Performans index'i — campaigns.slug
-- =============================================
-- useCampaigns.ts her detay sayfasında .eq('slug', slug) çalıştırır.
-- UNIQUE constraint implicit index oluşturur, ancak IF NOT EXISTS güvencesi için:
CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON public.campaigns (slug);

-- =============================================
-- KARŞILAŞTIRMA NOTU — Eklenmeyenler
-- =============================================
-- Aşağıdaki kolonlar update-sql-editor.sql'de var ama migration.sql'de yok.
-- Bunlar production'da mevcut, migration.sql eksik — ters yönde fark:
--
--   passengers.phone        VARCHAR(20)      — frontend'de dolaylı kullanım
--   passengers.email        VARCHAR(100)     — frontend'de dolaylı kullanım
--   passengers.price        DECIMAL(10,2)    — frontend'de kullanılmıyor
--   passengers.created_at   TIMESTAMPTZ      — frontend'de kullanılmıyor
--   messages.replied_at     TIMESTAMPTZ      — frontend'de kullanılmıyor
--   saved_passengers.created_at TIMESTAMPTZ  — frontend'de kullanılmıyor
--   destinations.created_at TIMESTAMPTZ      — frontend'de kullanılmıyor
--
-- Bu kolonlar production'da zaten var, üzerinde işlem GEREKMEZ.
-- İleride migration.sql şema dökümü güncellenirken bu kolonlar eklenmelidir.

-- =============================================
-- ROLLBACK
-- =============================================
-- Geri almak için aşağıdaki bloğu çalıştır:
--
-- ALTER TABLE public.reservations
--   DROP COLUMN IF EXISTS payment_method,
--   DROP COLUMN IF EXISTS payment_card_last4,
--   DROP COLUMN IF EXISTS baggage_info;
--
-- ALTER TABLE public.passengers
--   DROP COLUMN IF EXISTS checked_in;
--
-- ALTER TABLE public.saved_passengers
--   DROP COLUMN IF EXISTS gender;
--
-- ALTER TABLE public.campaigns
--   DROP CONSTRAINT IF EXISTS campaigns_slug_key,
--   DROP COLUMN IF EXISTS slug;
--
-- ALTER TABLE public.destinations
--   DROP CONSTRAINT IF EXISTS destinations_slug_key,
--   DROP COLUMN IF EXISTS slug;
--
-- DROP INDEX IF EXISTS public.idx_campaigns_slug;
