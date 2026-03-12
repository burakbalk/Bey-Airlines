export default function MobileApp() {
  return (
    <section className="bg-bg-alt py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="relative hidden lg:block">
            <div className="flex justify-center gap-8">
              <div className="w-64 transform -rotate-3">
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-4">
                  <img
                    src="/images/app/booking-screen.webp"
                    alt="Mobil Uygulama"
                    className="w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="w-64 transform rotate-3 mt-12">
                <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] p-4">
                  <img
                    src="/images/app/boarding-pass.webp"
                    alt="Biniş Kartı"
                    className="w-full rounded-2xl"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-4">
              Mobil Uygulama
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-8">
              Her Yerde Yanınızda
            </h2>
            <div className="space-y-0 mb-10">
              {[
                { icon: 'ri-smartphone-line', title: 'Hızlı Rezervasyon', desc: 'Birkaç dokunuşla uçuşunuzu rezerve edin' },
                { icon: 'ri-pass-valid-line', title: 'Dijital Biniş Kartı', desc: 'Biniş kartınız her zaman cebinizde' },
                { icon: 'ri-notification-3-line', title: 'Anlık Bildirimler', desc: 'Uçuş durumu ve kapı değişikliklerinden haberdar olun' },
                { icon: 'ri-map-pin-line', title: 'Uçuş Takibi', desc: 'Uçuşlarınızı anlık olarak takip edin' },
              ].map((item, i) => (
                <div key={i} className={`flex items-start gap-4 py-5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-red-50 rounded-xl">
                    <i className={`${item.icon} text-xl text-primary`}></i>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                    <p className="text-text-secondary text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <button className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-2xl opacity-75 cursor-not-allowed">
                  <i className="ri-apple-fill text-2xl"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">Download on the</p>
                    <p className="text-sm font-semibold leading-tight">App Store</p>
                  </div>
                </button>
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Yakında</span>
              </div>
              <div className="relative">
                <button className="flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-2xl opacity-75 cursor-not-allowed">
                  <i className="ri-google-play-fill text-2xl"></i>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 leading-none">GET IT ON</p>
                    <p className="text-sm font-semibold leading-tight">Google Play</p>
                  </div>
                </button>
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Yakında</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
