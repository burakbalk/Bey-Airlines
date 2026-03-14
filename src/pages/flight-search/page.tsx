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
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
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
      if (filters.departureTime && filters.departureTime !== 'all') {
        const hour = parseInt(f.departure.time.split(':')[0], 10);
        if (filters.departureTime === 'morning' && (hour < 6 || hour >= 12)) return false;
        if (filters.departureTime === 'afternoon' && (hour < 12 || hour >= 18)) return false;
        if (filters.departureTime === 'evening' && (hour < 18 || hour >= 24)) return false;
      }
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
      <div className="sticky top-[4.5rem] md:top-[6.75rem] z-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700"></div>
        <div className="absolute inset-0 bg-white/[0.04]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-3">
          {/* Trip type & class */}
          <div className="flex items-center gap-3 mb-2.5">
            <div className="flex items-center gap-0.5 bg-white/[0.07] rounded-lg p-0.5">
              {(['round', 'one-way'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTripType(t)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    tripType === t ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {t === 'round' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5 bg-white/[0.07] rounded-lg p-0.5">
              <button
                onClick={() => setFlightClass('normal')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  flightClass === 'normal' ? 'bg-white/15 text-white' : 'text-white/40 hover:text-white/70'
                }`}
              >
                Ekonomi
              </button>
              <button
                onClick={() => setFlightClass('vip')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  flightClass === 'vip' ? 'bg-amber-500/20 text-amber-400' : 'text-white/40 hover:text-white/70'
                }`}
              >
                <i className="ri-vip-crown-2-fill text-xs"></i>VIP
              </button>
            </div>
          </div>

          {/* Form fields */}
          <div className="flex flex-col md:flex-row items-stretch gap-1.5">
            {/* From / To */}
            <div className="flex-1 flex items-stretch bg-white/[0.05] rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-colors">
              <CityDropdown
                label="Nereden"
                icon="ri-takeoff-line"
                value={formData.from}
                onChange={(v) => setFormData({ ...formData, from: v })}
              />
              <div className="flex items-center px-1">
                <button
                  onClick={handleSwap}
                  className="w-7 h-7 rounded-full bg-white/10 hover:bg-primary/70 flex items-center justify-center transition-all cursor-pointer"
                >
                  <i className="ri-arrow-left-right-line text-xs text-white/60 hover:text-white"></i>
                </button>
              </div>
              <div className="border-l border-white/[0.07]">
                <CityDropdown
                  label="Nereye"
                  icon="ri-flight-land-line"
                  value={formData.to}
                  onChange={(v) => setFormData({ ...formData, to: v })}
                  cities={getAvailableDestinations(formData.from)}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="flex items-stretch bg-white/[0.05] rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-colors">
              <WeekPicker
                label="Gidiş"
                icon="ri-calendar-line"
                from={formData.from}
                to={formData.to}
                value={formData.departDate}
                onChange={(v) => setFormData({ ...formData, departDate: v })}
              />
              {tripType === 'round' && (
                <div className="border-l border-white/[0.07]">
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

            {/* Passengers */}
            <div className="flex items-stretch bg-white/[0.05] rounded-xl border border-white/[0.08] hover:border-white/[0.15] transition-colors">
              <PassengerSelector
                value={formData.passengers}
                onChange={(n) => setFormData({ ...formData, passengers: n })}
              />
            </div>

            {/* Search button */}
            <button
              onClick={() => setFilters({ ...filters })}
              className="px-5 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all text-sm cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] whitespace-nowrap"
            >
              <i className="ri-search-line"></i>
              Ara
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Filtre Drawer */}
      {filterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFilterDrawerOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-full max-w-sm bg-white overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <i className="ri-filter-3-line text-primary"></i>
                Filtreler
              </h2>
              <button
                onClick={() => setFilterDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg text-gray-600"></i>
              </button>
            </div>
            <div className="p-4">
              <FilterPanel onFilterChange={(f) => { setFilters(f); setFilterDrawerOpen(false); }} />
            </div>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-700 hover:border-primary hover:text-primary transition-colors cursor-pointer"
              >
                <i className="ri-filter-3-line"></i>
                Filtreler
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
              >
                <option value="price">Fiyata Göre</option>
                <option value="departure">Kalkış Saatine Göre</option>
              </select>
              </div>
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
