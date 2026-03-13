import { useNavigate } from 'react-router-dom';
import {
  CityDropdown,
  WeekPicker,
  PassengerSelector,
  useSearchForm,
  getAvailableDestinations,
} from '../../../components/feature/SearchForm';

const TRUST_STATS = [
  { icon: 'ri-flight-takeoff-line', value: '50+', label: 'Destinasyon' },
  { icon: 'ri-group-line', value: '2M+', label: 'Yolcu' },
  { icon: 'ri-shield-check-line', value: '%98', label: 'Memnuniyet' },
  { icon: 'ri-trophy-line', value: '10+', label: 'Ödül' },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const { tripType, setTripType, flightClass, setFlightClass, formData, setFormData, handleSwap } = useSearchForm();

  const handleSearch = () => {
    navigate('/ucus-ara', { state: { ...formData, flightClass } });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-24 gap-8 overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          src="/hero_video.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/45 to-black/75"></div>
      </div>

      {/* Hero Text */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></span>
          <p className="text-red-200 text-xs font-semibold uppercase tracking-[0.25em]">Türkiye'nin Gururu</p>
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white mb-5 leading-[1.1] [text-shadow:_0_2px_20px_rgba(0,0,0,0.6)]">
          Hayalinizdeki
          <br />
          <span className="bg-gradient-to-r from-red-300 to-red-400 bg-clip-text text-transparent">
            Destinasyona
          </span>{' '}
          Uçun
        </h1>
        <p className="text-base sm:text-lg text-white/75 font-light tracking-wide [text-shadow:_0_1px_8px_rgba(0,0,0,0.5)] max-w-xl mx-auto">
          İstanbul · Ankara · İzmir ⇄ Dubai — Ekonomi ve VIP sınıflarıyla konforlu uçuş deneyimi
        </p>
      </div>

      {/* Search Form */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <div className="relative rounded-2xl shadow-2xl shadow-black/30">
          {/* Frosted glass background */}
          <div className="absolute inset-0 bg-white/[0.07] backdrop-blur-2xl ring-1 ring-white/[0.12] rounded-2xl pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none rounded-t-2xl"></div>

          <div className="relative p-5 sm:p-6">
            {/* Trip type & class tabs */}
            <div className="flex flex-wrap items-center justify-between mb-5 gap-2">
              <div className="flex items-center gap-1 bg-white/[0.08] rounded-xl p-0.5">
                {(['round', 'one-way'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTripType(t)}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                      tripType === t
                        ? 'bg-white/20 text-white shadow-sm'
                        : 'text-white/50 hover:text-white/80'
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
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    flightClass === 'normal'
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <i className="ri-seat-line mr-1.5"></i>
                  Ekonomi
                </button>
                <button
                  onClick={() => setFlightClass('vip')}
                  className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    flightClass === 'vip'
                      ? 'bg-amber-500/25 text-amber-300 shadow-sm'
                      : 'text-white/50 hover:text-white/80'
                  }`}
                >
                  <i className="ri-vip-crown-2-fill text-sm"></i>
                  VIP
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col md:flex-row items-stretch gap-2 mb-4">
              {/* From-To Group */}
              <div className="flex-1 flex items-stretch bg-white/[0.07] rounded-2xl border border-white/[0.12] hover:border-white/[0.2] transition-colors">
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

              {/* Date Group */}
              <div className="flex items-stretch bg-white/[0.07] rounded-2xl border border-white/[0.12] hover:border-white/[0.2] transition-colors">
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

              {/* Passengers */}
              <div className="flex items-stretch bg-white/[0.07] rounded-2xl border border-white/[0.12] hover:border-white/[0.2] transition-colors">
                <PassengerSelector
                  value={formData.passengers}
                  onChange={(n) => setFormData({ ...formData, passengers: n })}
                />
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-2xl transition-all text-base cursor-pointer flex items-center justify-center gap-2.5 shadow-lg hover:shadow-xl hover:shadow-red-500/30 active:scale-[0.98]"
            >
              <i className="ri-search-line text-xl"></i>
              Uçuş Ara
              <i className="ri-arrow-right-line text-lg ml-1 opacity-70"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Trust Stats */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {TRUST_STATS.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl mb-2 mx-auto">
                <i className={`${stat.icon} text-lg text-white/90`}></i>
              </div>
              <p className="text-white font-bold text-lg leading-none">{stat.value}</p>
              <p className="text-white/55 text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 opacity-50">
        <span className="text-white text-[10px] uppercase tracking-widest">Keşfet</span>
        <i className="ri-arrow-down-line text-white text-xl animate-bounce"></i>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFF5F5] to-transparent pointer-events-none z-10"></div>
    </section>
  );
}
