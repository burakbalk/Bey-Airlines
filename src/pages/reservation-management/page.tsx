import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';
import { usePageTitle } from '../../hooks/usePageTitle';

interface ReservationSearchResult {
  pnr: string;
  surname: string;
  flightNumber: string;
  date: string;
  time: string;
  from: string;
  to: string;
  class: string;
  status: string;
  baggage: string;
  totalPrice: string;
  passengers: { name: string; type: string; seat: string }[];
}

interface RpcPassenger {
  first_name: string;
  last_name: string;
  passenger_type?: string;
  seat_number?: string;
}

export default function ReservationManagementPage() {
  usePageTitle('Rezervasyon Yönetimi');
  const [pnr, setPnr] = useState('');
  const [surname, setSurname] = useState('');
  const [searchResult, setSearchResult] = useState<ReservationSearchResult | null>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearchResult(null);

    if (!pnr.trim() || !surname.trim()) {
      setError('Lütfen PNR kodu ve soyadınızı giriniz.');
      return;
    }

    setSearching(true);

    const { data, error: fetchError } = await supabase.rpc('get_reservation_by_pnr', {
      p_pnr: pnr.toUpperCase(),
    });

    setSearching(false);

    if (fetchError || !data) {
      setError('Rezervasyon bulunamadı. Lütfen bilgilerinizi kontrol ediniz.');
      return;
    }

    // Check if any passenger surname matches
    const passengerMatch = data.passengers?.some(
      (p: RpcPassenger) => p.last_name?.toUpperCase() === surname.toUpperCase()
    );

    if (!passengerMatch) {
      setError('Rezervasyon bulunamadı. Lütfen bilgilerinizi kontrol ediniz.');
      return;
    }

    // Map RPC result to the shape the UI expects
    const routeParts = (data.route?.split('→') || ['']).map((s: string) => s.trim());
    setSearchResult({
      pnr: data.pnr,
      surname: surname.toUpperCase(),
      flightNumber: data.flight_number,
      date: data.flight_date,
      time: data.flight_time,
      from: routeParts[0],
      to: routeParts[1],
      class: data.flight_class,
      status: data.status,
      baggage: data.flight_class === 'VIP' ? '30 kg' : '20 kg',
      totalPrice: `${data.total_price?.toLocaleString('tr-TR')} TL`,
      passengers: data.passengers?.map((p: RpcPassenger) => ({
        name: `${p.first_name} ${p.last_name}`,
        type: p.passenger_type || 'Yetişkin',
        seat: p.seat_number || '-',
      })) || [],
    });
  };

  const handleCancel = async () => {
    if (!searchResult) return;
    setCancelling(true);

    const { error: updateError } = await supabase
      .from('reservations')
      .update({ status: 'İptal Edildi' })
      .eq('pnr', searchResult.pnr);

    setCancelling(false);
    setShowCancelModal(false);

    if (updateError) {
      setError('İptal işlemi başarısız oldu. Lütfen daha sonra tekrar deneyiniz.');
      return;
    }

    setSearchResult({ ...searchResult, status: 'İptal Edildi' });
    setSuccessMessage('Rezervasyonunuz başarıyla iptal edilmiştir. İade işlemi için müşteri hizmetlerimiz sizinle iletişime geçecektir.');
    setShowSuccessModal(true);
  };

  const handleChange = () => {
    setShowChangeModal(false);
    setSuccessMessage('Rezervasyon değişiklik talebiniz alınmıştır. Müşteri hizmetlerimiz sizinle iletişime geçecektir.');
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 pt-16 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <i className="ri-file-list-3-line text-3xl text-white"></i>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Rezervasyon Yönetimi</h1>
            <p className="text-xl text-red-100">Rezervasyonunuzu görüntüleyin, değiştirin veya iptal edin</p>
            <div className="flex items-center justify-center gap-8 mt-8">
              {['Anlık Sorgulama', 'Değişiklik Talebi', 'İptal İşlemi'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                  <i className="ri-check-line text-red-200"></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-10 relative z-20">
          <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Rezervasyon Sorgula</h2>
            <p className="text-gray-500 text-sm mb-8">PNR kodunuz ve soyadınızla rezervasyonunuza ulaşın</p>
            <form onSubmit={handleSearch}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PNR Kodu
                  </label>
                  <input
                    type="text"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    placeholder="Örn: BEY123"
                    className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl text-lg font-semibold uppercase focus:outline-none focus:border-red-500 transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Soyadınız
                  </label>
                  <input
                    type="text"
                    value={surname}
                    onChange={(e) => setSurname(e.target.value.toUpperCase())}
                    placeholder="Örn: YILMAZ"
                    className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-red-500 transition-colors text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <i className="ri-error-warning-line text-lg"></i>
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={searching}
                className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-lg whitespace-nowrap cursor-pointer shadow-lg shadow-red-100 disabled:opacity-50"
              >
                {searching ? (
                  <><i className="ri-loader-4-line animate-spin mr-2"></i>Sorgulanıyor...</>
                ) : (
                  <><i className="ri-search-line mr-2"></i>Rezervasyon Sorgula</>
                )}
              </button>
            </form>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
              {[
                { icon: 'ri-mail-line', title: 'PNR Nerede?', desc: 'Onay e-postanızda bulunur' },
                { icon: 'ri-edit-line', title: 'Değişiklik', desc: '24 saat öncesine kadar' },
                { icon: 'ri-refund-line', title: 'İade', desc: 'Koşullara göre değişir' },
              ].map((item, i) => (
                <div key={i} className="text-center p-3 bg-red-50 rounded-xl">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full mx-auto mb-2">
                    <i className={`${item.icon} text-red-600 text-lg`}></i>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Search Result */}
        {searchResult && (
          <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8 pb-16">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              {/* Result Header */}
              <div className={`p-6 ${searchResult.class === 'VIP' ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gradient-to-r from-red-600 to-red-700'} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">PNR: {searchResult.pnr}</h2>
                      {searchResult.class === 'VIP' && (
                        <i className="ri-vip-crown-fill text-2xl"></i>
                      )}
                    </div>
                    <p className="text-sm opacity-90">Yolcu: {searchResult.surname}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/20 px-4 py-2 rounded-xl">
                      <div className="text-xs opacity-90 mb-1">Durum</div>
                      <div className="font-bold">{searchResult.status}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flight Info */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-flight-takeoff-line text-red-600"></i>
                  Uçuş Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Uçuş Numarası</div>
                    <div className="font-semibold text-gray-900">{searchResult.flightNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tarih</div>
                    <div className="font-semibold text-gray-900">{searchResult.date}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Kalkış Saati</div>
                    <div className="font-semibold text-gray-900">{searchResult.time}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900">{searchResult.from}</div>
                    <div className="text-xs text-gray-500 mt-1">Kalkış</div>
                  </div>
                  <div className="flex-shrink-0 px-4">
                    <i className="ri-arrow-right-line text-2xl text-red-600"></i>
                  </div>
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold text-gray-900">{searchResult.to}</div>
                    <div className="text-xs text-gray-500 mt-1">Varış</div>
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-user-line text-red-600"></i>
                  Yolcu Bilgileri
                </h3>
                <div className="space-y-3">
                  {searchResult.passengers.map((passenger: { name: string; type: string; seat: string }, idx: number) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-xl">
                      <div>
                        <div className="font-semibold text-gray-900">{passenger.name}</div>
                        <div className="text-sm text-gray-500">{passenger.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Koltuk</div>
                        <div className="font-bold text-red-600">{passenger.seat}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Info */}
              <div className="p-6 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Kabin Sınıfı</div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {searchResult.class === 'VIP' && (
                        <i className="ri-vip-crown-fill text-amber-500"></i>
                      )}
                      {searchResult.class}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Bagaj Hakkı</div>
                    <div className="font-semibold text-gray-900">{searchResult.baggage}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Toplam Tutar</div>
                    <div className="font-bold text-red-600 text-lg">{searchResult.totalPrice}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-gray-50">
                {searchResult.status === 'İptal Edildi' ? (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 text-red-600 font-semibold">
                      <i className="ri-close-circle-fill text-xl"></i>
                      Bu rezervasyon iptal edilmiştir
                    </div>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setShowChangeModal(true)}
                    className="bg-white border-2 border-red-600 text-red-600 hover:bg-red-50 font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Rezervasyon Değiştir
                  </button>
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-close-circle-line mr-2"></i>
                    Rezervasyon İptal Et
                  </button>
                </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-close-circle-line text-3xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Rezervasyon İptali</h3>
              <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                Rezervasyonunuzu iptal etmek istediğinizden emin misiniz? İptal koşulları ve iade tutarı için müşteri hizmetlerimiz sizinle iletişime geçecektir.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {cancelling ? <><i className="ri-loader-4-line animate-spin mr-2"></i>İptal Ediliyor...</> : 'İptal Et'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Modal */}
        {showChangeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-edit-line text-3xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">Rezervasyon Değişikliği</h3>
              <p className="text-gray-600 mb-6 text-center text-sm leading-relaxed">
                Rezervasyonunuzda değişiklik yapmak için talebiniz alınacaktır. Müşteri hizmetlerimiz en kısa sürede sizinle iletişime geçerek değişiklik seçeneklerini sunacaktır.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowChangeModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  onClick={handleChange}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
                >
                  Talep Oluştur
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-check-line text-3xl text-green-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Talebiniz Alındı</h3>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed">{successMessage}</p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer"
              >
                Tamam
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
