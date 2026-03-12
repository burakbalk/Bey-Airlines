import { useState } from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminLayout from '../../../components/admin/AdminLayout';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { monthlyRevenueData, dailyOccupancyTrend, occupancyData, weeklySalesData } from '../../../mocks/adminStats';

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-12-31'
  });

  const [activeTab, setActiveTab] = useState<'revenue' | 'occupancy' | 'sales'>('revenue');

  const summaryStats = {
    totalRevenue: 4247000,
    avgOccupancy: 81,
    totalFlights: 1247,
    totalPassengers: 156890
  };

  return (
    <AdminGuard>
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Raporlar & Analitik 📊</h1>
                <p className="text-purple-100">Detaylı performans raporları ve istatistikler</p>
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
                <span className="font-semibold text-gray-900">Tarih Aralığı:</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-gray-400">—</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button className="ml-auto px-6 py-2 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors cursor-pointer whitespace-nowrap">
                <i className="ri-download-line mr-2"></i>
                Rapor İndir
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
              <p className="text-3xl font-bold text-gray-900">₺{summaryStats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">Yıllık toplam</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                  <i className="ri-percent-line text-2xl text-blue-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Ortalama Doluluk</p>
              <p className="text-3xl font-bold text-gray-900">%{summaryStats.avgOccupancy}</p>
              <p className="text-xs text-blue-600 mt-2">Tüm uçuşlar</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                  <i className="ri-flight-takeoff-line text-2xl text-purple-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Uçuş</p>
              <p className="text-3xl font-bold text-gray-900">{summaryStats.totalFlights.toLocaleString()}</p>
              <p className="text-xs text-purple-600 mt-2">Gerçekleşen</p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                  <i className="ri-user-line text-2xl text-orange-600"></i>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Toplam Yolcu</p>
              <p className="text-3xl font-bold text-gray-900">{summaryStats.totalPassengers.toLocaleString()}</p>
              <p className="text-xs text-orange-600 mt-2">Taşınan yolcu</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('revenue')}
                className={`flex-1 px-6 py-4 font-semibold transition-colors cursor-pointer ${
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
                className={`flex-1 px-6 py-4 font-semibold transition-colors cursor-pointer ${
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
                className={`flex-1 px-6 py-4 font-semibold transition-colors cursor-pointer ${
                  activeTab === 'sales'
                    ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <i className="ri-line-chart-line mr-2"></i>
                Satış Trendi
              </button>
            </div>

            <div className="p-6">
              {/* Revenue Report */}
              {activeTab === 'revenue' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aylık Gelir Trendi</h3>
                    <p className="text-sm text-gray-500 mb-6">Gerçekleşen gelir vs hedef karşılaştırması</p>
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
                        <Area type="monotone" dataKey="gelir" stroke="#10B981" fillOpacity={1} fill="url(#colorGelir)" name="Gerçekleşen (₺)" />
                        <Area type="monotone" dataKey="hedef" stroke="#6366F1" fillOpacity={1} fill="url(#colorHedef)" name="Hedef (₺)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Revenue Table */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ay</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Gerçekleşen</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Hedef</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Fark</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Başarı</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthlyRevenueData.map((item, index) => {
                          const diff = item.gelir - item.hedef;
                          const success = ((item.gelir / item.hedef) * 100).toFixed(1);
                          return (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.month}</td>
                              <td className="px-6 py-4 text-sm text-right text-gray-900">₺{item.gelir.toLocaleString()}</td>
                              <td className="px-6 py-4 text-sm text-right text-gray-600">₺{item.hedef.toLocaleString()}</td>
                              <td className={`px-6 py-4 text-sm text-right font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {diff >= 0 ? '+' : ''}₺{diff.toLocaleString()}
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
                </div>
              )}

              {/* Occupancy Report */}
              {activeTab === 'occupancy' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Günlük Doluluk Trendi</h3>
                    <p className="text-sm text-gray-500 mb-6">Son 15 günün doluluk oranı</p>
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
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Rota Bazlı Doluluk</h3>
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
                  </div>
                </div>
              )}

              {/* Sales Trend */}
              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Haftalık Satış Performansı</h3>
                    <p className="text-sm text-gray-500 mb-6">Satış adedi ve gelir karşılaştırması</p>
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
                        <Bar yAxisId="left" dataKey="satis" fill="#EF4444" name="Satış Adedi" radius={[8, 8, 0, 0]} />
                        <Bar yAxisId="right" dataKey="gelir" fill="#F97316" name="Gelir (₺)" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Sales Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                          <i className="ri-shopping-cart-line text-xl text-white"></i>
                        </div>
                        <span className="text-xs font-semibold text-red-600 bg-white px-2 py-1 rounded-lg">
                          Haftalık
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mb-1">Toplam Satış</p>
                      <p className="text-2xl font-bold text-red-900">467 Bilet</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center">
                          <i className="ri-money-dollar-circle-line text-xl text-white"></i>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-white px-2 py-1 rounded-lg">
                          Haftalık
                        </span>
                      </div>
                      <p className="text-sm text-orange-700 mb-1">Toplam Gelir</p>
                      <p className="text-2xl font-bold text-orange-900">₺134,500</p>
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
                      <p className="text-sm text-green-700 mb-1">Bilet Başı Gelir</p>
                      <p className="text-2xl font-bold text-green-900">₺288</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </AdminGuard>
  );
}