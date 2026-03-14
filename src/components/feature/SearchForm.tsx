import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo, type ReactNode } from 'react';
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
export function formatDateTR(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getDate()} ${MONTHS_TR[d.getMonth()]} ${d.getFullYear()}`;
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
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, visible: false });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 768px)');
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const calcPos = useCallback(() => {
    if (isMobile || !triggerRef.current || !dropdownRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const maxW = window.innerWidth - 16;
    const w = Math.min(width || rect.width, maxW);
    let left = rect.left;
    if (align === 'center') left = rect.left + rect.width / 2 - w / 2;
    if (align === 'right') left = rect.right - w;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    if (left < 8) left = 8;
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight + 8;
    const top = openUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8;
    setPos({ top, left, width: w, visible: true });
  }, [triggerRef, width, align, isMobile]);

  useLayoutEffect(() => {
    if (!open) { setPos(p => ({ ...p, visible: false, width: 0 })); return; }
    if (isMobile) { setPos(p => ({ ...p, visible: true })); return; }
    setPos(p => ({ ...p, visible: false }));
    const id = requestAnimationFrame(calcPos);
    return () => cancelAnimationFrame(id);
  }, [open, calcPos, isMobile]);

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
    if (!isMobile) {
      window.addEventListener('scroll', onClose, true);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      if (!isMobile) {
        window.removeEventListener('scroll', onClose, true);
      }
    };
  }, [open, onClose, triggerRef, isMobile]);

  if (!open) return null;

  // Mobilde bottom sheet olarak göster
  if (isMobile) {
    return createPortal(
      <>
        <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={onClose} />
        <div
          ref={dropdownRef}
          className="fixed bottom-0 left-0 right-0 z-[9999] rounded-t-2xl shadow-2xl bg-gray-900/98 max-h-[60vh] overflow-y-auto animate-fade-up"
        >
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-white/20 rounded-full" />
          </div>
          {children}
        </div>
      </>,
      document.body
    );
  }

  return createPortal(
    <div
      ref={dropdownRef}
      className="fixed rounded-xl shadow-2xl shadow-black/50 border border-white/[0.15] bg-gray-900/98 backdrop-blur-sm"
      style={{
        top: pos.top,
        left: pos.left,
        width: pos.width || triggerRef.current?.getBoundingClientRect().width,
        zIndex: 9999,
        opacity: pos.visible ? 1 : 0,
        pointerEvents: pos.visible ? 'auto' : 'none',
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

// Route → uçuş günü haritası (1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 7=Paz)
const ROUTE_DAY_MAP: Record<string, number> = {
  'İstanbul→Dubai': 1,
  'Dubai→İstanbul': 3,
  'Ankara→Dubai': 2,
  'Dubai→Ankara': 4,
  'İzmir→Dubai': 5,
  'Dubai→İzmir': 7,
};

const DAYS_FULL_TR = ['', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

function getRouteDayOfWeek(from: string, to: string): number | null {
  return ROUTE_DAY_MAP[`${from}→${to}`] ?? null;
}

function getWeekRange(date: Date): { start: Date; end: Date } {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Pazartesi başlangıç
  const start = new Date(date);
  start.setDate(date.getDate() + diff);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start, end };
}

function getFlightDateInWeek(weekStart: Date, dayOfWeek: number): Date {
  const result = new Date(weekStart);
  result.setDate(weekStart.getDate() + dayOfWeek - 1); // dayOfWeek 1=Pzt=offset 0
  return result;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatWeekRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth();
  if (sameMonth) {
    return `${start.getDate()} - ${end.getDate()} ${MONTHS_TR[end.getMonth()]}`;
  }
  return `${start.getDate()} ${MONTHS_TR[start.getMonth()]} - ${end.getDate()} ${MONTHS_TR[end.getMonth()]}`;
}

export function WeekPicker({
  label,
  icon,
  from,
  to,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  from: string;
  to: string;
  value: string;
  onChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const dayOfWeek = getRouteDayOfWeek(from, to);

  const weeks = useMemo(() => {
    if (!dayOfWeek) return [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = toDateStr(today);

    const result: { weekStart: Date; weekEnd: Date; flightDate: Date; flightDateStr: string; isPast: boolean }[] = [];

    // Mevcut haftadan başla, 8 hafta ilerle
    const { start: currentWeekStart } = getWeekRange(today);
    for (let i = 0; i < 8; i++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(currentWeekStart.getDate() + i * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const flightDate = getFlightDateInWeek(weekStart, dayOfWeek);
      const flightDateStr = toDateStr(flightDate);
      const isPast = flightDateStr < todayStr;

      result.push({ weekStart, weekEnd, flightDate, flightDateStr, isPast });
    }

    return result;
  }, [dayOfWeek]);

  // Rota yoksa bilgi göster
  if (!dayOfWeek) {
    return (
      <div className="relative">
        <div className="w-full text-left px-4 py-3">
          <label className="text-[10px] text-white/40 uppercase tracking-[0.15em] font-semibold mb-1 block">
            {label}
          </label>
          <div className="flex items-center gap-2">
            <i className={`${icon} text-lg text-white/40`}></i>
            <span className="text-white/30 text-sm font-medium">Rota seçin</span>
          </div>
        </div>
      </div>
    );
  }

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
            {value ? formatDateTR(value) : 'Hafta seçin'}
          </span>
          <i className={`ri-arrow-down-s-line text-white/30 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}></i>
        </div>
      </button>

      <PortalDropdown open={open} onClose={() => setOpen(false)} triggerRef={triggerRef} width={360} align="center">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <i className="ri-calendar-schedule-line text-red-400 text-sm"></i>
            <span className="text-white/50 text-xs font-medium">
              Her {DAYS_FULL_TR[dayOfWeek]} uçuş var
            </span>
          </div>

          <div
            ref={scrollRef}
            className="grid grid-cols-2 gap-2 max-h-[320px] overflow-y-auto pr-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.15) transparent' }}
          >
            {weeks.map((week) => {
              const isSelected = week.flightDateStr === value;
              const disabled = week.isPast;

              return (
                <button
                  key={week.flightDateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onChange(week.flightDateStr);
                    setOpen(false);
                  }}
                  className={`relative p-3 rounded-xl text-left transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-red-600/20 border-red-500/50 ring-1 ring-red-500/30'
                      : disabled
                        ? 'bg-white/[0.02] border-white/[0.04] opacity-40 cursor-not-allowed'
                        : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.15]'
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${
                    isSelected ? 'text-red-300' : 'text-white/40'
                  }`}>
                    {formatWeekRange(week.weekStart, week.weekEnd)}
                  </p>
                  <p className={`text-sm font-semibold ${
                    isSelected ? 'text-white' : disabled ? 'text-white/30' : 'text-white/80'
                  }`}>
                    {DAYS_FULL_TR[dayOfWeek]} {week.flightDate.getDate()} {MONTHS_TR[week.flightDate.getMonth()]}
                  </p>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <i className="ri-check-line text-red-400 text-sm"></i>
                    </div>
                  )}
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

/** Bugünden itibaren en yakın uçuş tarihini hesapla */
function getNextFlightDate(dayOfWeek: number): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDow = today.getDay() === 0 ? 7 : today.getDay();
  let diff = dayOfWeek - todayDow;
  if (diff < 0) diff += 7;
  if (diff === 0) diff = 0; // Bugün uçuş varsa bugünü göster
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  return toDateStr(target);
}

export function useSearchForm(initialData?: Partial<SearchFormData>) {
  const [tripType, setTripType] = useState<'round' | 'one-way'>('round');
  const [flightClass, setFlightClass] = useState<'normal' | 'vip'>('normal');
  const [formData, setFormData] = useState<SearchFormData>(() => {
    const from = initialData?.from || 'İstanbul';
    const to = initialData?.to || 'Dubai';
    const departDay = getRouteDayOfWeek(from, to);
    const defaultDepart = departDay ? getNextFlightDate(departDay) : new Date().toISOString().split('T')[0];
    return {
      from,
      to,
      departDate: initialData?.departDate || defaultDepart,
      returnDate: initialData?.returnDate || '',
      passengers: initialData?.passengers || 1,
    };
  });

  const handleSwap = useCallback(() => {
    setFormData((prev) => ({ ...prev, from: prev.to, to: prev.from, departDate: '', returnDate: '' }));
  }, []);

  // "from" değişince "to"yu otomatik düzelt (iç hat olmasın)
  // prevFromRef ile sadece gerçek "from" değişiminde tetiklenir; circular re-render önlenir
  const prevFromRef = useRef(formData.from);
  useEffect(() => {
    if (prevFromRef.current === formData.from) return;
    prevFromRef.current = formData.from;
    const available = getAvailableDestinations(formData.from);
    setFormData((prev) => {
      if (available.find(c => c.name === prev.to)) return prev;
      return { ...prev, to: available[0]?.name || 'Dubai', departDate: '', returnDate: '' };
    });
  }, [formData.from]);

  // Rota değişince tarihleri sıfırla ve en yakın uçuşu seç
  useEffect(() => {
    const departDay = getRouteDayOfWeek(formData.from, formData.to);
    if (departDay && !formData.departDate) {
      setFormData((prev) => ({ ...prev, departDate: getNextFlightDate(departDay) }));
    }
  }, [formData.from, formData.to, formData.departDate]);

  useEffect(() => {
    if (formData.departDate && formData.returnDate && formData.returnDate < formData.departDate) {
      setFormData((prev) => ({ ...prev, returnDate: '' }));
    }
  }, [formData.departDate, formData.returnDate]);

  return { tripType, setTripType, flightClass, setFlightClass, formData, setFormData, handleSwap };
}
