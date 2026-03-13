import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

interface SearchFormProps {
  onSearch: (searchType: 'flightNumber' | 'route' | 'pnr', value: string, from?: string, to?: string, date?: string) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [searchType, setSearchType] = useState<'flightNumber' | 'route' | 'pnr'>('flightNumber');
  const [flightNumber, setFlightNumber] = useState('');
  const [pnr, setPnr] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from('flight_schedule')
      .select('from_city, to_city')
      .then(({ data }) => {
        if (!data) return;
        const citySet = new Set<string>();
        data.forEach((row: { from_city: string; to_city: string }) => {
          citySet.add(row.from_city);
          citySet.add(row.to_city);
        });
        setCities(Array.from(citySet).sort());
      });
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'flightNumber' && flightNumber.trim()) {
      onSearch('flightNumber', flightNumber.trim(), undefined, undefined, date);
    } else if (searchType === 'route' && from && to) {
      onSearch('route', '', from, to, date);
    } else if (searchType === 'pnr' && pnr.trim()) {
      onSearch('pnr', pnr.trim());
    }
  };

  const tabs = [
    { key: 'flightNumber' as const, label: 'Uçuş Numarası', icon: 'ri-flight-takeoff-line' },
    { key: 'route' as const, label: 'Rota ile Ara', icon: 'ri-route-line' },
    { key: 'pnr' as const, label: 'PNR ile Ara', icon: 'ri-file-list-3-line' },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-8 border border-gray-100">
      <div className="flex gap-2 sm:gap-4 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSearchType(tab.key)}
            className={`flex-1 py-3 px-2 sm:px-6 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer text-sm ${
              searchType === tab.key
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <i className={`${tab.icon} mr-1.5 hidden sm:inline`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {searchType === 'flightNumber' && (
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Uçuş Numarası</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="Örn: BEY1101"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Tarih</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {searchType === 'route' && (
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Nereden</label>
                <select
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm cursor-pointer"
                >
                  <option value="">Şehir Seçin</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">Nereye</label>
                <select
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm cursor-pointer"
                >
                  <option value="">Şehir Seçin</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">Tarih</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {searchType === 'pnr' && (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2 text-sm">PNR Kodu</label>
            <input
              type="text"
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              placeholder="Örn: BEY123ABC"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm uppercase"
            />
            <p className="text-xs text-gray-400 mt-2">PNR kodunuzu onay e-postanızda bulabilirsiniz.</p>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white py-4 rounded-xl font-semibold transition-all whitespace-nowrap cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98]"
        >
          <i className="ri-search-line mr-2"></i>
          Uçuş Durumunu Sorgula
        </button>
      </form>
    </div>
  );
}
