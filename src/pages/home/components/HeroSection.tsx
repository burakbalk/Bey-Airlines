import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import {
  CityDropdown,
  WeekPicker,
  PassengerSelector,
  useSearchForm,
  getAvailableDestinations,
} from '../../../components/feature/SearchForm';

export default function HeroSection() {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  const { tripType, setTripType, flightClass, setFlightClass, formData, setFormData, handleSwap } = useSearchForm();

  useEffect(() => {
    const updateHeight = () => {
      const el = sectionRef.current;
      if (!el) return;
      const top = el.getBoundingClientRect().top + window.scrollY;
      el.style.height = `${window.innerHeight - top}px`;
    };
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  const handleSearch = () => {
    navigate('/ucus-ara', { state: { ...formData, flightClass } });
  };

  return (
    <section ref={sectionRef} className="relative flex flex-col overflow-hidden">

      {/* Video Background */}
      <div className="absolute inset-0">
        <video autoPlay muted loop playsInline className="w-full h-full object-cover" src="/herovideo.mp4" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* ÜST — Yazı, menünün hemen altı */}
      <div className="relative z-10 w-full px-4 pt-6 sm:pt-10 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-4 sm:mb-6">
            <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
            <p className="text-red-200 text-xs font-semibold uppercase tracking-[0.25em]">Türkiye'nin Gururu</p>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-3 sm:mb-5 leading-[1.1] [text-shadow:_0_2px_20px_rgba(0,0,0,0.6)]">
            Hayalinizdeki
            <br />
            <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">
              Destinasyona
            </span>{' '}
            Uçun
          </h1>
          <p className="hidden sm:block text-sm sm:text-base text-white/75 font-light tracking-wide [text-shadow:_0_1px_8px_rgba(0,0,0,0.5)] whitespace-nowrap mx-auto">
            İstanbul · Ankara · İzmir ⇄ Dubai &mdash; Ekonomi ve VIP sınıflarıyla konforlu uçuş deneyimi
          </p>
        </div>
      </div>

      {/* Spacer — video görünsün, sıkışınca küçülür */}
      <div className="flex-1 min-h-0"></div>

      {/* ALT — Arama Formu */}
      <div className="relative z-20 w-full px-4 pb-4 sm:pb-6 shrink-0">
        <div className="max-w-5xl mx-auto">
          <div className="relative rounded-2xl shadow-2xl shadow-black/20">
            <div className="absolute inset-0 bg-white/[0.04] backdrop-blur-xl ring-1 ring-white/[0.08] rounded-2xl pointer-events-none"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-2xl"></div>

            <div className="relative p-3 sm:p-4">
              {/* Trip type & class */}
              <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                <div className="flex items-center gap-1 bg-white/[0.08] rounded-xl p-0.5">
                  {(['round', 'one-way'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTripType(t)}
                      className={`px-2.5 py-2 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                        tripType === t ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white/80'
                      }`}
                    >
                      <i className={`${t === 'round' ? 'ri-arrow-left-right-line' : 'ri-arrow-right-line'} mr-1.5`}></i>
                      {t === 'round' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-1 bg-white/[0.08] rounded-xl p-0.5">
                  <button
                    onClick={() => setFlightClass('normal')}
                    className={`px-2.5 py-2 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer ${
                      flightClass === 'normal' ? 'bg-white/20 text-white shadow-sm' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <i className="ri-seat-line mr-1.5"></i>Ekonomi
                  </button>
                  <button
                    onClick={() => setFlightClass('vip')}
                    className={`px-2.5 py-2 rounded-md text-[11px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                      flightClass === 'vip' ? 'bg-amber-500/25 text-amber-300 shadow-sm' : 'text-white/50 hover:text-white/80'
                    }`}
                  >
                    <i className="ri-vip-crown-2-fill text-sm"></i>VIP
                  </button>
                </div>
              </div>

              {/* Form alanları */}
              <div className="flex flex-col lg:flex-row items-stretch gap-2">
                {/* From-To */}
                <div className="flex-[2] flex items-stretch bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                  <CityDropdown
                    label="Nereden"
                    icon="ri-takeoff-line"
                    value={formData.from}
                    onChange={(v) => setFormData({ ...formData, from: v })}
                  />
                  <div className="flex items-center px-1">
                    <button
                      onClick={handleSwap}
                      className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/70 flex items-center justify-center transition-all cursor-pointer duration-200 hover:scale-110"
                    >
                      <i className="ri-arrow-left-right-line text-sm text-white/70 hover:text-white"></i>
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

                {/* Tarih */}
                <div className="flex-[1.5] flex items-stretch bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
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

                {/* Yolcu */}
                <div className="flex-none flex items-stretch bg-white/[0.03] rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition-colors">
                  <PassengerSelector
                    value={formData.passengers}
                    onChange={(n) => setFormData({ ...formData, passengers: n })}
                  />
                </div>

                {/* Ara butonu */}
                <button
                  onClick={handleSearch}
                  className="flex-none lg:w-14 lg:aspect-square w-full py-3 lg:py-0 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-red-500/20 active:scale-[0.98]"
                >
                  <i className="ri-search-line text-xl"></i>
                  <span className="lg:hidden text-sm">Uçuş Ara</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FFF5F5] to-transparent pointer-events-none z-10"></div>
    </section>
  );
}
