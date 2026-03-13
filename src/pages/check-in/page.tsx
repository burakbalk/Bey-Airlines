import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { supabase } from '../../lib/supabase';
import { usePageTitle } from '../../hooks/usePageTitle';

interface ReservationData {
  id: string;
  pnr: string;
  flight_number: string;
  flight_date: string;
  flight_time: string;
  route: string;
  flight_class: string;
  status: string;
  passengers: {
    id: string;
    first_name: string;
    last_name: string;
    seat_number: string;
    passenger_type: string;
    checked_in: boolean;
  }[];
  flights: {
    from_city: string;
    to_city: string;
    from_code: string;
    to_code: string;
    departure_time: string;
    arrival_time: string;
    duration: string;
    gate: string | null;
    terminal: string | null;
  } | null;
}

export default function CheckInPage() {
  usePageTitle('Online Check-in');
  const [step, setStep] = useState<'form' | 'success' | 'already'>('form');
  const [formData, setFormData] = useState({ pnr: '', surname: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [checkedInPassenger, setCheckedInPassenger] = useState<ReservationData['passengers'][0] | null>(null);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const pnr = formData.pnr.trim().toUpperCase();
    const surname = formData.surname.trim().toUpperCase();

    // Supabase'den PNR ile rezervasyon çek (SECURITY DEFINER RPC — misafir erişimi destekler)
    // Passengers ve flight bilgilerini de içerir, ayrı sorgu gerekmez.
    const { data, error: queryError } = await supabase
      .rpc('get_reservation_by_pnr', { p_pnr: pnr });

    setLoading(false);

    if (queryError || !data) {
      setError('Rezervasyon bulunamadı. PNR kodunuzu ve soyadınızı kontrol edin.');
      return;
    }

    const res = data as unknown as ReservationData;

    // Soyadı kontrolü — yolculardan biri eşleşiyor mu?
    const matchingPassenger = res.passengers?.find(
      p => p.last_name.toUpperCase() === surname
    );
    if (!matchingPassenger) {
      setError('Soyad bilgisi bu rezervasyonla eşleşmiyor.');
      return;
    }

    // 24 saat kontrolü
    const flightDateStr = res.flight_date;
    const flightTimeStr = res.flights?.departure_time || res.flight_time || '00:00';
    const flightDateTime = new Date(`${flightDateStr}T${flightTimeStr}`);
    const now = new Date();
    const diffMs = flightDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 24) {
      const hoursLeft = Math.floor(diffHours - 24);
      setError(
        `Check-in henüz açılmadı. Check-in, uçuştan 24 saat önce başlar. ` +
        `Yaklaşık ${hoursLeft} saat sonra tekrar deneyebilirsiniz.`
      );
      return;
    }

    if (diffHours < 1) {
      setError('Check-in süresi dolmuştur. Uçuşa 1 saatten az kaldı. Lütfen havalimanı check-in kontuarını kullanın.');
      return;
    }

    // Çift check-in kontrolü
    if (matchingPassenger.checked_in) {
      setReservation(res);
      setCheckedInPassenger(matchingPassenger);
      setStep('already');
      return;
    }

    // Check-in durumunu DB'ye kaydet
    await supabase
      .from('passengers')
      .update({ checked_in: true })
      .eq('id', matchingPassenger.id);

    setReservation(res);
    setCheckedInPassenger(matchingPassenger);
    setStep('success');
  };

  const flight = reservation?.flights;
  const fromCode = flight?.from_code || reservation?.route?.split(' → ')[0]?.substring(0, 3) || 'IST';
  const toCode = flight?.to_code || reservation?.route?.split(' → ')[1]?.substring(0, 3) || 'DXB';
  const fromCity = flight?.from_city || reservation?.route?.split(' → ')[0] || '';
  const toCity = flight?.to_city || reservation?.route?.split(' → ')[1] || '';
  const depTime = (flight?.departure_time || reservation?.flight_time || '').slice(0, 5);
  const arrTime = (flight?.arrival_time || '').slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 pt-16 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <i className="ri-checkbox-circle-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Online Check-in</h1>
          <p className="text-xl text-red-100">PNR kodunuz ve soyadınızla hızlıca check-in yapın</p>
          <div className="flex items-center justify-center flex-wrap gap-2 sm:gap-8 mt-8">
            {['Hızlı İşlem', 'Dijital Biniş Kartı', 'Uçuştan 24 Saat Önce Açılır'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                <i className="ri-check-line text-red-200"></i>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pb-16">
        {step === 'form' ? (
          <div className="max-w-2xl mx-auto px-4 sm:px-8 -mt-10 relative z-10">
            <div className="bg-white rounded-2xl shadow-2xl p-10 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Rezervasyon Bilgileriniz</h2>
              <p className="text-gray-500 text-sm mb-8">Biletinizde yazan PNR kodu ve soyadınızı girin</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <i className="ri-error-warning-line text-xl text-red-600 mt-0.5"></i>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleCheckIn}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PNR Kodu</label>
                    <input
                      type="text"
                      value={formData.pnr}
                      onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                      placeholder="BEYABC123"
                      maxLength={9}
                      className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl text-lg font-semibold uppercase focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
                    <input
                      type="text"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value.toUpperCase() })}
                      placeholder="YILMAZ"
                      className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors text-lg whitespace-nowrap cursor-pointer shadow-lg shadow-red-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Aranıyor...
                    </>
                  ) : (
                    <>
                      <i className="ri-checkbox-circle-line"></i>
                      Check-in Yap
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-400 mt-5">
                  Rezervasyon bulamıyor musunuz?{' '}
                  <Link to="/yardim" className="text-red-600 hover:underline font-medium">Yardım alın</Link>
                </p>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-8 pt-8 border-t border-gray-100">
                {[
                  { icon: 'ri-time-line', title: 'Ne Zaman?', desc: 'Uçuştan 24 saat önce açılır' },
                  { icon: 'ri-smartphone-line', title: 'Dijital Kart', desc: 'Telefona kaydedin' },
                  { icon: 'ri-map-pin-line', title: 'Kapı Bilgisi', desc: 'Anlık güncellenir' },
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
        ) : reservation && checkedInPassenger ? (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-10 relative z-10">
            {step === 'already' ? (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
                  <i className="ri-information-line text-2xl text-blue-600"></i>
                </div>
                <div>
                  <p className="text-blue-800 font-bold">Zaten check-in yaptınız</p>
                  <p className="text-blue-600 text-sm">Biniş kartınız aşağıda görüntülenmektedir.</p>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                  <i className="ri-check-line text-2xl text-green-600"></i>
                </div>
                <div>
                  <p className="text-green-800 font-bold">Check-in başarıyla tamamlandı!</p>
                  <p className="text-green-600 text-sm">Biniş kartınız hazır. İyi uçuşlar dileriz.</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sol: Uçuş Bilgisi */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl shadow-md p-3 sm:p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {checkedInPassenger.first_name} {checkedInPassenger.last_name}
                      </h3>
                      <p className="text-gray-500 mt-1">
                        Uçuş: <span className="font-semibold text-red-600">{reservation.flight_number}</span>
                        {' · '}
                        {new Date(reservation.flight_date).toLocaleDateString('tr-TR', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right bg-red-50 px-5 py-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Koltuk</p>
                      <p className="text-2xl sm:text-4xl font-black text-red-600">
                        {checkedInPassenger.seat_number || '-'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{fromCity.toUpperCase()}</p>
                      <p className="text-sm text-gray-500 mt-1">{fromCode} · {depTime}</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <i className="ri-flight-takeoff-line text-2xl text-red-600"></i>
                      <p className="text-xs text-gray-400">{flight?.duration || ''}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{toCity.toUpperCase()}</p>
                      <p className="text-sm text-gray-500 mt-1">{toCode} · {arrTime}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4">
                    {[
                      { label: 'Kapı', value: flight?.gate || '-' },
                      { label: 'Terminal', value: flight?.terminal ? `Terminal ${flight.terminal}` : '-' },
                      { label: 'Sınıf', value: reservation.flight_class === 'vip' ? 'VIP' : 'Ekonomi' },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-3 border border-gray-100 rounded-lg">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="font-bold text-gray-900 mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Diğer yolcular */}
                  {reservation.passengers.length > 1 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Diğer Yolcular</p>
                      <div className="space-y-1">
                        {reservation.passengers
                          .filter(p => p.last_name !== checkedInPassenger.last_name || p.first_name !== checkedInPassenger.first_name)
                          .map((p, i) => (
                            <div key={i} className="flex justify-between text-sm text-gray-600">
                              <span>{p.first_name} {p.last_name}</span>
                              <span className="font-semibold">{p.seat_number || '-'}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sağ: Biniş Kartı */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-md p-3 sm:p-6 sticky top-24 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-5 text-center">Dijital Biniş Kartı</h3>
                  <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-2xl p-5 text-white">
                    <div className="text-center mb-4">
                      <p className="text-xl font-black tracking-widest">BEY AIRLINES</p>
                      <p className="text-red-200 text-xs mt-1">Türkiye&apos;nin Premium Havayolu</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 mb-4">
                      <img
                        src="/images/app/qr-code.webp"
                        alt="QR Code"
                        className="w-full rounded-lg"
                      />
                    </div>
                    <div className="space-y-2.5 text-sm">
                      {[
                        { label: 'Yolcu', value: `${checkedInPassenger.first_name} ${checkedInPassenger.last_name}` },
                        { label: 'PNR', value: reservation.pnr },
                        { label: 'Uçuş', value: reservation.flight_number },
                        { label: 'Tarih', value: new Date(reservation.flight_date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() },
                        { label: 'Kalkış', value: depTime },
                        { label: 'Kapı', value: flight?.gate || '-' },
                        { label: 'Koltuk', value: checkedInPassenger.seat_number || '-' },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-red-200 text-xs">{item.label}</span>
                          <span className={`font-bold ${item.label === 'Koltuk' ? 'text-xl' : 'text-sm'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      onClick={() => alert('Bu özellik yakında aktif olacaktır.')}
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-red-100"
                    >
                      <i className="ri-download-line mr-2"></i>Biniş Kartını İndir
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Bu özellik yakında aktif olacaktır.')}
                      className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      <i className="ri-mail-send-line mr-2"></i>E-posta Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Footer />
    </div>
  );
}
