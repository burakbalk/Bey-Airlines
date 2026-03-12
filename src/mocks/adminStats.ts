export const dashboardStats = {
  totalReservations: 1247,
  reservationGrowth: 12,
  dailyRevenue: 89450,
  revenueGrowth: 8,
  activeFlights: 24,
  newCustomers: 156,
  customerGrowth: 24
};

export const weeklySalesData = [
  { day: 'Pzt', satis: 45, gelir: 12500 },
  { day: 'Sal', satis: 52, gelir: 14800 },
  { day: 'Çar', satis: 48, gelir: 13200 },
  { day: 'Per', satis: 61, gelir: 17600 },
  { day: 'Cum', satis: 78, gelir: 22400 },
  { day: 'Cmt', satis: 95, gelir: 28900 },
  { day: 'Paz', satis: 88, gelir: 25100 }
];

export const occupancyData = [
  { route: 'IST-DXB', doluluk: 92, kapasite: 180 },
  { route: 'DXB-IST', doluluk: 88, kapasite: 180 },
  { route: 'ESB-DXB', doluluk: 78, kapasite: 180 },
  { route: 'DXB-ESB', doluluk: 71, kapasite: 180 },
  { route: 'ADB-DXB', doluluk: 85, kapasite: 180 },
  { route: 'DXB-ADB', doluluk: 65, kapasite: 120 }
];

export const revenueByClassData = [
  { name: 'Ekonomi', value: 65, color: '#EF4444' },
  { name: 'Business', value: 25, color: '#F97316' },
  { name: 'VIP', value: 10, color: '#FCD34D' }
];

export const recentReservations = [
  {
    id: 1,
    pnr: 'ABC123',
    passenger: 'Ahmet Yılmaz',
    route: 'IST → DXB',
    date: '2024-01-15',
    amount: 3499,
    status: 'confirmed'
  },
  {
    id: 2,
    pnr: 'DEF456',
    passenger: 'Ayşe Demir',
    route: 'DXB → IST',
    date: '2024-01-16',
    amount: 3499,
    status: 'confirmed'
  },
  {
    id: 3,
    pnr: 'GHI789',
    passenger: 'Mehmet Kaya',
    route: 'ESB → DXB',
    date: '2024-01-16',
    amount: 3699,
    status: 'pending'
  },
  {
    id: 4,
    pnr: 'JKL012',
    passenger: 'Fatma Şahin',
    route: 'DXB → ADB',
    date: '2024-01-17',
    amount: 3599,
    status: 'confirmed'
  },
  {
    id: 5,
    pnr: 'MNO345',
    passenger: 'Ali Öztürk',
    route: 'ADB → DXB',
    date: '2024-01-17',
    amount: 3599,
    status: 'confirmed'
  }
];

export const popularRoutes = [
  { route: 'İstanbul → Dubai', count: 145, percent: 85 },
  { route: 'Dubai → İstanbul', count: 128, percent: 75 },
  { route: 'Ankara → Dubai', count: 112, percent: 65 },
  { route: 'İzmir → Dubai', count: 98, percent: 55 },
  { route: 'Dubai → Ankara', count: 87, percent: 50 }
];

export const monthlyRevenueData = [
  { month: 'Oca', gelir: 245000, hedef: 220000 },
  { month: 'Şub', gelir: 268000, hedef: 240000 },
  { month: 'Mar', gelir: 312000, hedef: 280000 },
  { month: 'Nis', gelir: 298000, hedef: 290000 },
  { month: 'May', gelir: 335000, hedef: 310000 },
  { month: 'Haz', gelir: 389000, hedef: 350000 },
  { month: 'Tem', gelir: 425000, hedef: 400000 },
  { month: 'Ağu', gelir: 456000, hedef: 420000 },
  { month: 'Eyl', gelir: 398000, hedef: 380000 },
  { month: 'Eki', gelir: 367000, hedef: 360000 },
  { month: 'Kas', gelir: 342000, hedef: 340000 },
  { month: 'Ara', gelir: 412000, hedef: 390000 }
];

export const dailyOccupancyTrend = [
  { date: '01', doluluk: 72 },
  { date: '02', doluluk: 68 },
  { date: '03', doluluk: 75 },
  { date: '04', doluluk: 71 },
  { date: '05', doluluk: 78 },
  { date: '06', doluluk: 82 },
  { date: '07', doluluk: 88 },
  { date: '08', doluluk: 85 },
  { date: '09', doluluk: 79 },
  { date: '10', doluluk: 76 },
  { date: '11', doluluk: 81 },
  { date: '12', doluluk: 84 },
  { date: '13', doluluk: 87 },
  { date: '14', doluluk: 91 },
  { date: '15', doluluk: 89 }
];
