import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import BookingStepper from '../../components/feature/BookingStepper';
import { useSavedPassengers } from '../../hooks/useReservations';

interface Passenger {
  id: string;
  type: 'adult' | 'child' | 'infant';
  firstName: string;
  lastName: string;
  tcNo: string;
  birthDate: string;
  gender: 'male' | 'female';
}

interface ContactInfo {
  email: string;
  phone: string;
}

const FlightBookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { savedPassengers = [] } = useSavedPassengers();

  const flightId = searchParams.get('flightId');
  const from = searchParams.get('from') || 'İstanbul';
  const to = searchParams.get('to') || 'Dubai';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const price = searchParams.get('price') || '1,250';
  const flightNumber = searchParams.get('flightNumber') || '';
  const flightTime = searchParams.get('departureTime') || '';
  const flightClass = searchParams.get('flightClass') || 'normal';
  const duration = searchParams.get('duration') || '';

  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);

  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: '',
    phone: ''
  });

  const [showSavedPassengers, setShowSavedPassengers] = useState<string | null>(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setPassengers(prev => {
      const buildSlots = (type: Passenger['type'], count: number): Passenger[] => {
        const existing = prev.filter(p => p.type === type);
        const kept = existing.slice(0, count);
        const needed = count - kept.length;
        const added: Passenger[] = [];
        for (let i = 0; i < needed; i++) {
          added.push({
            id: `${type}-${kept.length + i}`,
            type,
            firstName: '',
            lastName: '',
            tcNo: '',
            birthDate: '',
            gender: 'male'
          });
        }
        return [...kept, ...added];
      };
      return [
        ...buildSlots('adult', adultCount),
        ...buildSlots('child', childCount),
        ...buildSlots('infant', infantCount),
      ];
    });
  }, [adultCount, childCount, infantCount]);

  const updatePassenger = useCallback((id: string, field: keyof Passenger, value: string) => {
    setPassengers(prev => prev.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ));
  }, []);

  const fillFromSaved = useCallback((passengerId: string, savedPassenger: typeof savedPassengers[0]) => {
    setPassengers(prev => prev.map(p =>
      p.id === passengerId ? {
        ...p,
        firstName: savedPassenger.firstName || savedPassenger.first_name,
        lastName: savedPassenger.lastName || savedPassenger.last_name,
        tcNo: savedPassenger.tcNo || savedPassenger.tc_no,
        birthDate: savedPassenger.birthDate || savedPassenger.birth_date,
      } : p
    ));
    setShowSavedPassengers(null);
  }, [savedPassengers]);

  const validateTcNo = useCallback((tc: string): boolean => {
    if (tc.length !== 11 || !/^\d+$/.test(tc)) return false;
    if (tc[0] === '0') return false;
    const d = tc.split('').map(Number);
    const oddSum = d[0] + d[2] + d[4] + d[6] + d[8];
    const evenSum = d[1] + d[3] + d[5] + d[7];
    if ((7 * oddSum - evenSum) % 10 !== d[9]) return false;
    const totalSum = d.slice(0, 10).reduce((a, b) => a + b, 0);
    return totalSum % 10 === d[10];
  }, []);

  const validateAndContinue = useCallback(() => {
    setFormError('');
    // Uçuş seçimi kontrolü
    if (!flightId) {
      setFormError('Geçersiz uçuş. Lütfen uçuş arama sayfasından bir uçuş seçin.');
      return;
    }
    // Yolcu bilgileri kontrolü
    for (const passenger of passengers) {
      if (!passenger.firstName || !passenger.lastName || !passenger.tcNo || !passenger.birthDate) {
        setFormError('Lütfen tüm yolcu bilgilerini eksiksiz doldurun.');
        return;
      }
      if (!validateTcNo(passenger.tcNo)) {
        setFormError('Geçersiz TC Kimlik No. Lütfen kontrol ediniz.');
        return;
      }
    }

    // Bebek > yetişkin validasyonu
    if (infantCount > adultCount) {
      setFormError('Her bebek için en az bir yetişkin gereklidir.');
      return;
    }

    // İletişim bilgileri kontrolü
    if (!contactInfo.email || !contactInfo.phone) {
      setFormError('Lütfen iletişim bilgilerinizi eksiksiz doldurun.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactInfo.email)) {
      setFormError('Lütfen geçerli bir e-posta adresi girin.');
      return;
    }

    const phoneDigits = contactInfo.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      setFormError('Telefon numarası en az 10 haneli olmalıdır.');
      return;
    }

    // Koltuk seçimine geç
    const bookingData = {
      flightId,
      flightNumber,
      flightTime,
      flightClass,
      duration,
      from,
      to,
      date,
      price,
      passengers,
      contactInfo
    };

    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    navigate(`/koltuk-secimi?flightId=${flightId}`);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flightId, flightNumber, flightTime, flightClass, duration,
      from, to, date, price, passengers, contactInfo,
      infantCount, adultCount, validateTcNo, navigate]);

  const getPassengerTypeLabel = useCallback((type: string) => {
    switch(type) {
      case 'adult': return 'Yetişkin';
      case 'child': return 'Çocuk (2-12 yaş)';
      case 'infant': return 'Bebek (0-2 yaş)';
      default: return '';
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 pt-4">
        <BookingStepper currentStep={1} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Yolcu Sayısı Seçimi */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                    <i className="ri-group-line text-primary text-lg"></i>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Yolcu Sayısı</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Yetişkin
                      <span className="block text-xs font-normal text-gray-500 mt-1">12 yaş üzeri</span>
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <i className="ri-subtract-line text-lg"></i>
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{adultCount}</span>
                      <button
                        type="button"
                        onClick={() => setAdultCount(Math.min(9, adultCount + 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <i className="ri-add-line text-lg"></i>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Çocuk
                      <span className="block text-xs font-normal text-gray-500 mt-1">2-12 yaş arası</span>
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setChildCount(Math.max(0, childCount - 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <i className="ri-subtract-line text-lg"></i>
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{childCount}</span>
                      <button
                        type="button"
                        onClick={() => setChildCount(Math.min(9, childCount + 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <i className="ri-add-line text-lg"></i>
                      </button>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Bebek
                      <span className="block text-xs font-normal text-gray-500 mt-1">0-2 yaş arası</span>
                    </label>
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setInfantCount(Math.max(0, infantCount - 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <i className="ri-subtract-line text-lg"></i>
                      </button>
                      <span className="text-2xl font-bold text-gray-900">{infantCount}</span>
                      <button
                        type="button"
                        onClick={() => setInfantCount(Math.min(adultCount, infantCount + 1))}
                        className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                      >
                        <i className="ri-add-line text-lg"></i>
                      </button>
                    </div>
                  </div>
                </div>

                {infantCount > adultCount && (
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
                    <i className="ri-information-line text-amber-600 text-lg mt-0.5"></i>
                    <p className="text-sm text-amber-800">
                      Her bebek için bir yetişkin yolcu bulunmalıdır.
                    </p>
                  </div>
                )}
              </div>

              {/* Yolcu Bilgileri */}
              {passengers.map((passenger, index) => (
                <div key={passenger.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                  <div className="flex items-start sm:items-center justify-between mb-6 gap-2">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900">
                      {index + 1}. Yolcu - {getPassengerTypeLabel(passenger.type)}
                    </h3>

                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => setShowSavedPassengers(showSavedPassengers === passenger.id ? null : passenger.id)}
                        className="px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs sm:text-sm font-medium text-gray-700 transition-colors whitespace-nowrap flex items-center space-x-2"
                      >
                        <i className="ri-user-line"></i>
                        <span>Kayıtlı Yolcu Seç</span>
                      </button>

                      {showSavedPassengers === passenger.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 z-20 max-h-72 overflow-y-auto w-64 sm:w-72 max-w-[calc(100vw-2rem)]">
                          <div className="p-3 border-b border-gray-100">
                            <p className="text-sm font-semibold text-gray-900">Kayıtlı Yolcular</p>
                          </div>
                          {savedPassengers.map(saved => (
                            <button
                              key={saved.id}
                              type="button"
                              onClick={() => fillFromSaved(passenger.id, saved)}
                              className="w-full px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b border-gray-100 last:border-0"
                            >
                              <div className="font-medium text-gray-900 text-sm">{saved.firstName} {saved.lastName}</div>
                              <div className="text-xs text-gray-500 mt-0.5">TC: {saved.tcNo}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ad <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.firstName}
                        onChange={(e) => updatePassenger(passenger.id, 'firstName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="Adınız"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Soyad <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.lastName}
                        onChange={(e) => updatePassenger(passenger.id, 'lastName', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="Soyadınız"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        TC Kimlik No <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={passenger.tcNo}
                        onChange={(e) => updatePassenger(passenger.id, 'tcNo', e.target.value.replace(/\D/g, '').slice(0, 11))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="12345678901"
                        maxLength={11}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Doğum Tarihi <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="date"
                        value={passenger.birthDate}
                        onChange={(e) => updatePassenger(passenger.id, 'birthDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Cinsiyet <span className="text-red-600">*</span>
                      </label>
                      <div className="flex space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${passenger.id}`}
                            value="male"
                            checked={passenger.gender === 'male'}
                            onChange={(e) => updatePassenger(passenger.id, 'gender', e.target.value)}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Erkek</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`gender-${passenger.id}`}
                            value="female"
                            checked={passenger.gender === 'female'}
                            onChange={(e) => updatePassenger(passenger.id, 'gender', e.target.value)}
                            className="w-4 h-4 text-red-600 focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Kadın</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* İletişim Bilgileri */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <i className="ri-mail-line text-blue-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">İletişim Bilgileri</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      E-posta Adresi <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="email"
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="ornek@email.com"
                    />
                    <p className="text-xs text-gray-500 mt-2">Bilet bilgileriniz bu adrese gönderilecektir.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Telefon Numarası <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="tel"
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="0555 123 45 67"
                    />
                    <p className="text-xs text-gray-500 mt-2">Uçuş değişiklikleri için SMS bildirimi alacaksınız.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Özet */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:sticky lg:top-24">
                <div className="flex items-center gap-2 mb-6">
                  <i className="ri-flight-takeoff-line text-primary text-xl"></i>
                  <h3 className="text-lg font-bold text-gray-900">Uçuş Özeti</h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-flight-takeoff-line text-red-600 text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{from} → {to}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Yetişkin ({adultCount})</span>
                      <span className="font-semibold text-gray-900">{(parseFloat(price.replace(/[.,]/g, '')) * adultCount).toLocaleString('tr-TR')} ₺</span>
                    </div>
                    {childCount > 0 && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Çocuk ({childCount})</span>
                        <span className="font-semibold text-gray-900">{(parseFloat(price.replace(/[.,]/g, '')) * 0.75 * childCount).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}
                    {infantCount > 0 && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Bebek ({infantCount})</span>
                        <span className="font-semibold text-gray-900">{(parseFloat(price.replace(/[.,]/g, '')) * 0.1 * infantCount).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-red-600">
                        {(
                          parseFloat(price.replace(/[.,]/g, '')) * adultCount +
                          parseFloat(price.replace(/[.,]/g, '')) * 0.75 * childCount +
                          parseFloat(price.replace(/[.,]/g, '')) * 0.1 * infantCount
                        ).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700" role="alert">
                    <i className="ri-error-warning-line text-lg flex-shrink-0"></i>
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={validateAndContinue}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <span>Koltuk Seçimine Geç</span>
                  <i className="ri-arrow-right-line text-lg"></i>
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-start space-x-2">
                    <i className="ri-shield-check-line text-green-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-gray-600">Güvenli ödeme sistemi</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ri-time-line text-blue-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-gray-600">24 saat ücretsiz iptal</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ri-customer-service-2-line text-purple-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-gray-600">7/24 müşteri desteği</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FlightBookingPage;