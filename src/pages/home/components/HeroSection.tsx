import { useNavigate } from 'react-router-dom';
import {
  CityDropdown,
  DatePicker,
  PassengerSelector,
  useSearchForm,
} from '../../../components/feature/SearchForm';

export default function HeroSection() {
  const navigate = useNavigate();
  const { tripType, setTripType, flightClass, setFlightClass, formData, setFormData, handleSwap } = useSearchForm();

  const handleSearch = () => {
    navigate('/ucus-ara', { state: { ...formData, flightClass } });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-24 gap-8">
      {/* Video Background */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          src="/hero_video.mp4"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
      </div>

      {/* Hero Text */}
      <div className="relative z-10 text-center px-4">
        <p className="text-red-300 text-xs font-semibold uppercase tracking-[0.3em] mb-4 [text-shadow:_0_1px_8px_rgba(0,0,0,0.7)]">Türkiye'nin Gururu</p>
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-5 leading-tight [text-shadow:_0_2px_16px_rgba(0,0,0,0.8)]">
          Hayalinizdeki Destinasyona <br />
          <span className="text-red-400">Bey Airlines</span> ile Uçun
        </h1>
        <p className="text-base text-white/80 font-light tracking-wider [text-shadow:_0_1px_8px_rgba(0,0,0,0.7)]">
          İstanbul · Ankara · İzmir · Dubai — Normal ve VIP uçuş seçenekleriyle
        </p>
      </div>

      {/* Search Form */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
        <div className="relative rounded-2xl shadow-2xl shadow-black/20">
          {/* Frosted glass background */}
          <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-xl ring-1 ring-white/[0.08] rounded-2xl pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>

          <div className="relative p-6">
            {/* Trip type & class tabs */}
            <div className="flex flex-wrap items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg p-0.5 gap-1">
                  {(['round', 'one-way'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTripType(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                        tripType === t
                          ? 'bg-white/20 text-white border border-white/20'
                          : 'text-white/50 hover:text-white/80 border border-transparent'
                      }`}
                    >
                      {t === 'round' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex rounded-lg p-0.5 gap-1">
                <button
                  onClick={() => setFlightClass('normal')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer ${
                    flightClass === 'normal'
                      ? 'bg-white/20 text-white border border-white/20'
                      : 'text-white/50 hover:text-white/80 border border-transparent'
                  }`}
                >
                  Ekonomi
                </button>
                <button
                  onClick={() => setFlightClass('vip')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                    flightClass === 'vip'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30'
                      : 'text-white/50 hover:text-white/80 border border-transparent'
                  }`}
                >
                  <i className="ri-vip-crown-2-fill text-base"></i> VIP
                </button>
              </div>
            </div>

            {/* Form fields */}
            <div className="flex flex-col md:flex-row items-stretch gap-2 mb-4">
              {/* From-To Group */}
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
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary/60 flex items-center justify-center transition-all cursor-pointer group duration-200"
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
                  />
                </div>
              </div>

              {/* Date Group */}
              <div className="flex items-stretch bg-white/[0.06] rounded-2xl border border-white/[0.1]">
                <DatePicker
                  label="Gidiş"
                  icon="ri-calendar-line"
                  value={formData.departDate}
                  onChange={(v) => setFormData({ ...formData, departDate: v })}
                />
                {tripType === 'round' && (
                  <div className="border-l border-white/[0.08]">
                    <DatePicker
                      label="Dönüş"
                      icon="ri-calendar-check-line"
                      value={formData.returnDate}
                      onChange={(v) => setFormData({ ...formData, returnDate: v })}
                      minDate={formData.departDate}
                    />
                  </div>
                )}
              </div>

              {/* Passengers */}
              <div className="flex items-stretch bg-white/[0.06] rounded-2xl border border-white/[0.1]">
                <PassengerSelector
                  value={formData.passengers}
                  onChange={(n) => setFormData({ ...formData, passengers: n })}
                />
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="w-full py-4 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-primary text-white font-bold rounded-2xl transition-all text-base cursor-pointer flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:shadow-red-500/20 active:scale-[0.98]"
            >
              <i className="ri-search-line text-xl"></i>
              Uçuş Ara
            </button>
          </div>
        </div>
      </div>

      {/* Bottom fade to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#FFF5F5] to-transparent pointer-events-none z-10"></div>
    </section>
  );
}
