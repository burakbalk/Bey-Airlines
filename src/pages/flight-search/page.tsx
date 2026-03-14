import { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { usePageTitle } from '../../hooks/usePageTitle';
import FilterPanel from './components/FilterPanel';
import type { FlightFilters } from './components/FilterPanel';
import FlightCard from './components/FlightCard';
import { useFlightsByDate, toFlightCardFormat } from '../../hooks/useFlights';
import { getTodayTR } from '../../utils/date';
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
  const locationState = location.state as { from?: string; to?: string; departDate?: string; returnDate?: string; passengers?: number; flightClass?: 'all' | 'premium' | 'vip' } | null;

  const [filters, setFilters] = useState<FlightFilters>({ directOnly: false, departureTime: 'all', maxPrice: 100000, includeBaggage: false, flightClass: 'all' });
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
    setFilters(prev => ({ ...prev, flightClass }));
  }, [flightClass]);

  const { flights: rawFlights, loading, error: flightError, retry } = useFlightsByDate(
    formData.departDate || getTodayTR(),
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
      <div className="sticky top-[4.5rem] z-40 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-700 via-red-600 to-red-700"></div>
        <div className="absolute inset-0 bg-black/[0.08]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex flex-col md:flex-row items-stretch gap-1.5">

            {/* Sol: trip type + class toggles */}
            <div className="flex flex-col gap-1 shrink-0 justify-center">
              <div className="flex items-center bg-white/[0.08] rounded-lg p-0.5">
                {(['round', 'one-way'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTripType(t)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                      tripType === t ? 'bg-white/20 text-white' : 'text-white/45 hover:text-white/75'
                    }`}
                  >
                    {t === 'round' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                  </button>
                ))}
              </div>
              <div className="flex items-center bg-white/[0.08] rounded-lg p-0.5">
                {([['all', 'Tümü'], ['premium', 'Premium'], ['vip', 'VIP']] as const).map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFlightClass(val)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap flex items-center gap-0.5 ${
                      flightClass === val
                        ? val === 'vip' ? 'bg-amber-500/25 text-amber-300' : 'bg-white/20 text-white'
                        : 'text-white/45 hover:text-white/75'
                    }`}
                  >
                    {val === 'vip' && <i className="ri-vip-crown-2-fill text-[10px]"></i>}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Orta: form alanları */}
            <div className="flex flex-1 items-stretch gap-1.5">
              {/* From / To */}
              <div className="flex-1 flex items-stretch bg-white/[0.06] rounded-xl border border-white/[0.08] hover:border-white/[0.18] transition-colors min-w-0">
                <CityDropdown
                  label="Nereden"
                  icon="ri-takeoff-line"
                  value={formData.from}
                  onChange={(v) => setFormData({ ...formData, from: v })}
                />
                <div className="flex items-center px-1 shrink-0">
                  <button
                    onClick={handleSwap}
                    className="w-6 h-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all cursor-pointer"
                  >
                    <i className="ri-arrow-left-right-line text-[10px] text-white/60"></i>
                  </button>
                </div>
                <div className="flex-1 min-w-0 border-l border-white/[0.07]">
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
              <div className="flex items-stretch bg-white/[0.06] rounded-xl border border-white/[0.08] hover:border-white/[0.18] transition-colors shrink-0">
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
              <div className="flex items-stretch bg-white/[0.06] rounded-xl border border-white/[0.08] hover:border-white/[0.18] transition-colors shrink-0">
                <PassengerSelector
                  value={formData.passengers}
                  onChange={(n) => setFormData({ ...formData, passengers: n })}
                />
              </div>

              {/* Search button */}
              <button
                onClick={() => setFilters({ ...filters })}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 border border-white/20 text-white font-semibold rounded-xl transition-all text-sm cursor-pointer flex items-center gap-1.5 active:scale-[0.97] whitespace-nowrap shrink-0"
              >
                <i className="ri-search-line text-sm"></i>
                Ara
              </button>
            </div>
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
              <FilterPanel filters={filters} onFilterChange={(f) => { setFilters(f); setFilterDrawerOpen(false); }} />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <FilterPanel filters={filters} onFilterChange={setFilters} />
          </div>

          <div className="lg:col-span-9">
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600 text-sm">
                  <strong className="text-primary text-base">{filtered.length}</strong> uçuş bulundu
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {filtered.filter(f => f.flightClass === 'premium').length} Premium
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
              ) : flightError ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-md border border-gray-100">
                  <div className="w-16 h-16 flex items-center justify-center mx-auto mb-4 bg-red-50 rounded-full">
                    <i className="ri-wifi-off-line text-3xl text-red-400"></i>
                  </div>
                  <p className="text-gray-700 font-semibold text-base">{flightError}</p>
                  <button
                    onClick={retry}
                    className="mt-4 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2 mx-auto"
                  >
                    <i className="ri-refresh-line"></i>
                    Tekrar Dene
                  </button>
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
