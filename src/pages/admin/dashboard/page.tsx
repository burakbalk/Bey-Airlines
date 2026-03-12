import AdminGuard from '../../../components/admin/AdminGuard';
import AdminLayout from '../../../components/admin/AdminLayout';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { dashboardStats, weeklySalesData, occupancyData, revenueByClassData, recentReservations, popularRoutes } from '../../../mocks/adminStats';

export default function AdminDashboardPage() {
  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { text: 'Onaylandı', color: 'bg-green-50 text-green-600' },
      pending: { text: 'Beklemede', color: 'bg-yellow-50 text-yellow-600' },
      cancelled: { text: 'İptal', color: 'bg-red-50 text-red-600' }
    };
    return badges[status as keyof typeof badges] || badges.confirmed;
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Hoş Geldiniz! 👋</h1>
                <p className="text-red-100">Bey Airlines Admin Paneline hoş geldiniz. İşte bugünün özeti:</p>
              </div>
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <i className="ri-dashboard-line text-4xl"></i>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <i className="ri-ticket-line text-2xl text-blue-600"></i>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +{dashboardStats.reservationGrowth}%
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Rezervasyon</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.totalReservations.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +{dashboardStats.revenueGrowth}%
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Günlük Gelir</p>
              <p className="text-3xl font-bold text-gray-900">₺{dashboardStats.dailyRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="ri-flight-takeoff-line text-2xl text-purple-600"></i>
                </div>
                <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                  Aktif
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Aktif Uçuş</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.activeFlights}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <i className="ri-user-add-line text-2xl text-orange-600"></i>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  +{dashboardStats.customerGrowth}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Yeni Müşteri</p>
              <p className="text-3xl font-bold text-gray-900">{dashboardStats.newCustomers}</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Sales Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Haftalık Satış Trendi</h3>
                  <p className="text-sm text-gray-500">Son 7 günün satış performansı</p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                  <i className="ri-line-chart-line text-xl text-red-600"></i>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={weeklySalesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      fontSize: '13px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Line type="monotone" dataKey="satis" stroke="#EF4444" strokeWidth={2} name="Satış Adedi" />
                  <Line type="monotone" dataKey="gelir" stroke="#F97316" strokeWidth={2} name="Gelir (₺)" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Occupancy Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Rota Doluluk Oranları</h3>
                  <p className="text-sm text-gray-500">Popüler rotaların doluluk durumu</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="ri-bar-chart-line text-xl text-green-600"></i>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="route" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      fontSize: '13px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '13px' }} />
                  <Bar dataKey="doluluk" fill="#10B981" name="Doluluk %" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Class & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Pie Chart */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Sınıf Bazlı Gelir</h3>
                  <p className="text-sm text-gray-500">Gelir dağılımı</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="ri-pie-chart-line text-xl text-purple-600"></i>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={revenueByClassData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {revenueByClassData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb', 
                      borderRadius: '12px',
                      fontSize: '13px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {revenueByClassData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <i className="ri-flight-takeoff-line text-xl text-red-600"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Uçuş Ekle</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <i className="ri-megaphone-line text-xl text-blue-600"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Kampanya Ekle</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <i className="ri-mail-line text-xl text-green-600"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Mesajlar</p>
                </button>
                <button className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-center">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                    <i className="ri-bar-chart-line text-xl text-purple-600"></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">Raporlar</p>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Son Rezervasyonlar</h3>
              <div className="space-y-3">
                {recentReservations.map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <i className="ri-user-line text-lg text-red-600"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.passenger}</p>
                          <p className="text-xs text-gray-500">{item.route} • PNR: {item.pnr}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${badge.color}`}>
                          {badge.text}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">₺{item.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Popüler Rotalar</h3>
              <div className="space-y-3">
                {popularRoutes.map((item, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.route}</p>
                      <span className="text-xs font-semibold text-gray-600">{item.count} uçuş</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{ width: `${item.percent}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}