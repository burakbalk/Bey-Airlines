import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export const CITIES = [
  { code: 'IST', name: 'İstanbul', country: 'Türkiye' },
  { code: 'ESB', name: 'Ankara', country: 'Türkiye' },
  { code: 'ADB', name: 'İzmir', country: 'Türkiye' },
  { code: 'DXB', name: 'Dubai', country: 'BAE' },
];

const TURKISH_CITIES = ['İstanbul', 'Ankara', 'İzmir'];

// Sadece uluslararası uçuş: Türkiye şehirleri ↔ Dubai
export function getAvailableDestinations(fromCity: string) {
  if (TURKISH_CITIES.includes(fromCity)) {
    return CITIES.filter(c => c.name === 'Dubai');
  }
  // Dubai seçiliyse tüm Türkiye şehirleri
  return CITIES.filter(c => TURKISH_CITIES.includes(c.name));
}

const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const DAYS_TR = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

export function formatDateTR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

export function PortalDropdown({
  open,
  onClose,
  triggerRef,
  children,
  width,
  align = 'left',
}: {
  open: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLElement | null>;
  children: ReactNode;
  width?: number;
  align?: 'left' | 'center' | 'right';
}) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    let left = rect.left;
    if (align === 'center') left = rect.left + rect.width / 2 - (width || rect.width) / 2;
    if (align === 'right') left = rect.right - (width || rect.width);
    const w = width || rect.width;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    if (left < 8) left = 8;
    setPos({ top: rect.bottom + 8, left });
  }, [open, triggerRef, width, align]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    window.addEventListener('scroll', onClose, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      window.removeEventListener('scroll', onClose, true);
    };
  }, [open, onClose, triggerRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-xl shadow-2xl shadow-black/50 border border-white/[0.15] bg-gray-900/95 backdrop-blur-2xl"
      style={{
        top: pos.top,
        left: pos.left,
        width: width || triggerRef.current?.getBoundingClientRect().width,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

export function CityDropdown({
  label,
  icon,
  value,
  onChange,
  iconColor = 'text-red-400',
  cities,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (city: string) => void;
  iconColor?: string;
  cities?: typeof CITIES;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cityList = cities || CITIES;
  const selected = cityList.find((c) => c.name === value);

  return (
    <div className="relative flex-1">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 cursor-pointer group"
      >
        <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold mb-1 block pointer-events-none">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <i className={`${icon} text-lg ${iconColor}`}></i>
          <div className="flex-1 min-w-0">
            <span className="text-white text-base font-semibold block truncate">{value}</span>
          </div>
          <span className="text-white/20 text-xs font-medium">{selected?.code}</span>
          <i className={`ri-arrow-down-s-line text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      <PortalDropdown open={open} onClose={() => setOpen(false)} triggerRef={triggerRef}>
        <div className="p-1.5">
          {cityList.map((city) => (
            <button
              key={city.code}
              type="button"
              onClick={() => { onChange(city.name); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer ${
                value === city.name
                  ? 'bg-red-600/20 text-white'
                  : 'text-white/70 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                value === city.name ? 'bg-red-600 text-white' : 'bg-white/[0.08] text-white/50'
              }`}>
                {city.code}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold">{city.name}</p>
                <p className="text-[10px] text-white/40">{city.country}</p>
              </div>
              {value === city.name && (
                <i className="ri-check-line text-red-400"></i>
              )}
            </button>
          ))}
        </div>
      </PortalDropdown>
    </div>
  );
}

export function DatePicker({
  label,
  icon,
  value,
  onChange,
  minDate,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const goMonth = (dir: number) => {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const isDisabled = (dateStr: string) => {
    if (dateStr < todayStr) return true;
    if (minDate && dateStr < minDate) return true;
    return false;
  };

  const selectDate = (day: number) => {
    const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (isDisabled(dateStr)) return;
    onChange(dateStr);
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 cursor-pointer"
      >
        <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold mb-1 block pointer-events-none">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <i className={`${icon} text-lg text-white/40`}></i>
          <span className={`text-sm font-medium whitespace-nowrap ${value ? 'text-white' : 'text-white/30'}`}>
            {value ? formatDateTR(value) : 'Tarih seçin'}
          </span>
          <i className={`ri-arrow-down-s-line text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      <PortalDropdown open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} width={300} align="center">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => goMonth(-1)}
              className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-white/70"></i>
            </button>
            <span className="text-white font-semibold text-sm">
              {MONTHS_TR[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={() => goMonth(1)}
              className="w-8 h-8 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] flex items-center justify-center transition-colors cursor-pointer"
            >
              <i className="ri-arrow-right-s-line text-white/70"></i>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_TR.map((d) => (
              <div key={d} className="text-center text-[10px] text-white/30 font-medium py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = dateStr === value;
              const isToday = dateStr === todayStr;
              const disabled = isDisabled(dateStr);

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDate(day)}
                  disabled={disabled}
                  className={`w-full aspect-square rounded-lg text-sm font-medium transition-all cursor-pointer flex items-center justify-center ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                      : isToday
                        ? 'bg-white/[0.1] text-white ring-1 ring-red-400/50'
                        : disabled
                          ? 'text-white/10 cursor-not-allowed'
                          : 'text-white/60 hover:bg-white/[0.1] hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.08]">
            {[
              { label: 'Bugün', offset: 0 },
              { label: 'Yarın', offset: 1 },
              { label: '+1 Hafta', offset: 7 },
            ].map((q) => {
              const d = new Date();
              d.setDate(d.getDate() + q.offset);
              const qStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              const qDisabled = minDate ? qStr < minDate : false;
              return (
                <button
                  key={q.label}
                  type="button"
                  disabled={qDisabled}
                  onClick={() => { onChange(qStr); setOpen(false); }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    qDisabled
                      ? 'text-white/10 cursor-not-allowed'
                      : 'bg-white/[0.06] text-white/50 hover:bg-white/[0.12] hover:text-white'
                  }`}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
        </div>
      </PortalDropdown>
    </div>
  );
}

export function PassengerSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 cursor-pointer"
      >
        <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold mb-1 block pointer-events-none">
          Yolcu
        </label>
        <div className="flex items-center gap-2">
          <i className="ri-group-line text-lg text-white/40"></i>
          <span className="text-white text-sm font-medium whitespace-nowrap">{value} Yolcu</span>
          <i className={`ri-arrow-down-s-line text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      <PortalDropdown open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} width={220} align="right">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-white text-sm font-semibold">Yolcu Sayısı</p>
              <p className="text-white/30 text-[10px]">Maksimum 9 yolcu</p>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/[0.06] rounded-xl p-3">
            <button
              type="button"
              onClick={() => value > 1 && onChange(value - 1)}
              disabled={value <= 1}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                value <= 1
                  ? 'bg-white/[0.04] text-white/10 cursor-not-allowed'
                  : 'bg-white/[0.1] text-white hover:bg-white/[0.2]'
              }`}
            >
              <i className="ri-subtract-line text-lg"></i>
            </button>
            <div className="text-center">
              <span className="text-white text-2xl font-bold">{value}</span>
              <p className="text-white/30 text-[10px]">Yolcu</p>
            </div>
            <button
              type="button"
              onClick={() => value < 9 && onChange(value + 1)}
              disabled={value >= 9}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                value >= 9
                  ? 'bg-white/[0.04] text-white/10 cursor-not-allowed'
                  : 'bg-white/[0.1] text-white hover:bg-white/[0.2]'
              }`}
            >
              <i className="ri-add-line text-lg"></i>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            Tamam
          </button>
        </div>
      </PortalDropdown>
    </div>
  );
}

interface SearchFormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
}

export function useSearchForm(initialData?: Partial<SearchFormData>) {
  const [tripType, setTripType] = useState<'round' | 'one-way'>('round');
  const [flightClass, setFlightClass] = useState<'normal' | 'vip'>('normal');
  const [formData, setFormData] = useState<SearchFormData>({
    from: 'İstanbul',
    to: 'Dubai',
    departDate: new Date().toISOString().split('T')[0],
    returnDate: '',
    passengers: 1,
    ...initialData,
  });

  const handleSwap = useCallback(() => {
    setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from }));
  }, []);

  // "from" değişince "to"yu otomatik düzelt (iç hat olmasın)
  useEffect(() => {
    const available = getAvailableDestinations(formData.from);
    if (!available.find(c => c.name === formData.to)) {
      setFormData((prev) => ({ ...prev, to: available[0]?.name || 'Dubai' }));
    }
  }, [formData.from, formData.to]);

  useEffect(() => {
    if (formData.departDate && formData.returnDate && formData.returnDate < formData.departDate) {
      setFormData((prev) => ({ ...prev, returnDate: '' }));
    }
  }, [formData.departDate, formData.returnDate]);

  return { tripType, setTripType, flightClass, setFlightClass, formData, setFormData, handleSwap };
}
