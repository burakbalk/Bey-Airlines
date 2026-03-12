import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminGuard from '../../../components/admin/AdminGuard';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  registrationDate: string;
  totalFlights: number;
  status: 'Aktif' | 'Askıda';
  reservations: Array<{
    pnr: string;
    route: string;
    date: string;
    amount: string;
    status: string;
  }>;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 532 123 4567',
    registrationDate: '15 Ocak 2024',
    totalFlights: 12,
    status: 'Aktif',
    reservations: [
      { pnr: 'BEY123', route: 'İstanbul → Dubai', date: '15 Mayıs 2025', amount: '12.500 TL', status: 'Onaylandı' },
      { pnr: 'BEY098', route: 'Dubai → Ankara', date: '10 Nisan 2025', amount: '3.699 TL', status: 'Tamamlandı' },
    ],
  },
  {
    id: '2',
    name: 'Mehmet Kaya',
    email: 'mehmet.kaya@email.com',
    phone: '+90 533 987 6543',
    registrationDate: '20 Şubat 2024',
    totalFlights: 8,
    status: 'Aktif',
    reservations: [
      { pnr: 'BEY456', route: 'Ankara → Dubai', date: '20 Mayıs 2025', amount: '3.699 TL', status: 'Beklemede' },
    ],
  },
  {
    id: '3',
    name: 'Zeynep Demir',
    email: 'zeynep.demir@email.com',
    phone: '+90 534 555 4444',
    registrationDate: '5 Mart 2024',
    totalFlights: 15,
    status: 'Aktif',
    reservations: [
      { pnr: 'BEY789', route: 'Dubai → İzmir', date: '25 Mayıs 2025', amount: '5.400 TL', status: 'Onaylandı' },
    ],
  },
  {
    id: '4',
    name: 'Ali Özkan',
    email: 'ali.ozkan@email.com',
    phone: '+90 535 111 2222',
    registrationDate: '12 Nisan 2024',
    totalFlights: 5,
    status: 'Askıda',
    reservations: [
      { pnr: 'BEY321', route: 'İstanbul → Dubai', date: '28 Mayıs 2025', amount: '8.750 TL', status: 'İptal' },
    ],
  },
  {
    id: '5',
    name: 'Fatma Şahin',
    email: 'fatma.sahin@email.com',
    phone: '+90 536 777 8888',
    registrationDate: '8 Mayıs 2024',
    totalFlights: 6,
    status: 'Aktif',
    reservations: [
      { pnr: 'BEY654', route: 'Dubai → İstanbul', date: '30 Mayıs 2025', amount: '3.499 TL', status: 'Onaylandı' },
    ],
  },
];

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tümü' | 'Aktif' | 'Askıda'>('Tümü');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'suspend' | 'activate'; id: string } | null>(null);

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'Tümü' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'Aktif' | 'Askıda') => {
    setCustomers((prev) =>
      prev.map((customer) => (customer.id === id ? { ...customer, status: newStatus } : customer))
    );
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const openConfirmModal = (type: 'suspend' | 'activate', id: string) => {
    setConfirmAction({ type, id });
    setShowConfirmModal(true);
  };

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === 'Aktif').length,
    suspended: customers.filter((c) => c.status === 'Askıda').length,
    totalFlights: customers.reduce((sum, c) => sum + c.totalFlights, 0),
  };

  return (
    <AdminGuard>
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
              { label: 'Aktif Müşteri', value: stats.active, icon: 'user-smile-line', color: 'bg-green-100 text-green-600' },
              { label: 'Askıda', value: stats.suspended, icon: 'user-forbid-line', color: 'bg-red-100 text-red-600' },
              { label: 'Toplam Uçuş', value: stats.totalFlights.toLocaleString('tr-TR'), icon: 'flight-takeoff-line', color: 'bg-amber-100 text-amber-600' },
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
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(['Tümü', 'Aktif', 'Askıda'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap cursor-pointer ${
                      statusFilter === status
                        ? 'bg-red-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Toplam Uçuş</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <i className="ri-user-line text-lg text-red-600"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{customer.name}</p>
                            <p className="text-xs text-gray-500">ID: {customer.id}</p>
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
                        <span className="text-sm font-semibold text-gray-900">{customer.totalFlights}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${
                          customer.status === 'Aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setShowDetailModal(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                            title="Detaylar"
                          >
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                          {customer.status === 'Aktif' ? (
                            <button
                              onClick={() => openConfirmModal('suspend', customer.id)}
                              className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors cursor-pointer"
                              title="Askıya Al"
                            >
                              <i className="ri-forbid-line text-sm"></i>
                            </button>
                          ) : (
                            <button
                              onClick={() => openConfirmModal('activate', customer.id)}
                              className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors cursor-pointer"
                              title="Aktif Et"
                            >
                              <i className="ri-check-line text-sm"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
                    { label: 'Toplam Uçuş', value: selectedCustomer.totalFlights },
                    { label: 'Durum', value: selectedCustomer.status },
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
                    {selectedCustomer.reservations.map((reservation, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{reservation.route}</p>
                          <p className="text-sm text-gray-500">PNR: {reservation.pnr} • {reservation.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{reservation.amount}</p>
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
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && confirmAction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowConfirmModal(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <div className="text-center mb-6">
                <div className={`w-16 h-16 ${confirmAction.type === 'activate' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`ri-${confirmAction.type === 'activate' ? 'check' : 'forbid'}-line text-3xl ${confirmAction.type === 'activate' ? 'text-green-600' : 'text-red-600'}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmAction.type === 'activate' ? 'Hesabı Aktif Et' : 'Hesabı Askıya Al'}
                </h3>
                <p className="text-gray-600">
                  {confirmAction.type === 'activate'
                    ? 'Bu müşteri hesabını aktif etmek istediğinizden emin misiniz?'
                    : 'Bu müşteri hesabını askıya almak istediğinizden emin misiniz? Müşteri giriş yapamayacak ve rezervasyon oluşturamayacak.'}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  onClick={() => handleStatusChange(confirmAction.id, confirmAction.type === 'activate' ? 'Aktif' : 'Askıda')}
                  className={`flex-1 py-3 ${confirmAction.type === 'activate' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl transition-colors font-medium whitespace-nowrap cursor-pointer`}
                >
                  {confirmAction.type === 'activate' ? 'Aktif Et' : 'Askıya Al'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
