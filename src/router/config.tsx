import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const FlightSearchPage = lazy(() => import('../pages/flight-search/page'));
const CheckInPage = lazy(() => import('../pages/check-in/page'));
const FlightStatusPage = lazy(() => import('../pages/flight-status/page'));
const AccountPage = lazy(() => import('../pages/account/page'));
const YardimPage = lazy(() => import('../pages/yardim/page'));
const CampaignsPage = lazy(() => import('../pages/campaigns/page'));
const CampaignDetailPage = lazy(() => import('../pages/campaign-detail/page'));
const ReservationManagementPage = lazy(() => import('../pages/reservation-management/page'));
const DestinationDetailPage = lazy(() => import('../pages/destination-detail/page'));
const KVKKPage = lazy(() => import('../pages/kvkk/page'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const FlightBookingPage = lazy(() => import('../pages/flight-booking/page'));
const SeatSelectionPage = lazy(() => import('../pages/seat-selection/page'));
const ExtraServicesPage = lazy(() => import('../pages/extra-services/page'));
const PaymentPage = lazy(() => import('../pages/payment/page'));
const ReservationConfirmationPage = lazy(() => import('../pages/reservation-confirmation/page'));
const AdminLoginPage = lazy(() => import('../pages/admin/login/page'));
const AdminDashboardPage = lazy(() => import('../pages/admin/dashboard/page'));
const AdminReportsPage = lazy(() => import('../pages/admin/raporlar/page'));
const AdminFlightsPage = lazy(() => import('../pages/admin/ucuslar/page'));
const AdminCampaignsPage = lazy(() => import('../pages/admin/kampanyalar/page'));
const AdminReservationsPage = lazy(() => import('../pages/admin/rezervasyonlar/page'));
const AdminCustomersPage = lazy(() => import('../pages/admin/musteriler/page'));
const AdminMessagesPage = lazy(() => import('../pages/admin/mesajlar/page'));
const AdminSettingsPage = lazy(() => import('../pages/admin/ayarlar/page'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/ucus-ara',
    element: <FlightSearchPage />,
  },
  {
    path: '/check-in',
    element: <CheckInPage />,
  },
  {
    path: '/ucus-durumu',
    element: <FlightStatusPage />,
  },
  {
    path: '/hesabim',
    element: <AccountPage />,
  },
  {
    path: '/yardim',
    element: <YardimPage />,
  },
  {
    path: '/kampanyalar',
    element: <CampaignsPage />,
  },
  {
    path: '/kampanyalar/:id',
    element: <CampaignDetailPage />,
  },
  {
    path: '/rezervasyon-yonetimi',
    element: <ReservationManagementPage />,
  },
  {
    path: '/destinasyonlar/:id',
    element: <DestinationDetailPage />,
  },
  {
    path: '/kvkk',
    element: <KVKKPage />,
  },
  {
    path: '/cerez-politikasi',
    element: <KVKKPage />,
  },
  {
    path: '/yolcu-haklari',
    element: <KVKKPage />,
  },
  {
    path: '/ucus-rezervasyon',
    element: <FlightBookingPage />,
  },
  {
    path: '/koltuk-secimi',
    element: <SeatSelectionPage />,
  },
  {
    path: '/ek-hizmetler',
    element: <ExtraServicesPage />,
  },
  {
    path: '/odeme',
    element: <PaymentPage />,
  },
  {
    path: '/rezervasyon-onay/:pnr',
    element: <ReservationConfirmationPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboardPage />,
  },
  {
    path: '/admin/raporlar',
    element: <AdminReportsPage />,
  },
  {
    path: '/admin/ucuslar',
    element: <AdminFlightsPage />,
  },
  {
    path: '/admin/kampanyalar',
    element: <AdminCampaignsPage />,
  },
  {
    path: '/admin/rezervasyonlar',
    element: <AdminReservationsPage />,
  },
  {
    path: '/admin/musteriler',
    element: <AdminCustomersPage />,
  },
  {
    path: '/admin/mesajlar',
    element: <AdminMessagesPage />,
  },
  {
    path: '/admin/ayarlar',
    element: <AdminSettingsPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
];

export default routes;
