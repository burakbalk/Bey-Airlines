-- Gelir hesabı için server-side SUM aggregate RPC fonksiyonu
-- Tüm rezervasyonların total_price toplamını döner
-- Client-side reduce yerine tek bir aggregate sorgu ile hesaplanır
CREATE OR REPLACE FUNCTION get_total_revenue()
RETURNS NUMERIC
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(total_price), 0) FROM reservations;
$$;

-- Sadece authenticated kullanıcılar çağırabilir (admin kontrolü useAdminStats içinde yapılır)
GRANT EXECUTE ON FUNCTION get_total_revenue() TO authenticated;
