-- =============================================
-- Mevcut verilere slug ekleme
-- Türkçe karakter dönüşümü: ğ→g, ü→u, ş→s, ı→i, ö→o, ç→c
-- Boşluklar tire (-), küçük harf
-- =============================================

-- Önce slug sütunlarını ekle (eğer yoksa)
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE;
ALTER TABLE destinations ADD COLUMN IF NOT EXISTS slug VARCHAR(200) UNIQUE;

-- =============================================
-- DESTINATIONS — city'den slug üret
-- =============================================
UPDATE destinations SET slug = 'dubai' WHERE city = 'Dubai';
UPDATE destinations SET slug = 'istanbul' WHERE city = 'İstanbul';
UPDATE destinations SET slug = 'ankara' WHERE city = 'Ankara';
UPDATE destinations SET slug = 'izmir' WHERE city = 'İzmir';

-- =============================================
-- CAMPAIGNS — title'dan slug üret
-- =============================================
UPDATE campaigns SET slug = 'dubai-ucus-agi' WHERE title = 'Dubai Uçuş Ağı';
UPDATE campaigns SET slug = 'vip-deneyimi' WHERE title = 'VIP Deneyimi';
UPDATE campaigns SET slug = 'erken-rezervasyon' WHERE title = 'Erken Rezervasyon';

-- =============================================
-- Gelecekte eklenecek veriler için genel slug üretici fonksiyon
-- Türkçe karakterleri ASCII'ye dönüştürür, boşlukları tire yapar
-- =============================================
CREATE OR REPLACE FUNCTION generate_slug(input TEXT)
RETURNS TEXT AS $$
DECLARE
  result TEXT;
BEGIN
  result := LOWER(TRIM(input));
  -- Türkçe karakter dönüşümleri
  result := REPLACE(result, 'ğ', 'g');
  result := REPLACE(result, 'ü', 'u');
  result := REPLACE(result, 'ş', 's');
  result := REPLACE(result, 'ı', 'i');
  result := REPLACE(result, 'ö', 'o');
  result := REPLACE(result, 'ç', 'c');
  result := REPLACE(result, 'Ğ', 'g');
  result := REPLACE(result, 'Ü', 'u');
  result := REPLACE(result, 'Ş', 's');
  result := REPLACE(result, 'İ', 'i');
  result := REPLACE(result, 'Ö', 'o');
  result := REPLACE(result, 'Ç', 'c');
  -- Boşlukları tire yap
  result := REGEXP_REPLACE(result, '\s+', '-', 'g');
  -- Sadece alfanumerik ve tire bırak
  result := REGEXP_REPLACE(result, '[^a-z0-9-]', '', 'g');
  -- Ardışık tireleri tek tire yap
  result := REGEXP_REPLACE(result, '-+', '-', 'g');
  -- Baştaki ve sondaki tireleri temizle
  result := TRIM(BOTH '-' FROM result);
  RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
