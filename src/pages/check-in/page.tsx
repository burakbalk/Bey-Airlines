import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

export default function CheckInPage() {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({ pnr: '', surname: '' });
  const [selectedSeat, setSelectedSeat] = useState('12A');

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.pnr && formData.surname) setStep('success');
  };

  const seats = Array.from({ length: 30 }, (_, i) => {
    const row = Math.floor(i / 6) + 1;
    const letter = ['A', 'B', 'C', 'D', 'E', 'F'][i % 6];
    const isOccupied = [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 3, 7, 13, 19, 25].includes(i);
    return { number: `${row}${letter}`, occupied: isOccupied };
  });

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
            {['Hızlı İşlem', 'Dijital Biniş Kartı', 'Koltuk Seçimi'].map((item, i) => (
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
              <form onSubmit={handleCheckIn}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">PNR Kodu</label>
                    <input
                      type="text"
                      value={formData.pnr}
                      onChange={(e) => setFormData({ ...formData, pnr: e.target.value.toUpperCase() })}
                      placeholder="ABC123"
                      maxLength={6}
                      className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl text-lg font-semibold uppercase focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Soyad</label>
                    <input
                      type="text"
                      value={formData.surname}
                      onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                      placeholder="YILMAZ"
                      className="w-full h-14 px-4 border-2 border-gray-200 rounded-xl text-lg focus:outline-none focus:border-red-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full h-14 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors text-lg whitespace-nowrap cursor-pointer shadow-lg shadow-red-200"
                >
                  <i className="ri-checkbox-circle-line mr-2"></i>Check-in Yap
                </button>
                <p className="text-center text-sm text-gray-400 mt-5">
                  Rezervasyon bulamıyor musunuz?{' '}
                  <a href="/yardim" className="text-red-600 hover:underline font-medium">Yardım alın</a>
                </p>
              </form>

              {/* Info Cards */}
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
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-8 -mt-10 relative z-10">
            {/* Success Banner */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3 shadow-sm">
              <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-full">
                <i className="ri-check-line text-2xl text-green-600"></i>
              </div>
              <div>
                <p className="text-green-800 font-bold">Check-in başarıyla tamamlandı!</p>
                <p className="text-green-600 text-sm">Biniş kartınız hazır. İyi uçuşlar dileriz.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Flight Info + Seat Map */}
              <div className="lg:col-span-2 space-y-6">
                {/* Flight Info */}
                <div className="bg-white rounded-2xl shadow-md p-3 sm:p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">AHMET YILMAZ</h3>
                      <p className="text-gray-500 mt-1">Uçuş: <span className="font-semibold text-red-600">BY1101</span> · 15 Haziran 2024</p>
                    </div>
                    <div className="text-right bg-red-50 px-5 py-3 rounded-xl">
                      <p className="text-xs text-gray-500 mb-1">Koltuk</p>
                      <p className="text-2xl sm:text-4xl font-black text-red-600">{selectedSeat}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">İSTANBUL</p>
                      <p className="text-sm text-gray-500 mt-1">IST · 06:30</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <i className="ri-flight-takeoff-line text-2xl text-red-600"></i>
                      <p className="text-xs text-gray-400">4s 30dk</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">DUBAİ</p>
                      <p className="text-sm text-gray-500 mt-1">DXB · 11:00</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 mt-4">
                    {[
                      { label: 'Kapı', value: 'A12' },
                      { label: 'Terminal', value: 'Terminal 1' },
                      { label: 'Bagaj', value: '20 kg' },
                    ].map((item, i) => (
                      <div key={i} className="text-center p-3 border border-gray-100 rounded-lg">
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="font-bold text-gray-900 mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Seat Map */}
                <div className="bg-white rounded-2xl shadow-md p-3 sm:p-6 border border-gray-100">
                  <h3 className="text-lg font-bold text-gray-900 mb-5">Koltuk Seçimi</h3>
                  <div className="flex justify-center gap-2 sm:gap-6 text-sm mb-6">
                    {[
                      { color: 'bg-gray-200', label: 'Boş' },
                      { color: 'bg-red-600', label: 'Dolu' },
                      { color: 'bg-red-500 ring-2 ring-red-300', label: 'Seçili' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-md ${item.color}`}></div>
                        <span className="text-gray-600">{item.label}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-6 gap-1 sm:gap-2 max-w-xs mx-auto">
                    {seats.map((seat) => (
                      <button
                        key={seat.number}
                        onClick={() => !seat.occupied && setSelectedSeat(seat.number)}
                        disabled={seat.occupied}
                        className={`aspect-square rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                          seat.occupied
                            ? 'bg-red-600 text-white cursor-not-allowed opacity-70'
                            : selectedSeat === seat.number
                            ? 'bg-red-500 text-white ring-2 ring-red-300 scale-110'
                            : 'bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700 cursor-pointer'
                        }`}
                      >
                        {seat.number}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Boarding Pass */}
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
                        { label: 'Yolcu', value: 'AHMET YILMAZ' },
                        { label: 'Uçuş', value: 'BY1101' },
                        { label: 'Tarih', value: '15 HAZ 2024' },
                        { label: 'Kalkış', value: '06:30' },
                        { label: 'Kapı', value: 'A12' },
                        { label: 'Koltuk', value: selectedSeat },
                      ].map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-white/10 pb-2">
                          <span className="text-red-200 text-xs">{item.label}</span>
                          <span className={`font-bold ${item.label === 'Koltuk' ? 'text-xl' : 'text-sm'}`}>{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-5 space-y-3">
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-red-100">
                      <i className="ri-download-line mr-2"></i>Biniş Kartını İndir
                    </button>
                    <button className="w-full border-2 border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition-colors whitespace-nowrap cursor-pointer">
                      <i className="ri-mail-send-line mr-2"></i>E-posta Gönder
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
