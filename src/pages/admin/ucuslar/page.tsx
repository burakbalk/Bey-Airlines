import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { getTodayTR } from '../../../utils/date';
import { useAllFlights, useFlightSchedule, useAircraft, FlightResult, ScheduleEntry } from '../../../hooks/useFlights';
import { supabase } from '../../../lib/supabase';

const DAY_NAMES = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const FLIGHT_STATUSES = [
  { value: 'zamaninda', label: 'Zamanında', bg: 'bg-green-100', text: 'text-green-700' },
  { value: 'gecikti', label: 'Gecikti', bg: 'bg-yellow-100', text: 'text-yellow-700' },
  { value: 'binis-basladi', label: 'Biniş Başladı', bg: 'bg-blue-100', text: 'text-blue-700' },
  { value: 'kalkti', label: 'Kalktı', bg: 'bg-purple-100', text: 'text-purple-700' },
  { value: 'iptal', label: 'İptal', bg: 'bg-red-100', text: 'text-red-700' },
];

function getStatusStyle(status: string) {
  return FLIGHT_STATUSES.find(s => s.value === status) || FLIGHT_STATUSES[0];
}

function formatDateTR(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`;
}

export default function AdminFlightsPage() {
  const { flights, loading: flightsLoading, refresh: refreshFlights, page, setPage, totalCount, pageSize } = useAllFlights();
  const { schedule, loading: scheduleLoading, updatePrice, addSchedule, updateSchedule, deleteSchedule, generateFlights, getMaxFlightDate } = useFlightSchedule();
  const { aircraft, loading: aircraftLoading, add: addAircraft, updateStatus: updateAircraftStatus } = useAircraft();

  const [activeTab, setActiveTab] = useState<'schedule' | 'flights' | 'fleet'>('schedule');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // ======================== TAB 1: TARİFE YÖNETİMİ ========================

  const [priceInputs, setPriceInputs] = useState<Record<number, string>>({});
  const [savingPriceId, setSavingPriceId] = useState<number | null>(null);
  const [savedPriceId, setSavedPriceId] = useState<number | null>(null);
  const [maxFlightDate, setMaxFlightDate] = useState<string | null>(null);

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    flight_code: '', aircraft_id: 0,
    from_code: '', from_city: '', to_code: '', to_city: '',
    day_of_week: 1, departure_time: '', arrival_time: '', duration: '',
    flight_class: 'normal', price: 0, baggage: true, meal: true, changeable: true,
  });
  const [scheduleFormError, setScheduleFormError] = useState('');
  const [savingSchedule, setSavingSchedule] = useState(false);

  // Generate modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genStartDate, setGenStartDate] = useState(getTodayTR());
  const [genWeeks, setGenWeeks] = useState(4);
  const [generating, setGenerating] = useState(false);

  // Delete confirm
  const [deleteScheduleId, setDeleteScheduleId] = useState<number | null>(null);

  useEffect(() => { getMaxFlightDate().then(setMaxFlightDate); }, [getMaxFlightDate]);

  useEffect(() => {
    const initial: Record<number, string> = {};
    schedule.forEach(s => { initial[s.id] = String(s.price); });
    setPriceInputs(initial);
  }, [schedule]);

  const handlePriceSave = async (id: number, flightCode: string) => {
    const raw = priceInputs[id];
    const newPrice = parseInt(raw, 10);
    if (isNaN(newPrice) || newPrice <= 0) { showFeedback('error', 'Geçerli bir fiyat girin.'); return; }
    setSavingPriceId(id);
    const { error } = await updatePrice(id, flightCode, newPrice);
    setSavingPriceId(null);
    if (error) { showFeedback('error', error); } else { setSavedPriceId(id); setTimeout(() => setSavedPriceId(null), 2000); }
  };

  const openAddSchedule = () => {
    setEditingSchedule(null);
    setScheduleForm({ flight_code: '', aircraft_id: aircraft[0]?.id || 0, from_code: '', from_city: '', to_code: '', to_city: '', day_of_week: 1, departure_time: '', arrival_time: '', duration: '', flight_class: 'normal', price: 0, baggage: true, meal: true, changeable: true });
    setScheduleFormError('');
    setShowScheduleModal(true);
  };

  const openEditSchedule = (entry: ScheduleEntry) => {
    setEditingSchedule(entry);
    setScheduleForm({
      flight_code: entry.flight_code, aircraft_id: entry.aircraft_id,
      from_code: entry.from_code, from_city: entry.from_city, to_code: entry.to_code, to_city: entry.to_city,
      day_of_week: entry.day_of_week, departure_time: entry.departure_time?.slice(0, 5), arrival_time: entry.arrival_time?.slice(0, 5), duration: entry.duration,
      flight_class: entry.flight_class, price: Number(entry.price), baggage: entry.baggage, meal: entry.meal, changeable: entry.changeable,
    });
    setScheduleFormError('');
    setShowScheduleModal(true);
  };

  const handleScheduleSave = async () => {
    if (!scheduleForm.flight_code || !scheduleForm.from_code || !scheduleForm.to_code || !scheduleForm.departure_time || !scheduleForm.arrival_time) {
      setScheduleFormError('Uçuş kodu, kalkış/varış kodu ve saatler zorunludur.');
      return;
    }
    if (scheduleForm.aircraft_id === 0) { setScheduleFormError('Uçak seçiniz.'); return; }
    setSavingSchedule(true);
    setScheduleFormError('');
    if (editingSchedule) {
      const { error } = await updateSchedule(editingSchedule.id, scheduleForm);
      if (error) { setScheduleFormError(error); setSavingSchedule(false); return; }
    } else {
      const { error } = await addSchedule(scheduleForm);
      if (error) { setScheduleFormError(error); setSavingSchedule(false); return; }
    }
    setSavingSchedule(false);
    setShowScheduleModal(false);
    showFeedback('success', editingSchedule ? 'Tarife güncellendi.' : 'Yeni tarife eklendi.');
  };

  const handleDeleteSchedule = async () => {
    if (!deleteScheduleId) return;
    const { error } = await deleteSchedule(deleteScheduleId);
    setDeleteScheduleId(null);
    if (error) showFeedback('error', error);
    else showFeedback('success', 'Tarife silindi.');
  };

  const handleGenerate = async () => {
    setGenerating(true);
    const { error } = await generateFlights(genStartDate, genWeeks);
    setGenerating(false);
    setShowGenerateModal(false);
    if (error) showFeedback('error', error);
    else {
      showFeedback('success', `${genWeeks} haftalık uçuşlar üretildi.`);
      refreshFlights();
      getMaxFlightDate().then(setMaxFlightDate);
    }
  };

  // ======================== TAB 2: UÇUŞ LİSTESİ ========================

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tümü');
  const [selectedFlights, setSelectedFlights] = useState<Set<number>>(new Set());

  // Edit flight modal (sadeleştirilmiş)
  const [showFlightModal, setShowFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState<FlightResult | null>(null);
  const [flightForm, setFlightForm] = useState({ status: 'zamaninda', gate: '', terminal: '', estimated_departure: '', estimated_arrival: '', price: 0 });
  const [savingFlight, setSavingFlight] = useState(false);

  const filteredFlights = flights.filter(f => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = f.flight_number.toLowerCase().includes(s) || f.from_city.toLowerCase().includes(s) || f.to_city.toLowerCase().includes(s);
    const matchesStatus = statusFilter === 'Tümü' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openEditFlight = (flight: FlightResult) => {
    setEditingFlight(flight);
    setFlightForm({
      status: flight.status, gate: flight.gate || '', terminal: flight.terminal || '',
      estimated_departure: flight.estimated_departure?.slice(0, 5) || flight.departure_time?.slice(0, 5) || '',
      estimated_arrival: flight.estimated_arrival?.slice(0, 5) || flight.arrival_time?.slice(0, 5) || '',
      price: Number(flight.price),
    });
    setShowFlightModal(true);
  };

  const handleFlightSave = async () => {
    if (!editingFlight) return;
    setSavingFlight(true);
    const { error } = await supabase.from('flights').update({
      status: flightForm.status, gate: flightForm.gate || null, terminal: flightForm.terminal || null,
      estimated_departure: flightForm.estimated_departure || null, estimated_arrival: flightForm.estimated_arrival || null,
      price: flightForm.price,
    }).eq('id', editingFlight.id);
    setSavingFlight(false);
    if (error) {
      showFeedback('error', 'Uçuş güncellenirken hata: ' + error.message);
      return;
    }
    setShowFlightModal(false);
    refreshFlights();
    showFeedback('success', 'Uçuş güncellendi.');
  };

  const handleBulkStatusChange = async (newStatus: string) => {
    if (selectedFlights.size === 0) return;
    const ids = Array.from(selectedFlights);
    const { error } = await supabase.from('flights').update({ status: newStatus }).in('id', ids);
    if (error) {
      showFeedback('error', 'Toplu güncelleme hatası: ' + error.message);
      return;
    }
    setSelectedFlights(new Set());
    refreshFlights();
    showFeedback('success', `${ids.length} uçuş "${FLIGHT_STATUSES.find(s => s.value === newStatus)?.label}" olarak güncellendi.`);
  };

  const toggleFlightSelection = (id: number) => {
    setSelectedFlights(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAllFlights = () => {
    if (selectedFlights.size === filteredFlights.length) setSelectedFlights(new Set());
    else setSelectedFlights(new Set(filteredFlights.map(f => f.id)));
  };

  // ======================== TAB 3: FİLO YÖNETİMİ ========================

  const [showAircraftModal, setShowAircraftModal] = useState(false);
  const [aircraftForm, setAircraftForm] = useState({ registration: '', model: '', capacity: 180, aircraft_type: 'normal' });
  const [aircraftFormError, setAircraftFormError] = useState('');
  const [savingAircraft, setSavingAircraft] = useState(false);

  const handleAddAircraft = async () => {
    if (!aircraftForm.registration || !aircraftForm.model) { setAircraftFormError('Tescil ve model zorunludur.'); return; }
    setSavingAircraft(true);
    setAircraftFormError('');
    const { error } = await addAircraft(aircraftForm);
    setSavingAircraft(false);
    if (error) setAircraftFormError(error);
    else { setShowAircraftModal(false); showFeedback('success', 'Yeni uçak eklendi.'); }
  };

  const handleToggleAircraft = async (id: number, currentActive: boolean) => {
    const { error } = await updateAircraftStatus(id, !currentActive);
    if (error) showFeedback('error', error);
    else showFeedback('success', `Uçak ${!currentActive ? 'aktif' : 'bakıma alındı'}.`);
  };

  // ======================== ÜRETIM BİLGİSİ ========================

  const today = getTodayTR();
  const maxDateObj = maxFlightDate ? new Date(maxFlightDate) : null;
  const daysRemaining = maxDateObj ? Math.max(0, Math.ceil((maxDateObj.getTime() - new Date(today).getTime()) / 86400000)) : null;

  // ======================== RENDER ========================

  const isLoading = flightsLoading || scheduleLoading || aircraftLoading;

  if (isLoading) {
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
      <div className="p-6 lg:p-8">
          {/* Feedback Toast */}
          {feedback && (
            <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium animate-[slideIn_0.3s_ease] ${
              feedback.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              <i className={feedback.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'}></i>
              {feedback.message}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Uçuş Yönetimi</h1>
              <p className="text-gray-600 mt-1">Tarife, operasyon ve filo yönetimi</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="overflow-x-auto mb-8">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
            {([
              { key: 'schedule' as const, label: 'Tarife Yönetimi', icon: 'ri-price-tag-3-line' },
              { key: 'flights' as const, label: 'Uçuş Listesi', icon: 'ri-flight-takeoff-line' },
              { key: 'fleet' as const, label: 'Filo Yönetimi', icon: 'ri-ship-line' },
            ]).map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.key ? 'bg-white text-red-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <i className={`${tab.icon} text-base`}></i>
                {tab.label}
              </button>
            ))}
          </div>
          </div>

          {/* ======================== TAB 1: TARİFE YÖNETİMİ ======================== */}
          {activeTab === 'schedule' && (
            <div className="space-y-8">
              {/* Üst Bilgi Kartları */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                      <i className="ri-calendar-check-line text-green-600 text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">En İleri Uçuş</p>
                      <p className="font-bold text-gray-900 text-sm">{maxFlightDate ? formatDateTR(maxFlightDate) : '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${daysRemaining !== null && daysRemaining <= 7 ? 'bg-amber-100' : 'bg-blue-100'}`}>
                      <i className={`ri-time-line text-lg ${daysRemaining !== null && daysRemaining <= 7 ? 'text-amber-600' : 'text-blue-600'}`}></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Kalan Gün</p>
                      <p className="font-bold text-gray-900 text-sm">{daysRemaining !== null ? `${daysRemaining} gün` : '—'}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                      <i className="ri-route-line text-red-600 text-lg"></i>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Tarife Slotları</p>
                      <p className="font-bold text-gray-900 text-sm">{schedule.length} Slot</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center justify-center">
                  <button onClick={() => setShowGenerateModal(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl transition-colors text-sm font-semibold whitespace-nowrap cursor-pointer shadow-md">
                    <i className="ri-refresh-line text-base"></i>
                    Uçuşları Üret
                  </button>
                </div>
              </div>

              {/* Tarife Tablosu */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Haftalık Tarife</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Tarife slotlarını yönetin, fiyatları hızlıca güncelleyin</p>
                  </div>
                  <button onClick={openAddSchedule} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors">
                    <i className="ri-add-line"></i>
                    Yeni Slot
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-100">
                      <tr>
                        {['Kod', 'Rota', 'Gün', 'Saat', 'Uçak', 'Sınıf', 'Kap.', 'Fiyat', 'Hızlı Fiyat', '', 'İşlem'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {scheduleLoading ? (
                        <tr><td colSpan={11} className="px-5 py-12 text-center text-gray-400"><i className="ri-loader-4-line animate-spin text-2xl"></i></td></tr>
                      ) : schedule.length === 0 ? (
                        <tr><td colSpan={11} className="px-5 py-12 text-center text-gray-400">Henüz tarife slotu yok</td></tr>
                      ) : schedule.map(entry => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                              entry.flight_class === 'vip' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                            }`}>{entry.flight_code}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                              {entry.from_code} <i className="ri-arrow-right-line text-gray-400 text-xs"></i> {entry.to_code}
                            </div>
                            <div className="text-xs text-gray-500">{entry.from_city} → {entry.to_city}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{DAY_NAMES[entry.day_of_week]}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {entry.departure_time?.slice(0, 5)} - {entry.arrival_time?.slice(0, 5)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-600">{entry.aircraft_registration || '—'}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              entry.flight_class === 'vip' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-600'
                            }`}>{entry.flight_class === 'vip' ? 'VIP' : 'Premium'}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{entry.capacity}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">₺{Number(entry.price).toLocaleString('tr-TR')}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <input type="number" min="0" value={priceInputs[entry.id] ?? entry.price}
                              onChange={e => setPriceInputs(prev => ({ ...prev, [entry.id]: e.target.value }))}
                              className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                              aria-label={`${entry.flight_code} yeni fiyat`} />
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <button onClick={() => handlePriceSave(entry.id, entry.flight_code)}
                              disabled={savingPriceId === entry.id || priceInputs[entry.id] === String(entry.price)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                                savedPriceId === entry.id ? 'bg-green-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
                              }`}>
                              {savingPriceId === entry.id ? <i className="ri-loader-4-line animate-spin"></i>
                                : savedPriceId === entry.id ? <><i className="ri-check-line mr-1"></i>OK</>
                                : '₺'}
                            </button>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditSchedule(entry)} className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" aria-label="Düzenle">
                                <i className="ri-edit-line"></i>
                              </button>
                              <button onClick={() => setDeleteScheduleId(entry.id)} className="w-7 h-7 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg cursor-pointer" aria-label="Sil">
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================== TAB 2: UÇUŞ LİSTESİ ======================== */}
          {activeTab === 'flights' && (
            <div className="space-y-6">
              {/* Filtreler + Toplu İşlem */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  <div className="relative sm:w-72 shrink-0">
                    <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input type="text" placeholder="Uçuş no veya rota ara..." value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <button onClick={() => setStatusFilter('Tümü')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${statusFilter === 'Tümü' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tümü</button>
                    {FLIGHT_STATUSES.map(s => (
                      <button key={s.value} onClick={() => setStatusFilter(s.value)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${statusFilter === s.value ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{s.label}</button>
                    ))}
                  </div>
                </div>
                {/* Toplu İşlem Barı */}
                {selectedFlights.size > 0 && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                    <span className="text-sm font-medium text-red-700"><i className="ri-checkbox-circle-line mr-1"></i>{selectedFlights.size} uçuş seçili</span>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => handleBulkStatusChange('gecikti')} className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap">Gecikti</button>
                      <button onClick={() => handleBulkStatusChange('iptal')} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap">İptal</button>
                      <button onClick={() => handleBulkStatusChange('zamaninda')} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap">Zamanında</button>
                      <button onClick={() => setSelectedFlights(new Set())} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap">Temizle</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Uçuş Tablosu */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-4 w-10">
                          <input type="checkbox" checked={selectedFlights.size === filteredFlights.length && filteredFlights.length > 0}
                            onChange={toggleAllFlights} className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                        </th>
                        {['Uçuş No', 'Rota', 'Tarih', 'Saat', 'Doluluk', 'Fiyat', 'Durum', 'Kapı', ''].map(h => (
                          <th key={h} className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredFlights.length === 0 ? (
                        <tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400">Uçuş bulunamadı</td></tr>
                      ) : filteredFlights.map(flight => {
                        const occ = flight.capacity > 0 ? (flight.booked_seats / flight.capacity) * 100 : 0;
                        const st = getStatusStyle(flight.status);
                        return (
                          <tr key={flight.id} className={`hover:bg-gray-50 transition-colors ${selectedFlights.has(flight.id) ? 'bg-red-50/50' : ''}`}>
                            <td className="px-4 py-3">
                              <input type="checkbox" checked={selectedFlights.has(flight.id)}
                                onChange={() => toggleFlightSelection(flight.id)}
                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="font-semibold text-gray-900">{flight.flight_number}</div>
                              <div className="text-xs text-gray-500">{flight.flight_class === 'vip' ? 'VIP' : 'Premium'}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5 text-sm font-medium text-gray-900">
                                {flight.from_code} <i className="ri-arrow-right-line text-gray-400 text-xs"></i> {flight.to_code}
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{flight.flight_date}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                              {flight.departure_time?.slice(0, 5)} – {flight.arrival_time?.slice(0, 5)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div className={`h-2 rounded-full ${occ > 80 ? 'bg-red-600' : occ > 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                    style={{ width: `${Math.min(occ, 100)}%` }} />
                                </div>
                                <span className="text-xs text-gray-600">{flight.booked_seats}/{flight.capacity}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">₺{Number(flight.price).toLocaleString('tr-TR')}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${st.bg} ${st.text}`}>{st.label}</span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{flight.gate || '—'} / T{flight.terminal || '—'}</td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <button onClick={() => openEditFlight(flight)} className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer" aria-label="Düzenle">
                                <i className="ri-edit-line text-lg"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Sayfalama */}
                {totalCount > pageSize && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                      Toplam {totalCount} uçuş, sayfa {page + 1} / {Math.ceil(totalCount / pageSize)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 0}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <i className="ri-arrow-left-s-line mr-1"></i>Önceki
                      </button>
                      <button
                        onClick={() => setPage(page + 1)}
                        disabled={(page + 1) * pageSize >= totalCount}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Sonraki<i className="ri-arrow-right-s-line ml-1"></i>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================== TAB 3: FİLO YÖNETİMİ ======================== */}
          {activeTab === 'fleet' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Filo ({aircraft.length} Uçak)</h2>
                <button onClick={() => { setAircraftForm({ registration: '', model: '', capacity: 180, aircraft_type: 'normal' }); setAircraftFormError(''); setShowAircraftModal(true); }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors shadow-md">
                  <i className="ri-add-line"></i>Yeni Uçak Ekle
                </button>
              </div>

              {aircraftLoading ? (
                <div className="flex items-center justify-center py-12"><i className="ri-loader-4-line animate-spin text-2xl text-gray-400"></i></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {aircraft.map(plane => {
                    const isVip = plane.aircraft_type === 'vip';
                    const isActive = plane.is_active;
                    // Bu uçağa atanmış tarife slotlarını bul
                    const assignedRoutes = schedule.filter(s => s.aircraft_id === plane.id);
                    return (
                      <div key={plane.id} className={`bg-white rounded-2xl shadow-sm border-2 p-6 transition-all ${
                        !isActive ? 'border-amber-300 opacity-75' : isVip ? 'border-amber-200' : 'border-gray-100'
                      }`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isVip ? 'bg-amber-100' : 'bg-blue-100'}`}>
                            <i className={`text-2xl ${isVip ? 'ri-vip-crown-fill text-amber-600' : 'ri-plane-line text-blue-600'}`}></i>
                          </div>
                          <button onClick={() => handleToggleAircraft(plane.id, isActive)}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer transition-colors ${
                              isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                            }`}>
                            {isActive ? 'Aktif' : 'Bakımda'}
                          </button>
                        </div>
                        <p className="font-bold text-gray-900 mb-0.5">{plane.model}</p>
                        <p className="text-sm text-gray-500 mb-3">{plane.registration}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                          <span><i className="ri-group-line mr-1"></i>{plane.capacity} koltuk</span>
                          <span className={`font-semibold ${isVip ? 'text-amber-600' : 'text-blue-600'}`}>{isVip ? 'VIP' : 'Premium'}</span>
                        </div>
                        {assignedRoutes.length > 0 && (
                          <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-semibold text-gray-500 mb-2">Atanmış Rotalar</p>
                            {assignedRoutes.map(r => (
                              <div key={r.id} className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <span className="font-medium">{r.flight_code}</span>
                                <span>{r.from_code}→{r.to_code}</span>
                                <span>{DAY_NAMES[r.day_of_week]?.slice(0, 3)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ======================== MODALS ======================== */}

        {/* Schedule Add/Edit Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{editingSchedule ? 'Tarife Düzenle' : 'Yeni Tarife Slotu'}</h2>
                <button onClick={() => setShowScheduleModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {scheduleFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2" role="alert">
                    <i className="ri-error-warning-line"></i>{scheduleFormError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uçuş Kodu</label>
                    <input type="text" value={scheduleForm.flight_code} onChange={e => setScheduleForm({...scheduleForm, flight_code: e.target.value.toUpperCase()})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="BEY107" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Uçak</label>
                    <select value={scheduleForm.aircraft_id} onChange={e => setScheduleForm({...scheduleForm, aircraft_id: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer">
                      <option value={0}>Seçiniz...</option>
                      {aircraft.filter(a => a.is_active).map(a => (
                        <option key={a.id} value={a.id}>{a.registration} — {a.model} ({a.capacity} koltuk, {a.aircraft_type === 'vip' ? 'VIP' : 'Premium'})</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kalkış Kodu / Şehir</label>
                    <div className="flex gap-2">
                      <input type="text" maxLength={3} value={scheduleForm.from_code} onChange={e => setScheduleForm({...scheduleForm, from_code: e.target.value.toUpperCase()})}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="IST" />
                      <input type="text" value={scheduleForm.from_city} onChange={e => setScheduleForm({...scheduleForm, from_city: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="İstanbul" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Varış Kodu / Şehir</label>
                    <div className="flex gap-2">
                      <input type="text" maxLength={3} value={scheduleForm.to_code} onChange={e => setScheduleForm({...scheduleForm, to_code: e.target.value.toUpperCase()})}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="DXB" />
                      <input type="text" value={scheduleForm.to_city} onChange={e => setScheduleForm({...scheduleForm, to_city: e.target.value})}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="Dubai" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gün</label>
                    <select value={scheduleForm.day_of_week} onChange={e => setScheduleForm({...scheduleForm, day_of_week: Number(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer">
                      {DAY_NAMES.slice(1).map((name, i) => <option key={i + 1} value={i + 1}>{name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kalkış</label>
                    <input type="time" value={scheduleForm.departure_time} onChange={e => setScheduleForm({...scheduleForm, departure_time: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Varış</label>
                    <input type="time" value={scheduleForm.arrival_time} onChange={e => setScheduleForm({...scheduleForm, arrival_time: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Süre</label>
                    <input type="text" value={scheduleForm.duration} onChange={e => setScheduleForm({...scheduleForm, duration: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="4s 30dk" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sınıf</label>
                    <select value={scheduleForm.flight_class} onChange={e => setScheduleForm({...scheduleForm, flight_class: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer">
                      <option value="normal">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                    <input type="number" min="0" value={scheduleForm.price} onChange={e => setScheduleForm({...scheduleForm, price: parseInt(e.target.value, 10) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={scheduleForm.baggage} onChange={e => setScheduleForm({...scheduleForm, baggage: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span>Bagaj</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={scheduleForm.meal} onChange={e => setScheduleForm({...scheduleForm, meal: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span>Yemek</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={scheduleForm.changeable} onChange={e => setScheduleForm({...scheduleForm, changeable: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                    <span>Değiştirilebilir</span>
                  </label>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowScheduleModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer">İptal</button>
                <button onClick={handleScheduleSave} disabled={savingSchedule}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50">
                  {savingSchedule ? <i className="ri-loader-4-line animate-spin"></i> : editingSchedule ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Delete Confirm */}
        {deleteScheduleId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Tarife Slotunu Sil</h3>
              <p className="text-gray-600 mb-6 text-sm">Bu tarife slotunu silmek istediğinizden emin misiniz? Mevcut uçuşlar etkilenmez.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteScheduleId(null)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">İptal</button>
                <button onClick={handleDeleteSchedule} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap">Sil</button>
              </div>
            </div>
          </div>
        )}

        {/* Generate Flights Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Uçuşları Üret</h3>
                <button onClick={() => setShowGenerateModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
                  <input type="date" value={genStartDate} onChange={e => setGenStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hafta Sayısı</label>
                  <select value={genWeeks} onChange={e => setGenWeeks(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer">
                    {[1, 2, 3, 4, 5, 6, 8].map(w => <option key={w} value={w}>{w} hafta</option>)}
                  </select>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700">
                  <i className="ri-information-line mr-1"></i>
                  Mevcut uçuşlar etkilenmez (ON CONFLICT DO NOTHING). {schedule.length} tarife slotu × {genWeeks} hafta = ~{schedule.length * genWeeks} yeni uçuş.
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowGenerateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">İptal</button>
                <button onClick={handleGenerate} disabled={generating}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50">
                  {generating ? <><i className="ri-loader-4-line animate-spin mr-1"></i>Üretiliyor...</> : 'Üret'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Flight Edit Modal (sadeleştirilmiş) */}
        {showFlightModal && editingFlight && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Uçuş Düzenle</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{editingFlight.flight_number} — {editingFlight.from_code}→{editingFlight.to_code} ({editingFlight.flight_date})</p>
                </div>
                <button onClick={() => setShowFlightModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durum</label>
                  <select value={flightForm.status} onChange={e => setFlightForm({...flightForm, status: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer">
                    {FLIGHT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapı (Gate)</label>
                    <input type="text" value={flightForm.gate} onChange={e => setFlightForm({...flightForm, gate: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="A3" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Terminal</label>
                    <input type="text" value={flightForm.terminal} onChange={e => setFlightForm({...flightForm, terminal: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="1" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahmini Kalkış</label>
                    <input type="time" value={flightForm.estimated_departure} onChange={e => setFlightForm({...flightForm, estimated_departure: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tahmini Varış</label>
                    <input type="time" value={flightForm.estimated_arrival} onChange={e => setFlightForm({...flightForm, estimated_arrival: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fiyat (₺)</label>
                  <input type="number" min="0" value={flightForm.price} onChange={e => setFlightForm({...flightForm, price: parseInt(e.target.value, 10) || 0})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowFlightModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">İptal</button>
                <button onClick={handleFlightSave} disabled={savingFlight}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50">
                  {savingFlight ? <i className="ri-loader-4-line animate-spin"></i> : 'Güncelle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Aircraft Add Modal */}
        {showAircraftModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Yeni Uçak Ekle</h2>
                <button onClick={() => setShowAircraftModal(false)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-lg cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-6 space-y-4">
                {aircraftFormError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-center gap-2" role="alert">
                    <i className="ri-error-warning-line"></i>{aircraftFormError}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tescil Numarası</label>
                  <input type="text" value={aircraftForm.registration} onChange={e => setAircraftForm({...aircraftForm, registration: e.target.value.toUpperCase()})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="TC-BEY05" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input type="text" value={aircraftForm.model} onChange={e => setAircraftForm({...aircraftForm, model: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" placeholder="Boeing 737-800" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kapasite</label>
                    <input type="number" min="1" value={aircraftForm.capacity} onChange={e => setAircraftForm({...aircraftForm, capacity: parseInt(e.target.value, 10) || 0})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                    <select value={aircraftForm.aircraft_type} onChange={e => setAircraftForm({...aircraftForm, aircraft_type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer">
                      <option value="normal">Premium</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button onClick={() => setShowAircraftModal(false)} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">İptal</button>
                <button onClick={handleAddAircraft} disabled={savingAircraft}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer whitespace-nowrap disabled:opacity-50">
                  {savingAircraft ? <i className="ri-loader-4-line animate-spin"></i> : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
}
