# Bey Airlines - Proje Bağlamı

## Tech Stack
- React 19.1.0 + TypeScript 5.8.3
- Vite 7.0.3 (SWC), React Router DOM 7.6.3
- Tailwind CSS 3.4.17, Remixicon (ri-*) ikonlar
- Supabase (PostgreSQL + Auth + RLS)
- Stripe ödeme, Recharts grafikler, i18next çoklu dil

## Proje Yapısı
```
src/
├── pages/           # Route tabanlı sayfalar
├── components/      # feature/ (Header, Footer, SearchForm), admin/ (AdminGuard, AdminLayout)
├── contexts/        # AuthContext (Supabase auth, profil, rol)
├── hooks/           # useFlights, useReservations, useCampaigns, useDestinations, useMessages, useAdminStats
├── lib/             # supabase.ts client
├── utils/           # flightSchedule.ts
├── mocks/           # Geliştirme mock verileri
├── i18n/            # i18next yapılandırması + dil dosyaları
├── router/          # config.tsx (tüm route tanımları)
├── App.tsx          # Root (providers)
└── main.tsx         # Giriş noktası
supabase/
└── migration.sql    # Şema + RLS
```

## Veritabanı Tabloları
profiles, flight_schedule, flights, reservations, passengers, saved_passengers, messages, campaigns, destinations, faq

## Stored Procedures
is_admin(), increment_booked_seats(), generate_weekly_flights(), handle_new_user()

## Route'lar (Türkçe)
/, /ucus-ara, /ucus-rezervasyon, /koltuk-secimi, /ek-hizmetler, /odeme, /rezervasyon-onay/:pnr, /check-in, /ucus-durumu, /rezervasyon-yonetimi, /kampanyalar, /kampanyalar/:id, /destinasyonlar/:id, /hesabim, /yardim, /giris, /kayit, /kvkk, /cerez-politikasi, /yolcu-haklari, /admin/*

## Renk Paleti
primary: #CC0000, secondary: #E31E24, primary-dark: #990000, bg-alt: #FFF5F5, text-primary: #1A1A1A, text-secondary: #6B7280, accent: #FF4444

## State Management
Context API + Custom Hooks (Redux/Zustand yok). SessionStorage booking akışı için. localStorage legacy admin (Supabase'e geçiş var).

## Kurallar
- Türkçe iletişim
- Supabase RLS her tabloda zorunlu
- Admin erişimi is_admin() ile kontrol
- Responsive: Tailwind breakpoints (sm/md/lg/xl)
- Lazy loading: React.lazy + Suspense
- useTranslation() ile çeviri
