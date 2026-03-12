export const popularDestinations = [
  {
    id: 1,
    city: 'Dubai',
    country: 'BAE',
    image: '/images/destinations/dubai-card.webp',
    price: 3299,
    description: 'Dünyanın en görkemli şehirlerinden Dubai, modern mimarisi, lüks alışveriş merkezleri ve çöl safarileriyle benzersiz bir deneyim sunuyor. Burj Khalifa, Dubai Mall ve Palm Jumeirah ile hayallerinizi gerçeğe dönüştürün.',
    heroImage: '/images/destinations/dubai-hero.webp',
    weather: { temp: '32°C', condition: 'Güneşli', humidity: '55%' },
    highlights: [
      { icon: 'ri-building-2-line', title: 'Burj Khalifa', description: 'Dünyanın en yüksek binası' },
      { icon: 'ri-shopping-cart-line', title: 'Dubai Mall', description: 'Dev alışveriş ve eğlence merkezi' },
      { icon: 'ri-sun-line', title: 'Çöl Safari', description: 'Kumul sürüşü ve geleneksel akşam yemeği' },
      { icon: 'ri-hotel-line', title: 'Lüks Oteller', description: 'Burj Al Arab ve Palm Jumeirah' }
    ],
    gallery: [
      '/images/destinations/dubai-gallery-1.webp',
      '/images/destinations/dubai-gallery-2.webp',
      '/images/destinations/dubai-gallery-3.webp',
      '/images/destinations/dubai-gallery-4.webp'
    ],
    popularFlights: [
      { from: 'İstanbul', duration: '4s 30dk', date: '10 Haz - 17 Haz', price: 3299 },
      { from: 'Ankara', duration: '4s 45dk', date: '13 Haz - 20 Haz', price: 3699 },
      { from: 'İzmir', duration: '4s 40dk', date: '15 Haz - 22 Haz', price: 3599 }
    ]
  },
  {
    id: 2,
    city: 'İstanbul',
    country: 'Türkiye',
    image: '/images/destinations/istanbul-card.webp',
    price: 3499,
    description: 'İki kıtayı birleştiren eşsiz şehir İstanbul, tarihi yarımadası, Boğaz manzarası ve zengin kültürel mirası ile dünyanın en çok ziyaret edilen şehirlerinden biri. Ayasofya, Topkapı Sarayı ve Kapalıçarşı ile zamanda yolculuk yapın.',
    heroImage: '/images/destinations/istanbul-hero.webp',
    weather: { temp: '21°C', condition: 'Parçalı Bulutlu', humidity: '65%' },
    highlights: [
      { icon: 'ri-ancient-gate-line', title: 'Ayasofya', description: 'Tarihi camii ve müze' },
      { icon: 'ri-ship-2-line', title: 'Boğaz Turu', description: 'İki kıta arasında tekne gezisi' },
      { icon: 'ri-store-line', title: 'Kapalıçarşı', description: 'Dünyanın en eski kapalı çarşısı' },
      { icon: 'ri-restaurant-2-line', title: 'Osmanlı Mutfağı', description: 'Kebap, baklava ve Türk kahvesi' }
    ],
    gallery: [
      '/images/destinations/istanbul-gallery-1.webp',
      '/images/destinations/istanbul-gallery-2.webp',
      '/images/destinations/istanbul-gallery-3.webp',
      '/images/destinations/istanbul-gallery-4.webp'
    ],
    popularFlights: [
      { from: 'Dubai', duration: '4s 30dk', date: '08 Haz - 15 Haz', price: 3499 }
    ]
  },
  {
    id: 3,
    city: 'Ankara',
    country: 'Türkiye',
    image: '/images/destinations/ankara-card.webp',
    price: 3699,
    description: 'Türkiye\'nin başkenti Ankara, tarihi ve modern mimarinin buluştuğu, kültürel zenginlikleriyle dolu bir şehir. Anıtkabir, Ankara Kalesi ve müzeleriyle ziyaretçilerine unutulmaz anlar yaşatıyor.',
    heroImage: '/images/destinations/ankara-hero.webp',
    weather: { temp: '18°C', condition: 'Güneşli', humidity: '45%' },
    highlights: [
      { icon: 'ri-building-line', title: 'Anıtkabir', description: 'Atatürk\'ün anıt mezarı ve müzesi' },
      { icon: 'ri-ancient-gate-line', title: 'Ankara Kalesi', description: 'Tarihi kale ve panoramik şehir manzarası' },
      { icon: 'ri-bank-line', title: 'Müzeler', description: 'Anadolu Medeniyetleri ve Etnografya Müzesi' },
      { icon: 'ri-restaurant-line', title: 'Gastronomi', description: 'Ankara tava, döner ve yerel lezzetler' }
    ],
    gallery: [
      '/images/destinations/ankara-gallery-1.webp',
      '/images/destinations/ankara-gallery-2.webp',
      '/images/destinations/ankara-gallery-3.webp',
      '/images/destinations/ankara-gallery-4.webp'
    ],
    popularFlights: [
      { from: 'Dubai', duration: '4s 45dk', date: '18 Haz - 25 Haz', price: 3699 }
    ]
  },
  {
    id: 4,
    city: 'İzmir',
    country: 'Türkiye',
    image: '/images/destinations/izmir-card.webp',
    price: 3599,
    description: 'Ege\'nin incisi İzmir, muhteşem sahil şeridi, tarihi dokusu ve canlı kültürel yaşamıyla Türkiye\'nin en güzel şehirlerinden biri. Kordon, Kemeraltı ve Efes antik kenti ile ziyaretçilerini büyülüyor.',
    heroImage: '/images/destinations/izmir-hero.webp',
    weather: { temp: '24°C', condition: 'Açık', humidity: '60%' },
    highlights: [
      { icon: 'ri-ship-line', title: 'Kordon', description: 'Sahil şeridi ve yürüyüş yolu' },
      { icon: 'ri-ancient-pavilion-line', title: 'Efes Antik Kenti', description: 'Dünya mirası antik şehir' },
      { icon: 'ri-shopping-bag-line', title: 'Kemeraltı Çarşısı', description: 'Tarihi pazar ve alışveriş merkezi' },
      { icon: 'ri-goblet-line', title: 'Ege Mutfağı', description: 'Deniz ürünleri ve zeytinyağlı yemekler' }
    ],
    gallery: [
      '/images/destinations/izmir-gallery-1.webp',
      '/images/destinations/izmir-gallery-2.webp',
      '/images/destinations/izmir-gallery-3.webp',
      '/images/destinations/izmir-gallery-4.webp'
    ],
    popularFlights: [
      { from: 'Dubai', duration: '4s 40dk', date: '12 Haz - 19 Haz', price: 3599 }
    ]
  },
];
