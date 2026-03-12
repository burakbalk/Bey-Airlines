import { useState } from 'react';

interface SearchFormProps {
  onSearch: (searchType: 'flightNumber' | 'route', value: string, from?: string, to?: string) => void;
}

export default function SearchForm({ onSearch }: SearchFormProps) {
  const [searchType, setSearchType] = useState<'flightNumber' | 'route'>('flightNumber');
  const [flightNumber, setFlightNumber] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const cities = ['İstanbul', 'Ankara', 'İzmir', 'Dubai'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'flightNumber' && flightNumber.trim()) {
      onSearch('flightNumber', flightNumber.trim());
    } else if (searchType === 'route' && from && to) {
      onSearch('route', '', from, to);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => setSearchType('flightNumber')}
          className={`flex-1 py-3 px-3 sm:px-6 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            searchType === 'flightNumber'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Uçuş Numarası
        </button>
        <button
          type="button"
          onClick={() => setSearchType('route')}
          className={`flex-1 py-3 px-3 sm:px-6 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer ${
            searchType === 'route'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Rota ile Ara
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {searchType === 'flightNumber' ? (
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Uçuş Numarası
            </label>
            <input
              type="text"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              placeholder="Örn: BEY1101"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-text"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nereden
              </label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer"
              >
                <option value="">Şehir Seçin</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Nereye
              </label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer"
              >
                <option value="">Şehir Seçin</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-search-line mr-2"></i>
          Uçuş Durumunu Sorgula
        </button>
      </form>
    </div>
  );
}