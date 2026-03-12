import { useState } from 'react';

interface FilterPanelProps {
  onFilterChange: (filters: any) => void;
}

export default function FilterPanel({ onFilterChange }: FilterPanelProps) {
  const [filters, setFilters] = useState({
    directOnly: false,
    departureTime: 'all',
    maxPrice: 10000,
    includeBaggage: false,
    flightClass: 'all',
  });

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      directOnly: false,
      departureTime: 'all',
      maxPrice: 10000,
      includeBaggage: false,
      flightClass: 'all',
    };
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Filtreler</h3>
        <button onClick={clearFilters} className="text-primary text-xs font-medium hover:underline whitespace-nowrap cursor-pointer">
          Temizle
        </button>
      </div>

      <div className="space-y-6">
        {/* Uçuş Sınıfı */}
        <div className="pb-6 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Uçuş Sınıfı</h4>
          <div className="flex gap-2">
            {[
              { value: 'all', label: 'Tümü' },
              { value: 'normal', label: 'Normal' },
              { value: 'vip', label: '✦ VIP' },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleFilterChange('flightClass', opt.value)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer border ${
                  filters.flightClass === opt.value
                    ? opt.value === 'vip'
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Direkt Uçuş */}
        <div className="pb-6 border-b border-gray-100">
          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-sm font-medium text-gray-700">Direkt Uçuş</span>
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.directOnly}
                onChange={(e) => handleFilterChange('directOnly', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </div>
          </label>
        </div>

        {/* Kalkış Saati */}
        <div className="pb-6 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Kalkış Saati</h4>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'Tüm Saatler' },
              { value: 'morning', label: 'Sabah (06:00 - 12:00)' },
              { value: 'afternoon', label: 'Öğleden Sonra (12:00 - 18:00)' },
              { value: 'evening', label: 'Akşam (18:00 - 24:00)' },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="departureTime"
                  value={opt.value}
                  checked={filters.departureTime === opt.value}
                  onChange={(e) => handleFilterChange('departureTime', e.target.value)}
                  className="w-4 h-4 text-primary focus:ring-primary cursor-pointer accent-primary"
                />
                <span className="ml-3 text-sm text-gray-600">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Fiyat Aralığı */}
        <div className="pb-6 border-b border-gray-100">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Maks. Fiyat</h4>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>0 TL</span>
            <span className="font-semibold text-primary">{filters.maxPrice.toLocaleString('tr-TR')} TL</span>
          </div>
          <input
            type="range"
            min="0"
            max="10000"
            step="100"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        {/* Bagaj */}
        <div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.includeBaggage}
              onChange={(e) => handleFilterChange('includeBaggage', e.target.checked)}
              className="w-4 h-4 rounded focus:ring-primary cursor-pointer accent-primary"
            />
            <span className="ml-3 text-sm text-gray-600">Bagaj Dahil</span>
          </label>
        </div>
      </div>
    </div>
  );
}
