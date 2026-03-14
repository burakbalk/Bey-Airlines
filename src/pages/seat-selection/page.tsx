import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import BookingStepper from '../../components/feature/BookingStepper';
import { supabase } from '../../lib/supabase';

interface Seat {
  id: string;
  row: number;
  column: string;
  type: 'economy' | 'vip' | 'exit';
  status: 'available' | 'occupied' | 'selected';
  price: number;
}

interface BookingPassenger {
  id: string;
  firstName: string;
  lastName: string;
  [key: string]: unknown;
}

interface SeatBookingData {
  flightId: string;
  from: string;
  to: string;
  date: string;
  price: string;
  passengers: BookingPassenger[];
  seats?: { seatId: string; type?: string; price?: number }[];
  [key: string]: unknown;
}

interface PassengerSeat {
  passengerId: string;
  passengerName: string;
  seatId: string | null;
}

const SeatSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const flightId = searchParams.get('flightId');

  const [bookingData, setBookingData] = useState<SeatBookingData | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [passengerSeats, setPassengerSeats] = useState<PassengerSeat[]>([]);
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0);
  const [seatError, setSeatError] = useState('');

  const buildSeats = (occupiedIds: Set<string>): Seat[] => {
    const seatLayout: Seat[] = [];
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];

    for (let row = 1; row <= 30; row++) {
      columns.forEach(col => {
        let type: 'economy' | 'vip' | 'exit' = 'economy';
        let price = 0;

        if (row <= 5) { type = 'vip'; price = 250; }
        else if (row === 12 || row === 13) { type = 'exit'; price = 150; }

        const id = `${row}${col}`;
        seatLayout.push({
          id,
          row,
          column: col,
          type,
          status: occupiedIds.has(id) ? 'occupied' : 'available',
          price,
        });
      });
    }
    return seatLayout;
  };

  const fetchOccupiedSeats = async (flightId: number): Promise<Set<string>> => {
    const { data: passengers } = await supabase
      .from('passengers')
      .select('seat_number, reservations!inner(flight_id)')
      .eq('reservations.flight_id', flightId)
      .not('seat_number', 'is', null)
      .neq('seat_number', '-');

    const occupied = new Set<string>();
    passengers?.forEach(p => {
      if (p.seat_number) occupied.add(p.seat_number);
    });
    return occupied;
  };

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      navigate('/ucus-ara');
      return;
    }

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

      const passengerSeatMap = parsed.passengers.map((p: BookingPassenger) => ({
        passengerId: p.id,
        passengerName: `${p.firstName} ${p.lastName}`,
        seatId: null,
      }));
      setPassengerSeats(passengerSeatMap);

      setSeatsLoading(true);
      const fId = Number(parsed.flightId);
      if (fId) {
        fetchOccupiedSeats(fId).then(occupiedIds => {
          setSeats(buildSeats(occupiedIds));
          setSeatsLoading(false);
        });
      } else {
        setSeats(buildSeats(new Set()));
        setSeatsLoading(false);
      }
    } catch {
      navigate('/ucus-ara');
    }
  }, [navigate]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    
    const currentPassenger = passengerSeats[selectedPassengerIndex];
    
    // Eğer bu yolcunun zaten bir koltuğu varsa, onu serbest bırak
    if (currentPassenger.seatId) {
      setSeats(prev => prev.map(s => 
        s.id === currentPassenger.seatId ? { ...s, status: 'available' } : s
      ));
    }
    
    // Eğer tıklanan koltuk başka bir yolcuya aitse, değiştir
    const otherPassengerIndex = passengerSeats.findIndex(ps => ps.seatId === seat.id);
    if (otherPassengerIndex !== -1 && otherPassengerIndex !== selectedPassengerIndex) {
      setPassengerSeats(prev => prev.map((ps, idx) => 
        idx === otherPassengerIndex ? { ...ps, seatId: null } : ps
      ));
    }
    
    // Yeni koltuğu seç
    setPassengerSeats(prev => prev.map((ps, idx) => 
      idx === selectedPassengerIndex ? { ...ps, seatId: seat.id } : ps
    ));
    
    setSeats(prev => prev.map(s => {
      if (s.id === seat.id) return { ...s, status: 'selected' };
      if (s.id === currentPassenger.seatId) return { ...s, status: 'available' };
      return s;
    }));
    
    // Otomatik olarak bir sonraki yolcuya geç
    if (selectedPassengerIndex < passengerSeats.length - 1) {
      setTimeout(() => {
        setSelectedPassengerIndex(selectedPassengerIndex + 1);
      }, 300);
    }
  };

  const getSeatStatus = (seatId: string): 'available' | 'occupied' | 'selected' => {
    const seat = seats.find(s => s.id === seatId);
    return seat?.status || 'available';
  };

  const calculateTotalSeatPrice = () => {
    let total = 0;
    passengerSeats.forEach(ps => {
      if (ps.seatId) {
        const seat = seats.find(s => s.id === ps.seatId);
        if (seat) total += seat.price;
      }
    });
    return total;
  };

  const handleContinue = () => {
    setSeatError('');
    // Tüm yolcular koltuk seçti mi kontrol et
    const unassigned = passengerSeats.filter(ps => !ps.seatId);
    if (unassigned.length > 0) {
      setSeatError(`Lütfen tüm yolcular için koltuk seçin. ${unassigned.length} yolcu için koltuk seçilmedi.`);
      return;
    }
    
    // Koltuk bilgilerini kaydet (type ve price bilgisini de ekle)
    const seatsWithDetails = passengerSeats.map(ps => {
      const seat = seats.find(s => s.id === ps.seatId);
      return {
        ...ps,
        type: seat?.type || 'economy',
        price: seat?.price || 0
      };
    });
    const updatedBookingData = {
      ...bookingData,
      seats: seatsWithDetails
    };
    sessionStorage.setItem('bookingData', JSON.stringify(updatedBookingData));
    
    navigate(`/ek-hizmetler?flightId=${flightId}`);
  };

  if (!bookingData) return null;

  const unitPrice = parseFloat(bookingData.price.replace(/[.,]/g, ''));
  const basePrice = bookingData.passengers.reduce((sum, p) => {
    const type = (p as { type?: string }).type;
    if (type === 'child') return sum + unitPrice * 0.75;
    if (type === 'infant') return sum + unitPrice * 0.1;
    return sum + unitPrice;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1 pt-4">
        <BookingStepper currentStep={2} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Taraf - Koltuk Haritası */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Koltuk Seçimi</h2>
                
                {/* Yolcu Seçici */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {passengerSeats.map((ps, idx) => (
                    <button
                      key={ps.passengerId}
                      type="button"
                      onClick={() => setSelectedPassengerIndex(idx)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                        selectedPassengerIndex === idx
                          ? 'bg-red-600 text-white shadow-lg'
                          : ps.seatId
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                    >
                      {ps.passengerName}
                      {ps.seatId && <span className="ml-2 font-bold">{ps.seatId}</span>}
                    </button>
                  ))}
                </div>

                {/* Koltuk Gösterge */}
                <div className="mb-6 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {[
                    { color: 'bg-white border-2 border-gray-200', label: 'Boş' },
                    { color: 'bg-primary', label: 'Seçili' },
                    { color: 'bg-gray-300', label: 'Dolu' },
                    { color: 'bg-amber-400', label: 'VIP (+250₺)' },
                    { color: 'bg-sky-400', label: 'Acil Çıkış (+150₺)' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded ${item.color} flex-shrink-0`}></div>
                      <span className="text-xs text-gray-600 whitespace-nowrap">{item.label}</span>
                    </div>
                  ))}
                </div>

                {seatsLoading && (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <i className="ri-loader-4-line animate-spin text-2xl mr-2"></i>
                    Koltuk durumu yükleniyor...
                  </div>
                )}

                {/* Uçak Kabini */}
                {!seatsLoading && <div className="bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-gray-100 p-3 sm:p-6 overflow-x-auto">
                  {/* Uçak burnu / kokpit */}
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-10 bg-gradient-to-b from-gray-400 to-gray-300 rounded-t-full flex items-end justify-center pb-1">
                      <i className="ri-plane-fill text-white text-lg rotate-90"></i>
                    </div>
                    <div className="w-32 h-4 bg-gray-200 rounded-b"></div>
                    <p className="text-xs text-gray-400 mt-2 font-medium tracking-widest uppercase">Ön</p>
                  </div>

                  {/* VIP section label */}
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="flex-1 h-px bg-amber-200"></div>
                    <span className="text-xs text-amber-600 font-semibold whitespace-nowrap flex items-center gap-1">
                      <i className="ri-vip-crown-fill text-xs"></i> VIP Kabin (1-5)
                    </span>
                    <div className="flex-1 h-px bg-amber-200"></div>
                  </div>

                  {/* Koltuklar */}
                  <div className="space-y-1.5 sm:space-y-3">
                    {Array.from({ length: 30 }, (_, rowIdx) => {
                      const row = rowIdx + 1;
                      const rowSeats = seats.filter(s => s.row === row);

                      return (
                        <div key={row} className="flex items-center justify-center gap-1 sm:gap-2">
                          {/* Sol taraf (A, B, C) */}
                          <div className="flex gap-1 sm:gap-2">
                            {['A', 'B', 'C'].map(col => {
                              const seat = rowSeats.find(s => s.column === col);
                              if (!seat) return null;

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status === 'occupied'}
                                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md sm:rounded-lg font-semibold text-[10px] sm:text-xs transition-all flex items-center justify-center ${
                                    seat.status === 'occupied'
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : seat.status === 'selected'
                                      ? 'bg-red-600 text-white shadow-lg scale-110'
                                      : seat.type === 'vip'
                                      ? 'bg-amber-500 text-white hover:bg-amber-600 cursor-pointer'
                                      : seat.type === 'exit'
                                      ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-600 cursor-pointer'
                                  }`}
                                  title={`${seat.id} - ${seat.type === 'vip' ? 'VIP +250₺' : seat.type === 'exit' ? 'Acil Çıkış +150₺' : 'Ekonomi'}`}
                                >
                                  {seat.column}
                                </button>
                              );
                            })}
                          </div>

                          {/* Sıra numarası */}
                          <div className="w-6 sm:w-8 text-center font-bold text-gray-500 text-xs sm:text-sm">
                            {row}
                          </div>

                          {/* Sağ taraf (D, E, F) */}
                          <div className="flex gap-1 sm:gap-2">
                            {['D', 'E', 'F'].map(col => {
                              const seat = rowSeats.find(s => s.column === col);
                              if (!seat) return null;

                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status === 'occupied'}
                                  className={`w-10 h-10 sm:w-11 sm:h-11 rounded-md sm:rounded-lg font-semibold text-[10px] sm:text-xs transition-all flex items-center justify-center ${
                                    seat.status === 'occupied'
                                      ? 'bg-gray-400 text-white cursor-not-allowed'
                                      : seat.status === 'selected'
                                      ? 'bg-red-600 text-white shadow-lg scale-110'
                                      : seat.type === 'vip'
                                      ? 'bg-amber-500 text-white hover:bg-amber-600 cursor-pointer'
                                      : seat.type === 'exit'
                                      ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer'
                                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-red-600 cursor-pointer'
                                  }`}
                                  title={`${seat.id} - ${seat.type === 'vip' ? 'VIP +250₺' : seat.type === 'exit' ? 'Acil Çıkış +150₺' : 'Ekonomi'}`}
                                >
                                  {seat.column}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>}
              </div>
            </div>

            {/* Sağ Taraf - Özet */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <i className="ri-flight-takeoff-line text-primary text-xl"></i>
                  <h3 className="text-lg font-bold text-gray-900">Rezervasyon Özeti</h3>
                </div>

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

                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-sm font-semibold text-gray-700 mb-3">Seçilen Koltuklar</div>
                    {passengerSeats.map(ps => {
                      const seat = seats.find(s => s.id === ps.seatId);
                      return (
                        <div key={ps.passengerId} className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">{ps.passengerName}</span>
                          <span className="font-semibold text-gray-900">
                            {ps.seatId ? (
                              <>
                                {ps.seatId}
                                {seat && seat.price > 0 && (
                                  <span className="text-red-600 ml-2">+{seat.price}₺</span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400">Seçilmedi</span>
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Uçuş Ücreti</span>
                      <span className="font-semibold text-gray-900">{basePrice.toLocaleString('tr-TR')} ₺</span>
                    </div>
                    {calculateTotalSeatPrice() > 0 && (
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Koltuk Ücreti</span>
                        <span className="font-semibold text-gray-900">{calculateTotalSeatPrice().toLocaleString('tr-TR')} ₺</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">Ara Toplam</span>
                      <span className="text-2xl font-bold text-red-600">
                        {(basePrice + calculateTotalSeatPrice()).toLocaleString('tr-TR')} ₺
                      </span>
                    </div>
                  </div>
                </div>

                {seatError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700" role="alert">
                    <i className="ri-error-warning-line text-lg flex-shrink-0"></i>
                    <span>{seatError}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <span>Ek Hizmetlere Geç</span>
                  <i className="ri-arrow-right-line text-lg"></i>
                </button>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <div className="flex items-start space-x-2">
                    <i className="ri-information-line text-blue-600 text-lg mt-0.5"></i>
                    <p className="text-xs text-blue-800">
                      Koltuk seçimi zorunlu değildir. Seçim yapmazsanız otomatik atama yapılacaktır.
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

export default SeatSelectionPage;