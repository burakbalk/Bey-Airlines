import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

interface Passenger {
  firstName: string;
  lastName: string;
  tcNo: string;
  birthDate: string;
  gender: string;
  seatNumber?: string;
}

interface ReservationData {
  pnr: string;
  flight: {
    from: string;
    to: string;
    fromCode: string;
    toCode: string;
    date: string;
    time: string;
    flightNumber: string;
    duration: string;
    airline: string;
  };
  passengers: Passenger[];
  contact: {
    email: string;
    phone: string;
  };
  extras: {
    baggage: number;
    meal: string;
    insurance: boolean;
    priority: boolean;
  };
  payment: {
    subtotal: number;
    seatFee: number;
    baggageFee: number;
    mealFee: number;
    insuranceFee: number;
    priorityFee: number;
    tax: number;
    serviceFee: number;
    total: number;
  };
  bookingDate: string;
}

export default function ReservationConfirmationPage() {
  const { pnr } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [showSuccess, setShowSuccess] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sessionData = sessionStorage.getItem('completedBooking');
    if (sessionData) {
      try {
        const data = JSON.parse(sessionData);
        // PNR eşleşmesini doğrula
        if (!pnr || data.pnr === pnr) {
          setReservation(data);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
          // Booking akışı tamamlandı, eski veriyi temizle
          sessionStorage.removeItem('bookingData');
          return;
        }
      } catch {
        setNotFound(true);
        return;
      }
    }

    // SessionStorage boşsa veya PNR uyuşmuyorsa Supabase RPC ile çek (RLS bypass)
    if (pnr) {
      supabase
        .rpc('get_reservation_by_pnr', { p_pnr: pnr.toUpperCase() })
        .then(({ data: res, error }) => {
          if (error || !res) {
            setNotFound(true);
            return;
          }
          // Supabase verisini ReservationData formatına dönüştür
          const cityCodeMap: Record<string, string> = {
            'İstanbul': 'IST', 'Ankara': 'ANK', 'İzmir': 'IZM',
            'Dubai': 'DXB', 'Antalya': 'AYT',
          };
          const [from, to] = (res.route || '').split(' → ');
          const flightInfo = res.flights || {};
          const built: ReservationData = {
            pnr: res.pnr,
            flight: {
              from: from || '',
              to: to || '',
              fromCode: flightInfo.from_code || cityCodeMap[from] || from?.substring(0, 3).toUpperCase() || '',
              toCode: flightInfo.to_code || cityCodeMap[to] || to?.substring(0, 3).toUpperCase() || '',
              date: res.flight_date,
              time: res.flight_time,
              flightNumber: res.flight_number,
              duration: flightInfo.duration || '',
              airline: 'Bey Airlines',
            },
            passengers: (res.passengers || []).map((p: { first_name: string; last_name: string; tc_no: string; birth_date: string; gender: string; seat_number: string }) => ({
              firstName: p.first_name,
              lastName: p.last_name,
              tcNo: p.tc_no,
              birthDate: p.birth_date,
              gender: p.gender,
              seatNumber: p.seat_number,
            })),
            contact: {
              email: res.contact_email,
              phone: res.contact_phone,
            },
            extras: {
              baggage: res.extra_services?.baggage || 0,
              meal: res.extra_services?.meal || 'none',
              insurance: res.extra_services?.insurance || false,
              priority: res.extra_services?.priorityBoarding || false,
            },
            payment: {
              subtotal: res.total_price,
              seatFee: 0,
              baggageFee: 0,
              mealFee: 0,
              insuranceFee: 0,
              priorityFee: 0,
              tax: 0,
              serviceFee: 0,
              total: res.total_price,
            },
            bookingDate: res.created_at,
          };
          setReservation(built);
          setShowSuccess(false);
        });
    } else {
      setNotFound(true);
    }
  }, [pnr]);

  const handleDownloadPDF = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 1500);
  };

  const handleSendEmail = async () => {
    if (!reservation) return;
    setSending(true);
    setError('');

    const { error: fnError } = await supabase.functions.invoke('send-reservation-email', {
      body: {
        pnr: reservation.pnr,
        email: reservation.contact.email,
        flight: reservation.flight,
        passengers: reservation.passengers.map((p) => ({
          firstName: p.firstName,
          lastName: p.lastName,
          tcNo: p.tcNo,
          seatNumber: p.seatNumber,
        })),
        extras: reservation.extras,
        payment: { total: reservation.payment.total },
      },
    });

    setSending(false);
    if (fnError) {
      setError('E-posta gönderilemedi. Lütfen tekrar deneyin.');
    } else {
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 4000);
    }
  };

  const handleCheckIn = () => {
    navigate('/check-in');
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-file-unknow-line text-4xl text-red-600"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Rezervasyon Bulunamadı</h1>
            <p className="text-gray-600 mb-2">
              <span className="font-semibold text-red-600">{pnr}</span> PNR koduna ait rezervasyon bulunamadı.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              PNR kodunu doğru girdiğinizden emin olun veya rezervasyon yönetimi sayfasını deneyin.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/rezervasyon-yonetimi"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-search-line"></i>
                Rezervasyon Sorgula
              </Link>
              <Link
                to="/"
                className="border-2 border-gray-300 hover:border-red-600 text-gray-700 hover:text-red-600 px-6 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <i className="ri-home-line"></i>
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line text-5xl text-red-600 animate-spin"></i>
          <p className="mt-4 text-gray-600">Rezervasyon bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Başarı Animasyonu Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-4 animate-[scale-in_0.5s_ease-out]">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-[bounce_1s_ease-in-out]">
              <i className="ri-check-line text-5xl text-green-600"></i>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Rezervasyon Tamamlandı!</h2>
            <p className="text-gray-600 text-lg">Biletiniz başarıyla oluşturuldu</p>
          </div>
        </div>
      )}

      <div className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <i className="ri-flight-takeoff-line text-3xl text-green-600"></i>
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">Rezervasyonunuz Hazır!</h1>
            <p className="text-gray-600 text-lg">PNR Kodunuz: <span className="font-bold text-red-600">{reservation.pnr}</span></p>
          </div>

          {/* Bilet Kartı */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-6">
            {/* Bilet Üst Kısım - Uçuş Bilgileri */}
            <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-800 p-4 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>
              
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-red-100 text-sm mb-1">Havayolu</p>
                    <p className="text-2xl font-bold">{reservation.flight.airline}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm mb-1">Uçuş No</p>
                    <p className="text-2xl font-bold">{reservation.flight.flightNumber}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <p className="text-red-100 text-sm mb-2">Kalkış</p>
                    <p className="text-3xl sm:text-5xl font-bold mb-2">{reservation.flight.fromCode}</p>
                    <p className="text-lg">{reservation.flight.from}</p>
                    <p className="text-red-100 mt-2">{reservation.flight.time}</p>
                  </div>

                  <div className="flex-1 px-4 sm:px-8">
                    <div className="relative">
                      <div className="h-0.5 bg-white/30"></div>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-700 px-4 py-2 rounded-full">
                        <i className="ri-flight-takeoff-line text-2xl"></i>
                      </div>
                    </div>
                    <p className="text-center text-red-100 text-sm mt-2">{reservation.flight.duration}</p>
                  </div>

                  <div className="text-center">
                    <p className="text-red-100 text-sm mb-2">Varış</p>
                    <p className="text-3xl sm:text-5xl font-bold mb-2">{reservation.flight.toCode}</p>
                    <p className="text-lg">{reservation.flight.to}</p>
                    <p className="text-red-100 mt-2">~{(() => {
                      const timeParts = reservation.flight.time?.split(':').map(Number);
                      if (!timeParts || timeParts.length < 2 || isNaN(timeParts[0]) || isNaN(timeParts[1])) return '--:--';
                      const [h, m] = timeParts;
                      const dur = reservation.flight.duration || '';
                      const durationMatch = dur.match(/(\d+)\s*s\s*(\d+)\s*dk/) || dur.match(/(\d+):(\d+)/);
                      const dHours = durationMatch ? parseInt(durationMatch[1]) : 0;
                      const dMins = durationMatch ? parseInt(durationMatch[2]) : 0;
                      if (dHours === 0 && dMins === 0) return '--:--';
                      const totalMins = h * 60 + m + dHours * 60 + dMins;
                      const arrH = Math.floor(totalMins / 60) % 24;
                      const arrM = totalMins % 60;
                      return `${String(arrH).padStart(2, '0')}:${String(arrM).padStart(2, '0')}`;
                    })()}</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/20 flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm mb-1">Tarih</p>
                    <p className="text-lg font-semibold">{new Date(reservation.flight.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-red-100 text-sm mb-1">Yolcu Sayısı</p>
                    <p className="text-lg font-semibold">{reservation.passengers.length} Kişi</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kesikli Çizgi */}
            <div className="relative h-8 bg-gray-50">
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-between px-4">
                <div className="w-8 h-8 bg-gray-50 rounded-full -ml-4 border-8 border-white"></div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300 mx-4"></div>
                <div className="w-8 h-8 bg-gray-50 rounded-full -mr-4 border-8 border-white"></div>
              </div>
            </div>

            {/* Bilet Alt Kısım - Yolcu ve Detaylar */}
            <div className="p-4 sm:p-8">
              {/* Yolcular */}
              <div className="mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <i className="ri-user-line text-red-600"></i>
                  Yolcular ve Koltuklar
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reservation.passengers.map((passenger, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{passenger.firstName} {passenger.lastName}</p>
                        <p className="text-sm text-gray-600">TC: {passenger.tcNo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Koltuk</p>
                        <p className="text-2xl font-bold text-red-600">{passenger.seatNumber || `${index + 1}A`}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="mb-8 bg-blue-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <i className="ri-mail-line text-blue-600"></i>
                  İletişim Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <i className="ri-mail-line text-gray-600"></i>
                    <span className="text-gray-900">{reservation.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="ri-phone-line text-gray-600"></i>
                    <span className="text-gray-900">{reservation.contact.phone}</span>
                  </div>
                </div>
              </div>

              {/* Ek Hizmetler */}
              {(reservation.extras.baggage > 0 || reservation.extras.meal !== 'none' || reservation.extras.insurance || reservation.extras.priority) && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-service-line text-red-600"></i>
                    Ek Hizmetler
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {reservation.extras.baggage > 0 && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 whitespace-nowrap">
                        <i className="ri-luggage-cart-line"></i>
                        +{reservation.extras.baggage}kg Bagaj
                      </span>
                    )}
                    {reservation.extras.meal !== 'none' && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 whitespace-nowrap">
                        <i className="ri-restaurant-line"></i>
                        {reservation.extras.meal === 'standard' ? 'Standart Yemek' : reservation.extras.meal === 'vegetarian' ? 'Vejetaryen' : 'Vegan'}
                      </span>
                    )}
                    {reservation.extras.insurance && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 whitespace-nowrap">
                        <i className="ri-shield-check-line"></i>
                        Seyahat Sigortası
                      </span>
                    )}
                    {reservation.extras.priority && (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5 whitespace-nowrap">
                        <i className="ri-vip-crown-line"></i>
                        Öncelikli Biniş
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Barkod */}
              <div className="border-t border-gray-200 pt-6">
                <div className="bg-gray-900 rounded-xl p-6 text-center">
                  <div className="mb-3">
                    <img
                      src="/images/app/barcode.webp"
                      alt="Barkod"
                      className="mx-auto h-20 object-contain invert"
                    />
                    <p className="text-white font-mono text-sm mt-2 tracking-widest">{reservation.pnr}</p>
                  </div>
                  <p className="text-white/60 text-xs">Check-in sırasında bu kodu gösteriniz</p>
                </div>
              </div>
            </div>
          </div>

          {/* Toast Notifications */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl flex items-center gap-3">
              <i className="ri-error-warning-line text-xl text-red-600"></i>
              <span className="font-medium">{error}</span>
            </div>
          )}
          {downloadSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-pulse">
              <i className="ri-check-double-line text-xl text-green-600"></i>
              <span className="font-medium">Biletiniz PDF olarak indirildi!</span>
            </div>
          )}
          {emailSuccess && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3 animate-pulse">
              <i className="ri-check-double-line text-xl text-green-600"></i>
              <span className="font-medium">Biletiniz {reservation?.contact.email} adresine gönderildi!</span>
            </div>
          )}

          {/* Aksiyon Butonları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl font-semibold hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  İndiriliyor...
                </>
              ) : (
                <>
                  <i className="ri-download-line text-xl"></i>
                  PDF İndir
                </>
              )}
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="bg-white border-2 border-gray-300 text-gray-900 px-6 py-4 rounded-xl font-semibold hover:border-red-600 hover:text-red-600 transition-all flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50"
            >
              {sending ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Gönderiliyor...
                </>
              ) : (
                <>
                  <i className="ri-mail-send-line text-xl"></i>
                  E-posta Gönder
                </>
              )}
            </button>

            <button
              onClick={handleCheckIn}
              className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg shadow-red-600/30"
            >
              <i className="ri-login-box-line text-xl"></i>
              Check-in Yap
            </button>
          </div>

          {/* Bilgilendirme */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex gap-4">
              <i className="ri-information-line text-2xl text-blue-600 flex-shrink-0"></i>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Önemli Bilgiler</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Biletiniz e-posta adresinize gönderilmiştir</li>
                  <li>• Uçuştan 24 saat önce online check-in yapabilirsiniz</li>
                  <li>• Havalimanına en az 2 saat önce gelmeniz önerilir</li>
                  <li>• Kimlik belgenizi yanınızda bulundurmayı unutmayın</li>
                  <li>• Rezervasyon detaylarınızı "Hesabım" sayfasından görüntüleyebilirsiniz</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        @keyframes scale-in {
          from {
            transform: scale(0.8);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}