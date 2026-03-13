import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import SearchForm from './components/SearchForm';
import StatusCard from './components/StatusCard';
import { useFlightStatus, toStatusCardFormat } from '../../hooks/useFlights';

export default function FlightStatusPage() {
  const { flights, loading, search } = useFlightStatus();
  const [hasSearched, setHasSearched] = useState(false);

  const searchResults = flights.map(toStatusCardFormat);

  const handleSearch = (
    searchType: 'flightNumber' | 'route' | 'pnr',
    value: string,
    from?: string,
    to?: string,
    date?: string
  ) => {
    setHasSearched(true);
    search(searchType, value, from, to, date);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 pt-16 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
            <i className="ri-flight-takeoff-line text-3xl text-white"></i>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">Uçuş Durumu</h1>
          <p className="text-xl text-red-100">Anlık uçuş bilgisi ve kapı durumunu öğrenin</p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-8 mt-8">
            {['Anlık Güncelleme', 'Kapı Bilgisi', 'Tahmini Saatler'].map((item, i) => (
              <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                <i className="ri-check-line text-red-200"></i>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 -mt-10 relative z-10">
          <SearchForm onSearch={handleSearch} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8">
          {hasSearched ? (
            loading ? (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <i className="ri-flight-takeoff-line text-4xl text-red-400"></i>
                </div>
                <p className="text-gray-500 text-lg">Uçuş durumu sorgulanıyor...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1 h-8 bg-red-600 rounded-full"></div>
                  <p className="text-gray-700 font-semibold">
                    <span className="text-red-600 text-xl font-bold">{searchResults.length}</span> uçuş bulundu
                  </p>
                </div>
                {searchResults.map((flight) => (
                  <StatusCard key={flight.flightNumber} flight={flight} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-md p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="ri-flight-takeoff-line text-4xl text-red-400"></i>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Uçuş Bulunamadı</h3>
                <p className="text-gray-500">Aradığınız kriterlere uygun uçuş bulunamadı. Lütfen bilgilerinizi kontrol edip tekrar deneyin.</p>
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
              {[
                { icon: 'ri-information-line', title: 'Uçuş Numarası ile Sorgulama', desc: 'Uçuş numaranızı girerek anlık durum bilgisine ulaşabilirsiniz.' },
                { icon: 'ri-route-line', title: 'Rota ile Sorgulama', desc: 'Kalkış ve varış noktalarını seçerek tüm uçuşları görüntüleyin.' },
                { icon: 'ri-time-line', title: 'Anlık Güncelleme', desc: 'Uçuş durumları anlık olarak güncellenmektedir.' },
                { icon: 'ri-notification-line', title: 'Detaylı Bilgi', desc: 'Kapı numarası, terminal ve tahmini saatler hakkında bilgi alın.' },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <i className={`${item.icon} text-2xl text-red-600`}></i>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
