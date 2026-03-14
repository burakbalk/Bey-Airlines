-- profiles tablosuna admin_settings JSONB kolonu ekle
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_settings JSONB DEFAULT NULL;

-- RLS: Sadece admin kendi admin_settings'ini güncelleyebilir
-- Mevcut "Users can update own profile" policy'si zaten yeterli (id = auth.uid())
-- Ek olarak: admin_settings kolonunu sadece adminler görebilsin
CREATE POLICY IF NOT EXISTS "Admins can update admin_settings" ON profiles
  FOR UPDATE USING (auth.uid() = id AND is_admin())
  WITH CHECK (auth.uid() = id AND is_admin());
