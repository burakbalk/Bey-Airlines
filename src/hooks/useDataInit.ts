import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

const DESTINATIONS = [
  {
    city: 'Dubai',
    country: 'Birleşik Arap Emirlikleri',
    image: '/images/destinations/dubai.webp',
    hero_image: '/images/destinations/dubai-hero.webp',
    price: 3299,
    description:
      'Dünyanın en yüksek binası Burj Khalifa, lüks alışveriş merkezleri, altın pazarları ve çöl safarileri ile Dubai, modern lüksün ve geleneksel Arap kültürünün buluştuğu büyüleyici bir şehir.',
    weather: { temp: '35°C', condition: 'Güneşli', humidity: '40%' },
    highlights: [
      { icon: 'ri-building-4-line', title: 'Burj Khalifa', description: "828 metre yüksekliğiyle dünyanın en yüksek binası" },
      { icon: 'ri-shopping-bag-line', title: 'Dubai Mall', description: "1.200'den fazla mağaza ile dünyanın en büyük AVM'si" },
      { icon: 'ri-sun-line', title: 'Çöl Safarisi', description: 'Unutulmaz bir çöl macerası deneyimi' },
      { icon: 'ri-ship-line', title: 'Palm Jumeirah', description: 'Yapay ada üzerinde lüks tatil deneyimi' },
    ],
    gallery: [
      '/images/destinations/dubai-gallery-1.webp',
      '/images/destinations/dubai-gallery-2.webp',
      '/images/destinations/dubai-gallery-3.webp',
      '/images/destinations/dubai-gallery-4.webp',
    ],
    popular_flights: [
      { from: 'İstanbul', duration: '4s 30dk', date: 'Her gün', price: '3.299' },
      { from: 'Ankara', duration: '4s 45dk', date: 'Her gün', price: '3.699' },
      { from: 'İzmir', duration: '4s 40dk', date: 'Her gün', price: '3.599' },
    ],
  },
  {
    city: 'İstanbul',
    country: 'Türkiye',
    image: '/images/destinations/istanbul.webp',
    hero_image: '/images/destinations/istanbul-hero.webp',
    price: 3499,
    description:
      'İki kıtayı birleştiren eşsiz konumuyla İstanbul, tarihi yarımadası, Boğaz manzarası ve zengin mutfak kültürüyle dünyada eşi benzeri olmayan bir metropol.',
    weather: { temp: '18°C', condition: 'Parçalı Bulutlu', humidity: '65%' },
    highlights: [
      { icon: 'ri-ancient-gate-line', title: 'Ayasofya', description: '1.500 yıllık tarihi ile mimarlık harikası' },
      { icon: 'ri-store-line', title: 'Kapalıçarşı', description: "Dünyanın en eski ve büyük kapalı çarşısı" },
      { icon: 'ri-ship-line', title: 'Boğaz Turu', description: "İstanbul Boğazı'nda unutulmaz bir tekne turu" },
      { icon: 'ri-restaurant-line', title: 'Türk Mutfağı', description: 'Dünyaca ünlü lezzetlerin başkenti' },
    ],
    gallery: [
      '/images/destinations/istanbul-gallery-1.webp',
      '/images/destinations/istanbul-gallery-2.webp',
      '/images/destinations/istanbul-gallery-3.webp',
      '/images/destinations/istanbul-gallery-4.webp',
    ],
    popular_flights: [
      { from: 'Dubai', duration: '4s 30dk', date: 'Her gün', price: '3.499' },
    ],
  },
  {
    city: 'Ankara',
    country: 'Türkiye',
    image: '/images/destinations/ankara.webp',
    hero_image: '/images/destinations/ankara-hero.webp',
    price: 3699,
    description:
      "Türkiye Cumhuriyeti'nin başkenti Ankara, Anıtkabir, tarihi kalesi ve modern şehir yaşamıyla öne çıkan kültür ve siyaset merkezi.",
    weather: { temp: '15°C', condition: 'Açık', humidity: '45%' },
    highlights: [
      { icon: 'ri-government-line', title: 'Anıtkabir', description: "Atatürk'ün anıt mezarı ve müzesi" },
      { icon: 'ri-ancient-gate-line', title: 'Ankara Kalesi', description: 'Şehrin tarihi kalbi ve panoramik manzarası' },
      { icon: 'ri-gallery-line', title: 'Müzeler', description: 'Anadolu Medeniyetleri ve daha fazlası' },
      { icon: 'ri-leaf-line', title: 'Gençlik Parkı', description: 'Şehrin merkezinde yeşil vaha' },
    ],
    gallery: [
      '/images/destinations/ankara-gallery-1.webp',
      '/images/destinations/ankara-gallery-2.webp',
      '/images/destinations/ankara-gallery-3.webp',
      '/images/destinations/ankara-gallery-4.webp',
    ],
    popular_flights: [
      { from: 'Dubai', duration: '4s 45dk', date: 'Her gün', price: '3.699' },
    ],
  },
  {
    city: 'İzmir',
    country: 'Türkiye',
    image: '/images/destinations/izmir.webp',
    hero_image: '/images/destinations/izmir-hero.webp',
    price: 3599,
    description:
      "Ege'nin incisi İzmir, antik Efes harabeleri, Kordon boyundaki cafeleri ve muhteşem sahilleriyle Türkiye'nin en yaşanılabilir şehri.",
    weather: { temp: '22°C', condition: 'Güneşli', humidity: '55%' },
    highlights: [
      { icon: 'ri-ancient-gate-line', title: 'Efes Antik Kenti', description: 'UNESCO Dünya Mirası listesindeki antik şehir' },
      { icon: 'ri-walk-line', title: 'Kordon', description: 'Deniz kenarında yürüyüş ve cafe keyfi' },
      { icon: 'ri-time-line', title: 'Saat Kulesi', description: "İzmir'in simgesi Konak Meydanı" },
      { icon: 'ri-sun-line', title: 'Çeşme', description: 'Turkuaz suları ve beyaz kumlu plajları' },
    ],
    gallery: [
      '/images/destinations/izmir-gallery-1.webp',
      '/images/destinations/izmir-gallery-2.webp',
      '/images/destinations/izmir-gallery-3.webp',
      '/images/destinations/izmir-gallery-4.webp',
    ],
    popular_flights: [
      { from: 'Dubai', duration: '4s 40dk', date: 'Her gün', price: '3.599' },
    ],
  },
];

const FAQ = [
  { category: 'Rezervasyon', question: 'Nasıl bilet satın alabilirim?', answer: 'Web sitemiz üzerinden uçuş arayarak, uygun uçuşu seçip yolcu bilgilerini girdikten sonra ödeme yaparak biletinizi satın alabilirsiniz.', sort_order: 1 },
  { category: 'Rezervasyon', question: 'Rezervasyonumu nasıl iptal edebilirim?', answer: 'Hesabım sayfasından veya Rezervasyon Yönetimi bölümünden PNR kodunuz ile rezervasyonunuzu görüntüleyip iptal edebilirsiniz.', sort_order: 2 },
  { category: 'Rezervasyon', question: 'PNR kodum nedir ve nasıl bulabilirim?', answer: 'PNR (Passenger Name Record) kodunuz, rezervasyon onay sayfasında ve e-posta ile gönderilen onay mesajında yer alır. Bu kod ile tüm işlemlerinizi takip edebilirsiniz.', sort_order: 3 },
  { category: 'Bagaj', question: 'Ücretsiz bagaj hakkım ne kadar?', answer: 'Normal sınıf yolcularımız 20 kg, VIP sınıf yolcularımız 30 kg ücretsiz bagaj hakkına sahiptir. El bagajı tüm yolcularımız için 8 kg\'dır.', sort_order: 4 },
  { category: 'Bagaj', question: 'Ekstra bagaj ücreti ne kadar?', answer: 'Ek bagaj ücretleri kiloya göre değişmektedir. Rezervasyon sırasında veya sonrasında ekstra bagaj ekleyebilirsiniz. Detaylı fiyat bilgisi için bizimle iletişime geçin.', sort_order: 5 },
  { category: 'Check-in', question: 'Online check-in ne zaman açılır?', answer: 'Online check-in, uçuşunuzdan 24 saat önce açılır ve kalkıştan 2 saat öncesine kadar yapılabilir.', sort_order: 6 },
  { category: 'Check-in', question: 'Online check-in nasıl yapılır?', answer: 'Web sitemizdeki Check-in sayfasından PNR kodunuz ve soyadınız ile giriş yaparak online check-in işleminizi tamamlayabilirsiniz.', sort_order: 7 },
  { category: 'Uçuş', question: 'Uçuş durumumu nasıl öğrenebilirim?', answer: 'Web sitemizdeki Uçuş Durumu sayfasından uçuş numaranız ile güncel uçuş durumunuzu takip edebilirsiniz.', sort_order: 8 },
  { category: 'Uçuş', question: 'Hangi şehirlere uçuyorsunuz?', answer: "Bey Airlines olarak İstanbul, Ankara ve İzmir'den Dubai'ye direkt uçuşlar gerçekleştirmekteyiz. VIP jet hizmetimiz İstanbul-Dubai arasında sunulmaktadır.", sort_order: 9 },
  { category: 'Genel', question: 'VIP sınıf avantajları nelerdir?', answer: 'VIP sınıfta geniş ve konforlu koltuklar, özel gurme menü, öncelikli biniş ve bagaj, lounge erişimi gibi ayrıcalıklı hizmetlerden yararlanabilirsiniz.', sort_order: 10 },
  { category: 'Genel', question: 'İletişim bilgileriniz nelerdir?', answer: 'Bize web sitemizdeki iletişim formu üzerinden, sosyal medya hesaplarımızdan veya müşteri hizmetleri hattımızdan ulaşabilirsiniz.', sort_order: 11 },
  { category: 'Genel', question: 'Çocuklar için özel bir ücret var mı?', answer: '2 yaş altı bebekler ücretsiz seyahat eder (koltuk tahsisi yapılmaz). 2-12 yaş arası çocuklar için indirimli tarife uygulanmaktadır.', sort_order: 12 },
];

/**
 * App başlatıldığında destinations ve faq tablolarını kontrol eder.
 * Tablolar boşsa seed verilerini ekler.
 * Sayfa başına 1 kez çalışır (ref ile korunur).
 */
export function useDataInit() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        // sessionStorage flag: oturum boyunca tekrar Supabase sorgusu yapma
        if (sessionStorage.getItem('dataInitDone')) return;
        sessionStorage.setItem('dataInitDone', '1');

        // Destinations kontrolü
        const { count: destCount, error: destError } = await supabase
          .from('destinations')
          .select('id', { count: 'exact', head: true });

        if (destError) {
          logger.error('Destinations count hatası:', destError.message);
        } else if ((destCount ?? 0) === 0) {
          const { error } = await supabase.from('destinations').upsert(DESTINATIONS, { onConflict: 'city', ignoreDuplicates: true });
          if (error) {
            logger.error('Destinations seed hatası:', error.message);
          }
        }

        // FAQ kontrolü
        const { count: faqCount, error: faqError } = await supabase
          .from('faq')
          .select('id', { count: 'exact', head: true });

        if (faqError) {
          logger.error('FAQ count hatası:', faqError.message);
        } else if ((faqCount ?? 0) === 0) {
          const { error } = await supabase.from('faq').insert(FAQ);
          if (error) {
            logger.error('FAQ seed hatası:', error.message);
          }
        }
      } catch (err) {
        logger.error('Data init hatası:', err);
      }
    })();
  }, []);
}
