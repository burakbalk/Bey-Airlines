import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

interface Seat {
  id: string;
  row: number;
  column: string;
  type: 'economy' | 'vip' | 'exit';
  status: 'available' | 'occupied' | 'selected';
  price: number;
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

  const [bookingData, setBookingData] = useState<any>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [passengerSeats, setPassengerSeats] = useState<PassengerSeat[]>([]);
  const [selectedPassengerIndex, setSelectedPassengerIndex] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem('bookingData');
    if (!data) {
      navigate('/ucus-ara');
      return;
    }
    
    const parsed = JSON.parse(data);
    setBookingData(parsed);

    // Yolcu-koltuk eşleştirmesi oluştur
    const passengerSeatMap = parsed.passengers.map((p: any, idx: number) => ({
      passengerId: p.id,
      passengerName: `${p.firstName} ${p.lastName}`,
      seatId: null
    }));
    setPassengerSeats(passengerSeatMap);

    // Mock koltuk haritası oluştur
    generateSeats();
  }, []);

  const generateSeats = () => {
    const seatLayout: Seat[] = [];
    const columns = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    for (let row = 1; row <= 30; row++) {
      columns.forEach(col => {
        let type: 'economy' | 'vip' | 'exit' = 'economy';
        let price = 0;
        
        // İlk 5 sıra VIP
        if (row <= 5) {
          type = 'vip';
          price = 250;
        }
        // 12. ve 13. sıra acil çıkış
        else if (row === 12 || row === 13) {
          type = 'exit';
          price = 150;
        }
        
        // Rastgele dolu koltuklar
        const isOccupied = Math.random() > 0.65;
        
        seatLayout.push({
          id: `${row}${col}`,
          row,
          column: col,
          type,
          status: isOccupied ? 'occupied' : 'available',
          price
        });
      });
    }
    
    setSeats(seatLayout);
  };

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
    // Tüm yolcular koltuk seçti mi kontrol et
    const unassigned = passengerSeats.filter(ps => !ps.seatId);
    if (unassigned.length > 0) {
      alert(`Lütfen tüm yolcular için koltuk seçin. ${unassigned.length} yolcu için koltuk seçilmedi.`);
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

  const basePrice = parseFloat(bookingData.price.replace(/[.,]/g, '')) * bookingData.passengers.length;

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

              <div className="flex items-center space-x-1 sm:space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-semibold">
                  2
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-red-600">Koltuk Seçimi</div>
                  <div className="text-xs text-gray-500">Koltuk seçin</div>
                </div>
              </div>

              <div className="flex-1 h-0.5 bg-gray-200 mx-1 sm:mx-4"></div>

              <div className="flex items-center space-x-1 sm:space-x-3 opacity-50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
                  3
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-500">Ek Hizmetler</div>
                  <div className="text-xs text-gray-400">Bagaj, yemek, sigorta</div>
                </div>
              </div>

              <div className="flex-1 h-0.5 bg-gray-200 mx-1 sm:mx-4"></div>

              <div className="flex items-center space-x-1 sm:space-x-3 opacity-50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center font-semibold">
                  4
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-gray-500">Ödeme</div>
                  <div className="text-xs text-gray-400">Ödeme ve onay</div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                <div className="mb-6 flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-white border-2 border-gray-300"></div>
                    <span className="text-sm text-gray-600">Boş</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-red-600"></div>
                    <span className="text-sm text-gray-600">Seçili</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-400"></div>
                    <span className="text-sm text-gray-600">Dolu</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500"></div>
                    <span className="text-sm text-gray-600">VIP (+250₺)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-500"></div>
                    <span className="text-sm text-gray-600">Acil Çıkış (+150₺)</span>
                  </div>
                </div>

                {/* Uçak Kabini */}
                <div className="bg-gradient-to-b from-gray-100 to-white rounded-2xl p-3 sm:p-6 overflow-x-auto">
                  {/* Kokpit */}
                  <div className="flex justify-center mb-6">
                    <div className="w-32 h-16 bg-gray-300 rounded-t-full flex items-center justify-center">
                      <i className="ri-steering-2-line text-3xl text-gray-600"></i>
                    </div>
                  </div>

                  {/* Koltuklar */}
                  <div className="space-y-3">
                    {Array.from({ length: 30 }, (_, rowIdx) => {
                      const row = rowIdx + 1;
                      const rowSeats = seats.filter(s => s.row === row);
                      
                      return (
                        <div key={row} className="flex items-center justify-center gap-2">
                          {/* Sol taraf (A, B, C) */}
                          <div className="flex gap-2">
                            {['A', 'B', 'C'].map(col => {
                              const seat = rowSeats.find(s => s.column === col);
                              if (!seat) return null;
                              
                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status === 'occupied'}
                                  className={`w-10 h-10 rounded-lg font-semibold text-xs transition-all flex items-center justify-center ${
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
                          <div className="w-8 text-center font-bold text-gray-500 text-sm">
                            {row}
                          </div>

                          {/* Sağ taraf (D, E, F) */}
                          <div className="flex gap-2">
                            {['D', 'E', 'F'].map(col => {
                              const seat = rowSeats.find(s => s.column === col);
                              if (!seat) return null;
                              
                              return (
                                <button
                                  key={seat.id}
                                  type="button"
                                  onClick={() => handleSeatClick(seat)}
                                  disabled={seat.status === 'occupied'}
                                  className={`w-10 h-10 rounded-lg font-semibold text-xs transition-all flex items-center justify-center ${
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

                <button
                  type="button"
                  onClick={handleContinue}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors whitespace-nowrap"
                >
                  Ek Hizmetlere Geç
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