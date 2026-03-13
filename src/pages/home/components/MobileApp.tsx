const APP_FEATURES = [
  { icon: 'ri-smartphone-line', title: 'Hızlı Rezervasyon', desc: 'Birkaç dokunuşla uçuşunuzu rezerve edin' },
  { icon: 'ri-pass-valid-line', title: 'Dijital Biniş Kartı', desc: 'Biniş kartınız her zaman cebinizde' },
  { icon: 'ri-notification-3-line', title: 'Anlık Bildirimler', desc: 'Uçuş durumu ve kapı değişikliklerinden haberdar olun' },
  { icon: 'ri-map-pin-line', title: 'Uçuş Takibi', desc: 'Uçuşlarınızı anlık olarak takip edin' },
];

export default function MobileApp() {
  return (
    <section className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 py-24 lg:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Phone Mockups */}
          <div className="relative hidden lg:flex justify-center items-center min-h-[420px]">
            {/* Glow effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
            </div>

            {/* Phone 1 */}
            <div className="relative w-56 transform -rotate-6 hover:-rotate-3 transition-transform duration-500 z-10">
              <div className="bg-gray-800 rounded-[2.5rem] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
                <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
                  <img
                    src="/images/app/booking-screen.webp"
                    alt="Mobil Uygulama"
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              </div>
              {/* Reflection */}
              <div className="absolute inset-x-4 top-2 h-px bg-white/20 rounded-full"></div>
            </div>

            {/* Phone 2 */}
            <div className="relative w-56 transform rotate-6 hover:rotate-3 transition-transform duration-500 -ml-10 mt-16 z-20">
              <div className="bg-gray-800 rounded-[2.5rem] p-2.5 shadow-[0_30px_80px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
                <div className="bg-gray-900 rounded-[2rem] overflow-hidden">
                  <img
                    src="/images/app/boarding-pass.webp"
                    alt="Biniş Kartı"
                    className="w-full"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="absolute inset-x-4 top-2 h-px bg-white/20 rounded-full"></div>
            </div>

            {/* Floating badge */}
            <div className="absolute top-8 right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-white text-xs font-medium flex items-center gap-2">
              <i className="ri-shield-check-fill text-green-400 text-base"></i>
              SSL Güvenli
            </div>
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 bg-primary rounded-full"></div>
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">Mobil Uygulama</p>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Her Yerde
              <br />
              <span className="text-red-400">Yanınızda</span>
            </h2>
            <p className="text-gray-400 mb-10 leading-relaxed">
              Bey Airlines mobil uygulamasıyla uçuş rezervasyonundan biniş kartınıza kadar her şey bir dokunuşta.
            </p>

            {/* Features */}
            <div className="space-y-0 mb-10">
              {APP_FEATURES.map((item, i) => (
                <div key={i} className={`flex items-start gap-4 py-4 ${i > 0 ? 'border-t border-white/[0.06]' : ''}`}>
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-primary/15 border border-primary/20 rounded-xl">
                    <i className={`${item.icon} text-lg text-red-400`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-0.5 text-sm">{item.title}</h4>
                    <p className="text-gray-500 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <button
                  className="flex items-center gap-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white px-6 py-3.5 rounded-2xl transition-all cursor-not-allowed opacity-70"
                  disabled
                >
                  <i className="ri-apple-fill text-2xl"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">Download on the</p>
                    <p className="text-sm font-semibold leading-tight mt-0.5">App Store</p>
                  </div>
                </button>
                <span className="absolute -top-2.5 -right-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  Yakında
                </span>
              </div>

              <div className="relative">
                <button
                  className="flex items-center gap-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/10 text-white px-6 py-3.5 rounded-2xl transition-all cursor-not-allowed opacity-70"
                  disabled
                >
                  <i className="ri-google-play-fill text-2xl"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">GET IT ON</p>
                    <p className="text-sm font-semibold leading-tight mt-0.5">Google Play</p>
                  </div>
                </button>
                <span className="absolute -top-2.5 -right-2.5 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                  Yakında
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
