import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { logger } from '../../../utils/logger';

const ITEMS_PER_PAGE = 20;

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  role: string | null;
  created_at: string;
}

interface CustomerDisplay {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  totalReservations: number;
  role: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'Tümü' | 'user' | 'admin'>('Tümü');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDisplay | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [customerReservations, setCustomerReservations] = useState<{ id: string; pnr: string; route: string; flight_date: string; total_price: number; status: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, phone, birth_date, role, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw new Error(profilesError.message);
      if (!profiles) { setLoading(false); return; }

      // Reservation sayısı için COUNT aggregate — tüm satırları çekmek yerine
      const { data: reservationCounts, error: countError } = await supabase
        .from('reservations')
        .select('user_id')
        .not('user_id', 'is', null)
        .limit(5000);

      if (countError) throw new Error(countError.message);

      const countMap: Record<string, number> = {};
      if (reservationCounts) {
        reservationCounts.forEach((r: { user_id: string | null }) => {
          if (r.user_id) {
            countMap[r.user_id] = (countMap[r.user_id] || 0) + 1;
          }
        });
      }

      const customerList: CustomerDisplay[] = profiles.map((p: Profile) => ({
        id: p.id,
        name: [p.first_name, p.last_name].filter(Boolean).join(' ') || 'İsimsiz Kullanıcı',
        email: '-',
        phone: p.phone || '-',
        registrationDate: new Date(p.created_at).toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        totalReservations: countMap[p.id] || 0,
        role: p.role || 'user',
      }));

      // E-posta bilgisini reservations'dan çek (sadece gerekli kolonlar)
      const { data: emailData } = await supabase
        .from('reservations')
        .select('user_id, contact_email')
        .not('user_id', 'is', null)
        .not('contact_email', 'is', null)
        .limit(5000);

      const emailMap: Record<string, string> = {};
      if (emailData) {
        emailData.forEach((r: { user_id: string | null; contact_email: string | null }) => {
          if (r.user_id && r.contact_email && !emailMap[r.user_id]) {
            emailMap[r.user_id] = r.contact_email;
          }
        });
      }

      customerList.forEach(c => {
        if (emailMap[c.id]) c.email = emailMap[c.id];
      });

      setCustomers(customerList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Müşteriler yüklenirken hata oluştu';
      logger.error('[fetchCustomers]', message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesRole = roleFilter === 'Tümü' || customer.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE));
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewDetail = async (customer: CustomerDisplay) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);

    // Fetch reservations for this customer
    const { data } = await supabase
      .from('reservations')
      .select('*')
      .eq('user_id', customer.id)
      .order('created_at', { ascending: false });

    setCustomerReservations(data || []);
  };

  const stats = {
    total: customers.length,
    users: customers.filter((c) => c.role === 'user').length,
    admins: customers.filter((c) => c.role === 'admin').length,
    totalReservations: customers.reduce((sum, c) => sum + c.totalReservations, 0),
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Müşteri Yönetimi</h1>
              <p className="text-gray-500 text-sm mt-1">Kayıtlı müşterileri görüntüleyin ve yönetin</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Toplam Müşteri', value: stats.total, icon: 'group-line', color: 'bg-blue-100 text-blue-600' },
              { label: 'Kullanıcılar', value: stats.users, icon: 'user-smile-line', color: 'bg-green-100 text-green-600' },
              { label: 'Adminler', value: stats.admins, icon: 'shield-user-line', color: 'bg-red-100 text-red-600' },
              { label: 'Toplam Rezervasyon', value: stats.totalReservations.toLocaleString('tr-TR'), icon: 'flight-takeoff-line', color: 'bg-amber-100 text-amber-600' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <i className={`ri-${stat.icon} text-xl`}></i>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                  <input
                    type="text"
                    placeholder="Ad, e-posta veya telefon ile ara..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(['Tümü', 'user', 'admin'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => { setRoleFilter(role); setCurrentPage(1); }}
                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                      roleFilter === role
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {role === 'Tümü' ? 'Tümü' : role === 'user' ? 'Kullanıcı' : 'Admin'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Müşteri</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">İletişim</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Kayıt Tarihi</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rezervasyon</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-user-line text-lg text-red-600"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">ID: {customer.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{customer.email}</p>
                          <p className="text-xs text-gray-500">{customer.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{customer.registrationDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{customer.totalReservations}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          customer.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {customer.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetail(customer)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                            title="Detaylar"
                          >
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredCustomers.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Toplam <span className="font-semibold text-gray-900">{filteredCustomers.length}</span> kayıt,{' '}
                  <span className="font-semibold text-gray-900">{currentPage}</span> / {totalPages} sayfa
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-left-s-line text-lg"></i>
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                    return start + i;
                  }).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        page === currentPage ? 'bg-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    <i className="ri-arrow-right-s-line text-lg"></i>
                  </button>
                </div>
              </div>
            )}
            {filteredCustomers.length === 0 && (
              <div className="text-center py-16">
                <i className="ri-group-line text-6xl text-gray-300 block mb-4"></i>
                <p className="text-gray-500 text-lg font-medium mb-1">Müşteri bulunamadı</p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchQuery || roleFilter !== 'Tümü'
                    ? 'Arama veya filtre kriterlerinize uygun müşteri yok.'
                    : 'Henüz kayıtlı müşteri bulunmuyor.'}
                </p>
                {(searchQuery || roleFilter !== 'Tümü') && (
                  <button
                    onClick={() => { setSearchQuery(''); setRoleFilter('Tümü'); }}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors cursor-pointer"
                  >
                    Filtreyi Temizle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedCustomer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <i className="ri-user-line text-3xl"></i>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">{selectedCustomer.name}</h2>
                      <p className="text-red-200 text-sm">{selectedCustomer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'Kayıt Tarihi', value: selectedCustomer.registrationDate },
                    { label: 'Toplam Rezervasyon', value: selectedCustomer.totalReservations },
                    { label: 'Rol', value: selectedCustomer.role === 'admin' ? 'Admin' : 'Kullanıcı' },
                    { label: 'Telefon', value: selectedCustomer.phone },
                  ].map((item, idx) => (
                    <div key={idx}>
                      <p className="text-red-200 text-xs mb-1">{item.label}</p>
                      <p className="text-lg font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Rezervasyon Geçmişi</h3>
                  <div className="space-y-3">
                    {customerReservations.length > 0 ? (
                      customerReservations.map((reservation, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-gray-900">{reservation.route}</p>
                            <p className="text-sm text-gray-500">PNR: {reservation.pnr} • {reservation.flight_date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">₺{Number(reservation.total_price).toLocaleString()}</p>
                            <span className={`text-xs px-2 py-1 rounded-lg ${
                              reservation.status === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                              reservation.status === 'Beklemede' ? 'bg-amber-100 text-amber-800' :
                              reservation.status === 'Tamamlandı' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {reservation.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Henüz rezervasyon bulunmuyor.</p>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
}
