
import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import AdminGuard from '../../../components/admin/AdminGuard';
import { useAllFlights, FlightResult } from '../../../hooks/useFlights';
import { supabase } from '../../../lib/supabase';

export default function AdminFlightsPage() {
  const { flights, loading, refresh } = useAllFlights();

  const [showModal, setShowModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightResult | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tümü');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    flight_number: '',
    from_city: '',
    to_city: '',
    from_code: '',
    to_code: '',
    flight_date: '',
    departure_time: '',
    arrival_time: '',
    capacity: 180,
    price: 0,
    flight_class: 'Ekonomi',
  });

  // ---------- Modal handling ----------
  const handleAdd = () => {
    setEditingFlight(null);
    setFormData({
      flight_number: '',
      from_city: '',
      to_city: '',
      from_code: '',
      to_code: '',
      flight_date: '',
      departure_time: '',
      arrival_time: '',
      capacity: 180,
      price: 0,
      flight_class: 'Ekonomi',
    });
    setShowModal(true);
  };

  const handleEdit = (flight: FlightResult) => {
    setEditingFlight(flight);
    setFormData({
      flight_number: flight.flight_number,
      from_city: flight.from_city,
      to_city: flight.to_city,
      from_code: flight.from_code,
      to_code: flight.to_code,
      flight_date: flight.flight_date,
      departure_time: flight.departure_time,
      arrival_time: flight.arrival_time,
      capacity: flight.capacity,
      price: flight.price,
      flight_class: flight.flight_class,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.flight_number || !formData.from_city || !formData.to_city) {
      alert('Uçuş numarası, kalkış ve varış havalimanı zorunludur.');
      return;
    }

    if (editingFlight) {
      await supabase
        .from('flights')
        .update({
          flight_number: formData.flight_number,
          from_city: formData.from_city,
          to_city: formData.to_city,
          from_code: formData.from_code,
          to_code: formData.to_code,
          flight_date: formData.flight_date,
          departure_time: formData.departure_time,
          arrival_time: formData.arrival_time,
          capacity: formData.capacity,
          price: formData.price,
          flight_class: formData.flight_class,
        })
        .eq('id', editingFlight.id);
    } else {
      await supabase.from('flights').insert({
        flight_number: formData.flight_number,
        from_city: formData.from_city,
        to_city: formData.to_city,
        from_code: formData.from_code,
        to_code: formData.to_code,
        flight_date: formData.flight_date,
        departure_time: formData.departure_time,
        arrival_time: formData.arrival_time,
        capacity: formData.capacity,
        price: formData.price,
        flight_class: formData.flight_class,
        status: 'Aktif',
        booked_seats: 0,
      });
    }
    await refresh();
    setShowModal(false);
  };

  // ---------- Delete handling ----------
  const handleDelete = async (id: number) => {
    await supabase.from('flights').delete().eq('id', id);
    await refresh();
    setShowDeleteConfirm(null);
  };

  // ---------- Status change ----------
  const handleStatusChange = async (id: number, status: string) => {
    await supabase.from('flights').update({ status }).eq('id', id);
    await refresh();
  };

  // ---------- Filtering ----------
  const statusMap: Record<string, string> = {
    'Aktif': 'Aktif',
    'İptal': 'İptal',
    'Gecikti': 'Gecikti',
  };

  const filteredFlights = flights.filter((f) => {
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch =
      f.flight_number.toLowerCase().includes(lowerSearch) ||
      f.from_city.toLowerCase().includes(lowerSearch) ||
      f.to_city.toLowerCase().includes(lowerSearch) ||
      f.from_code.toLowerCase().includes(lowerSearch) ||
      f.to_code.toLowerCase().includes(lowerSearch);
    const matchesStatus =
      statusFilter === 'Tümü' || f.status === statusMap[statusFilter] || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Uçuş Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Tüm uçuşları görüntüleyin ve yönetin
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              <i className="ri-add-line text-xl"></i>
              Yeni Uçuş Ekle
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  placeholder="Uçuş numarası veya rota ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <div className="flex gap-2">
                {['Tümü', 'Aktif', 'İptal', 'Gecikti'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      statusFilter === status
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Flights Table */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Uçuş No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Rota
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Saat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Kapasite
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Doluluk
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Fiyat
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredFlights.map((flight) => {
                    const occupancyRate =
                      flight.capacity > 0 ? (flight.booked_seats / flight.capacity) * 100 : 0;
                    return (
                      <tr
                        key={flight.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {flight.flight_number}
                          </div>
                          <div className="text-xs text-gray-500">
                            {flight.flight_class}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {flight.from_city} ({flight.from_code})
                            </span>
                            <i className="ri-arrow-right-line text-gray-400"></i>
                            <span className="font-medium text-gray-900">
                              {flight.to_city} ({flight.to_code})
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {flight.flight_date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {flight.departure_time?.slice(0, 5)} - {flight.arrival_time?.slice(0, 5)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          {flight.capacity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                              <div
                                className={`h-2 rounded-full ${
                                  occupancyRate > 80
                                    ? 'bg-red-600'
                                    : occupancyRate > 50
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600">
                              {flight.booked_seats}/{flight.capacity}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₺{Number(flight.price).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={flight.status}
                            onChange={(e) =>
                              handleStatusChange(flight.id, e.target.value)
                            }
                            className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                              flight.status === 'Aktif'
                                ? 'bg-green-100 text-green-700'
                                : flight.status === 'İptal'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="İptal">İptal</option>
                            <option value="Gecikti">Gecikti</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(flight)}
                              className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Düzenle"
                            >
                              <i className="ri-edit-line text-lg"></i>
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(flight.id)}
                              className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Sil"
                            >
                              <i className="ri-delete-bin-line text-lg"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFlight ? 'Uçuş Düzenle' : 'Yeni Uçuş Ekle'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {/* Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Uçuş Numarası
                    </label>
                    <input
                      type="text"
                      value={formData.flight_number}
                      onChange={(e) =>
                        setFormData({ ...formData, flight_number: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="ÖRN: TK123"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sınıf
                    </label>
                    <select
                      value={formData.flight_class}
                      onChange={(e) =>
                        setFormData({ ...formData, flight_class: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer"
                    >
                      <option value="Ekonomi">Ekonomi</option>
                      <option value="Business">Business</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalkış Şehri
                    </label>
                    <input
                      type="text"
                      value={formData.from_city}
                      onChange={(e) =>
                        setFormData({ ...formData, from_city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Varış Şehri
                    </label>
                    <input
                      type="text"
                      value={formData.to_city}
                      onChange={(e) =>
                        setFormData({ ...formData, to_city: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Ankara"
                    />
                  </div>
                </div>

                {/* Row 2b - Airport codes */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalkış Kodu
                    </label>
                    <input
                      type="text"
                      value={formData.from_code}
                      onChange={(e) =>
                        setFormData({ ...formData, from_code: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="IST"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Varış Kodu
                    </label>
                    <input
                      type="text"
                      value={formData.to_code}
                      onChange={(e) =>
                        setFormData({ ...formData, to_code: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="ESB"
                    />
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tarih
                    </label>
                    <input
                      type="date"
                      value={formData.flight_date}
                      onChange={(e) =>
                        setFormData({ ...formData, flight_date: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kalkış Saati
                    </label>
                    <input
                      type="time"
                      value={formData.departure_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          departure_time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Varış Saati
                    </label>
                    <input
                      type="time"
                      value={formData.arrival_time}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          arrival_time: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kapasite
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (₺)
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseInt(e.target.value, 10) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  {editingFlight ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                Uçuşu Sil
              </h3>
              <p className="text-gray-600 text-center mb-6">
                Bu uçuşu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </AdminGuard>
  );
}
