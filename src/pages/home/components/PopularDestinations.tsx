import { Link } from 'react-router-dom';
import { useDestinations } from '../../../hooks/useDestinations';

export default function PopularDestinations() {
  const { destinations, loading } = useDestinations();

  if (loading) {
    return (
      <section className="bg-bg-alt py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <i className="ri-loader-4-line text-4xl text-red-600 animate-spin"></i>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-bg-alt py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-3">Keşfet</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Popüler Destinasyonlar</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/destinasyonlar/${destination.id}`}
              className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className="w-full h-80">
                <img
                  src={destination.image}
                  alt={destination.city}
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between items-end">
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white mb-1">{destination.city}</h3>
                  <p className="text-sm text-white/70">{destination.country}</p>
                </div>
                <div className="bg-white text-gray-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg whitespace-nowrap">
                  {destination.price} TL'den
                </div>
              </div>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <i className="ri-arrow-right-up-line text-white text-lg"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
