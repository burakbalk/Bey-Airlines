import AdminGuard from '../../../components/admin/AdminGuard';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAdminStats } from '../../../hooks/useAdminStats';

export default function AdminDashboardPage() {
  const { stats, recentReservations, loading } = useAdminStats();

  const getStatusBadge = (status: string) => {
    const badges = {
      confirmed: { text: 'Onaylandı', color: 'bg-green-50 text-green-600' },
      pending: { text: 'Beklemede', color: 'bg-yellow-50 text-yellow-600' },
      cancelled: { text: 'İptal', color: 'bg-red-50 text-red-600' },
      'Onaylandı': { text: 'Onaylandı', color: 'bg-green-50 text-green-600' },
      'Beklemede': { text: 'Beklemede', color: 'bg-yellow-50 text-yellow-600' },
      'İptal': { text: 'İptal', color: 'bg-red-50 text-red-600' }
    };
    return badges[status as keyof typeof badges] || badges.confirmed;
  };

  if (loading) {
    return (
      <AdminGuard>
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
          </div>
        </AdminLayout>
      </AdminGuard>
    );
  }

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
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                  Toplam
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Rezervasyon</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalReservations.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  Toplam
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Gelir</p>
              <p className="text-3xl font-bold text-gray-900">₺{stats.totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="ri-flight-takeoff-line text-2xl text-purple-600"></i>
                </div>
                <span className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                  Bugün: {stats.todayFlights}
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Uçuş</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalFlights}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <i className="ri-user-add-line text-2xl text-orange-600"></i>
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  Toplam
                </span>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Yolcu</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalPassengers}</p>
            </div>
          </div>

          {/* Extra Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                  <i className="ri-mail-unread-line text-2xl text-red-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Okunmamış Mesajlar</p>
              <p className="text-3xl font-bold text-gray-900">{stats.unreadMessages}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                  <i className="ri-megaphone-line text-2xl text-amber-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Aktif Kampanyalar</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeCampaigns}</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <i className="ri-calendar-check-line text-2xl text-indigo-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Bugünkü Uçuşlar</p>
              <p className="text-3xl font-bold text-gray-900">{stats.todayFlights}</p>
            </div>
          </div>

          {/* Quick Actions & Recent Reservations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Hızlı İşlemler</h3>
              <div className="grid grid-cols-2 gap-4">
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

            {/* Recent Reservations */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Son Rezervasyonlar</h3>
              <div className="space-y-3">
                {recentReservations.slice(0, 6).map((item) => {
                  const badge = getStatusBadge(item.status);
                  return (
                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                          <i className="ri-user-line text-lg text-red-600"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{item.contact_email}</p>
                          <p className="text-xs text-gray-500">{item.route} • PNR: {item.pnr}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-semibold px-2 py-1 rounded-lg whitespace-nowrap ${badge.color}`}>
                          {badge.text}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">₺{Number(item.total_price).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}