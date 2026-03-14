# Bey Airlines - Proje Bağlamı

## Tech Stack
- React 19.1.0 + TypeScript 5.8.3
- Vite 7.0.3 (SWC, path alias: `@/` → `src/`), React Router DOM 7.6.3
- Tailwind CSS 3.4.17, Remixicon (ri-*) ikonlar
- Supabase (PostgreSQL + Auth + RLS + Edge Functions)
- Stripe ödeme, Recharts grafikler, i18next çoklu dil (tr/en)

## Proje Yapısı
```
src/
├── pages/                # Route tabanlı sayfalar (React.lazy)
│   ├── home/             # Ana sayfa + HeroSection, PopularDestinations, CampaignsSection, MobileApp
│   ├── flight-search/    # Uçuş arama + FlightCard, FilterPanel
│   ├── flight-booking/   # Rezervasyon formu
│   ├── seat-selection/   # Koltuk seçimi (kabin haritası)
│   ├── extra-services/   # Bagaj, yemek, sigorta, priority
│   ├── payment/          # Stripe ödeme
│   ├── reservation-confirmation/ # PNR onay
│   ├── flight-status/    # Uçuş durumu + SearchForm, StatusCard
│   ├── check-in/         # Online check-in
│   ├── reservation-management/   # Rezervasyonlarım
│   ├── campaigns/        # Kampanya listesi
│   ├── campaign-detail/  # Kampanya detay (slug)
│   ├── destination-detail/ # Destinasyon detay (slug)
│   ├── account/          # Profil ayarları
│   ├── giris/ kayit/     # Auth sayfaları
│   ├── yardim/           # FAQ + İletişim
│   ├── kvkk/             # KVKK, Çerez, Yolcu Hakları (paylaşımlı)
│   ├── admin/            # login, dashboard, ucuslar, raporlar, kampanyalar, rezervasyonlar, musteriler, mesajlar, ayarlar
│   └── NotFound.tsx
├── components/
│   ├── feature/          # Header, Footer, SearchForm, BookingStepper
│   └── admin/            # AdminGuard, AdminLayout
├── contexts/             # AuthContext (Supabase auth, profil, isAdmin)
├── hooks/                # useFlights, useReservations, useCampaigns, useDestinations, useMessages, useAdminStats, usePageTitle, useFlightInit, useDataInit
├── lib/                  # supabase.ts client
├── utils/                # flightSchedule.ts (rotalar, program, gate/terminal)
├── mocks/                # Geliştirme mock verileri (flights, reservations, campaigns, destinations, adminStats, messages, faq, flightStatus, userReservations)
├── i18n/                 # i18next config + local/[lang]/*.ts (dynamic glob import)
├── router/               # config.tsx (33 route, lazy load), index.ts (useRoutes + scroll top)
├── App.tsx               # Root (I18n, Auth, Router providers)
└── main.tsx              # Giriş noktası
supabase/
├── migration.sql         # Ana şema + RLS (614 satır)
├── functions/
│   ├── send-reservation-email/   # Rezervasyon email Edge Function
│   └── generate-weekly-flights/  # Haftalık uçuş üretimi (Cron: Pazar 00:00 UTC)
└── *.sql                 # Yardımcı SQL dosyaları (fix, temizlik, slug, veri kontrol)
```

## Veritabanı
**Tablolar:** profiles, aircraft, flight_schedule, flights, reservations, passengers, saved_passengers, messages, campaigns, destinations, faq
**Stored Procedures:** is_admin(), increment_booked_seats(), generate_weekly_flights(), handle_new_user()
**Edge Functions:** send-reservation-email, generate-weekly-flights (cron)

## Route'lar (Türkçe)
**Public:** /, /ucus-ara, /ucus-rezervasyon, /koltuk-secimi, /ek-hizmetler, /odeme, /rezervasyon-onay/:pnr, /check-in, /ucus-durumu, /rezervasyon-yonetimi, /kampanyalar, /kampanyalar/:slug, /destinasyonlar/:slug, /hesabim, /yardim, /giris, /kayit, /kvkk, /cerez-politikasi, /yolcu-haklari
**Admin (AdminGuard):** /admin/login, /admin/dashboard, /admin/raporlar, /admin/ucuslar, /admin/kampanyalar, /admin/rezervasyonlar, /admin/musteriler, /admin/mesajlar, /admin/ayarlar

## Renk Paleti
primary: #CC0000, secondary: #E31E24, primary-dark: #990000, bg-alt: #FFF5F5, text-primary: #1A1A1A, text-secondary: #6B7280, accent: #FF4444

## Fontlar
sans: Inter, cinzel: Cinzel (logo), cormorant: Cormorant Garamond, playfair: Playfair Display

## Build & Deploy
- `npm run dev` → localhost:3000, `npm run build` → out/ dizini
- Vercel deploy, sourcemap aktif
- Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

## State Management
Context API + Custom Hooks (Redux/Zustand yok). SessionStorage booking akışı için.

## Agent Ekibi
Proje `.claude/agents/` altındaki agent ekibiyle yönetilir:
- **takım-lideri** (opus) — Otonom orkestratör, görev parçalar, delege eder, review eder
- **frontend-dev** (sonnet) — React, TypeScript, Tailwind, routing, state
- **backend-dev** (sonnet) — Supabase sorgu, hook, Auth, Stripe entegrasyon
- **veri-mimari** (sonnet) — DB şema, migration, RLS, stored procedure, Edge Function
- **ui-designer** (sonnet) — Görsel tasarım, animasyon, responsive, erişilebilirlik
- **kalite-test** (sonnet) — Güvenlik audit, performans, test, bug tespiti
- **hizli-fix** (haiku) — Typo, lint, import, küçük düzeltmeler

## Kurallar
- Türkçe iletişim
- Supabase RLS her tabloda zorunlu
- Admin erişimi is_admin() ile kontrol
- Responsive: Tailwind breakpoints (sm/md/lg/xl)
- Lazy loading: React.lazy + Suspense
- useTranslation() ile çeviri
- TypeScript strict, `any` yasak
- .env git'e girmez
