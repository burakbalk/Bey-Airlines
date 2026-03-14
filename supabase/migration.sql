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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
  aircraft_type VARCHAR(10) NOT NULL CHECK (aircraft_type IN ('premium', 'vip')),
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
  flight_class VARCHAR(10) NOT NULL CHECK (flight_class IN ('premium', 'vip')),
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
  -- Çift rezervasyon koruması: rezervasyon akışı başlangıcında üretilen UUID token.
  -- Frontend INSERT öncesi token üretir; aynı token ile ikinci INSERT unique violation
  -- fırlatır — network retry'ları duplicate reservation oluşturmaz.
  booking_token UUID UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. PASSENGERS
CREATE TABLE IF NOT EXISTS passengers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  -- Koltuk çakışması kontrolü için denormalize flight_id.
  -- reservations.flight_id ile senkronize tutulur — INSERT sırasında set edilmeli.
  -- Partial unique index idx_unique_seat_per_flight bu kolona dayanır.
  flight_id INT REFERENCES flights(id),
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  tc_no VARCHAR(11),
  birth_date DATE,
  gender VARCHAR(10),
  seat_number VARCHAR(5),
  passenger_type VARCHAR(20) DEFAULT 'Yetişkin',
  checked_in BOOLEAN DEFAULT false
);

-- Koltuk çakışması engelleyici partial unique index.
-- Aynı uçuşta (flight_id) aynı koltuk numarası (seat_number) birden fazla
-- yolcuya atanamaz. '-' ve NULL değerler koltuk seçilmemiş anlamına gelir,
-- bunlar constraint dışında tutulur.
-- İptal edilen rezervasyonlar: ilgili passenger satırları ON DELETE CASCADE ile
-- silinir, bu sayede iptal sonrası koltuk otomatik serbest kalır.
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_seat_per_flight
  ON public.passengers (flight_id, seat_number)
  WHERE seat_number IS NOT NULL AND seat_number != '-';

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
$$ LANGUAGE sql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
-- İptal politikası: Kullanıcı sadece kendi rezervasyonunu güncelleyebilir.
-- WITH CHECK: Yalnızca status='İptal Edildi' yazılabilir — başka alan değişikliğine izin yok.
-- NOT: Güvenli iptal için cancel_reservation_by_pnr() fonksiyonu kullanılmalıdır.
-- Bu policy doğrudan UPDATE isteği gelirse son savunma hattıdır.
CREATE POLICY "Users can cancel own reservations" ON reservations FOR UPDATE
  USING (auth.uid() = user_id AND status NOT IN ('İptal Edildi', 'Tamamlandı'))
  WITH CHECK (status = 'İptal Edildi');

-- PASSENGERS
CREATE POLICY "Users can view own passengers" ON passengers FOR SELECT
  USING (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid()));
CREATE POLICY "Users can create passengers" ON passengers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.user_id = auth.uid()));
CREATE POLICY "Anon can create passengers" ON passengers FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM reservations r WHERE r.id = reservation_id AND r.user_id IS NULL));
-- Kullanıcı sadece kendi rezervasyonuna ait yolcuyu güncelleyebilir (check-in için)
-- Rezervasyon iptal/tamamlanmış değilse güncellemeye izin ver
CREATE POLICY "Users can update own passengers" ON passengers FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.id = reservation_id
      AND r.user_id = auth.uid()
      AND r.status NOT IN ('İptal Edildi', 'Tamamlandı')
  ));
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
--
-- Soyad doğrulaması (p_last_name):
--   NULL → soyad kontrolü yapılmaz (reservation-confirmation, flight-status gibi
--           PNR'ı zaten bilen sayfalar için geriye dönük uyumlu davranış).
--   Dolu → passengers tablosundan en az bir yolcunun soyadı eşleşmeli;
--           eşleşmezse NULL döner — client "rezervasyon bulunamadı" gösterir.
--   Güvenlik notu: p_last_name dolu geldiğinde kaba kuvvet PNR taraması
--   soyad faktörüyle ek bir engele çarpar. Yine de Supabase Edge'de rate
--   limiting (dakikada max 10 RPC/IP) yapılandırılması şiddetle tavsiye edilir.
--
-- Passengers ve flight bilgilerini de içerir — tek sorgu yeterlidir.
CREATE OR REPLACE FUNCTION get_reservation_by_pnr(
  p_pnr       TEXT,
  p_last_name TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_reservation_id UUID;
  v_result         JSONB;
BEGIN
  -- 1. PNR'ı bul
  SELECT id INTO v_reservation_id
  FROM public.reservations
  WHERE pnr = UPPER(TRIM(p_pnr));

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- 2. Soyad doğrulaması (isteğe bağlı)
  IF p_last_name IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.passengers
      WHERE reservation_id = v_reservation_id
        AND LOWER(last_name) = LOWER(TRIM(p_last_name))
    ) THEN
      RETURN NULL;  -- Soyad eşleşmedi — veri döndürme
    END IF;
  END IF;

  -- 3. Tam veriyi oluştur
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
  WHERE r.id = v_reservation_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- ATOMİK REZERVASYON OLUŞTURMA
-- Tek transaction içinde: kapasite kontrolü → reservations INSERT →
-- passengers INSERT → booked_seats artırma.
-- Herhangi bir adımda hata → tüm işlem otomatik ROLLBACK (plpgsql exception).
--
-- Parametreler:
--   p_flight_id      INT            — flights.id
--   p_pnr            TEXT           — ön-üretilmiş PNR (frontend generatePNR())
--   p_user_id        UUID           — auth.uid() veya NULL (misafir)
--   p_flight_number  TEXT           — görüntüleme için (ör. BEY101)
--   p_route          TEXT           — görüntüleme için (ör. İstanbul → Dubai)
--   p_flight_date    DATE
--   p_flight_time    TIME
--   p_flight_class   TEXT
--   p_total_price    DECIMAL        — frontend'in hesapladığı fiyat
--   p_contact_email  TEXT
--   p_contact_phone  TEXT
--   p_extra_services JSONB          — ek hizmetler (bagaj, yemek vb.)
--   p_payment_method TEXT
--   p_payment_card_last4 TEXT
--   p_booking_token  UUID           — idempotency token; aynı token ile ikinci
--                                    çağrı unique violation → duplicate engellenir
--   p_passengers     JSONB          — yolcu array'i, her eleman:
--                                    { first_name, last_name, tc_no, birth_date,
--                                      gender, seat_number, passenger_type }
--
-- Dönüş: JSONB { success: bool, pnr: text | null, error: text | null }
--
-- Güvenlik notları:
--   - Fiyat doğrulaması: p_total_price flights.price × yolcu sayısından
--     %20'den fazla sapıyorsa reddedilir (fiyat manipülasyon koruması).
--   - Kapasite kontrolü: booked_seats + yolcu sayısı > capacity ise reddedilir.
--   - booking_token UNIQUE constraint sayesinde idempotent — ağ tekrarı güvenli.
-- =============================================
CREATE OR REPLACE FUNCTION create_reservation(
  p_flight_id          INT,
  p_pnr                TEXT,
  p_user_id            UUID,
  p_flight_number      TEXT,
  p_route              TEXT,
  p_flight_date        DATE,
  p_flight_time        TIME,
  p_flight_class       TEXT,
  p_total_price        DECIMAL,
  p_contact_email      TEXT,
  p_contact_phone      TEXT,
  p_extra_services     JSONB    DEFAULT '{}',
  p_payment_method     TEXT    DEFAULT NULL,
  p_payment_card_last4 TEXT    DEFAULT NULL,
  p_booking_token      UUID    DEFAULT NULL,
  p_passengers         JSONB   DEFAULT '[]'
)
RETURNS JSONB AS $$
DECLARE
  v_flight         RECORD;
  v_reservation_id UUID;
  v_passenger      JSONB;
  v_passenger_count INT;
  v_expected_price  DECIMAL;
BEGIN
  -- 1. Uçuşu kilitle (FOR UPDATE — eşzamanlı rezervasyonlarda race condition engelle)
  SELECT id, price, capacity, booked_seats, flight_class
  INTO v_flight
  FROM public.flights
  WHERE id = p_flight_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'pnr', NULL, 'error', 'Uçuş bulunamadı');
  END IF;

  -- 2. Yolcu sayısı
  v_passenger_count := jsonb_array_length(p_passengers);
  IF v_passenger_count = 0 THEN
    RETURN jsonb_build_object('success', false, 'pnr', NULL, 'error', 'En az bir yolcu gereklidir');
  END IF;

  -- 3. Kapasite kontrolü
  IF v_flight.booked_seats + v_passenger_count > v_flight.capacity THEN
    RETURN jsonb_build_object('success', false, 'pnr', NULL, 'error', 'Yeterli koltuk kapasitesi yok');
  END IF;

  -- 4. Fiyat doğrulaması — frontend fiyatı DB fiyatından %20'den fazla düşükse reddet
  --    (fiyat manipülasyon koruması; %20 tolerans kampanya/indirim için bırakılmış)
  v_expected_price := v_flight.price * v_passenger_count;
  IF p_total_price < v_expected_price * 0.80 THEN
    RETURN jsonb_build_object('success', false, 'pnr', NULL,
      'error', 'Geçersiz fiyat: Beklenen minimum ' || (v_expected_price * 0.80)::TEXT);
  END IF;

  -- 5. Rezervasyon oluştur
  INSERT INTO public.reservations (
    pnr, user_id, flight_id, flight_number, route,
    flight_date, flight_time, status, total_price, flight_class,
    contact_email, contact_phone, extra_services,
    payment_method, payment_card_last4, booking_token
  ) VALUES (
    UPPER(TRIM(p_pnr)), p_user_id, p_flight_id, p_flight_number, p_route,
    p_flight_date, p_flight_time, 'Onaylandı', p_total_price, p_flight_class,
    p_contact_email, p_contact_phone, p_extra_services,
    p_payment_method, p_payment_card_last4, p_booking_token
  )
  RETURNING id INTO v_reservation_id;

  -- 6. Yolcuları ekle
  FOR v_passenger IN SELECT * FROM jsonb_array_elements(p_passengers)
  LOOP
    INSERT INTO public.passengers (
      reservation_id, flight_id,
      first_name, last_name, tc_no, birth_date,
      gender, seat_number, passenger_type
    ) VALUES (
      v_reservation_id, p_flight_id,
      v_passenger->>'first_name',
      v_passenger->>'last_name',
      v_passenger->>'tc_no',
      NULLIF(v_passenger->>'birth_date', '')::DATE,
      v_passenger->>'gender',
      NULLIF(v_passenger->>'seat_number', ''),
      COALESCE(NULLIF(v_passenger->>'passenger_type', ''), 'Yetişkin')
    );
    -- NOT: seat_number çakışması burada idx_unique_seat_per_flight tarafından
    -- yakalanır ve exception fırlatır → tüm transaction ROLLBACK olur.
  END LOOP;

  -- 7. Koltuk sayacını artır
  UPDATE public.flights
  SET booked_seats = booked_seats + v_passenger_count
  WHERE id = p_flight_id;

  RETURN jsonb_build_object('success', true, 'pnr', UPPER(TRIM(p_pnr)), 'error', NULL);

EXCEPTION
  WHEN unique_violation THEN
    -- booking_token veya seat çakışması
    RETURN jsonb_build_object('success', false, 'pnr', NULL,
      'error', 'Bu rezervasyon zaten oluşturulmuş veya seçilen koltuk alındı');
  WHEN OTHERS THEN
    RETURN jsonb_build_object('success', false, 'pnr', NULL,
      'error', SQLERRM);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- HAFTALIK UÇUŞ ÜRETİCİ FONKSİYON
-- Gün bazlı üretim: her schedule sadece kendi gününde uçuş oluşturur
-- flight_number = flight_code (BEY101, BEY201...) — her hafta aynı kod
-- capacity = aircraft.capacity — uçağa göre otomatik
-- GÜVENLİK: Sadece admin çağırabilir. Cron Edge Function service_role ile çağırır.
-- =============================================

CREATE OR REPLACE FUNCTION generate_weekly_flights(start_date DATE, num_weeks INT DEFAULT 4)
RETURNS void AS $$
DECLARE
  current_date_iter DATE;
  current_dow INT;  -- 1=Pazartesi, 7=Pazar (ISO)
  sched RECORD;
  next_seq INT;
  new_flight_number VARCHAR(20);
BEGIN
  -- GÜVENLİK: Sadece admin veya service_role çağırabilir
  IF auth.uid() IS NOT NULL AND NOT is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz erişim: generate_weekly_flights sadece admin tarafından çağrılabilir';
  END IF;

  FOR i IN 0..(num_weeks * 7 - 1) LOOP
    current_date_iter := start_date + i;
    current_dow := EXTRACT(ISODOW FROM current_date_iter);

    FOR sched IN
      SELECT fs.*, a.capacity AS aircraft_capacity
      FROM flight_schedule fs
      JOIN aircraft a ON a.id = fs.aircraft_id
      WHERE fs.is_active = true AND fs.day_of_week = current_dow
    LOOP
      -- Bu tarihte aynı schedule'dan uçuş var mı kontrol et
      IF EXISTS (
        SELECT 1 FROM flights
        WHERE schedule_id = sched.id AND flight_date = current_date_iter
      ) THEN
        CONTINUE;
      END IF;

      -- BEY101-N formatında sıradaki numarayı bul
      SELECT COALESCE(MAX(
        (regexp_match(flight_number, '^' || sched.flight_code || '-(\d+)$'))[1]::int
      ), 0) + 1 INTO next_seq
      FROM flights
      WHERE flight_number ~ ('^' || sched.flight_code || '-\d+$');

      new_flight_number := sched.flight_code || '-' || next_seq;

      INSERT INTO flights (
        flight_number, schedule_id, aircraft_id, flight_date,
        from_code, from_city, to_code, to_city,
        departure_time, arrival_time, duration,
        flight_class, price, baggage, meal, changeable,
        status, gate, terminal, estimated_departure, estimated_arrival,
        capacity
      ) VALUES (
        new_flight_number, sched.id, sched.aircraft_id, current_date_iter,
        sched.from_code, sched.from_city, sched.to_code, sched.to_city,
        sched.departure_time, sched.arrival_time, sched.duration,
        sched.flight_class, sched.price, sched.baggage, sched.meal, sched.changeable,
        'zamaninda',
        CASE (sched.id % 6)
          WHEN 0 THEN 'A3' WHEN 1 THEN 'A12' WHEN 2 THEN 'B8'
          WHEN 3 THEN 'C5' WHEN 4 THEN 'D14' WHEN 5 THEN 'B3'
        END,
        CASE WHEN sched.flight_class = 'vip' THEN 'VIP' ELSE 'T1' END,
        sched.departure_time,
        sched.arrival_time,
        sched.aircraft_capacity
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ADMİN FİYAT GÜNCELLEME FONKSİYONU
-- Schedule fiyatını ve gelecek uçuşların fiyatını günceller
-- GÜVENLİK: Sadece admin çağırabilir.
CREATE OR REPLACE FUNCTION update_flight_price(p_flight_code TEXT, p_new_price DECIMAL)
RETURNS void AS $$
BEGIN
  -- GÜVENLİK: Sadece admin çağırabilir
  IF NOT is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz erişim: update_flight_price sadece admin tarafından çağrılabilir';
  END IF;
  -- Negatif fiyat engelle
  IF p_new_price <= 0 THEN
    RAISE EXCEPTION 'Geçersiz fiyat: Fiyat sıfırdan büyük olmalıdır';
  END IF;
  -- Schedule tablosundaki baz fiyatı güncelle
  UPDATE flight_schedule SET price = p_new_price WHERE flight_code = p_flight_code;
  -- Gelecek tarihli uçuşların fiyatını güncelle (rezervasyonlu olanlar dahil — bilet fiyatı sabit kalır)
  UPDATE flights SET price = p_new_price
  WHERE flight_number LIKE p_flight_code || '-%' AND flight_date >= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- SEED DATA
-- =============================================

-- FİLO (4 araç: 3 premium + 1 VIP jet)
INSERT INTO aircraft (id, registration, model, capacity, aircraft_type) VALUES
(1, 'TC-BEY01', 'Boeing 737-800',         180, 'premium'),
(2, 'TC-BEY02', 'Boeing 737-800',         180, 'premium'),
(3, 'TC-BEY03', 'Boeing 737-800',         180, 'premium'),
(4, 'TC-BEY04', 'Bombardier Global 7500',  24, 'vip')
ON CONFLICT (registration) DO NOTHING;

-- Haftalık Uçuş Programı (8 slot — filo bazlı, çakışma yok)
-- Premium uçuşlar (3 uçak rotasyonu):
--   Uçak-1 (TC-BEY01): Pzt IST→DXB, Çar DXB→IST
--   Uçak-2 (TC-BEY02): Sal ANK→DXB, Per DXB→ANK
--   Uçak-3 (TC-BEY03): Cum IZM→DXB, Paz DXB→IZM
-- VIP jet (TC-BEY04): Pzt IST→DXB VIP, Çar DXB→IST VIP
INSERT INTO flight_schedule (flight_code, aircraft_id, from_code, from_city, to_code, to_city, day_of_week, departure_time, arrival_time, duration, flight_class, price, baggage, meal, changeable) VALUES
('BEY101', 1, 'IST', 'İstanbul', 'DXB', 'Dubai',    1, '09:00', '13:30', '4s 30dk', 'premium', 3499, true, true, true),
('BEY102', 1, 'DXB', 'Dubai',    'IST', 'İstanbul', 3, '09:00', '13:30', '4s 30dk', 'premium', 3499, true, true, true),
('BEY103', 2, 'ESB', 'Ankara',   'DXB', 'Dubai',    2, '08:00', '12:45', '4s 45dk', 'premium', 3699, true, true, true),
('BEY104', 2, 'DXB', 'Dubai',    'ESB', 'Ankara',   4, '09:00', '13:45', '4s 45dk', 'premium', 3699, true, true, true),
('BEY105', 3, 'ADB', 'İzmir',    'DXB', 'Dubai',    5, '10:00', '14:40', '4s 40dk', 'premium', 3599, true, true, true),
('BEY106', 3, 'DXB', 'Dubai',    'ADB', 'İzmir',    7, '10:00', '14:40', '4s 40dk', 'premium', 3599, true, true, true),
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
('Dubai Uçuş Ağı', 'dubai-ucus-agi', 'Türkiye''nin 3 büyük şehrinden Dubai''ye direkt uçuşlar', 'İstanbul, Ankara ve İzmir''den Dubai''ye her gün direkt uçuş imkanı. Premium ve VIP sınıf seçenekleriyle konforlu seyahat deneyimi.', 'Yeni', 'featured', '/images/campaigns/dubai-network.webp',
 '["İstanbul, Ankara, İzmir''den direkt uçuşlar", "Premium ve VIP sınıf seçenekleri", "Günlük düzenli seferler", "Online check-in kolaylığı"]',
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- Seed data init — RLS bypass
-- SECURITY DEFINER: Sadece admin çağırabilir.
-- destinations ve faq INSERT RLS'ini bypass eder (sadece boşsa ekler).
-- GÜVENLİK: Anonim kullanıcılar bu fonksiyonu çağıramaz.
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
  -- GÜVENLİK: Sadece admin çağırabilir (service_role hariç — auth.uid() NULL ise izin ver)
  IF auth.uid() IS NOT NULL AND NOT is_admin() THEN
    RAISE EXCEPTION 'Yetkisiz erişim: seed_initial_data sadece admin tarafından çağrılabilir';
  END IF;

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =============================================
-- TOPLAM GELİR HESABI
-- Client-side reduce yerine tek aggregate sorgu ile hesaplanır.
-- SECURITY DEFINER: reservations tablosunu RLS bypass ile okur.
-- GÜVENLİK: Admin kontrolü çağıran tarafta (useAdminStats) yapılır.
-- =============================================
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_price), 0) FROM reservations;
$$;

GRANT EXECUTE ON FUNCTION get_total_revenue() TO authenticated;
GRANT EXECUTE ON FUNCTION get_total_revenue() TO anon;
GRANT EXECUTE ON FUNCTION generate_weekly_flights(DATE, INT) TO anon;
GRANT EXECUTE ON FUNCTION generate_weekly_flights(DATE, INT) TO authenticated;

-- =============================================
-- GÜVENLİ REZERVASYON İPTAL FONKSİYONU
-- Üç katmanlı doğrulama: PNR + yolcu soyadı + user_id (veya misafir)
-- SECURITY DEFINER: RLS'i bypass eder — doğrulama bu fonksiyon içinde yapılır.
-- İş kuralları:
--   1. PNR mevcut olmalı ve 'İptal Edildi' / 'Tamamlandı' statüsünde olmamalı
--   2. Yolcu soyadı passengers tablosunda eşleşmeli (case-insensitive)
--   3. Giriş yapmış kullanıcı: rezervasyon kendisine ait olmalı
--      Misafir kullanıcı: rezervasyonun user_id'si NULL olmalı
--   4. Uçuş 2 saat veya daha az kalmışsa iptal edilemez
-- Dönüş: JSONB { success: bool, message: text }
-- =============================================
CREATE OR REPLACE FUNCTION cancel_reservation_by_pnr(
  p_pnr       TEXT,
  p_last_name TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_reservation RECORD;
  v_passenger   RECORD;
  v_departure   TIMESTAMPTZ;
BEGIN
  -- 1. PNR'ı bul
  SELECT r.id, r.user_id, r.status, r.flight_id, r.flight_date, r.flight_time
  INTO v_reservation
  FROM public.reservations r
  WHERE r.pnr = UPPER(TRIM(p_pnr));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Rezervasyon bulunamadı');
  END IF;

  -- 2. Statü kontrolü
  IF v_reservation.status IN ('İptal Edildi', 'Tamamlandı') THEN
    RETURN jsonb_build_object('success', false, 'message', 'Bu rezervasyon zaten iptal edilmiş veya tamamlanmış');
  END IF;

  -- 3. Kullanıcı yetkisi kontrolü
  IF auth.uid() IS NOT NULL THEN
    -- Giriş yapmış kullanıcı: kendi rezervasyonu olmalı
    IF v_reservation.user_id IS DISTINCT FROM auth.uid() THEN
      RETURN jsonb_build_object('success', false, 'message', 'Bu rezervasyonu iptal etme yetkiniz yok');
    END IF;
  ELSE
    -- Misafir: rezervasyonun user_id'si NULL olmalı
    IF v_reservation.user_id IS NOT NULL THEN
      RETURN jsonb_build_object('success', false, 'message', 'Giriş yapmanız gerekmektedir');
    END IF;
  END IF;

  -- 4. Yolcu soyadı doğrulaması (case-insensitive, Türkçe karakter toleranslı)
  SELECT p.id INTO v_passenger
  FROM public.passengers p
  WHERE p.reservation_id = v_reservation.id
    AND LOWER(p.last_name) = LOWER(TRIM(p_last_name))
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'message', 'Soyad doğrulaması başarısız');
  END IF;

  -- 5. Uçuş zamanı kontrolü — 2 saatten az kaldıysa iptal edilemez
  IF v_reservation.flight_date IS NOT NULL AND v_reservation.flight_time IS NOT NULL THEN
    v_departure := (v_reservation.flight_date::TEXT || ' ' || v_reservation.flight_time::TEXT)::TIMESTAMPTZ;
    IF v_departure - now() < INTERVAL '2 hours' THEN
      RETURN jsonb_build_object('success', false, 'message', 'Uçuşa 2 saatten az kaldığında rezervasyon iptal edilemez');
    END IF;
  END IF;

  -- 6. İptal işlemi
  UPDATE public.reservations
  SET status = 'İptal Edildi'
  WHERE id = v_reservation.id;

  RETURN jsonb_build_object('success', true, 'message', 'Rezervasyon başarıyla iptal edildi');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

