-- =============================================
-- Bey Airlines — SQL Editor'e Yapıştır ve Çalıştır
-- Bu dosya mevcut DB'yi yeni otomatik uçuş sistemine günceller
-- =============================================

-- 1. ESKİ FONKSİYONLARI TEMİZLE (return type değişiklikleri için)
DROP FUNCTION IF EXISTS increment_booked_seats(integer, integer);
DROP FUNCTION IF EXISTS generate_weekly_flights(date, integer);
DROP FUNCTION IF EXISTS update_flight_price(text, decimal);
DROP FUNCTION IF EXISTS get_reservation_by_pnr(text);

-- 2. ESKİ TABLOLARI TEMİZLE (sıra önemli — FK bağımlılıkları)
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS passengers CASCADE;
DROP TABLE IF EXISTS reservations CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS flight_schedule CASCADE;
DROP TABLE IF EXISTS aircraft CASCADE;
DROP TABLE IF EXISTS destinations CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS saved_passengers CASCADE;
DROP TABLE IF EXISTS faq CASCADE;

-- profiles tablosunu silmiyoruz (auth.users ile bağlı, kullanıcı verisi kaybolmasın)

-- 2. AIRCRAFT (Filo) TABLOSU
CREATE TABLE aircraft (
  id SERIAL PRIMARY KEY,
  registration VARCHAR(20) UNIQUE NOT NULL,
  model VARCHAR(100) NOT NULL,
  capacity INT NOT NULL,
  aircraft_type VARCHAR(10) NOT NULL CHECK (aircraft_type IN ('normal', 'vip')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FLIGHT SCHEDULE (Haftalık program)
CREATE TABLE flight_schedule (
  id SERIAL PRIMARY KEY,
  flight_code VARCHAR(10) UNIQUE NOT NULL,
  aircraft_id INT REFERENCES aircraft(id),
  from_code VARCHAR(3) NOT NULL,
  from_city VARCHAR(50) NOT NULL,
  to_code VARCHAR(3) NOT NULL,
  to_city VARCHAR(50) NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration VARCHAR(20) NOT NULL,
  flight_class VARCHAR(10) NOT NULL CHECK (flight_class IN ('normal', 'vip')),
  price DECIMAL(10,2) NOT NULL,
  baggage BOOLEAN DEFAULT true,
  meal BOOLEAN DEFAULT true,
  changeable BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true
);

-- 4. FLIGHTS (Gerçek uçuş instance'ları)
CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  flight_number VARCHAR(10) NOT NULL,
  schedule_id INT REFERENCES flight_schedule(id),
  aircraft_id INT REFERENCES aircraft(id),
  flight_date DATE NOT NULL,
  from_code VARCHAR(3) NOT NULL,
  from_city VARCHAR(50) NOT NULL,
  to_code VARCHAR(3) NOT NULL,
  to_city VARCHAR(50) NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  duration VARCHAR(20) NOT NULL,
  flight_class VARCHAR(10) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  baggage BOOLEAN DEFAULT true,
  meal BOOLEAN DEFAULT true,
  changeable BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'zamaninda',
  gate VARCHAR(10),
  terminal VARCHAR(5),
  estimated_departure TIME,
  estimated_arrival TIME,
  capacity INT DEFAULT 180,
  booked_seats INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(flight_number, flight_date)
);

-- 5. RESERVATIONS
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr VARCHAR(10) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  flight_id INT REFERENCES flights(id),
  flight_number VARCHAR(10),
  route TEXT,
  flight_date DATE,
  flight_time TIME,
  status VARCHAR(20) DEFAULT 'Onaylandı',
  flight_class VARCHAR(10) DEFAULT 'Ekonomi',
  total_price DECIMAL(10,2),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  extra_services JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. PASSENGERS
CREATE TABLE passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  tc_no VARCHAR(11),
  birth_date DATE,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  passenger_type VARCHAR(20) DEFAULT 'adult',
  seat_number VARCHAR(5),
  price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. SAVED PASSENGERS
CREATE TABLE saved_passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  tc_no VARCHAR(11),
  birth_date DATE,
  gender VARCHAR(10),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. MESSAGES
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(20) DEFAULT 'genel',
  status VARCHAR(20) DEFAULT 'unread',
  admin_reply TEXT,
  replied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. CAMPAIGNS
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  long_description TEXT,
  badge VARCHAR(50),
  type VARCHAR(20) DEFAULT 'featured',
  image TEXT,
  benefits JSONB DEFAULT '[]',
  terms JSONB DEFAULT '[]',
  routes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. DESTINATIONS
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  image TEXT,
  hero_image TEXT,
  price DECIMAL(10,2),
  description TEXT,
  weather JSONB,
  highlights JSONB DEFAULT '[]',
  gallery JSONB DEFAULT '[]',
  popular_flights JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 11. FAQ
CREATE TABLE IF NOT EXISTS faq (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'genel',
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- RLS POLİTİKALARI
-- =============================================

ALTER TABLE aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq ENABLE ROW LEVEL SECURITY;

-- Public SELECT
CREATE POLICY "Public read aircraft" ON aircraft FOR SELECT USING (true);
CREATE POLICY "Public read schedule" ON flight_schedule FOR SELECT USING (true);
CREATE POLICY "Public read flights" ON flights FOR SELECT USING (true);
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Public read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Public read faq" ON faq FOR SELECT USING (true);

-- Reservations
CREATE POLICY "Users read own reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anon can create reservations" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access reservations" ON reservations FOR ALL USING (public.is_admin());

-- Passengers
CREATE POLICY "Public read passengers" ON passengers FOR SELECT USING (true);
CREATE POLICY "Anon can create passengers" ON passengers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access passengers" ON passengers FOR ALL USING (public.is_admin());

-- Saved passengers
CREATE POLICY "Users manage own saved passengers" ON saved_passengers FOR ALL USING (auth.uid() = user_id);

-- Messages
CREATE POLICY "Anon can send messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access messages" ON messages FOR ALL USING (public.is_admin());

-- Admin write
CREATE POLICY "Admin write aircraft" ON aircraft FOR ALL USING (public.is_admin());
CREATE POLICY "Admin write schedule" ON flight_schedule FOR ALL USING (public.is_admin());
CREATE POLICY "Admin write flights" ON flights FOR ALL USING (public.is_admin());
CREATE POLICY "Admin write campaigns" ON campaigns FOR ALL USING (public.is_admin());
CREATE POLICY "Admin write destinations" ON destinations FOR ALL USING (public.is_admin());

-- =============================================
-- FONKSİYONLAR
-- =============================================

-- Misafir PNR sorgusu (SECURITY DEFINER — RLS bypass)
CREATE OR REPLACE FUNCTION get_reservation_by_pnr(p_pnr TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
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
    'flight_date', r.flight_date,
    'flight_time', r.flight_time,
    'flight_number', r.flight_number,
    'created_at', r.created_at,
    'passengers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'tc_no', p.tc_no,
        'birth_date', p.birth_date,
        'gender', p.gender,
        'seat_number', p.seat_number,
        'passenger_type', p.passenger_type
      )), '[]'::jsonb)
      FROM passengers p WHERE p.reservation_id = r.id
    ),
    'flight', (
      SELECT jsonb_build_object(
        'flight_number', f.flight_number,
        'from_city', f.from_city,
        'to_city', f.to_city,
        'from_code', f.from_code,
        'to_code', f.to_code,
        'departure_time', f.departure_time,
        'arrival_time', f.arrival_time,
        'duration', f.duration,
        'flight_date', f.flight_date,
        'status', f.status,
        'gate', f.gate,
        'terminal', f.terminal
      )
      FROM flights f WHERE f.id = r.flight_id
    )
  )
  INTO v_result
  FROM reservations r
  WHERE r.pnr = UPPER(p_pnr);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Koltuk sayısı artırma (kapasite kontrolü ile)
CREATE OR REPLACE FUNCTION increment_booked_seats(p_flight_id INT, p_count INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_updated INT;
BEGIN
  UPDATE flights
  SET booked_seats = booked_seats + p_count
  WHERE id = p_flight_id
    AND booked_seats + p_count <= capacity;
  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Haftalık uçuş üretici
CREATE OR REPLACE FUNCTION generate_weekly_flights(start_date DATE, num_weeks INT DEFAULT 4)
RETURNS void AS $$
DECLARE
  current_date_iter DATE;
  current_dow INT;
  sched RECORD;
BEGIN
  FOR i IN 0..(num_weeks * 7 - 1) LOOP
    current_date_iter := start_date + i;
    current_dow := EXTRACT(ISODOW FROM current_date_iter);

    FOR sched IN
      SELECT fs.*, a.capacity AS aircraft_capacity
      FROM flight_schedule fs
      JOIN aircraft a ON a.id = fs.aircraft_id
      WHERE fs.is_active = true AND fs.day_of_week = current_dow
    LOOP
      INSERT INTO flights (
        flight_number, schedule_id, aircraft_id, flight_date,
        from_code, from_city, to_code, to_city,
        departure_time, arrival_time, duration,
        flight_class, price, baggage, meal, changeable,
        status, gate, terminal, estimated_departure, estimated_arrival,
        capacity
      ) VALUES (
        sched.flight_code, sched.id, sched.aircraft_id, current_date_iter,
        sched.from_code, sched.from_city, sched.to_code, sched.to_city,
        sched.departure_time, sched.arrival_time, sched.duration,
        sched.flight_class, sched.price, sched.baggage, sched.meal, sched.changeable,
        'zamaninda',
        CASE (sched.id % 6)
          WHEN 0 THEN 'A3' WHEN 1 THEN 'A12' WHEN 2 THEN 'B8'
          WHEN 3 THEN 'C5' WHEN 4 THEN 'D14' WHEN 5 THEN 'B3'
        END,
        CASE WHEN sched.flight_class = 'vip' THEN 'VIP' ELSE '1' END,
        sched.departure_time,
        sched.arrival_time,
        sched.aircraft_capacity
      ) ON CONFLICT (flight_number, flight_date) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Admin fiyat güncelleme
CREATE OR REPLACE FUNCTION update_flight_price(p_flight_code TEXT, p_new_price DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE flight_schedule SET price = p_new_price WHERE flight_code = p_flight_code;
  UPDATE flights SET price = p_new_price
  WHERE flight_number = p_flight_code AND flight_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA
-- =============================================

-- Filo (4 araç)
INSERT INTO aircraft (id, registration, model, capacity, aircraft_type) VALUES
(1, 'TC-BEY01', 'Boeing 737-800',         180, 'normal'),
(2, 'TC-BEY02', 'Boeing 737-800',         180, 'normal'),
(3, 'TC-BEY03', 'Boeing 737-800',         180, 'normal'),
(4, 'TC-BEY04', 'Bombardier Global 7500',  24, 'vip')
ON CONFLICT (registration) DO NOTHING;

-- Haftalık Uçuş Programı (8 slot)
INSERT INTO flight_schedule (flight_code, aircraft_id, from_code, from_city, to_code, to_city, day_of_week, departure_time, arrival_time, duration, flight_class, price, baggage, meal, changeable) VALUES
('BEY101', 1, 'IST', 'İstanbul', 'DXB', 'Dubai',    1, '09:00', '13:30', '4s 30dk', 'normal', 3499, true, true, true),
('BEY102', 1, 'DXB', 'Dubai',    'IST', 'İstanbul', 3, '09:00', '13:30', '4s 30dk', 'normal', 3499, true, true, true),
('BEY103', 2, 'ESB', 'Ankara',   'DXB', 'Dubai',    2, '08:00', '12:45', '4s 45dk', 'normal', 3699, true, true, true),
('BEY104', 2, 'DXB', 'Dubai',    'ESB', 'Ankara',   4, '09:00', '13:45', '4s 45dk', 'normal', 3699, true, true, true),
('BEY105', 3, 'ADB', 'İzmir',    'DXB', 'Dubai',    5, '10:00', '14:40', '4s 40dk', 'normal', 3599, true, true, true),
('BEY106', 3, 'DXB', 'Dubai',    'ADB', 'İzmir',    7, '10:00', '14:40', '4s 40dk', 'normal', 3599, true, true, true),
('BEY201', 4, 'IST', 'İstanbul', 'DXB', 'Dubai',    1, '14:00', '18:30', '4s 30dk', 'vip',    7999, true, true, true),
('BEY202', 4, 'DXB', 'Dubai',    'IST', 'İstanbul', 3, '14:00', '18:30', '4s 30dk', 'vip',    7999, true, true, true)
ON CONFLICT (flight_code) DO NOTHING;

-- 4 haftalık uçuş üret
SELECT generate_weekly_flights(CURRENT_DATE, 4);

-- Destinasyonlar
INSERT INTO destinations (city, country, image, hero_image, price, description, weather, highlights, gallery, popular_flights) VALUES
('Dubai', 'Birleşik Arap Emirlikleri', '/images/destinations/dubai.webp', '/images/destinations/dubai-hero.webp', 3299,
 'Dünyanın en yüksek binası Burj Khalifa, lüks alışveriş merkezleri, altın pazarları ve çöl safarileri ile Dubai, modern lüksün ve geleneksel Arap kültürünün buluştuğu büyüleyici bir şehir.',
 '{"temp": "35°C", "condition": "Güneşli", "humidity": "40%"}',
 '[{"icon": "ri-building-4-line", "title": "Burj Khalifa", "description": "828 metre yüksekliğiyle dünyanın en yüksek binası"}, {"icon": "ri-shopping-bag-line", "title": "Dubai Mall", "description": "1.200''den fazla mağaza ile dünyanın en büyük AVM''si"}, {"icon": "ri-sun-line", "title": "Çöl Safarisi", "description": "Unutulmaz bir çöl macerası deneyimi"}, {"icon": "ri-ship-line", "title": "Palm Jumeirah", "description": "Yapay ada üzerinde lüks tatil deneyimi"}]',
 '["/images/destinations/dubai-gallery-1.webp", "/images/destinations/dubai-gallery-2.webp", "/images/destinations/dubai-gallery-3.webp", "/images/destinations/dubai-gallery-4.webp"]',
 '[{"from": "İstanbul", "duration": "4s 30dk", "date": "Pazartesi", "price": "3.499"}, {"from": "Ankara", "duration": "4s 45dk", "date": "Salı", "price": "3.699"}, {"from": "İzmir", "duration": "4s 40dk", "date": "Cuma", "price": "3.599"}]'
),
('İstanbul', 'Türkiye', '/images/destinations/istanbul.webp', '/images/destinations/istanbul-hero.webp', 3499,
 'İki kıtayı birleştiren eşsiz konumuyla İstanbul, tarihi yarımadası, Boğaz manzarası ve zengin mutfak kültürüyle dünyada eşi benzeri olmayan bir metropol.',
 '{"temp": "18°C", "condition": "Parçalı Bulutlu", "humidity": "65%"}',
 '[{"icon": "ri-ancient-gate-line", "title": "Ayasofya", "description": "1.500 yıllık tarihi ile mimarlık harikası"}, {"icon": "ri-store-line", "title": "Kapalıçarşı", "description": "Dünyanın en eski ve büyük kapalı çarşısı"}, {"icon": "ri-ship-line", "title": "Boğaz Turu", "description": "İstanbul Boğazı''nda unutulmaz bir tekne turu"}, {"icon": "ri-restaurant-line", "title": "Türk Mutfağı", "description": "Dünyaca ünlü lezzetlerin başkenti"}]',
 '["/images/destinations/istanbul-gallery-1.webp", "/images/destinations/istanbul-gallery-2.webp", "/images/destinations/istanbul-gallery-3.webp", "/images/destinations/istanbul-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 30dk", "date": "Çarşamba", "price": "3.499"}]'
),
('Ankara', 'Türkiye', '/images/destinations/ankara.webp', '/images/destinations/ankara-hero.webp', 3699,
 'Türkiye Cumhuriyeti''nin başkenti Ankara, Anıtkabir, tarihi kalesi ve modern şehir yaşamıyla öne çıkan kültür ve siyaset merkezi.',
 '{"temp": "15°C", "condition": "Açık", "humidity": "45%"}',
 '[{"icon": "ri-government-line", "title": "Anıtkabir", "description": "Atatürk''ün anıt mezarı ve müzesi"}, {"icon": "ri-ancient-gate-line", "title": "Ankara Kalesi", "description": "Şehrin tarihi kalbi ve panoramik manzarası"}, {"icon": "ri-gallery-line", "title": "Müzeler", "description": "Anadolu Medeniyetleri ve daha fazlası"}, {"icon": "ri-leaf-line", "title": "Gençlik Parkı", "description": "Şehrin merkezinde yeşil vaha"}]',
 '["/images/destinations/ankara-gallery-1.webp", "/images/destinations/ankara-gallery-2.webp", "/images/destinations/ankara-gallery-3.webp", "/images/destinations/ankara-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 45dk", "date": "Perşembe", "price": "3.699"}]'
),
('İzmir', 'Türkiye', '/images/destinations/izmir.webp', '/images/destinations/izmir-hero.webp', 3599,
 'Ege''nin incisi İzmir, antik Efes harabeleri, Kordon boyundaki cafe''leri ve muhteşem sahilleriyle Türkiye''nin en yaşanılabilir şehri.',
 '{"temp": "22°C", "condition": "Güneşli", "humidity": "55%"}',
 '[{"icon": "ri-ancient-gate-line", "title": "Efes Antik Kenti", "description": "UNESCO Dünya Mirası listesindeki antik şehir"}, {"icon": "ri-walk-line", "title": "Kordon", "description": "Deniz kenarında yürüyüş ve cafe keyfi"}, {"icon": "ri-time-line", "title": "Saat Kulesi", "description": "İzmir''in simgesi Konak Meydanı"}, {"icon": "ri-sun-line", "title": "Çeşme", "description": "Turkuaz suları ve beyaz kumlu plajları"}]',
 '["/images/destinations/izmir-gallery-1.webp", "/images/destinations/izmir-gallery-2.webp", "/images/destinations/izmir-gallery-3.webp", "/images/destinations/izmir-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 40dk", "date": "Pazar", "price": "3.599"}]'
);

-- Kampanyalar
INSERT INTO campaigns (title, description, long_description, badge, type, image, benefits, terms, routes) VALUES
('Dubai Uçuş Ağı', 'Türkiye''nin 3 büyük şehrinden Dubai''ye direkt uçuşlar', 'İstanbul, Ankara ve İzmir''den Dubai''ye her hafta direkt uçuş imkanı. Normal ve VIP sınıf seçenekleriyle konforlu seyahat deneyimi.', 'Yeni', 'featured', '/images/campaigns/dubai-network.webp',
 '["İstanbul, Ankara, İzmir''den direkt uçuşlar", "Normal ve VIP sınıf seçenekleri", "Haftalık düzenli seferler", "Online check-in kolaylığı"]',
 '["Kampanya tüm rotalarda geçerlidir", "Koltuk müsaitliğine bağlıdır"]',
 '["İstanbul ↔ Dubai", "Ankara ↔ Dubai", "İzmir ↔ Dubai"]'
),
('VIP Deneyimi', 'Lüks seyahatin keyfini çıkarın', 'VIP sınıfımızla üst düzey konfor ve ayrıcalıklı hizmetlerden yararlanın. Geniş koltuklar, özel yemek menüsü ve öncelikli biniş avantajı.', 'Premium', 'vip', '/images/campaigns/vip.webp',
 '["Geniş ve konforlu koltuklar", "Özel gurme menü", "Öncelikli biniş ve bagaj", "Lounge erişimi"]',
 '["VIP sınıf biletlerde geçerlidir", "Lounge erişimi havalimanına göre değişebilir"]',
 '["Tüm Dubai rotaları"]'
),
('Erken Rezervasyon', '30 gün önceden rezervasyonda %15 indirim', '30 gün veya daha erken rezervasyon yaparak tüm uçuşlarımızda %15 indirim kazanın. Erken planlamanın avantajını yaşayın.', '%15', 'featured', '/images/campaigns/early-booking.webp',
 '["Tüm rotalarda geçerli %15 indirim", "Ücretsiz iptal hakkı", "Esnek tarih değişikliği", "Ek bagaj hediyesi"]',
 '["Uçuş tarihinden en az 30 gün önce rezervasyon yapılmalıdır", "Diğer kampanyalarla birleştirilemez", "Koltuk müsaitliğine bağlıdır"]',
 '["İstanbul → Dubai", "Ankara → Dubai", "İzmir → Dubai", "Dubai → İstanbul", "Dubai → Ankara", "Dubai → İzmir"]'
);

-- Örnek Mesajlar
INSERT INTO messages (sender_name, email, phone, subject, message, category, status) VALUES
('Ahmet Yılmaz', 'ahmet@email.com', '+90 532 123 4567', 'Bagaj Sorunu', 'Merhaba, son uçuşumda bagajım hasar gördü. Yardım bekliyorum.', 'sikayet', 'unread'),
('Fatma Kaya', 'fatma@email.com', '+90 533 987 6543', 'Tarih Değişikliği', 'Uçuşumu 1 hafta ileri almak istiyorum. Ücret farkı var mı?', 'degisiklik', 'read'),
('Mehmet Demir', 'mehmet@email.com', '+90 534 555 4444', 'VIP Hakkında', 'VIP sınıfta hangi hizmetler sunuluyor? Detay alabilir miyim?', 'bilgi', 'replied');
