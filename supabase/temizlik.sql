-- =============================================
-- TEMİZLİK + DÜZELTMELER
-- Supabase SQL Editor'de çalıştır
-- =============================================

-- 1. Duplike destinations temizle (her city'den sadece 1 tane kalacak)
DELETE FROM destinations a
USING destinations b
WHERE a.ctid > b.ctid
AND a.city = b.city;

-- 2. city'ye UNIQUE constraint ekle (bir daha duplike olmasın)
ALTER TABLE destinations ADD CONSTRAINT destinations_city_unique UNIQUE (city);

-- 3. check_admin_role RPC (eğer yoksa oluştur)
CREATE OR REPLACE FUNCTION check_admin_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  RETURN COALESCE(v_role, 'user');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Doğrulama: kaç kayıt kaldı?
SELECT 'destinations' as tablo, count(*) FROM destinations
UNION ALL
SELECT 'campaigns', count(*) FROM campaigns
UNION ALL
SELECT 'profiles', count(*) FROM profiles;
