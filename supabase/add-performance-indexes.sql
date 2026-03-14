-- =============================================
-- PERFORMANS INDEX'LERİ
-- Supabase SQL Editor'da çalıştırılmalı
-- Breaking change yok — sadece index ekleme
-- =============================================

-- flights: uçuş arama (en kritik — ana kullanıcı akışı)
CREATE INDEX IF NOT EXISTS idx_flights_date_from_to
  ON flights (flight_date, from_city, to_city);

-- flights: tarih bazlı sorgular (admin stats, future flights)
CREATE INDEX IF NOT EXISTS idx_flights_date
  ON flights (flight_date);

-- flights: flight_number + tarih güncellemeleri
CREATE INDEX IF NOT EXISTS idx_flights_flight_number
  ON flights (flight_number);

-- reservations: kullanıcı rezervasyonları (en sık kullanılan)
CREATE INDEX IF NOT EXISTS idx_reservations_user_id_created_at
  ON reservations (user_id, created_at DESC);

-- reservations: status filtresi (admin iptal sayımı)
CREATE INDEX IF NOT EXISTS idx_reservations_status
  ON reservations (status);

-- passengers: rezervasyon bazlı erişim + RLS subquery (kritik)
CREATE INDEX IF NOT EXISTS idx_passengers_reservation_id
  ON passengers (reservation_id);

-- saved_passengers: kullanıcı bazlı erişim
CREATE INDEX IF NOT EXISTS idx_saved_passengers_user_id
  ON saved_passengers (user_id);

-- campaigns: is_active filtresi (her sayfa yükünde)
CREATE INDEX IF NOT EXISTS idx_campaigns_is_active_created_at
  ON campaigns (is_active, created_at DESC);


-- =============================================
-- ROLLBACK (gerekirse)
-- =============================================
-- DROP INDEX IF EXISTS idx_flights_date_from_to;
-- DROP INDEX IF EXISTS idx_flights_date;
-- DROP INDEX IF EXISTS idx_flights_flight_number;
-- DROP INDEX IF EXISTS idx_reservations_user_id_created_at;
-- DROP INDEX IF EXISTS idx_reservations_status;
-- DROP INDEX IF EXISTS idx_passengers_reservation_id;
-- DROP INDEX IF EXISTS idx_saved_passengers_user_id;
-- DROP INDEX IF EXISTS idx_campaigns_is_active_created_at;
