import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { usePageTitle } from '../../hooks/usePageTitle';
import FilterPanel from './components/FilterPanel';
import type { FlightFilters } from './components/FilterPanel';
import FlightCard from './components/FlightCard';
import { useFlightsByDate, toFlightCardFormat } from '../../hooks/useFlights';
import {
  CityDropdown,
  WeekPicker,
  PassengerSelector,
  useSearchForm,
  getAvailableDestinations,
} from '../../components/feature/SearchForm';

export default function FlightSearchPage() {
  usePageTitle('Uçuş Ara');
  const location = useLocation();
  const locationState = location.state as { from?: string; to?: string; departDate?: string; returnDate?: string; passengers?: number; flightClass?: 'normal' | 'vip' } | null;

  const [filters, setFilters] = useState<FlightFilters>({ directOnly: false, departureTime: 'all', maxPrice: 10000, includeBaggage: false, flightClass: 'all' });
  const [sortBy, setSortBy] = useState('price');
  const { tripType, setTripType, flightClass, setFlightClass, formData, setFormData, handleSwap } = useSearchForm(
    locationState
      ? {
          from: locationState.from,
          to: locationState.to,
          departDate: locationState.departDate,
          returnDate: locationState.returnDate,
          passengers: locationState.passengers,
        }
      : undefined
  );

  // Ana sayfadan gelen uçuş sınıfını uygula
  useEffect(() => {
    if (locationState?.flightClass) {
      setFlightClass(locationState.flightClass);
    }
    // Sadece ilk mount'ta çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // flightClass değiştiğinde filtreyi senkronize et
  useEffect(() => {
    setFilters(prev => ({ ...prev, flightClass: flightClass === 'normal' ? 'normal' : flightClass === 'vip' ? 'vip' : 'all' }));
  }, [flightClass]);

  const { flights: rawFlights, loading } = useFlightsByDate(
    formData.departDate || new Date().toISOString().split('T')[0],
    formData.from || undefined,
    formData.to || undefined
  );

  const availableFlights = useMemo(
    () => rawFlights.map(toFlightCardFormat),
    [rawFlights]
  );

  const filtered = availableFlights
    .filter((f) => {
      if (filters.flightClass && filters.flightClass !== 'all' && f.flightClass !== filters.flightClass) return false;
      if (filters.directOnly && f.type !== 'Direkt') return false;
      if (filters.includeBaggage && !f.baggage) return false;
      if (filters.maxPrice && f.price > filters.maxPrice) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price;
      if (sortBy === 'departure') return a.departure.time.localeCompare(b.departure.time);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Search bar */}
      <div className="sticky top-16 z-40">
        <div className="relative rounded-b-2xl shadow-2xl shadow-black/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700"></div>
          <div className="absolute inset-0 bg-white/[0.05] backdrop-blur-xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-8 py-2 sm:py-4">
            {/* Trip type & class tabs */}
            <div className="flex flex-wrap items-center justify-between mb-3">
              <div className="flex items-center gap-1">
                {(['round', 'one-way'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTripType(t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      tripType === t
                        ? 'bg-white/20 text-white border border-white/20'
                        : 'text-white/50 hover:text-white/80 border border-transparent'
                    }`}
                  >
                    {t === 'round' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFlightClass('normal')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    flightClass === 'normal'
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-white/50 hover:text-white/80 border border-transparent'
                  }`}
                >
                  Ekonomi
                </button>
                <button
                  onClick={() => setFlightClass('vip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                    flightClass === 'vip'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                      : 'text-white/50 hover:text-white/80 border border-transparent'
                  }`}
                >
                  <i className="ri-vip-crown-2-fill text-xs"></i> VIP
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col md:flex-row items-stretch gap-2">
              <div className="flex-1 flex items-stretch bg-white/[0.06] rounded-2xl border border-white/[0.1]">
                <CityDropdown
                  label="Nereden"
                  icon="ri-takeoff-line"
                  value={formData.from}
                  onChange={(v) => setFormData({ ...formData, from: v })}
                />
                <div className="flex items-center">
                  <button
                    onClick={handleSwap}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-primary/60 flex items-center justify-center transition-all cursor-pointer group duration-200"
                  >
                    <i className="ri-arrow-left-right-line text-sm text-white/60 group-hover:text-white"></i>
                  </button>
                </div>
                <div className="border-l border-white/[0.08]">
                  <CityDropdown
                    label="Nereye"
                    icon="ri-flight-land-line"
                    value={formData.to}
                    onChange={(v) => setFormData({ ...formData, to: v })}
                    cities={getAvailableDestinations(formData.from)}
                  />
                </div>
              </div>

              <div className="flex items-stretch bg-white/[0.06] rounded-2xl border border-white/[0.1]">
                <WeekPicker
                  label="Gidiş"
                  icon="ri-calendar-line"
                  from={formData.from}
                  to={formData.to}
                  value={formData.departDate}
                  onChange={(v) => setFormData({ ...formData, departDate: v })}
                />
                {tripType === 'round' && (
                  <div className="border-l border-white/[0.08]">
                    <WeekPicker
                      label="Dönüş"
                      icon="ri-calendar-check-line"
                      from={formData.to}
                      to={formData.from}
                      value={formData.returnDate}
                      onChange={(v) => setFormData({ ...formData, returnDate: v })}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-stretch bg-white/[0.06] rounded-2xl border border-white/[0.1]">
                <PassengerSelector
                  value={formData.passengers}
                  onChange={(n) => setFormData({ ...formData, passengers: n })}
                />
              </div>

              <button
                onClick={() => setFilters({ ...filters })}
                className="px-4 sm:px-8 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-2xl transition-all text-sm cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] whitespace-nowrap"
              >
                <i className="ri-search-line text-lg"></i>
                Uçuş Ara
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <FilterPanel onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-9">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600 text-sm">
                  <strong className="text-primary text-base">{filtered.length}</strong> uçuş bulundu
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {filtered.filter(f => f.flightClass === 'normal').length} Normal
                  </span>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                    <i className="ri-vip-crown-fill text-xs"></i>
                    {filtered.filter(f => f.flightClass === 'vip').length} VIP
                  </span>
                </div>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="price">Fiyata Göre</option>
                <option value="departure">Kalkış Saatine Göre</option>
              </select>
            </div>

            <div className="space-y-4">
              {loading ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-red-50 rounded-full animate-pulse">
                    <i className="ri-plane-line text-3xl text-primary"></i>
                  </div>
                  <p className="text-gray-500 text-lg">Uçuşlar yükleniyor...</p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-red-50 rounded-full">
                    <i className="ri-plane-line text-3xl text-primary"></i>
                  </div>
                  <p className="text-gray-500 text-lg">Seçilen kriterlere uygun uçuş bulunamadı.</p>
                  <p className="text-gray-400 text-sm mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
                </div>
              ) : (
                filtered.map((flight) => (
                  <FlightCard key={flight.id} flight={flight} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
