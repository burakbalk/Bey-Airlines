-- =============================================
-- Bey Airlines — Performans Index'leri
-- Oluşturulma: 2026-03-14
-- Rollback: dosya sonundaki DROP INDEX bloğunu çalıştır
-- Breaking change: YOK — sadece index ekleme
-- =============================================

-- -----------------------------------------------
-- FLIGHTS tablosu
-- -----------------------------------------------

-- Uçuş arama: flight_date + from_city + to_city
-- useFlights.ts her aramada bu üç kolonu filtreler.
-- Bu composite index olmadan her aramada full table scan olur.
CREATE INDEX IF NOT EXISTS idx_flights_date_from_to
  ON public.flights (flight_date, from_city, to_city);

-- Tarih bazlı sorgular: admin stats, future flights kontrolü
-- idx_flights_date_from_to bu sorguları da karşılar (leading column),
-- ancak sadece flight_date filtreli sorgular için ayrı index daha verimli.
CREATE INDEX IF NOT EXISTS idx_flights_date
  ON public.flights (flight_date);

-- flight_number bazlı UPDATE (update_flight_price fonksiyonu)
-- ve admin panel filtreleme
CREATE INDEX IF NOT EXISTS idx_flights_flight_number
  ON public.flights (flight_number);

-- -----------------------------------------------
-- RESERVATIONS tablosu
-- -----------------------------------------------

-- NOT: reservations.pnr zaten UNIQUE NOT NULL → implicit B-tree index mevcut.
-- Ayrıca UNIQUE index oluşturmak gerekmez.

-- Kullanıcı rezervasyon listesi: user_id + created_at DESC sıralaması
-- useReservations.ts ve hesabim sayfası her oturumda bu sorguyu çalıştırır.
CREATE INDEX IF NOT EXISTS idx_reservations_user_id_created_at
  ON public.reservations (user_id, created_at DESC);

-- Admin panel: status bazlı sayım ve filtreleme
CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON public.reservations (status);

-- -----------------------------------------------
-- PASSENGERS tablosu
-- -----------------------------------------------

-- reservation_id FK üzerinde index — iki kritik etki:
-- 1. passengers.delete/insert işlemleri hızlanır
-- 2. RLS politikasındaki EXISTS subquery hızlanır:
--    EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id ...)
CREATE INDEX IF NOT EXISTS idx_passengers_reservation_id
  ON public.passengers (reservation_id);

-- -----------------------------------------------
-- SAVED_PASSENGERS tablosu
-- -----------------------------------------------

-- NOT: UNIQUE(user_id, tc_no) constraint implicit composite index sağlar.
-- Ancak tc_no şifreleme migration'ı (pgcrypto, görev #26) bu constraint'i kaldıracak.
-- Şifreleme öncesi bu index'i eklemek UNIQUE constraint'in güvenle kaldırılmasını sağlar.
CREATE INDEX IF NOT EXISTS idx_saved_passengers_user_id
  ON public.saved_passengers (user_id);

-- -----------------------------------------------
-- CAMPAIGNS tablosu
-- -----------------------------------------------

-- NOT: campaigns.slug UNIQUE constraint YOK — sadece slug sorguları var.
-- useCampaigns.ts her kampanya detay sayfasında .eq('slug', slug) çalıştırır.
CREATE INDEX IF NOT EXISTS idx_campaigns_slug
  ON public.campaigns (slug);

-- is_active + created_at: ana sayfa ve kampanyalar listesi
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active_created_at
  ON public.campaigns (is_active, created_at DESC);

-- -----------------------------------------------
-- DESTINATIONS tablosu
-- -----------------------------------------------

-- NOT: destinations.slug UNIQUE constraint mevcut → implicit index var.
-- Ayrıca index gerekmez — bu satır bilgi amaçlıdır:
-- CREATE INDEX IF NOT EXISTS idx_destinations_slug ON public.destinations (slug);

-- -----------------------------------------------
-- ROLLBACK
-- -----------------------------------------------
-- Geri almak için aşağıdaki bloğu çalıştır:
--
-- DROP INDEX IF EXISTS public.idx_flights_date_from_to;
-- DROP INDEX IF EXISTS public.idx_flights_date;
-- DROP INDEX IF EXISTS public.idx_flights_flight_number;
-- DROP INDEX IF EXISTS public.idx_reservations_user_id_created_at;
-- DROP INDEX IF EXISTS public.idx_reservations_status;
-- DROP INDEX IF EXISTS public.idx_passengers_reservation_id;
-- DROP INDEX IF EXISTS public.idx_saved_passengers_user_id;
-- DROP INDEX IF EXISTS public.idx_campaigns_slug;
-- DROP INDEX IF EXISTS public.idx_campaigns_is_active_created_at;
