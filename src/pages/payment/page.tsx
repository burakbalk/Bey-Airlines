import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import BookingStepper from '../../components/feature/BookingStepper';
import { useCreateReservation } from '../../hooks/useReservations';
import { usePageTitle } from '../../hooks/usePageTitle';
import { supabase } from '../../lib/supabase';
import { logger } from '../../utils/logger';

interface Passenger {
  firstName: string;
  lastName: string;
  tcNo: string;
  birthDate: string;
  gender: string;
  type: 'adult' | 'child' | 'infant';
}

interface ContactInfo {
  email: string;
  phone: string;
}

interface Seat {
  seatId: string;
  price: number;
}

interface ExtraServices {
  baggagePrice?: number;
  meal?: string;
  insurance?: boolean;
  mealPrice?: number;
  priorityBoarding?: boolean;
}

interface BookingData {
  flightId: string;
  flightNumber: string;
  flightTime: string;
  flightClass: string;
  duration: string;
  from: string;
  to: string;
  date: string;
  price: string;
  passengers: Passenger[];
  contactInfo: ContactInfo;
  seats: Seat[];
  extraServices: ExtraServices;
}

const PaymentPage = () => {
  usePageTitle('Ödeme');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { create: createReservation } = useCreateReservation();

  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  // P5: Çift tıklama koruması
  const paymentInProgress = useRef(false);
  // P5: Her booking akışı için tek seferlik benzersiz token
  const bookingToken = useRef(crypto.randomUUID());

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
      try {
        const parsed = JSON.parse(data);
        if (
          !parsed.flightId ||
          !parsed.price ||
          !Array.isArray(parsed.passengers) ||
          parsed.passengers.length === 0
        ) {
          navigate('/ucus-ara');
          return;
        }
        setBookingData(parsed);
      } catch {
        navigate('/ucus-ara');
      }
    } else {
      navigate('/ucus-ara');
    }

  }, [navigate]);

  if (!bookingData) return null;

  const basePrice = parseFloat(bookingData.price.replace(/[.,]/g, ''));
  const adultCount = bookingData.passengers.filter(p => p.type === 'adult').length;
  const childCount = bookingData.passengers.filter(p => p.type === 'child').length;
  const infantCount = bookingData.passengers.filter(p => p.type === 'infant').length;

  const flightTotal = basePrice * adultCount + basePrice * 0.75 * childCount + basePrice * 0.1 * infantCount;
  
  const seatTotal = bookingData.seats?.reduce((sum: number, seat: Seat) => sum + (seat.price || 0), 0) || 0;

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
    // P5: Çift tıklama koruması
    if (paymentInProgress.current) return;
    paymentInProgress.current = true;

    // Validasyon
    setPaymentError(null);
    if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
      setPaymentError('Lütfen geçerli bir kart numarası giriniz (16 hane).');
      paymentInProgress.current = false;
      return;
    }
    if (!cardName) {
      setPaymentError('Lütfen kart üzerindeki ismi giriniz.');
      paymentInProgress.current = false;
      return;
    }
    if (!expiryDate || expiryDate.length !== 5) {
      setPaymentError('Lütfen geçerli bir son kullanma tarihi giriniz (AA/YY).');
      paymentInProgress.current = false;
      return;
    }
    if (!cvv || cvv.length !== 3) {
      setPaymentError('Lütfen geçerli bir CVV kodu giriniz (3 hane).');
      paymentInProgress.current = false;
      return;
    }

    setIsProcessing(true);

    // Şehir kodu eşlemesi
    const cityCodeMap: Record<string, string> = {
      'İstanbul': 'IST', 'Ankara': 'ANK', 'İzmir': 'IZM', 'Antalya': 'AYT',
      'Dubai': 'DXB', 'Trabzon': 'TZX', 'Bodrum': 'BJV', 'Dalaman': 'DLM'
    };

    const flightNumber = bookingData.flightNumber || `BEY${bookingData.flightId}`;
    const flightTime = bookingData.flightTime || '00:00';
    const flightClassLabel = bookingData.flightClass === 'vip' ? 'VIP' : 'Premium';

    // Create reservation via Supabase
    const { pnr, error } = await createReservation({
      flightId: Number(bookingData.flightId) || 0,
      flightNumber,
      route: `${bookingData.from} → ${bookingData.to}`,
      flightDate: bookingData.date,
      flightTime,
      flightClass: flightClassLabel,
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
      passengers: bookingData.passengers.map((p: Passenger, i: number) => ({
        first_name: p.firstName,
        last_name: p.lastName,
        tc_no: p.tcNo,
        birth_date: p.birthDate,
        gender: p.gender,
        seat_number: bookingData.seats?.[i]?.seatId || '-',
        passenger_type: p.type === 'child' ? 'Çocuk' : p.type === 'infant' ? 'Bebek' : 'Yetişkin',
      })),
      bookingToken: bookingToken.current,
    });

    if (error || !pnr) {
      setIsProcessing(false);
      paymentInProgress.current = false;
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
        duration: bookingData.duration || '',
        airline: 'Bey Airlines'
      },
      passengers: bookingData.passengers.map((p: Passenger, i: number) => ({
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
    sessionStorage.removeItem('bookingData');

    // Otomatik onay e-postası gönder (fire-and-forget — hata kullanıcıyı bloklamaz)
    supabase.functions.invoke('send-reservation-email', {
      body: {
        pnr,
        email: bookingData.contactInfo?.email || '',
        flight: reservationData.flight,
        passengers: reservationData.passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          tcNo: p.tcNo,
          seatNumber: p.seatNumber,
        })),
        extras: reservationData.extras,
        payment: { total: reservationData.payment.total },
      },
    }).catch((err) => logger.error('[PaymentPage] Onay e-postası gönderilemedi:', err));

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
      
      <main className="flex-1 pt-4">
        <BookingStepper currentStep={4} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Ödeme Formu */}
            <div className="lg:col-span-2 space-y-6">
              {/* Kart Bilgileri */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <i className="ri-bank-card-line text-blue-600 text-lg"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Kart Bilgileri</h2>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <i className="ri-visa-line text-2xl text-blue-600"></i>
                    <i className="ri-mastercard-line text-2xl text-orange-500"></i>
                  </div>
                </div>
                
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
                        aria-label="Kart numarası"
                        autoComplete="cc-number"
                        inputMode="numeric"
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
                      aria-label="Kart üzerindeki isim"
                      autoComplete="cc-name"
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
                        aria-label="Son kullanma tarihi"
                        autoComplete="cc-exp"
                        inputMode="numeric"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        CVV <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="password"
                        value={cvv}
                        onChange={handleCvvChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                        placeholder="123"
                        aria-label="CVV güvenlik kodu"
                        autoComplete="cc-csc"
                        inputMode="numeric"
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
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                    <i className="ri-calendar-check-line text-green-600 text-lg"></i>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Taksit Seçenekleri</h3>
                </div>
                
                <div className="space-y-2">
                  {installmentOptions.map(option => (
                    <label
                      key={option.value}
                      className={`flex items-center justify-between gap-2 p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${installment === option.value ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
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
              <div className="bg-gradient-to-r from-gray-50 to-gray-50/50 rounded-2xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500 text-center mb-3 font-medium uppercase tracking-wide">Güvenli Ödeme</p>
                <div className="flex items-center justify-center gap-6 flex-wrap">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center">
                      <i className="ri-shield-check-fill text-green-600 text-lg"></i>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">256-bit SSL</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                      <i className="ri-lock-fill text-blue-600 text-lg"></i>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">3D Secure</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                      <i className="ri-secure-payment-line text-purple-600 text-lg"></i>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">Güvenli Bağlantı</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center">
                      <i className="ri-time-fill text-orange-600 text-lg"></i>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">24s İptal</span>
                  </div>
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
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg disabled:shadow-none active:scale-[0.98] disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <i className="ri-loader-4-line animate-spin text-xl"></i>
                      <span>İşleminiz Gerçekleştiriliyor...</span>
                    </>
                  ) : (
                    <>
                      <i className="ri-shield-check-fill text-lg"></i>
                      <span>Güvenli Ödeme Yap</span>
                      <i className="ri-arrow-right-line text-lg opacity-80"></i>
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
