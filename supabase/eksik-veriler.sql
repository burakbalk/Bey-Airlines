-- =============================================
-- EKSİK VERİLER — Supabase SQL Editor'de çalıştır
-- check_admin_role RPC + destinations + faq seed data
-- =============================================

-- 0. ADMIN LOGIN İÇİN RPC (SECURITY DEFINER — RLS bypass)
CREATE OR REPLACE FUNCTION check_admin_role(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.profiles WHERE id = p_user_id;
  RETURN v_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. DESTINATIONS (4 şehir)
INSERT INTO destinations (city, country, image, hero_image, price, description, weather, highlights, gallery, popular_flights) VALUES
('Dubai', 'Birleşik Arap Emirlikleri', '/images/destinations/dubai.webp', '/images/destinations/dubai-hero.webp', 3299,
 'Dünyanın en yüksek binası Burj Khalifa, lüks alışveriş merkezleri, altın pazarları ve çöl safarileri ile Dubai, modern lüksün ve geleneksel Arap kültürünün buluştuğu büyüleyici bir şehir.',
 '{"temp": "35°C", "condition": "Güneşli", "humidity": "40%"}',
 '[{"icon": "ri-building-4-line", "title": "Burj Khalifa", "description": "828 metre yüksekliğiyle dünyanın en yüksek binası"}, {"icon": "ri-shopping-bag-line", "title": "Dubai Mall", "description": "1.200''den fazla mağaza ile dünyanın en büyük AVM''si"}, {"icon": "ri-sun-line", "title": "Çöl Safarisi", "description": "Unutulmaz bir çöl macerası deneyimi"}, {"icon": "ri-ship-line", "title": "Palm Jumeirah", "description": "Yapay ada üzerinde lüks tatil deneyimi"}]',
 '["/images/destinations/dubai-gallery-1.webp", "/images/destinations/dubai-gallery-2.webp", "/images/destinations/dubai-gallery-3.webp", "/images/destinations/dubai-gallery-4.webp"]',
 '[{"from": "İstanbul", "duration": "4s 30dk", "date": "Her gün", "price": "3.299"}, {"from": "Ankara", "duration": "4s 45dk", "date": "Her gün", "price": "3.699"}, {"from": "İzmir", "duration": "4s 40dk", "date": "Her gün", "price": "3.599"}]'
),
('İstanbul', 'Türkiye', '/images/destinations/istanbul.webp', '/images/destinations/istanbul-hero.webp', 3499,
 'İki kıtayı birleştiren eşsiz konumuyla İstanbul, tarihi yarımadası, Boğaz manzarası ve zengin mutfak kültürüyle dünyada eşi benzeri olmayan bir metropol.',
 '{"temp": "18°C", "condition": "Parçalı Bulutlu", "humidity": "65%"}',
 '[{"icon": "ri-ancient-gate-line", "title": "Ayasofya", "description": "1.500 yıllık tarihi ile mimarlık harikası"}, {"icon": "ri-store-line", "title": "Kapalıçarşı", "description": "Dünyanın en eski ve büyük kapalı çarşısı"}, {"icon": "ri-ship-line", "title": "Boğaz Turu", "description": "İstanbul Boğazı''nda unutulmaz bir tekne turu"}, {"icon": "ri-restaurant-line", "title": "Türk Mutfağı", "description": "Dünyaca ünlü lezzetlerin başkenti"}]',
 '["/images/destinations/istanbul-gallery-1.webp", "/images/destinations/istanbul-gallery-2.webp", "/images/destinations/istanbul-gallery-3.webp", "/images/destinations/istanbul-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 30dk", "date": "Her gün", "price": "3.499"}]'
),
('Ankara', 'Türkiye', '/images/destinations/ankara.webp', '/images/destinations/ankara-hero.webp', 3699,
 'Türkiye Cumhuriyeti''nin başkenti Ankara, Anıtkabir, tarihi kalesi ve modern şehir yaşamıyla öne çıkan kültür ve siyaset merkezi.',
 '{"temp": "15°C", "condition": "Açık", "humidity": "45%"}',
 '[{"icon": "ri-government-line", "title": "Anıtkabir", "description": "Atatürk''ün anıt mezarı ve müzesi"}, {"icon": "ri-ancient-gate-line", "title": "Ankara Kalesi", "description": "Şehrin tarihi kalbi ve panoramik manzarası"}, {"icon": "ri-gallery-line", "title": "Müzeler", "description": "Anadolu Medeniyetleri ve daha fazlası"}, {"icon": "ri-leaf-line", "title": "Gençlik Parkı", "description": "Şehrin merkezinde yeşil vaha"}]',
 '["/images/destinations/ankara-gallery-1.webp", "/images/destinations/ankara-gallery-2.webp", "/images/destinations/ankara-gallery-3.webp", "/images/destinations/ankara-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 45dk", "date": "Her gün", "price": "3.699"}]'
),
('İzmir', 'Türkiye', '/images/destinations/izmir.webp', '/images/destinations/izmir-hero.webp', 3599,
 'Ege''nin incisi İzmir, antik Efes harabeleri, Kordon boyundaki cafe''leri ve muhteşem sahilleriyle Türkiye''nin en yaşanılabilir şehri.',
 '{"temp": "22°C", "condition": "Güneşli", "humidity": "55%"}',
 '[{"icon": "ri-ancient-gate-line", "title": "Efes Antik Kenti", "description": "UNESCO Dünya Mirası listesindeki antik şehir"}, {"icon": "ri-walk-line", "title": "Kordon", "description": "Deniz kenarında yürüyüş ve cafe keyfi"}, {"icon": "ri-time-line", "title": "Saat Kulesi", "description": "İzmir''in simgesi Konak Meydanı"}, {"icon": "ri-sun-line", "title": "Çeşme", "description": "Turkuaz suları ve beyaz kumlu plajları"}]',
 '["/images/destinations/izmir-gallery-1.webp", "/images/destinations/izmir-gallery-2.webp", "/images/destinations/izmir-gallery-3.webp", "/images/destinations/izmir-gallery-4.webp"]',
 '[{"from": "Dubai", "duration": "4s 40dk", "date": "Her gün", "price": "3.599"}]'
)
ON CONFLICT DO NOTHING;


-- 2. FAQ (Sıkça Sorulan Sorular)
INSERT INTO faq (category, question, answer, sort_order) VALUES
('Rezervasyon', 'Nasıl bilet satın alabilirim?', 'Web sitemiz üzerinden uçuş arayarak, uygun uçuşu seçip yolcu bilgilerini girdikten sonra ödeme yaparak biletinizi satın alabilirsiniz.', 1),
('Rezervasyon', 'Rezervasyonumu nasıl iptal edebilirim?', 'Hesabım sayfasından veya Rezervasyon Yönetimi bölümünden PNR kodunuz ile rezervasyonunuzu görüntüleyip iptal edebilirsiniz.', 2),
('Rezervasyon', 'PNR kodum nedir ve nasıl bulabilirim?', 'PNR (Passenger Name Record) kodunuz, rezervasyon onay sayfasında ve e-posta ile gönderilen onay mesajında yer alır. Bu kod ile tüm işlemlerinizi takip edebilirsiniz.', 3),
('Bagaj', 'Ücretsiz bagaj hakkım ne kadar?', 'Normal sınıf yolcularımız 20 kg, VIP sınıf yolcularımız 30 kg ücretsiz bagaj hakkına sahiptir. El bagajı tüm yolcularımız için 8 kg''dır.', 4),
('Bagaj', 'Ekstra bagaj ücreti ne kadar?', 'Ek bagaj ücretleri kiloya göre değişmektedir. Rezervasyon sırasında veya sonrasında ekstra bagaj ekleyebilirsiniz. Detaylı fiyat bilgisi için bizimle iletişime geçin.', 5),
('Check-in', 'Online check-in ne zaman açılır?', 'Online check-in, uçuşunuzdan 24 saat önce açılır ve kalkıştan 2 saat öncesine kadar yapılabilir.', 6),
('Check-in', 'Online check-in nasıl yapılır?', 'Web sitemizdeki Check-in sayfasından PNR kodunuz ve soyadınız ile giriş yaparak online check-in işleminizi tamamlayabilirsiniz.', 7),
('Uçuş', 'Uçuş durumumu nasıl öğrenebilirim?', 'Web sitemizdeki Uçuş Durumu sayfasından uçuş numaranız ile güncel uçuş durumunuzu takip edebilirsiniz.', 8),
('Uçuş', 'Hangi şehirlere uçuyorsunuz?', 'Bey Airlines olarak İstanbul, Ankara ve İzmir''den Dubai''ye direkt uçuşlar gerçekleştirmekteyiz. VIP jet hizmetimiz İstanbul-Dubai arasında sunulmaktadır.', 9),
('Genel', 'VIP sınıf avantajları nelerdir?', 'VIP sınıfta geniş ve konforlu koltuklar, özel gurme menü, öncelikli biniş ve bagaj, lounge erişimi gibi ayrıcalıklı hizmetlerden yararlanabilirsiniz.', 10),
('Genel', 'İletişim bilgileriniz nelerdir?', 'Bize web sitemizdeki iletişim formu üzerinden, sosyal medya hesaplarımızdan veya müşteri hizmetleri hattımızdan ulaşabilirsiniz.', 11),
('Genel', 'Çocuklar için özel bir ücret var mı?', '2 yaş altı bebekler ücretsiz seyahat eder (koltuk tahsisi yapılmaz). 2-12 yaş arası çocuklar için indirimli tarife uygulanmaktadır.', 12);
