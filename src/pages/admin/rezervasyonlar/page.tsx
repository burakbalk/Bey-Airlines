import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminGuard from '../../../components/admin/AdminGuard';

interface Reservation {
  id: string;
  pnr: string;
  passengerName: string;
  route: string;
  flightNumber: string;
  date: string;
  time: string;
  amount: string;
  status: 'Onaylandı' | 'Beklemede' | 'İptal';
  passengers: Array<{
    name: string;
    surname: string;
    tcNo: string;
    birthDate: string;
    seat: string;
  }>;
  contact: {
    email: string;
    phone: string;
  };
  baggage: string[];
  payment: {
    method: string;
    cardLast4?: string;
    transactionId: string;
  };
  class: string;

}

const mockReservations: Reservation[] = [
  {
    id: '1',
    pnr: 'BEY123',
    passengerName: 'Ahmet Yılmaz',
    route: 'İstanbul → Dubai',
    flightNumber: 'BY101',
    date: '15 Mayıs 2025',
    time: '14:30',
    amount: '12.500 TL',
    status: 'Onaylandı',
    passengers: [
      { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', seat: '12A' },
      { name: 'Ayşe', surname: 'Yılmaz', tcNo: '98765432109', birthDate: '20.08.1988', seat: '12B' },
    ],
    contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
    baggage: ['2 x 30 kg Bagaj', 'El Bagajı'],
    payment: { method: 'Kredi Kartı', cardLast4: '4532', transactionId: 'TRX123456789' },
    class: 'VIP',
  },
  {
    id: '2',
    pnr: 'BEY456',
    passengerName: 'Mehmet Kaya',
    route: 'Ankara → İstanbul',
    flightNumber: 'BY205',
    date: '20 Mayıs 2025',
    time: '09:15',
    amount: '1.250 TL',
    status: 'Beklemede',
    passengers: [
      { name: 'Mehmet', surname: 'Kaya', tcNo: '11122233344', birthDate: '10.03.1990', seat: '8C' },
    ],
    contact: { email: 'mehmet.kaya@email.com', phone: '+90 533 987 6543' },
    baggage: ['1 x 20 kg Bagaj'],
    payment: { method: 'Havale/EFT', transactionId: 'TRX987654321' },
    class: 'Normal',
  },
  {
    id: '3',
    pnr: 'BEY789',
    passengerName: 'Zeynep Demir',
    route: 'İzmir → Ankara',
    flightNumber: 'BY308',
    date: '25 Mayıs 2025',
    time: '16:45',
    amount: '2.100 TL',
    status: 'Onaylandı',
    passengers: [
      { name: 'Zeynep', surname: 'Demir', tcNo: '55566677788', birthDate: '05.12.1992', seat: '15F' },
      { name: 'Can', surname: 'Demir', tcNo: '99988877766', birthDate: '15.07.2015', seat: '15E' },
    ],
    contact: { email: 'zeynep.demir@email.com', phone: '+90 534 555 4444' },
    baggage: ['2 x 20 kg Bagaj'],
    payment: { method: 'Kredi Kartı', cardLast4: '8765', transactionId: 'TRX555666777' },
    class: 'Normal',
  },
  {
    id: '4',
    pnr: 'BEY321',
    passengerName: 'Ali Özkan',
    route: 'İstanbul → Londra',
    flightNumber: 'BY450',
    date: '28 Mayıs 2025',
    time: '22:00',
    amount: '8.750 TL',
    status: 'İptal',
    passengers: [
      { name: 'Ali', surname: 'Özkan', tcNo: '44455566677', birthDate: '22.09.1987', seat: '5A' },
    ],
    contact: { email: 'ali.ozkan@email.com', phone: '+90 535 111 2222' },
    baggage: ['1 x 30 kg Bagaj', 'El Bagajı'],
    payment: { method: 'Kredi Kartı', cardLast4: '1234', transactionId: 'TRX111222333' },
    class: 'VIP',
  },
  {
    id: '5',
    pnr: 'BEY654',
    passengerName: 'Fatma Şahin',
    route: 'Antalya → İstanbul',
    flightNumber: 'BY512',
    date: '30 Mayıs 2025',
    time: '11:30',
    amount: '1.850 TL',
    status: 'Onaylandı',
    passengers: [
      { name: 'Fatma', surname: 'Şahin', tcNo: '33344455566', birthDate: '18.04.1995', seat: '20D' },
    ],
    contact: { email: 'fatma.sahin@email.com', phone: '+90 536 777 8888' },
    baggage: ['1 x 20 kg Bagaj'],
    payment: { method: 'Kredi Kartı', cardLast4: '5678', transactionId: 'TRX444555666' },
    class: 'Normal',
  },
];

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tümü' | 'Onaylandı' | 'Beklemede' | 'İptal'>('Tümü');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'cancel'; id: string } | null>(null);

  const filteredReservations = reservations.filter((res) => {
    const matchesSearch =
      res.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.flightNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Tümü' || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id: string, newStatus: 'Onaylandı' | 'İptal') => {
    setReservations((prev) =>
      prev.map((res) => (res.id === id ? { ...res, status: newStatus } : res))
    );
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
      case 'İptal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: reservations.length,
    confirmed: reservations.filter((r) => r.status === 'Onaylandı').length,
    pending: reservations.filter((r) => r.status === 'Beklemede').length,
    cancelled: reservations.filter((r) => r.status === 'İptal').length,
  };

  return (
    <AdminGuard>
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
              { label: 'İptal', value: stats.cancelled, icon: 'close-circle-line', color: 'bg-red-100 text-red-600' },
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
                    placeholder="PNR, yolcu adı veya uçuş numarası ile ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(['Tümü', 'Onaylandı', 'Beklemede', 'İptal'] as const).map((status) => (
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
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900 text-sm">{reservation.pnr}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{reservation.passengerName}</p>
                          <p className="text-xs text-gray-500">{reservation.contact.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">{reservation.route}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{reservation.flightNumber}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm text-gray-900">{reservation.date}</p>
                          <p className="text-xs text-gray-500">{reservation.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-gray-900">{reservation.amount}</span>
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
                    <p className="text-3xl font-bold">{selectedReservation.route.split(' → ')[0]}</p>
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
                    <p className="text-3xl font-bold">{selectedReservation.route.split(' → ')[1]}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Yolcu Bilgileri</h3>
                  <div className="space-y-3">
                    {selectedReservation.passengers.map((passenger, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-gray-900">{passenger.name} {passenger.surname}</p>
                          <p className="text-sm text-gray-500">TC: {passenger.tcNo} • Doğum: {passenger.birthDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Koltuk</p>
                          <p className="font-bold text-red-600 text-lg">{passenger.seat}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">İletişim</h3>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-700"><i className="ri-mail-line mr-2 text-red-600"></i>{selectedReservation.contact.email}</p>
                      <p className="text-sm text-gray-700"><i className="ri-phone-line mr-2 text-red-600"></i>{selectedReservation.contact.phone}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Bagaj</h3>
                    <div className="space-y-2">
                      {selectedReservation.baggage.map((bag, idx) => (
                        <p key={idx} className="text-sm text-gray-700"><i className="ri-luggage-cart-line mr-2 text-red-600"></i>{bag}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Ödeme Bilgileri</h3>
                  <div className="p-4 bg-gray-50 rounded-xl space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ödeme Yöntemi:</span>
                      <span className="font-medium text-gray-900">{selectedReservation.payment.method}</span>
                    </div>
                    {selectedReservation.payment.cardLast4 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Kart:</span>
                        <span className="font-medium text-gray-900">**** **** **** {selectedReservation.payment.cardLast4}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">İşlem No:</span>
                      <span className="font-medium text-gray-900">{selectedReservation.payment.transactionId}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-600">Toplam Tutar:</span>
                      <span className="font-bold text-red-600 text-lg">{selectedReservation.amount}</span>
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
                  onClick={() => handleStatusChange(confirmAction.id, confirmAction.type === 'approve' ? 'Onaylandı' : 'İptal')}
                  className={`flex-1 py-3 ${confirmAction.type === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white rounded-xl transition-colors font-medium whitespace-nowrap cursor-pointer`}
                >
                  {confirmAction.type === 'approve' ? 'Onayla' : 'İptal Et'}
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
