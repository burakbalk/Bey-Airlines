-- =============================================
-- Bey Airlines — Supabase Migration
-- Tüm tablolar + RLS + Trigger + Seed Data
-- =============================================

-- 1. PROFILES (auth.users'a ek bilgi)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  birth_date DATE,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Yeni kullanıcı kayıt olunca otomatik profil oluştur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'user'  -- GÜVENLİK: Her zaman 'user' — admin atama sadece DB üzerinden yapılmalı
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. AIRCRAFT (Filo yönetimi)
CREATE TABLE IF NOT EXISTS aircraft (
  id SERIAL PRIMARY KEY,
  registration VARCHAR(20) UNIQUE NOT NULL,   -- TC-BEY01, TC-BEY02...
  model VARCHAR(100) NOT NULL,                -- Boeing 737-800, Bombardier Global 7500
  capacity INT NOT NULL,                      -- 180, 24
  aircraft_type VARCHAR(10) NOT NULL CHECK (aircraft_type IN ('normal', 'vip')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. FLIGHT SCHEDULE (Haftalık program — filo + gün bazlı)
CREATE TABLE IF NOT EXISTS flight_schedule (
  id SERIAL PRIMARY KEY,
  flight_code VARCHAR(10) UNIQUE NOT NULL,    -- BEY101, BEY201... sabit uçuş kodu
  aircraft_id INT REFERENCES aircraft(id),
  from_code VARCHAR(3) NOT NULL,
  from_city VARCHAR(50) NOT NULL,
  to_code VARCHAR(3) NOT NULL,
  to_city VARCHAR(50) NOT NULL,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Pazartesi, 7=Pazar
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
CREATE TABLE IF NOT EXISTS flights (
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

-- 4. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pnr VARCHAR(10) UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  flight_id INT REFERENCES flights(id),
  flight_number VARCHAR(10),
  route TEXT,
  flight_date DATE,
  flight_time TIME,
  status VARCHAR(20) DEFAULT 'Onaylandı',
  total_price DECIMAL(10,2),
  flight_class VARCHAR(10),
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  baggage_info TEXT,
  extra_services JSONB DEFAULT '{}',
  payment_method VARCHAR(30),
  payment_card_last4 VARCHAR(4),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PASSENGERS
CREATE TABLE IF NOT EXISTS passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  tc_no VARCHAR(11),
  birth_date DATE,
  gender VARCHAR(10),
  seat_number VARCHAR(5),
  passenger_type VARCHAR(20) DEFAULT 'Yetişkin',
  checked_in BOOLEAN DEFAULT false
);

-- 6. SAVED PASSENGERS
CREATE TABLE IF NOT EXISTS saved_passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  tc_no VARCHAR(11),
  birth_date DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  UNIQUE(user_id, tc_no)
);

-- 7. MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  subject VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(30) DEFAULT 'genel',
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. CAMPAIGNS
CREATE TABLE IF NOT EXISTS campaigns (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  description TEXT,
  long_description TEXT,
  badge VARCHAR(50),
  type VARCHAR(20) DEFAULT 'featured',
  image VARCHAR(500),
  benefits JSONB DEFAULT '[]',
  terms JSONB DEFAULT '[]',
  routes JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. DESTINATIONS
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(100) NOT NULL,
  slug VARCHAR(200) UNIQUE,
  country VARCHAR(100) NOT NULL,
  image VARCHAR(500),
  hero_image VARCHAR(500),
  price DECIMAL(10,2),
  description TEXT,
  weather JSONB DEFAULT '{}',
  highlights JSONB DEFAULT '[]',
  gallery JSONB DEFAULT '[]',
  popular_flights JSONB DEFAULT '[]'
);

-- 10. FAQ
CREATE TABLE IF NOT EXISTS faq (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
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

-- Helper: Admin mi kontrol et
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (is_admin());

-- GÜVENLİK: Kullanıcının kendi rolünü değiştirmesini engelle
CREATE OR REPLACE FUNCTION prevent_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role != OLD.role AND NOT is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS prevent_role_change_trigger ON profiles;
CREATE TRIGGER prevent_role_change_trigger
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_change();

-- AIRCRAFT (herkes okuyabilir, admin yazabilir)
CREATE POLICY "Anyone can read aircraft" ON aircraft FOR SELECT USING (true);
CREATE POLICY "Admins can manage aircraft" ON aircraft FOR ALL USING (is_admin());

-- FLIGHT_SCHEDULE (herkes okuyabilir, admin yazabilir)
CREATE POLICY "Anyone can read flight_schedule" ON flight_schedule FOR SELECT USING (true);
CREATE POLICY "Admins can manage flight_schedule" ON flight_schedule FOR ALL USING (is_admin());

-- FLIGHTS (herkes okuyabilir, admin yazabilir)
CREATE POLICY "Anyone can read flights" ON flights FOR SELECT USING (true);
CREATE POLICY "Admins can manage flights" ON flights FOR ALL USING (is_admin());

-- RESERVATIONS
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage all reservations" ON reservations FOR ALL USING (is_admin());
CREATE POLICY "Anon can create reservations" ON reservations FOR INSERT WITH CHECK (user_id IS NULL);
CREATE POLICY "Users can cancel own reservations" ON reservations FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (status = 'İptal Edildi');

-- PASSENGERS
CREATE POLICY "Users can view own passengers" ON passengers FOR SELECT
  USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can create passengers" ON passengers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid()));
CREATE POLICY "Anon can create passengers" ON passengers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.user_id IS NULL));
CREATE POLICY "Admins can manage passengers" ON passengers FOR ALL USING (is_admin());

-- SAVED_PASSENGERS
CREATE POLICY "Users can manage own saved_passengers" ON saved_passengers FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view saved_passengers" ON saved_passengers FOR SELECT USING (is_admin());

-- MESSAGES (herkes yazabilir, admin okuyabilir)
CREATE POLICY "Anyone can create messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage messages" ON messages FOR ALL USING (is_admin());

-- CAMPAIGNS (herkes okuyabilir, admin yazabilir)
CREATE POLICY "Anyone can read campaigns" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Admins can manage campaigns" ON campaigns FOR ALL USING (is_admin());

-- DESTINATIONS (herkes okuyabilir, admin yazabilir)
CREATE POLICY "Anyone can read destinations" ON destinations FOR SELECT USING (true);
CREATE POLICY "Admins can manage destinations" ON destinations FOR ALL USING (is_admin());

-- FAQ (herkes okuyabilir, admin yazabilir)
CREATE POLICY "Anyone can read faq" ON faq FOR SELECT USING (true);
CREATE POLICY "Admins can manage faq" ON faq FOR ALL USING (is_admin());

-- =============================================
-- YARDIMCI FONKSİYONLAR

-- PNR ile rezervasyon sorgulama (misafir + giriş yapmış kullanıcılar)
-- SECURITY DEFINER: RLS'i bypass ederek sadece verilen PNR'a ait veriyi döndürür.
-- Brute-force riski düşüktür (BEY + 6 karakter ≈ 2.1 milyar kombinasyon).
-- Passengers ve flight bilgilerini de içerir — tek sorgu yeterlidir.
CREATE OR REPLACE FUNCTION get_reservation_by_pnr(p_pnr TEXT)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'id', r.id,
    'pnr', r.pnr,
    'user_id', r.user_id,
    'flight_id', r.flight_id,
    'flight_number', r.flight_number,
    'route', r.route,
    'flight_date', r.flight_date,
    'flight_time', r.flight_time,
    'status', r.status,
    'total_price', r.total_price,
    'flight_class', r.flight_class,
    'contact_email', r.contact_email,
    'contact_phone', r.contact_phone,
    'extra_services', r.extra_services,
    'created_at', r.created_at,
    'passengers', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', p.id,
        'first_name', p.first_name,
        'last_name', p.last_name,
        'seat_number', p.seat_number,
        'passenger_type', p.passenger_type,
        'checked_in', p.checked_in
      )), '[]'::jsonb)
      FROM public.passengers p
      WHERE p.reservation_id = r.id
    ),
    'flights', (
      SELECT jsonb_build_object(
        'from_city', f.from_city,
        'to_city', f.to_city,
        'from_code', f.from_code,
        'to_code', f.to_code,
        'departure_time', f.departure_time,
        'arrival_time', f.arrival_time,
        'duration', f.duration,
        'gate', f.gate,
        'terminal', f.terminal
      )
      FROM public.flights f
      WHERE f.id = r.flight_id
    )
  )
  INTO v_result
  FROM public.reservations r
  WHERE r.pnr = UPPER(p_pnr);

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- HAFTALIK UÇUŞ ÜRETİCİ FONKSİYON
-- Gün bazlı üretim: her schedule sadece kendi gününde uçuş oluşturur
-- flight_number = flight_code (BEY101, BEY201...) — her hafta aynı kod
-- capacity = aircraft.capacity — uçağa göre otomatik
-- =============================================

CREATE OR REPLACE FUNCTION generate_weekly_flights(start_date DATE, num_weeks INT DEFAULT 4)
RETURNS void AS $$
DECLARE
  current_date_iter DATE;
  current_dow INT;  -- 1=Pazartesi, 7=Pazar (ISO)
  sched RECORD;
  ac_capacity INT;
BEGIN
  FOR i IN 0..(num_weeks * 7 - 1) LOOP
    current_date_iter := start_date + i;
    -- PostgreSQL ISODOW: 1=Pazartesi, 7=Pazar
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ADMİN FİYAT GÜNCELLEME FONKSİYONU
-- Schedule fiyatını ve gelecek uçuşların fiyatını günceller
CREATE OR REPLACE FUNCTION update_flight_price(p_flight_code TEXT, p_new_price DECIMAL)
RETURNS void AS $$
BEGIN
  -- Schedule tablosundaki baz fiyatı güncelle
  UPDATE flight_schedule SET price = p_new_price WHERE flight_code = p_flight_code;
  -- Gelecek tarihli uçuşların fiyatını güncelle (rezervasyonlu olanlar dahil — bilet fiyatı sabit kalır)
  UPDATE flights SET price = p_new_price
  WHERE flight_number = p_flight_code AND flight_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA
-- =============================================

-- FİLO (4 araç: 3 normal + 1 VIP jet)
INSERT INTO aircraft (id, registration, model, capacity, aircraft_type) VALUES
(1, 'TC-BEY01', 'Boeing 737-800',         180, 'normal'),
(2, 'TC-BEY02', 'Boeing 737-800',         180, 'normal'),
(3, 'TC-BEY03', 'Boeing 737-800',         180, 'normal'),
(4, 'TC-BEY04', 'Bombardier Global 7500',  24, 'vip')
ON CONFLICT (registration) DO NOTHING;

-- Haftalık Uçuş Programı (8 slot — filo bazlı, çakışma yok)
-- Normal uçuşlar (3 uçak rotasyonu):
--   Uçak-1 (TC-BEY01): Pzt IST→DXB, Çar DXB→IST
--   Uçak-2 (TC-BEY02): Sal ANK→DXB, Per DXB→ANK
--   Uçak-3 (TC-BEY03): Cum IZM→DXB, Paz DXB→IZM
-- VIP jet (TC-BEY04): Pzt IST→DXB VIP, Çar DXB→IST VIP
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

-- Bugünden 4 hafta ileri uçuş üret
SELECT generate_weekly_flights(CURRENT_DATE, 4);

-- Destinations
INSERT INTO destinations (city, slug, country, image, hero_image, price, description, weather, highlights, gallery, popular_flights) VALUES
('Dubai', 'dubai', 'Birleşik Arap Emirlikleri', '/images/destinations/dubai.webp', '/images/destinations/dubai-hero.webp', 3299,
 'Dünyanın en yüksek binası Burj Khalifa, lüks alışveriş merkezleri, altın pazarları ve çöl safarileri ile Dubai, modern lüksün ve geleneksel Arap kültürünün buluştuğu büyüleyici bir şehir.',
 '{"temp": "35°C", "condition": "Güneşli", "humidity": "40%"}',
 '[{"icon": "ri-building-4-line", "title": "Burj Khalifa", "description": "828 metre yüksekliğiyle dünyanın en yüksek binası"}, {"icon": "ri-shopping-bag-line", "title": "Dubai Mall", "description": "1.200''den fazla mağaza ile dünyanın en büyük AVM''si"}, {"icon": "ri-sun-line", "title": "Çöl Safarisi", "description": "Unutulmaz bir çöl macerası deneyimi"}, {"icon": "ri-ship-line", "title": "Palm Jumeirah", "description": "Yapay ada üzerinde lüks tatil deneyimi"}]',
 '["/images/destinations/dubai-gallery-1.webp", "/images/destinations/dubai-gallery-2.webp", "/images/destinations/dubai-gallery-3.webp", "/images/destinations/dubai-gallery-4.webp"]',
 '[{"from": "İstanbul", "duration": "4s 30dk", "date": "Her gün", "price": "3.299"}, {"from": "Ankara", "duration": "4s 45dk", "date": "Her gün", "price": "3.699"}, {"from": "İzmir", "duration": "4s 40dk", "date": "Her gün", "price": "3.599"}]'
),
('İstanbul', 'istanbul', 'Türkiye', '/images/destinations/istanbul.webp', '/images/destinations/istanbul-hero.webp', 3499,
 'İki kıtayı birleştiren eşsiz konumuyla İstanbul, tarihi yarımadası, Boğaz manzarası ve zengin mutfak kültürüyle dünyada eşi benzeri olmayan bir metropol.',
 '{"temp": "18°C", "condition": "Parçalı Bulutlu", "humidity": "65%"}',
 '[{"icon": "ri-ancient-gate-line", "title": "Ayasofya", "description": "1.500 yıllık tarihi ile mimarlık harikası"}, {"icon": "ri-store-line", "title": "Kapalıçarşı", "description": "Dünyanın en eski ve büyük kapalı çarşısı"}, {"icon": "ri-ship-line", "title": "Boğaz Turu", "description": "İstanbul Boğazı''nda unutulmaz bir tekne turu"}, {"icon": "ri-restaurant-line", "title": "Türk Mutfağı", "description": "Dünyaca ünlü lezzetlerin başkenti"}]',
 '["/images/destinations/istanbul-gallery-1.webp", "/images/destinations/istanbul-gallery-2.webp", "/images/destinations/istanbul-gallery-3.webp", "/images/destinations/istanbul-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 30dk", "date": "Her gün", "price": "3.499"}]'
),
('Ankara', 'ankara', 'Türkiye', '/images/destinations/ankara.webp', '/images/destinations/ankara-hero.webp', 3699,
 'Türkiye Cumhuriyeti''nin başkenti Ankara, Anıtkabir, tarihi kalesi ve modern şehir yaşamıyla öne çıkan kültür ve siyaset merkezi.',
 '{"temp": "15°C", "condition": "Açık", "humidity": "45%"}',
 '[{"icon": "ri-government-line", "title": "Anıtkabir", "description": "Atatürk''ün anıt mezarı ve müzesi"}, {"icon": "ri-ancient-gate-line", "title": "Ankara Kalesi", "description": "Şehrin tarihi kalbi ve panoramik manzarası"}, {"icon": "ri-gallery-line", "title": "Müzeler", "description": "Anadolu Medeniyetleri ve daha fazlası"}, {"icon": "ri-leaf-line", "title": "Gençlik Parkı", "description": "Şehrin merkezinde yeşil vaha"}]',
 '["/images/destinations/ankara-gallery-1.webp", "/images/destinations/ankara-gallery-2.webp", "/images/destinations/ankara-gallery-3.webp", "/images/destinations/ankara-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 45dk", "date": "Her gün", "price": "3.699"}]'
),
('İzmir', 'izmir', 'Türkiye', '/images/destinations/izmir.webp', '/images/destinations/izmir-hero.webp', 3599,
 'Ege''nin incisi İzmir, antik Efes harabeleri, Kordon boyundaki cafe''leri ve muhteşem sahilleriyle Türkiye''nin en yaşanılabilir şehri.',
 '{"temp": "22°C", "condition": "Güneşli", "humidity": "55%"}',
 '[{"icon": "ri-ancient-gate-line", "title": "Efes Antik Kenti", "description": "UNESCO Dünya Mirası listesindeki antik şehir"}, {"icon": "ri-walk-line", "title": "Kordon", "description": "Deniz kenarında yürüyüş ve cafe keyfi"}, {"icon": "ri-time-line", "title": "Saat Kulesi", "description": "İzmir''in simgesi Konak Meydanı"}, {"icon": "ri-sun-line", "title": "Çeşme", "description": "Turkuaz suları ve beyaz kumlu plajları"}]',
 '["/images/destinations/izmir-gallery-1.webp", "/images/destinations/izmir-gallery-2.webp", "/images/destinations/izmir-gallery-3.webp", "/images/destinations/izmir-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 40dk", "date": "Her gün", "price": "3.599"}]'
);

-- Campaigns
INSERT INTO campaigns (title, slug, description, long_description, badge, type, image, benefits, terms, routes) VALUES
('Dubai Uçuş Ağı', 'dubai-ucus-agi', 'Türkiye''nin 3 büyük şehrinden Dubai''ye direkt uçuşlar', 'İstanbul, Ankara ve İzmir''den Dubai''ye her gün direkt uçuş imkanı. Normal ve VIP sınıf seçenekleriyle konforlu seyahat deneyimi.', 'Yeni', 'featured', '/images/campaigns/dubai-network.webp',
 '["İstanbul, Ankara, İzmir''den direkt uçuşlar", "Normal ve VIP sınıf seçenekleri", "Günlük düzenli seferler", "Online check-in kolaylığı"]',
 '["Kampanya tüm rotalarda geçerlidir", "Koltuk müsaitliğine bağlıdır"]',
 '["İstanbul ↔ Dubai", "Ankara ↔ Dubai", "İzmir ↔ Dubai"]'
),
('VIP Deneyimi', 'vip-deneyimi', 'Lüks seyahatin keyfini çıkarın', 'VIP sınıfımızla üst düzey konfor ve ayrıcalıklı hizmetlerden yararlanın. Geniş koltuklar, özel yemek menüsü ve öncelikli biniş avantajı.', 'Premium', 'vip', '/images/campaigns/vip.webp',
 '["Geniş ve konforlu koltuklar", "Özel gurme menü", "Öncelikli biniş ve bagaj", "Lounge erişimi"]',
 '["VIP sınıf biletlerde geçerlidir", "Lounge erişimi havalimanına göre değişebilir"]',
 '["Tüm Dubai rotaları"]'
),
('Erken Rezervasyon', 'erken-rezervasyon', '30 gün önceden rezervasyonda %15 indirim', '30 gün veya daha erken rezervasyon yaparak tüm uçuşlarımızda %15 indirim kazanın. Erken planlamanın avantajını yaşayın.', '%15', 'featured', '/images/campaigns/early-booking.webp',
 '["Tüm rotalarda geçerli %15 indirim", "Ücretsiz iptal hakkı", "Esnek tarih değişikliği", "Ek bagaj hediyesi"]',
 '["Uçuş tarihinden en az 30 gün önce rezervasyon yapılmalıdır", "Diğer kampanyalarla birleştirilemez", "Koltuk müsaitliğine bağlıdır"]',
 '["İstanbul → Dubai", "Ankara → Dubai", "İzmir → Dubai", "Dubai → İstanbul", "Dubai → Ankara", "Dubai → İzmir"]'
);

-- Galeri görsel path düzeltmesi (dosyalar gallery- prefix ile kaydedildi)
UPDATE destinations SET gallery = '["/images/destinations/dubai-gallery-1.webp", "/images/destinations/dubai-gallery-2.webp", "/images/destinations/dubai-gallery-3.webp", "/images/destinations/dubai-gallery-4.webp"]'
WHERE city = 'Dubai';
UPDATE destinations SET gallery = '["/images/destinations/istanbul-gallery-1.webp", "/images/destinations/istanbul-gallery-2.webp", "/images/destinations/istanbul-gallery-3.webp", "/images/destinations/istanbul-gallery-4.webp"]'
WHERE city = 'İstanbul';
UPDATE destinations SET gallery = '["/images/destinations/ankara-gallery-1.webp", "/images/destinations/ankara-gallery-2.webp", "/images/destinations/ankara-gallery-3.webp", "/images/destinations/ankara-gallery-4.webp"]'
WHERE city = 'Ankara';
UPDATE destinations SET gallery = '["/images/destinations/izmir-gallery-1.webp", "/images/destinations/izmir-gallery-2.webp", "/images/destinations/izmir-gallery-3.webp", "/images/destinations/izmir-gallery-4.webp"]'
WHERE city = 'İzmir';

-- Örnek Mesajlar
INSERT INTO messages (sender_name, email, phone, subject, message, category, status) VALUES
('Ahmet Yılmaz', 'ahmet@email.com', '+90 532 123 4567', 'Bagaj Sorunu', 'Merhaba, son uçuşumda bagajım hasar gördü. Yardım bekliyorum.', 'sikayet', 'unread'),
('Fatma Kaya', 'fatma@email.com', '+90 533 987 6543', 'Tarih Değişikliği', 'Uçuşumu 1 hafta ileri almak istiyorum. Ücret farkı var mı?', 'degisiklik', 'read'),
('Mehmet Demir', 'mehmet@email.com', '+90 534 555 4444', 'VIP Hakkında', 'VIP sınıfta hangi hizmetler sunuluyor? Detay alabilir miyim?', 'bilgi', 'replied');

-- =============================================
-- Admin rol kontrolü — RLS bypass
-- SECURITY DEFINER: signInWithPassword hemen sonrasında bile JWT
-- propagation race condition olmadan güvenli şekilde role döndürür.
-- Dönüş: 'admin' | 'user' | NULL (profil yoksa)
-- =============================================
CREATE OR REPLACE FUNCTION check_admin_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- GÜVENLİK: Sadece kendi rolünü sorgulayabilir
  IF p_user_id != auth.uid() THEN
    RETURN NULL;
  END IF;
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- Seed data init — RLS bypass
-- SECURITY DEFINER: anonim kullanıcılar için tablolar boşsa seed data ekler.
-- destinations ve faq INSERT RLS'ini bypass eder (sadece boşsa ekler).
-- =============================================
CREATE OR REPLACE FUNCTION seed_initial_data(
  p_destinations JSONB DEFAULT NULL,
  p_faq          JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  dest_count INT;
  faq_count  INT;
  result     JSONB := '{}';
BEGIN
  -- DESTINATIONS
  SELECT COUNT(*) INTO dest_count FROM public.destinations;
  IF dest_count = 0 AND p_destinations IS NOT NULL THEN
    INSERT INTO public.destinations
      (city, country, image, hero_image, price, description,
       weather, highlights, gallery, popular_flights)
    SELECT
      d->>'city',
      d->>'country',
      d->>'image',
      d->>'hero_image',
      (d->>'price')::DECIMAL,
      d->>'description',
      d->'weather',
      d->'highlights',
      d->'gallery',
      d->'popular_flights'
    FROM jsonb_array_elements(p_destinations) AS d;
    result := result || '{"destinations_inserted": true}';
  ELSE
    result := result || '{"destinations_inserted": false}';
  END IF;

  -- FAQ
  SELECT COUNT(*) INTO faq_count FROM public.faq;
  IF faq_count = 0 AND p_faq IS NOT NULL THEN
    INSERT INTO public.faq (category, question, answer, sort_order)
    SELECT
      d->>'category',
      d->>'question',
      d->>'answer',
      (d->>'sort_order')::INT
    FROM jsonb_array_elements(p_faq) AS d;
    result := result || '{"faq_inserted": true}';
  ELSE
    result := result || '{"faq_inserted": false}';
  END IF;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

