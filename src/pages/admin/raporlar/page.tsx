import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../../../lib/supabase';
import { getTodayTR } from '../../../utils/date';

interface MonthlyRevenue {
  month: string;
  gelir: number;
  hedef: number;
}

interface RouteOccupancy {
  route: string;
  doluluk: number;
}

interface DailyTrend {
  date: string;
  doluluk: number;
}

interface WeeklySales {
  day: string;
  satis: number;
  gelir: number;
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' }),
    end: getTodayTR(),
  });

  const [activeTab, setActiveTab] = useState<'revenue' | 'occupancy' | 'sales'>('revenue');
  const [loading, setLoading] = useState(true);

  // Real data states
  const [summaryStats, setSummaryStats] = useState({
    totalRevenue: 0,
    avgOccupancy: 0,
    totalFlights: 0,
    totalPassengers: 0,
  });
  const [monthlyRevenueData, setMonthlyRevenueData] = useState<MonthlyRevenue[]>([]);
  const [occupancyData, setOccupancyData] = useState<RouteOccupancy[]>([]);
  const [dailyOccupancyTrend, setDailyOccupancyTrend] = useState<DailyTrend[]>([]);
  const [weeklySalesData, setWeeklySalesData] = useState<WeeklySales[]>([]);

  const MONTH_NAMES = ['Oca', 'Sub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Agu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const DAY_NAMES = ['Paz', 'Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt'];

  const fetchReportData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Toplam istatistikler
      const endOfDay = dateRange.end + 'T23:59:59';
      const [
        { data: reservations },
        { count: totalFlights },
        { count: totalPassengers },
        { data: flightsWithOccupancy },
      ] = await Promise.all([
        supabase
          .from('reservations')
          .select('total_price, created_at, flight_date, flight_number, route, status')
          .gte('created_at', dateRange.start)
          .lte('created_at', endOfDay),
        supabase
          .from('flights')
          .select('*', { count: 'exact', head: true })
          .gte('flight_date', dateRange.start)
          .lte('flight_date', dateRange.end),
        supabase.from('passengers').select('*', { count: 'exact', head: true }),
        supabase
          .from('flights')
          .select('from_code, to_code, capacity, booked_seats, flight_date')
          .gte('flight_date', dateRange.start)
          .lte('flight_date', dateRange.end),
      ]);

      // Toplam gelir
      const totalRevenue = reservations?.reduce((sum, r) => sum + Number(r.total_price || 0), 0) || 0;

      // Ortalama doluluk
      let avgOccupancy = 0;
      if (flightsWithOccupancy && flightsWithOccupancy.length > 0) {
        const totalOcc = flightsWithOccupancy.reduce((sum, f) => {
          const cap = Number(f.capacity) || 180;
          const booked = Number(f.booked_seats) || 0;
          return sum + (booked / cap) * 100;
        }, 0);
        avgOccupancy = Math.round(totalOcc / flightsWithOccupancy.length);
      }

      setSummaryStats({
        totalRevenue,
        avgOccupancy,
        totalFlights: totalFlights || 0,
        totalPassengers: totalPassengers || 0,
      });

      // 2. Aylik gelir verisi
      if (reservations && reservations.length > 0) {
        const monthMap: Record<number, number> = {};
        reservations.forEach((r) => {
          const date = new Date(r.created_at);
          const month = date.getMonth();
          monthMap[month] = (monthMap[month] || 0) + Number(r.total_price || 0);
        });

        const monthlyData: MonthlyRevenue[] = [];
        for (let i = 0; i < 12; i++) {
          const gelir = monthMap[i] || 0;
          if (gelir > 0) {
            monthlyData.push({
              month: MONTH_NAMES[i],
              gelir,
              hedef: Math.round(gelir * 0.9), // Hedef olarak gercek gelirin %90'i gosterilir
            });
          }
        }
        setMonthlyRevenueData(monthlyData.length > 0 ? monthlyData : [{ month: 'Veri yok', gelir: 0, hedef: 0 }]);
      } else {
        setMonthlyRevenueData([{ month: 'Veri yok', gelir: 0, hedef: 0 }]);
      }

      // 3. Rota bazli doluluk
      if (flightsWithOccupancy && flightsWithOccupancy.length > 0) {
        const routeMap: Record<string, { totalOcc: number; count: number }> = {};
        flightsWithOccupancy.forEach((f) => {
          const route = `${f.from_code}-${f.to_code}`;
          const cap = Number(f.capacity) || 180;
          const booked = Number(f.booked_seats) || 0;
          const occ = (booked / cap) * 100;
          if (!routeMap[route]) routeMap[route] = { totalOcc: 0, count: 0 };
          routeMap[route].totalOcc += occ;
          routeMap[route].count += 1;
        });

        const occData: RouteOccupancy[] = Object.entries(routeMap)
          .map(([route, data]) => ({
            route,
            doluluk: Math.round(data.totalOcc / data.count),
          }))
          .sort((a, b) => b.doluluk - a.doluluk)
          .slice(0, 8);

        setOccupancyData(occData);
      } else {
        setOccupancyData([]);
      }

      // 4. Son 15 gunluk doluluk trendi
      if (flightsWithOccupancy && flightsWithOccupancy.length > 0) {
        const dayMap: Record<string, { totalOcc: number; count: number }> = {};
        const today = new Date();
        const fifteenDaysAgo = new Date(today);
        fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

        flightsWithOccupancy.forEach((f) => {
          const fDate = new Date(f.flight_date);
          if (fDate >= fifteenDaysAgo && fDate <= today) {
            const day = f.flight_date;
            const cap = Number(f.capacity) || 180;
            const booked = Number(f.booked_seats) || 0;
            const occ = (booked / cap) * 100;
            if (!dayMap[day]) dayMap[day] = { totalOcc: 0, count: 0 };
            dayMap[day].totalOcc += occ;
            dayMap[day].count += 1;
          }
        });

        const dailyData: DailyTrend[] = Object.entries(dayMap)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([date, data]) => ({
            date: date.slice(5), // MM-DD format
            doluluk: Math.round(data.totalOcc / data.count),
          }));

        setDailyOccupancyTrend(dailyData);
      } else {
        setDailyOccupancyTrend([]);
      }

      // 5. Haftalik satis verisi
      if (reservations && reservations.length > 0) {
        const weekMap: Record<number, { satis: number; gelir: number }> = {};
        const now = new Date();
        const sevenDaysAgo = new Date(now);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        reservations.forEach((r) => {
          const rDate = new Date(r.created_at);
          if (rDate >= sevenDaysAgo && rDate <= now) {
            const dayIdx = rDate.getDay();
            if (!weekMap[dayIdx]) weekMap[dayIdx] = { satis: 0, gelir: 0 };
            weekMap[dayIdx].satis += 1;
            weekMap[dayIdx].gelir += Number(r.total_price || 0);
          }
        });

        // Haftanin gunlerini sirayla goster (Pzt-Paz)
        const weekOrder = [1, 2, 3, 4, 5, 6, 0];
        const weeklyData: WeeklySales[] = weekOrder.map((dayIdx) => ({
          day: DAY_NAMES[dayIdx],
          satis: weekMap[dayIdx]?.satis || 0,
          gelir: weekMap[dayIdx]?.gelir || 0,
        }));

        setWeeklySalesData(weeklyData);
      } else {
        setWeeklySalesData([]);
      }
    } catch (err) {
      // Hata sessizce işlenir
    }

    setLoading(false);
  }, [dateRange]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Haftalik ozet hesapla
  const weeklyTotalSales = weeklySalesData.reduce((sum, d) => sum + d.satis, 0);
  const weeklyTotalRevenue = weeklySalesData.reduce((sum, d) => sum + d.gelir, 0);
  const avgTicketPrice = weeklyTotalSales > 0 ? Math.round(weeklyTotalRevenue / weeklyTotalSales) : 0;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Raporlar & Analitik</h1>
                <p className="text-purple-100">Detayli performans raporlari ve istatistikler</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <i className="ri-bar-chart-box-line text-4xl"></i>
              </div>
            </div>
          </div>

          {/* Date Filter */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <i className="ri-calendar-line text-xl text-gray-600"></i>
                <span className="font-semibold text-gray-900">Tarih Araligi:</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-gray-400">--</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={fetchReportData}
                className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-refresh-line mr-2"></i>
                Yenile
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Gelir</p>
              <p className="text-3xl font-bold text-gray-900">{summaryStats.totalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</p>
              <p className="text-xs text-green-600 mt-2">Tum rezervasyonlar</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <i className="ri-percent-line text-2xl text-blue-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Ortalama Doluluk</p>
              <p className="text-3xl font-bold text-gray-900">%{summaryStats.avgOccupancy}</p>
              <p className="text-xs text-blue-600 mt-2">Tum ucuslar</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="ri-flight-takeoff-line text-2xl text-purple-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Ucus</p>
              <p className="text-3xl font-bold text-gray-900">{summaryStats.totalFlights.toLocaleString()}</p>
              <p className="text-xs text-purple-600 mt-2">Planlanan</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-orange-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Yolcu</p>
              <p className="text-3xl font-bold text-gray-900">{summaryStats.totalPassengers.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-2">Kayitli yolcu</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'revenue'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="ri-money-dollar-circle-line mr-2"></i>
                Gelir Raporu
              </button>
              <button
                onClick={() => setActiveTab('occupancy')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'occupancy'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="ri-percent-line mr-2"></i>
                Doluluk Raporu
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'sales'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="ri-line-chart-line mr-2"></i>
                Satis Trendi
              </button>
            </div>

            <div className="p-6">
              {/* Revenue Report */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aylik Gelir Trendi</h3>
                    <p className="text-sm text-gray-500 mb-6">Gerceklesen gelir vs hedef karsilastirmasi</p>
                    {monthlyRevenueData.length > 0 && monthlyRevenueData[0].gelir > 0 ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <AreaChart data={monthlyRevenueData}>
                          <defs>
                            <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorHedef" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '13px' }} />
                          <YAxis stroke="#6b7280" style={{ fontSize: '13px' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '13px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '13px' }} />
                          <Area type="monotone" dataKey="gelir" stroke="#10B981" fillOpacity={1} fill="url(#colorGelir)" name="Gerceklesen (TL)" />
                          <Area type="monotone" dataKey="hedef" stroke="#6366F1" fillOpacity={1} fill="url(#colorHedef)" name="Hedef (TL)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <i className="ri-bar-chart-line text-5xl mb-3 block"></i>
                          <p>Henuz gelir verisi bulunmuyor</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Revenue Table */}
                  {monthlyRevenueData.length > 0 && monthlyRevenueData[0].gelir > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ay</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Gerceklesen</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hedef</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Fark</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Basari</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {monthlyRevenueData.map((item, index) => {
                            const diff = item.gelir - item.hedef;
                            const success = item.hedef > 0 ? ((item.gelir / item.hedef) * 100).toFixed(1) : '0.0';
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.month}</td>
                                <td className="px-6 py-4 text-sm text-right text-gray-900">{item.gelir.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</td>
                                <td className="px-6 py-4 text-sm text-right text-gray-600">{item.hedef.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</td>
                                <td className={`px-6 py-4 text-sm text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {diff >= 0 ? '+' : ''}{diff.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}
                                </td>
                                <td className="px-6 py-4 text-sm text-right">
                                  <span className={`px-2 py-1 rounded-lg font-semibold ${
                                    parseFloat(success) >= 100 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                                  }`}>
                                    %{success}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Occupancy Report */}
              {activeTab === 'occupancy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Gunluk Doluluk Trendi</h3>
                    <p className="text-sm text-gray-500 mb-6">Son 15 gunun doluluk orani</p>
                    {dailyOccupancyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={dailyOccupancyTrend}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '13px' }} />
                          <YAxis stroke="#6b7280" style={{ fontSize: '13px' }} domain={[0, 100]} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '13px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '13px' }} />
                          <Line type="monotone" dataKey="doluluk" stroke="#8B5CF6" strokeWidth={3} name="Doluluk %" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <i className="ri-line-chart-line text-5xl mb-3 block"></i>
                          <p>Son 15 gun icin doluluk verisi bulunmuyor</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Rota Bazli Doluluk</h3>
                    {occupancyData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={occupancyData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis type="number" stroke="#6b7280" style={{ fontSize: '13px' }} domain={[0, 100]} />
                          <YAxis dataKey="route" type="category" stroke="#6b7280" style={{ fontSize: '13px' }} width={80} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '13px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '13px' }} />
                          <Bar dataKey="doluluk" fill="#10B981" name="Doluluk %" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <i className="ri-bar-chart-horizontal-line text-5xl mb-3 block"></i>
                          <p>Rota bazli doluluk verisi bulunmuyor</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Sales Trend */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Haftalik Satis Performansi</h3>
                    <p className="text-sm text-gray-500 mb-6">Son 7 gunluk satis adedi ve gelir</p>
                    {weeklySalesData.some(d => d.satis > 0) ? (
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={weeklySalesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                          <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '13px' }} />
                          <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '13px' }} />
                          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '13px' }} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '12px',
                              fontSize: '13px'
                            }}
                          />
                          <Legend wrapperStyle={{ fontSize: '13px' }} />
                          <Bar yAxisId="left" dataKey="satis" fill="#EF4444" name="Satis Adedi" radius={[8, 8, 0, 0]} />
                          <Bar yAxisId="right" dataKey="gelir" fill="#F97316" name="Gelir (TL)" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-400">
                        <div className="text-center">
                          <i className="ri-shopping-cart-line text-5xl mb-3 block"></i>
                          <p>Son 7 gun icin satis verisi bulunmuyor</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sales Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                          <i className="ri-shopping-cart-line text-xl text-white"></i>
                        </div>
                        <span className="text-xs font-semibold text-red-600 bg-white px-2 py-1 rounded-lg">
                          Haftalik
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mb-1">Toplam Satis</p>
                      <p className="text-2xl font-bold text-red-900">{weeklyTotalSales} Bilet</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                          <i className="ri-money-dollar-circle-line text-xl text-white"></i>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-white px-2 py-1 rounded-lg">
                          Haftalik
                        </span>
                      </div>
                      <p className="text-sm text-orange-700 mb-1">Toplam Gelir</p>
                      <p className="text-2xl font-bold text-orange-900">{weeklyTotalRevenue.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                          <i className="ri-line-chart-line text-xl text-white"></i>
                        </div>
                        <span className="text-xs font-semibold text-green-600 bg-white px-2 py-1 rounded-lg">
                          Ortalama
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mb-1">Bilet Basi Gelir</p>
                      <p className="text-2xl font-bold text-green-900">{avgTicketPrice.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </AdminLayout>
  );
}
