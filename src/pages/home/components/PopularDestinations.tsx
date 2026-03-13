import { Link } from 'react-router-dom';
import { useDestinations } from '../../../hooks/useDestinations';

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden bg-gray-200 animate-pulse">
      <div className="w-full h-80 bg-gray-300"></div>
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  );
}

export default function PopularDestinations() {
  const { destinations, loading } = useDestinations();

  return (
    <section className="bg-bg-alt py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-0.5 bg-primary rounded-full"></div>
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">Keşfet</p>
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
              Popüler Destinasyonlar
            </h2>
            <p className="text-text-secondary mt-2 text-sm sm:text-base">
              En çok tercih edilen rotalarımızda özel fiyatlar sizi bekliyor
            </p>
          </div>
          <Link
            to="/ucus-ara"
            className="flex-shrink-0 flex items-center gap-2 border border-primary/30 hover:border-primary text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all self-start sm:self-auto"
          >
            Tüm Destinasyonlar
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-map-pin-line text-5xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500">Henüz destinasyon eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((destination, index) => (
              <Link
                key={destination.id}
                to={`/destinasyonlar/${destination.slug}`}
                className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 block"
              >
                <div className="w-full h-80">
                  <img
                    src={destination.image}
                    alt={destination.city}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"></div>

                {/* Popular badge for first card */}
                {index === 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="flex items-center gap-1 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      <i className="ri-fire-fill text-xs"></i>
                      En Popüler
                    </span>
                  </div>
                )}

                {/* Arrow icon on hover */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0">
                  <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <i className="ri-arrow-right-up-line text-white text-base"></i>
                  </div>
                </div>

                {/* Card content */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-white mb-0.5">{destination.city}</h3>
                    <p className="text-sm text-white/65 flex items-center gap-1">
                      <i className="ri-map-pin-line text-xs"></i>
                      {destination.country}
                    </p>
                  </div>
                  <div className="bg-white text-gray-900 px-3.5 py-2 rounded-xl text-sm font-bold shadow-lg whitespace-nowrap flex flex-col items-end">
                    <span className="text-[10px] text-gray-500 font-normal leading-none mb-0.5">itibaren</span>
                    <span>{destination.price} ₺</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
