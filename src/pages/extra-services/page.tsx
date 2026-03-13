import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import BookingStepper from '../../components/feature/BookingStepper';

interface ExtraService {
  baggage: number;
  meal: string;
  insurance: boolean;
  priorityBoarding: boolean;
}

interface ExtrasBookingData {
  from: string;
  to: string;
  date: string;
  price: string;
  passengers: { id: string; firstName: string; lastName: string; [key: string]: unknown }[];
  seats?: { seatId: string; price?: number }[];
  [key: string]: unknown;
}

const ExtraServicesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flightId = searchParams.get('flightId');

  const [bookingData, setBookingData] = useState<ExtrasBookingData | null>(null);
  const [services, setServices] = useState<ExtraService>({
    baggage: 0,
    meal: 'none',
    insurance: false,
    priorityBoarding: false
  });

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      navigate('/ucus-ara');
      return;
    }

    try {
      const parsed = JSON.parse(data);
      setBookingData(parsed);
    } catch {
      navigate('/ucus-ara');
    }
  }, [navigate]);

  const baggageOptions = [
    { weight: 0, price: 0, label: 'Bagaj Yok' },
    { weight: 15, price: 150, label: '+15 kg' },
    { weight: 20, price: 250, label: '+20 kg' },
    { weight: 30, price: 400, label: '+30 kg' }
  ];

  const mealOptions = [
    { id: 'none', label: 'Yemek İstemiyorum', price: 0 },
    { id: 'standard', label: 'Standart Menü', price: 75 },
    { id: 'vegetarian', label: 'Vejetaryen Menü', price: 75 },
    { id: 'vegan', label: 'Vegan Menü', price: 75 },
    { id: 'glutenfree', label: 'Glutensiz Menü', price: 85 }
  ];

  const calculateExtrasTotal = () => {
    let total = 0;
    
    // Bagaj
    const selectedBaggage = baggageOptions.find(b => b.weight === services.baggage);
    if (selectedBaggage) total += selectedBaggage.price;
    
    // Yemek
    const selectedMeal = mealOptions.find(m => m.id === services.meal);
    if (selectedMeal) total += selectedMeal.price * bookingData.passengers.length;
    
    // Sigorta
    if (services.insurance) total += 50 * bookingData.passengers.length;
    
    // Öncelikli biniş
    if (services.priorityBoarding) total += 100 * bookingData.passengers.length;
    
    return total;
  };

  const handleContinue = () => {
    // Fiyatları hesapla
    const selectedBaggage = baggageOptions.find(b => b.weight === services.baggage);
    const selectedMeal = mealOptions.find(m => m.id === services.meal);

    const updatedBookingData = {
      ...bookingData,
      extraServices: {
        ...services,
        baggagePrice: selectedBaggage?.price || 0,
        mealPrice: (selectedMeal?.price || 0) * bookingData.passengers.length
      }
    };
    sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
    
    navigate(`/odeme?flightId=${flightId}`);
  };

  if (!bookingData) return null;

  const unitPrice = parseFloat(bookingData.price.replace(/[.,]/g, ''));
  const basePrice = bookingData.passengers.reduce((sum, p) => {
    const type = (p as { type?: string }).type;
    if (type === 'child') return sum + unitPrice * 0.75;
    if (type === 'infant') return sum + unitPrice * 0.1;
    return sum + unitPrice;
  }, 0);
  const seatPrice = bookingData.seats?.reduce((sum: number, ps: { seatId: string; price?: number }) => {
    return sum + (ps.price || 0);
  }, 0) || 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20">
        <BookingStepper currentStep={3} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Ek Hizmetler */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bagaj */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <i className="ri-luggage-cart-line text-red-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Ekstra Bagaj</h3>
                    <p className="text-sm text-gray-500">Standart 8 kg kabin bagajı dahildir</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {baggageOptions.map(option => (
                    <button
                      key={option.weight}
                      type="button"
                      onClick={() => setServices(prev => ({ ...prev, baggage: option.weight }))}
                      className={`p-4 rounded-xl border-2 transition-all text-center ${
                        services.baggage === option.weight
                          ? 'border-red-600 bg-red-50'
                          : 'border-gray-200 hover:border-red-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 mb-1">{option.label}</div>
                      <div className="text-sm text-red-600 font-semibold">
                        {option.price === 0 ? 'Ücretsiz' : `${option.price} ₺`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Yemek */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center">
                    <i className="ri-restaurant-line text-orange-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Yemek Seçimi</h3>
                    <p className="text-sm text-gray-500">Tüm yolcular için geçerli</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {mealOptions.map(option => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setServices(prev => ({ ...prev, meal: option.id }))}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                        services.meal === option.id
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          services.meal === option.id
                            ? 'border-orange-600 bg-orange-600'
                            : 'border-gray-300'
                        }`}>
                          {services.meal === option.id && (
                            <i className="ri-check-line text-white text-sm"></i>
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">{option.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-orange-600">
                        {option.price === 0 ? 'Ücretsiz' : `${option.price} ₺ / kişi`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Diğer Hizmetler */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <i className="ri-service-line text-blue-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Ek Hizmetler</h3>
                    <p className="text-sm text-gray-500">Konforunuz için</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Sigorta */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    services.insurance ? 'border-blue-600 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={services.insurance}
                        onChange={(e) => setServices(prev => ({ ...prev, insurance: e.target.checked }))}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Seyahat Sigortası</span>
                          <span className="text-sm font-semibold text-blue-600">50 ₺ / kişi</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Uçuş iptali, bagaj kaybı ve sağlık sorunları için kapsamlı koruma
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                            ✓ 50.000 ₺ Sağlık
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                            ✓ Bagaj Kaybı
                          </span>
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full whitespace-nowrap">
                            ✓ İptal Koruması
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Öncelikli Biniş */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    services.priorityBoarding ? 'border-purple-600 bg-purple-50' : 'border-gray-200'
                  }`}>
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={services.priorityBoarding}
                        onChange={(e) => setServices(prev => ({ ...prev, priorityBoarding: e.target.checked }))}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">Öncelikli Biniş</span>
                          <span className="text-sm font-semibold text-purple-600">100 ₺ / kişi</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Uçağa ilk binen yolcular arasında olun, bagajınız için yer garantisi
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                            ✓ İlk Biniş
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                            ✓ Bagaj Garantisi
                          </span>
                          <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full whitespace-nowrap">
                            ✓ Hızlı Güvenlik
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Özet */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Rezervasyon Özeti</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-flight-takeoff-line text-red-600 text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{bookingData.from} → {bookingData.to}</div>
                      <div className="text-sm text-gray-500 mt-1">{new Date(bookingData.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Uçuş Ücreti</span>
                      <span className="font-semibold text-gray-900">{basePrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    
                    {seatPrice > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Koltuk Ücreti</span>
                        <span className="font-semibold text-gray-900">{seatPrice.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}

                    {services.baggage > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Bagaj (+{services.baggage}kg)</span>
                        <span className="font-semibold text-gray-900">
                          {baggageOptions.find(b => b.weight === services.baggage)?.price.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    )}

                    {services.meal !== 'none' && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Yemek ({bookingData.passengers.length} kişi)</span>
                        <span className="font-semibold text-gray-900">
                          {((mealOptions.find(m => m.id === services.meal)?.price || 0) * bookingData.passengers.length).toLocaleString('tr-TR')} ₺
                        </span>
                      </div>
                    )}

                    {services.insurance && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Sigorta ({bookingData.passengers.length} kişi)</span>
                        <span className="font-semibold text-gray-900">{(50 * bookingData.passengers.length).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}

                    {services.priorityBoarding && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Öncelikli Biniş ({bookingData.passengers.length} kişi)</span>
                        <span className="font-semibold text-gray-900">{(100 * bookingData.passengers.length).toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Toplam</span>
                      <span className="text-2xl font-bold text-red-600">
                        {(basePrice + seatPrice + calculateExtrasTotal()).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <span>Ödemeye Geç</span>
                  <i className="ri-arrow-right-line text-lg"></i>
                </button>

                <div className="mt-6 p-4 bg-green-50 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <i className="ri-information-line text-green-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-green-800">
                      Ek hizmetler isteğe bağlıdır. Seçim yapmazsanız sadece temel uçuş hizmeti alacaksınız.
                    </p>
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

export default ExtraServicesPage;