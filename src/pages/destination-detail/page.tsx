import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDestinationById, useDestinations } from '../../hooks/useDestinations';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';

export default function DestinationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { destination, loading } = useDestinationById(id);
  const { destinations } = useDestinations();

  const otherDestinations = destinations.filter(d => d.id !== destination?.id).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <i className="ri-loader-4-line text-5xl text-red-600 animate-spin"></i>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Destinasyon bulunamadı</h2>
            <Link to="/" className="text-primary hover:underline">Ana sayfaya dön</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="relative h-72 sm:h-96 md:h-[500px] overflow-hidden">
        <div className="w-full h-full">
          <img
            src={destination.hero_image}
            alt={destination.city}
            className="w-full h-full object-cover object-top"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4 sm:px-8 max-w-4xl">
            <div className="w-14 h-14 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <i className="ri-map-pin-line text-4xl sm:text-6xl"></i>
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4">{destination.city}</h1>
            <p className="text-base sm:text-xl mb-6 text-white/90">{destination.country}</p>
            
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                {destination.weather.temp}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap">
                {destination.weather.condition}
              </span>
              <span className="bg-primary text-white px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap">
                {destination.price} TL'den başlayan fiyatlarla
              </span>
            </div>

            <button
              onClick={() => navigate('/ucus-ara')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-2xl whitespace-nowrap"
            >
              Bu Destinasyona Uç
            </button>
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-16 bg-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="bg-white rounded-2xl shadow-md p-8">
            <p className="text-lg text-gray-700 leading-relaxed">{destination.description}</p>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Öne Çıkan Özellikler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destination.highlights.map((highlight, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-primary/10 rounded-xl mb-4">
                  <i className={`${highlight.icon} text-3xl text-primary`}></i>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{highlight.title}</h3>
                <p className="text-gray-600 text-sm">{highlight.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-16 bg-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Galeri</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destination.gallery.map((image, index) => (
              <div
                key={index}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="w-full h-40 sm:h-64">
                  <img
                    src={image}
                    alt={`${destination.city} ${index + 1}`}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Flights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Popüler Uçuşlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {destination.popular_flights.map((flight, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-lg">
                      <i className="ri-flight-takeoff-line text-xl text-primary"></i>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Kalkış</p>
                      <p className="font-bold text-gray-800">{flight.from}</p>
                    </div>
                  </div>
                  <i className="ri-arrow-right-line text-2xl text-gray-400"></i>
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm text-gray-500 text-right">Varış</p>
                      <p className="font-bold text-gray-800 text-right">{destination.city}</p>
                    </div>
                    <div className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-lg">
                      <i className="ri-flight-land-line text-xl text-red-600"></i>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-600">Süre</span>
                    <span className="font-semibold text-gray-800">{flight.duration}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600">Tarih</span>
                    <span className="font-semibold text-gray-800">{flight.date}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">{flight.price} TL</span>
                    <button
                      onClick={() => navigate('/ucus-ara')}
                      className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap"
                    >
                      Rezervasyon Yap
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Other Destinations */}
      <section className="py-16 bg-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Diğer Destinasyonlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherDestinations.map((dest) => (
              <Link
                key={dest.id}
                to={`/destinasyonlar/${dest.id}`}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className="w-full h-40 sm:h-64">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{dest.city}</h3>
                    <p className="text-sm text-white/80">{dest.country}</p>
                  </div>
                  <div className="bg-red-600 text-white px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                    {dest.price} TL'den
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
