-- Tablo veri sayılarını kontrol et
-- Supabase SQL Editor'de çalıştır

SELECT 'destinations' as tablo, count(*) FROM destinations
UNION ALL
SELECT 'campaigns', count(*) FROM campaigns
UNION ALL
SELECT 'flights', count(*) FROM flights
UNION ALL
SELECT 'flight_schedule', count(*) FROM flight_schedule
UNION ALL
SELECT 'aircraft', count(*) FROM aircraft
UNION ALL
SELECT 'messages', count(*) FROM messages
UNION ALL
SELECT 'profiles', count(*) FROM profiles
UNION ALL
SELECT 'faq', count(*) FROM faq;
