import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAdminReservations, Reservation } from '../../../hooks/useReservations';

const ITEMS_PER_PAGE = 20;

export default function AdminReservationsPage() {
  const { reservations, loading, updateStatus } = useAdminReservations();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tümü' | 'Onaylandı' | 'Beklemede' | 'İptal Edildi'>('Tümü');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'cancel'; id: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.contact_email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.flight_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Tümü' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredReservations.length / ITEMS_PER_PAGE));
  const paginatedReservations = filteredReservations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleStatusChange = async (id: string, newStatus: 'Onaylandı' | 'İptal Edildi') => {
    await updateStatus(id, newStatus);
    setShowConfirmModal(false);
    setConfirmAction(null);
  };

  const openConfirmModal = (type: 'approve' | 'cancel', id: string) => {
    setConfirmAction({ type, id });
    setShowConfirmModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Onaylandı':
        return 'bg-green-100 text-green-800';
      case 'Beklemede':
        return 'bg-amber-100 text-amber-800';
      case 'İptal Edildi':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'Onaylandı').length,
    pending: reservations.filter((r) => r.status === 'Beklemede').length,
    cancelled: reservations.filter((r) => r.status === 'İptal Edildi').length,
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
              <h1 className="text-2xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
              <p className="text-gray-500 text-sm mt-1">Tüm rezervasyonları görüntüleyin ve yönetin</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Toplam Rezervasyon', value: stats.total, icon: 'file-list-3-line', color: 'bg-blue-100 text-blue-600' },
              { label: 'Onaylandı', value: stats.confirmed, icon: 'checkbox-circle-line', color: 'bg-green-100 text-green-600' },
              { label: 'Beklemede', value: stats.pending, icon: 'time-line', color: 'bg-amber-100 text-amber-600' },
              { label: 'İptal Edildi', value: stats.cancelled, icon: 'close-circle-line', color: 'bg-red-100 text-red-600' },
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
                    placeholder="PNR, e-posta veya uçuş numarası ile ara..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(['Tümü', 'Onaylandı', 'Beklemede', 'İptal Edildi'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => { setStatusFilter(status); setCurrentPage(1); }}
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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">PNR</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Yolcu</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Rota</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Uçuş No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tarih</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Tutar</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 text-sm">{reservation.pnr}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {reservation.passengers && reservation.passengers.length > 0
                              ? `${reservation.passengers[0].first_name} ${reservation.passengers[0].last_name}`
                              : reservation.contact_email}
                          </p>
                          <p className="text-xs text-gray-500">{reservation.contact_email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{reservation.route}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{reservation.flight_number}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{reservation.flight_date}</p>
                          <p className="text-xs text-gray-500">{reservation.flight_time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">₺{Number(reservation.total_price).toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedReservation(reservation);
                              setShowDetailModal(true);
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors cursor-pointer"
                            title="Detaylar"
                          >
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                          {reservation.status === 'Beklemede' && (
                            <>
                              <button
                                onClick={() => openConfirmModal('approve', reservation.id)}
                                className="w-8 h-8 flex items-center justify-center bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors cursor-pointer"
                                title="Onayla"
                              >
                                <i className="ri-check-line text-sm"></i>
                              </button>
                              <button
                                onClick={() => openConfirmModal('cancel', reservation.id)}
                                className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors cursor-pointer"
                                title="İptal Et"
                              >
                                <i className="ri-close-line text-sm"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredReservations.length > 0 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Toplam <span className="font-semibold text-gray-900">{filteredReservations.length}</span> kayıt,{' '}
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
            {filteredReservations.length === 0 && (
              <div className="text-center py-16">
                <i className="ri-file-list-3-line text-6xl text-gray-300 block mb-4"></i>
                <p className="text-gray-500 text-lg font-medium mb-1">Rezervasyon bulunamadı</p>
                <p className="text-gray-400 text-sm mb-4">
                  {searchQuery || statusFilter !== 'Tümü'
                    ? 'Arama veya filtre kriterlerinize uygun rezervasyon yok.'
                    : 'Henüz hiç rezervasyon bulunmuyor.'}
                </p>
                {(searchQuery || statusFilter !== 'Tümü') && (
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('Tümü'); }}
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
        {showDetailModal && selectedReservation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-red-600 to-red-700 p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <i className="ri-flight-takeoff-fill text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-red-200 text-xs">Rezervasyon Detayı</p>
                      <p className="text-lg font-bold">PNR: {selectedReservation.pnr}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-red-200 text-xs mb-1">Kalkış</p>
                    <p className="text-3xl font-bold">{selectedReservation.route.split(' → ')[0] || selectedReservation.route.split('→')[0]}</p>
                  </div>
                  <div className="flex-1 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-px bg-white/30 flex-1"></div>
                      <i className="ri-plane-fill text-xl"></i>
                      <div className="h-px bg-white/30 flex-1"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-xs mb-1">Varış</p>
                    <p className="text-3xl font-bold">{selectedReservation.route.split(' → ')[1] || selectedReservation.route.split('→')[1]}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Yolcu Bilgileri</h3>
                  <div className="space-y-3">
                    {selectedReservation.passengers && selectedReservation.passengers.length > 0 ? (
                      selectedReservation.passengers.map((passenger, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-semibold text-gray-900">{passenger.first_name} {passenger.last_name}</p>
                            <p className="text-sm text-gray-500">TC: {passenger.tc_no} • Doğum: {passenger.birth_date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Koltuk</p>
                            <p className="font-bold text-red-600 text-lg">{passenger.seat_number || '-'}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">Yolcu bilgisi bulunamadı.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">İletişim</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700"><i className="ri-mail-line mr-2 text-red-600"></i>{selectedReservation.contact_email}</p>
                      <p className="text-sm text-gray-700"><i className="ri-phone-line mr-2 text-red-600"></i>{selectedReservation.contact_phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Uçuş Bilgileri</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700"><i className="ri-flight-takeoff-line mr-2 text-red-600"></i>{selectedReservation.flight_number}</p>
                      <p className="text-sm text-gray-700"><i className="ri-calendar-line mr-2 text-red-600"></i>{selectedReservation.flight_date} - {selectedReservation.flight_time}</p>
                      <p className="text-sm text-gray-700"><i className="ri-vip-crown-line mr-2 text-red-600"></i>{selectedReservation.flight_class}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Ödeme Bilgileri</h3>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ödeme Yöntemi:</span>
                      <span className="font-medium text-gray-900">{selectedReservation.payment_method || '-'}</span>
                    </div>
                    {selectedReservation.payment_card_last4 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kart:</span>
                        <span className="font-medium text-gray-900">**** **** **** {selectedReservation.payment_card_last4}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Toplam Tutar:</span>
                      <span className="font-bold text-red-600 text-lg">₺{Number(selectedReservation.total_price).toLocaleString()}</span>
                    </div>
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
                <div className={`w-16 h-16 ${confirmAction.type === 'approve' ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <i className={`ri-${confirmAction.type === 'approve' ? 'check' : 'close'}-line text-3xl ${confirmAction.type === 'approve' ? 'text-green-600' : 'text-red-600'}`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {confirmAction.type === 'approve' ? 'Rezervasyonu Onayla' : 'Rezervasyonu İptal Et'}
                </h3>
                <p className="text-gray-600">
                  {confirmAction.type === 'approve'
                    ? 'Bu rezervasyonu onaylamak istediğinizden emin misiniz?'
                    : 'Bu rezervasyonu iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz.'}
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
                  onClick={() => handleStatusChange(confirmAction.id, confirmAction.type === 'approve' ? 'Onaylandı' : 'İptal Edildi')}
                  className={`flex-1 py-3 ${confirmAction.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl transition-colors font-medium whitespace-nowrap cursor-pointer`}
                >
                  {confirmAction.type === 'approve' ? 'Onayla' : 'İptal Et'}
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
}
