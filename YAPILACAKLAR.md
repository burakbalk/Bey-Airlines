# Bey Airlines — Manuel Yapılacaklar

## 1. Supabase SQL Editor'den Çalıştır

Supabase Dashboard → SQL Editor → New Query → Aşağıdakileri yapıştır ve çalıştır:

### a) Misafir Rezervasyon RPC Fonksiyonu

```sql
CREATE OR REPLACE FUNCTION get_reservation_by_pnr(p_pnr TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', r.id,
    'pnr', r.pnr,
    'flight_id', r.flight_id,
    'user_id', r.user_id,
    'status', r.status,
    'total_price', r.total_price,
    'flight_class', r.flight_class,
    'contact_email', r.contact_email,
    'contact_phone', r.contact_phone,
    'route', r.route,
    'created_at', r.created_at,
    'passengers', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'tc_no', p.tc_no,
        'birth_date', p.birth_date,
        'gender', p.gender,
        'seat_number', p.seat_number,
        'passenger_type', p.passenger_type
      ))
      FROM passengers p WHERE p.reservation_id = r.id
    ),
    'flight', (
      SELECT jsonb_build_object(
        'flight_number', f.flight_number,
        'departure_city', f.departure_city,
        'arrival_city', f.arrival_city,
        'departure_time', f.departure_time,
        'duration', f.duration
      )
      FROM flights f WHERE f.id = r.flight_id
    )
  ) INTO result
  FROM reservations r
  WHERE UPPER(r.pnr) = UPPER(p_pnr);

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### b) Galeri Görsel Path Güncellemeleri

```sql
UPDATE destinations SET gallery = '["/images/destinations/dubai-gallery-1.webp", "/images/destinations/dubai-gallery-2.webp", "/images/destinations/dubai-gallery-3.webp", "/images/destinations/dubai-gallery-4.webp"]'
WHERE city = 'Dubai';

UPDATE destinations SET gallery = '["/images/destinations/istanbul-gallery-1.webp", "/images/destinations/istanbul-gallery-2.webp", "/images/destinations/istanbul-gallery-3.webp", "/images/destinations/istanbul-gallery-4.webp"]'
WHERE city = 'İstanbul';

UPDATE destinations SET gallery = '["/images/destinations/ankara-gallery-1.webp", "/images/destinations/ankara-gallery-2.webp", "/images/destinations/ankara-gallery-3.webp", "/images/destinations/ankara-gallery-4.webp"]'
WHERE city = 'Ankara';

UPDATE destinations SET gallery = '["/images/destinations/izmir-gallery-1.webp", "/images/destinations/izmir-gallery-2.webp", "/images/destinations/izmir-gallery-3.webp", "/images/destinations/izmir-gallery-4.webp"]'
WHERE city = 'İzmir';
```

---

## 2. E-posta Sistemi (Resend)

### a) Resend API Key Al
1. https://resend.com adresine git
2. Ücretsiz hesap oluştur (ayda 3000 e-posta bedava)
3. Dashboard → API Keys → Create API Key
4. Key'i kopyala (re_xxxxxxxx formatında)

### b) Supabase'e Deploy Et

Terminalde sırasıyla çalıştır:

```bash
# API key'i Supabase secret olarak ekle
supabase secrets set RESEND_API_KEY=re_BURAYA_KEYI_YAPISTIR

# Edge Function'ı deploy et
supabase functions deploy send-reservation-email
```

### c) Gönderici Domain (Opsiyonel)
- Resend Dashboard → Domains → Add Domain
- DNS kayıtlarını domain sağlayıcına ekle
- Yapmazsan e-postalar onboarding@resend.dev adresinden gider (test için yeterli)

---

## 3. Favicon Kontrolü

Favicon otomatik oluşturuldu. Tarayıcıda http://localhost:3000/ aç ve sekme ikonunu kontrol et.
Güncellenmemişse: Cmd+Shift+R (hard refresh)

---

## 4. Otomatik Uçuş Sistemi — SQL Çalıştır

Supabase SQL Editor'de migration.sql'deki yeni eklenen kısımları çalıştır:

### a) Aircraft (Filo) Tablosu

```sql
CREATE TABLE IF NOT EXISTS aircraft (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  registration TEXT UNIQUE NOT NULL,
  model TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  type TEXT DEFAULT 'normal' CHECK (type IN ('normal', 'vip')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'retired')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO aircraft (registration, model, capacity, type) VALUES
('TC-BEY01', 'Boeing 737-800', 180, 'normal'),
('TC-BEY02', 'Boeing 737-800', 180, 'normal'),
('TC-BEY03', 'Boeing 737-800', 180, 'normal'),
('TC-BEY04', 'Bombardier Global 7500', 24, 'vip');
```

### b) flight_schedule Güncelleme

```sql
ALTER TABLE flight_schedule ADD COLUMN IF NOT EXISTS flight_code TEXT;
ALTER TABLE flight_schedule ADD COLUMN IF NOT EXISTS aircraft_id UUID REFERENCES aircraft(id);

-- Mevcut schedule verilerini temizle ve yeniden ekle
DELETE FROM flight_schedule;

INSERT INTO flight_schedule (flight_code, departure_city, arrival_city, departure_time, duration, day_of_week, base_price, aircraft_id)
SELECT 'BEY101', 'İstanbul', 'Dubai', '08:00', '4s 15dk', 1, 2500, id FROM aircraft WHERE registration = 'TC-BEY01'
UNION ALL
SELECT 'BEY102', 'Dubai', 'İstanbul', '14:00', '4s 15dk', 3, 2500, id FROM aircraft WHERE registration = 'TC-BEY01'
UNION ALL
SELECT 'BEY103', 'Ankara', 'Dubai', '09:00', '3s 45dk', 2, 2200, id FROM aircraft WHERE registration = 'TC-BEY02'
UNION ALL
SELECT 'BEY104', 'Dubai', 'Ankara', '15:00', '3s 45dk', 4, 2200, id FROM aircraft WHERE registration = 'TC-BEY02'
UNION ALL
SELECT 'BEY105', 'İzmir', 'Dubai', '10:00', '4s 00dk', 5, 2400, id FROM aircraft WHERE registration = 'TC-BEY03'
UNION ALL
SELECT 'BEY106', 'Dubai', 'İzmir', '16:00', '4s 00dk', 7, 2400, id FROM aircraft WHERE registration = 'TC-BEY03'
UNION ALL
SELECT 'BEY201', 'İstanbul', 'Dubai', '10:00', '4s 00dk', 1, 15000, id FROM aircraft WHERE registration = 'TC-BEY04'
UNION ALL
SELECT 'BEY202', 'Dubai', 'İstanbul', '16:00', '4s 00dk', 3, 15000, id FROM aircraft WHERE registration = 'TC-BEY04';
```

### c) Güncellenmiş Stored Procedures

migration.sql'deki `generate_weekly_flights()`, `update_flight_price()` ve güncellenmiş `increment_booked_seats()` fonksiyonlarını SQL Editor'den çalıştır.

### d) Cron Schedule Ayarla

Supabase Dashboard → Edge Functions → `generate-weekly-flights` → Schedule:
```
0 0 * * 0
```
(Her Pazar gece 00:00 UTC — haftalık uçuşları otomatik oluşturur)

---

## Checklist

### Daha Önce Yapılanlar
- [x] Supabase SQL Editor → get_reservation_by_pnr RPC fonksiyonu
- [x] Supabase SQL Editor → 4 adet galeri UPDATE sorgusu
- [x] Resend.com → API key alındı
- [x] Terminal → supabase secrets set RESEND_API_KEY ✅
- [x] Terminal → supabase functions deploy send-reservation-email ✅
- [x] Terminal → supabase functions deploy generate-weekly-flights ✅
- [x] Tarayıcı → Favicon kontrol

### Yeni Yapılacaklar
- [ ] Supabase SQL Editor → aircraft tablosu oluştur + filo ekle
- [ ] Supabase SQL Editor → flight_schedule güncelle (8 slot)
- [ ] Supabase SQL Editor → generate_weekly_flights() fonksiyonunu güncelle
- [ ] Supabase SQL Editor → update_flight_price() fonksiyonunu ekle
- [ ] Supabase SQL Editor → increment_booked_seats() fonksiyonunu güncelle
- [ ] Supabase Dashboard → generate-weekly-flights cron: `0 0 * * 0`
