import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { useCreateReservation } from '../../hooks/useReservations';

interface BookingData {
  flightId: string;
  from: string;
  to: string;
  date: string;
  price: string;
  passengers: any[];
  contactInfo: any;
  seats: any[];
  extraServices: any;
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { create: createReservation } = useCreateReservation();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [installment, setInstallment] = useState(1);
  const [saveCard, setSaveCard] = useState(false);

  const [showCardError, setShowCardError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (data) {
      setBookingData(JSON.parse(data));
    } else {
      navigate('/');
    }

    // Mock login check
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
  }, [navigate]);

  if (!bookingData) return null;

  const basePrice = parseFloat(bookingData.price.replace(/[.,]/g, ''));
  const adultCount = bookingData.passengers.filter(p => p.type === 'adult').length;
  const childCount = bookingData.passengers.filter(p => p.type === 'child').length;
  const infantCount = bookingData.passengers.filter(p => p.type === 'infant').length;

  const flightTotal = basePrice * adultCount + basePrice * 0.75 * childCount + basePrice * 0.1 * infantCount;
  
  const seatTotal = bookingData.seats?.reduce((sum: number, seat: any) => sum + (seat.price || 0), 0) || 0;

  const baggageTotal = bookingData.extraServices?.baggagePrice || 0;
  const mealTotal = bookingData.extraServices?.mealPrice || 0;
  const insuranceTotal = bookingData.extraServices?.insurance ? 50 * bookingData.passengers.length : 0;
  const priorityTotal = bookingData.extraServices?.priorityBoarding ? 100 * bookingData.passengers.length : 0;

  const subtotal = flightTotal + seatTotal + baggageTotal + mealTotal + insuranceTotal + priorityTotal;
  const tax = subtotal * 0.18;
  const serviceFee = 25;
  const total = subtotal + tax + serviceFee;

  const finalTotal = total;

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(value);
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    if (value.length <= 5) {
      setExpiryDate(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 3 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handlePayment = async () => {
    // Validasyon
    setPaymentError(null);
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      alert('Lütfen geçerli bir kart numarası giriniz');
      return;
    }
    if (!cardName) {
      alert('Lütfen kart üzerindeki ismi giriniz');
      return;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      alert('Lütfen geçerli bir son kullanma tarihi giriniz');
      return;
    }
    if (!cvv || cvv.length !== 3) {
      alert('Lütfen geçerli bir CVV kodu giriniz');
      return;
    }

    setIsProcessing(true);

    // Şehir kodu eşlemesi
    const cityCodeMap: Record<string, string> = {
      'İstanbul': 'IST', 'Ankara': 'ANK', 'İzmir': 'IZM', 'Antalya': 'AYT',
      'Dubai': 'DXB', 'Trabzon': 'TZX', 'Bodrum': 'BJV', 'Dalaman': 'DLM'
    };

    const flightNumber = 'BEY ' + Math.floor(100 + Math.random() * 900);
    const flightTime = '14:30';

    // Create reservation via Supabase
    const { pnr, error } = await createReservation({
      flightId: Number(bookingData.flightId) || 0,
      flightNumber,
      route: `${bookingData.from} → ${bookingData.to}`,
      flightDate: bookingData.date,
      flightTime,
      flightClass: 'Ekonomi',
      totalPrice: Math.round(finalTotal),
      contactEmail: bookingData.contactInfo?.email || '',
      contactPhone: bookingData.contactInfo?.phone || '',
      extraServices: {
        baggage: bookingData.extraServices?.baggagePrice || 0,
        meal: bookingData.extraServices?.meal || 'none',
        insurance: bookingData.extraServices?.insurance || false,
        priorityBoarding: bookingData.extraServices?.priorityBoarding || false,
      },
      paymentMethod: 'credit_card',
      paymentCardLast4: cardNumber.slice(-4),
      passengers: bookingData.passengers.map((p: any, i: number) => ({
        first_name: p.firstName,
        last_name: p.lastName,
        tc_no: p.tcNo,
        birth_date: p.birthDate,
        gender: p.gender,
        seat_number: bookingData.seats?.[i]?.seatId || '-',
        passenger_type: p.type === 'child' ? 'Çocuk' : p.type === 'infant' ? 'Bebek' : 'Yetişkin',
      })),
    });

    if (error || !pnr) {
      setIsProcessing(false);
      setPaymentError(error || 'Rezervasyon oluşturulurken bir hata oluştu.');
      return;
    }

    // Store booking details in sessionStorage for the confirmation page
    const reservationData = {
      pnr,
      flight: {
        from: bookingData.from,
        to: bookingData.to,
        fromCode: cityCodeMap[bookingData.from] || bookingData.from?.substring(0, 3).toUpperCase(),
        toCode: cityCodeMap[bookingData.to] || bookingData.to?.substring(0, 3).toUpperCase(),
        date: bookingData.date,
        time: flightTime,
        flightNumber,
        duration: '2s 15dk',
        airline: 'Bey Airlines'
      },
      passengers: bookingData.passengers.map((p: any, i: number) => ({
        firstName: p.firstName,
        lastName: p.lastName,
        tcNo: p.tcNo,
        birthDate: p.birthDate,
        gender: p.gender,
        seatNumber: bookingData.seats?.[i]?.seatId || '-'
      })),
      contact: bookingData.contactInfo,
      extras: {
        baggage: bookingData.extraServices?.baggagePrice || 0,
        meal: bookingData.extraServices?.meal || 'none',
        insurance: bookingData.extraServices?.insurance || false,
        priority: bookingData.extraServices?.priorityBoarding || false
      },
      payment: {
        subtotal: flightTotal,
        seatFee: seatTotal,
        baggageFee: baggageTotal,
        mealFee: mealTotal,
        insuranceFee: insuranceTotal,
        priorityFee: priorityTotal,
        tax: Math.round(tax),
        serviceFee: serviceFee,
        total: Math.round(finalTotal)
      },
      bookingDate: new Date().toISOString()
    };

    sessionStorage.setItem('completedBooking', JSON.stringify(reservationData));
    navigate(`/rezervasyon-onay/${pnr}`);
  };

  const installmentOptions = [
    { value: 1, label: 'Tek Çekim', fee: 0 },
    { value: 3, label: '3 Taksit', fee: 0 },
    { value: 6, label: '6 Taksit', fee: 2.5 },
    { value: 9, label: '9 Taksit', fee: 4 },
    { value: 12, label: '12 Taksit', fee: 6 }
  ];

  const selectedInstallmentFee = installmentOptions.find(opt => opt.value === installment)?.fee || 0;
  const installmentTotal = finalTotal * (1 + selectedInstallmentFee / 100);
  const monthlyPayment = installmentTotal / installment;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-20">
        {/* Progress Steps */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 sm:space-x-3 opacity-50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  <i className="ri-check-line text-lg"></i>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-500">Yolcu Bilgileri</div>
                  <div className="text-xs text-gray-400">Tamamlandı</div>
                </div>
              </div>

              <div className="flex-1 h-0.5 bg-green-600 mx-1 sm:mx-4"></div>

              <div className="flex items-center space-x-1 sm:space-x-3 opacity-50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  <i className="ri-check-line text-lg"></i>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-500">Koltuk Seçimi</div>
                  <div className="text-xs text-gray-400">Tamamlandı</div>
                </div>
              </div>

              <div className="flex-1 h-0.5 bg-green-600 mx-1 sm:mx-4"></div>

              <div className="flex items-center space-x-1 sm:space-x-3 opacity-50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  <i className="ri-check-line text-lg"></i>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-500">Ek Hizmetler</div>
                  <div className="text-xs text-gray-400">Tamamlandı</div>
                </div>
              </div>

              <div className="flex-1 h-0.5 bg-green-600 mx-1 sm:mx-4"></div>

              <div className="flex items-center space-x-1 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-red-600">Ödeme</div>
                  <div className="text-xs text-gray-500">Ödeme ve onay</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Ödeme Formu */}
            <div className="lg:col-span-2 space-y-6">
              {/* Kart Bilgileri */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Kart Bilgileri</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kart Numarası <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formatCardNumber(cardNumber)}
                        onChange={handleCardNumberChange}
                        className={`w-full px-4 py-3 border ${showCardError && cardNumber.length !== 16 ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm`}
                        placeholder="1234 5678 9012 3456"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex space-x-1">
                        <i className="ri-visa-line text-2xl text-blue-600"></i>
                        <i className="ri-mastercard-line text-2xl text-orange-600"></i>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kart Üzerindeki İsim <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm uppercase"
                      placeholder="AD SOYAD"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Son Kullanma Tarihi <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={handleExpiryChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="AA/YY"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={handleCvvChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="123"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="saveCard"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="w-4 h-4 text-red-600 focus:ring-red-500 rounded"
                    />
                    <label htmlFor="saveCard" className="text-sm text-gray-700 cursor-pointer">
                      Kartımı kaydet (Sonraki alışverişlerimde kullanmak için)
                    </label>
                  </div>
                </div>
              </div>

              {/* Taksit Seçenekleri */}
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Taksit Seçenekleri</h3>
                
                <div className="space-y-2">
                  {installmentOptions.map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${installment === option.value ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="installment"
                          value={option.value}
                          checked={installment === option.value}
                          onChange={(e) => setInstallment(parseInt(e.target.value))}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <div>
                          <div className="font-semibold text-gray-900">{option.label}</div>
                          {option.value > 1 && (
                            <div className="text-sm text-gray-500">
                              Aylık {(installmentTotal / option.value).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">
                          {(finalTotal * (1 + option.fee / 100)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                        </div>
                        {option.fee > 0 && (
                          <div className="text-xs text-amber-600">+%{option.fee} vade farkı</div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Güvenlik Rozetleri */}
              <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <i className="ri-shield-check-line text-green-600 text-xl"></i>
                  <span className="text-sm font-medium text-gray-700">SSL Güvenli</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-lock-line text-blue-600 text-xl"></i>
                  <span className="text-sm font-medium text-gray-700">3D Secure</span>
                </div>
                <div className="flex items-center space-x-2">
                  <i className="ri-bank-card-line text-purple-600 text-xl"></i>
                  <span className="text-sm font-medium text-gray-700">PCI DSS</span>
                </div>
              </div>
            </div>

            {/* Sağ Taraf - Sipariş Özeti */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 sticky top-24 space-y-6">
                <h3 className="text-lg font-bold text-gray-900">Sipariş Özeti</h3>
                
                {/* Uçuş Bilgisi */}
                <div className="pb-4 border-b border-gray-200">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                      <i className="ri-flight-takeoff-line text-red-600 text-lg"></i>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{bookingData.from} → {bookingData.to}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(bookingData.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {bookingData.passengers.length} Yolcu
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yolcular ve Koltuklar */}
                <div className="pb-4 border-b border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Yolcular ve Koltuklar</h4>
                  <div className="space-y-2">
                    {bookingData.passengers.map((passenger, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                          {passenger.firstName} {passenger.lastName}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {bookingData.seats?.[index]?.seatId || '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fiyat Detayları */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Uçuş Ücreti</span>
                    <span className="font-semibold text-gray-900">{flightTotal.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  {seatTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Koltuk Seçimi</span>
                      <span className="font-semibold text-gray-900">{seatTotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}

                  {baggageTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Ekstra Bagaj</span>
                      <span className="font-semibold text-gray-900">{baggageTotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}

                  {mealTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Yemek Seçimi</span>
                      <span className="font-semibold text-gray-900">{mealTotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}

                  {insuranceTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Seyahat Sigortası</span>
                      <span className="font-semibold text-gray-900">{insuranceTotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}

                  {priorityTotal > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Öncelikli Biniş</span>
                      <span className="font-semibold text-gray-900">{priorityTotal.toLocaleString('tr-TR')} ₺</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-200">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span className="font-semibold text-gray-900">{subtotal.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">KDV (%18)</span>
                    <span className="font-semibold text-gray-900">{tax.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Hizmet Bedeli</span>
                    <span className="font-semibold text-gray-900">{serviceFee.toLocaleString('tr-TR')} ₺</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t-2 border-gray-300">
                    <span className="text-lg font-bold text-gray-900">Toplam</span>
                    <span className="text-2xl font-bold text-red-600">
                      {installmentTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </span>
                  </div>

                  {installment > 1 && (
                    <div className="text-center text-sm text-gray-500">
                      {installment} x {monthlyPayment.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₺
                    </div>
                  )}
                </div>

                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                    <i className="ri-error-warning-line text-lg"></i>
                    <span className="text-sm">{paymentError}</span>
                  </div>
                )}

                {/* Ödeme Butonu */}
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors whitespace-nowrap flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-xl"></i>
                      <span>İşleminiz Gerçekleştiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-secure-payment-line text-xl"></i>
                      <span>Ödemeyi Tamamla</span>
                    </>
                  )}
                </button>

                <div className="space-y-2 pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2">
                    <i className="ri-shield-check-line text-green-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-gray-600">256-bit SSL şifreleme ile güvenli ödeme</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <i className="ri-time-line text-blue-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-gray-600">24 saat içinde ücretsiz iptal hakkı</p>
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

export default PaymentPage;
