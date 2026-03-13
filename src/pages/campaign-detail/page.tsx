import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { useCampaignBySlug } from '../../hooks/useCampaigns';

export default function CampaignDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { campaign, similarCampaigns, loading } = useCampaignBySlug(slug);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-loader-4-line text-5xl text-red-600 animate-spin"></i>
            <p className="mt-4 text-gray-600">Yükleniyor...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-error-warning-line text-6xl text-red-600 mb-4"></i>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Kampanya Bulunamadı</h2>
            <p className="text-gray-500 mb-6">Aradığınız kampanya mevcut değil.</p>
            <Link to="/kampanyalar" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer">
              Tüm Kampanyalara Dön
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative h-96 w-full overflow-hidden">
          {campaign.image ? (
            <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover object-top" />
          ) : (
            <div className="bg-gradient-to-r from-red-500 to-red-700 w-full h-full" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8 max-w-4xl">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold text-white mb-4 ${campaign.type === 'vip' ? 'bg-amber-500' : 'bg-red-600'}`}>
                {campaign.badge}
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                {campaign.type === 'vip' && <i className="ri-vip-crown-fill text-amber-400 mr-3"></i>}
                {campaign.title}
              </h1>
              <p className="text-xl text-white/90">{campaign.description}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Description */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${campaign.type === 'vip' ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <i className={`ri-information-line text-xl ${campaign.type === 'vip' ? 'text-amber-600' : 'text-red-600'}`}></i>
                  </div>
                  Hizmet Detayları
                </h2>
                <p className="text-gray-700 leading-relaxed mb-6">{campaign.long_description}</p>

                <h3 className="text-lg font-bold text-gray-900 mb-4">Avantajlar</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {campaign.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 mt-0.5 ${campaign.type === 'vip' ? 'bg-amber-100' : 'bg-red-100'}`}>
                        <i className={`ri-check-line text-sm ${campaign.type === 'vip' ? 'text-amber-600' : 'text-red-600'}`}></i>
                      </div>
                      <span className="text-gray-700 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Routes */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${campaign.type === 'vip' ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <i className={`ri-flight-takeoff-line text-xl ${campaign.type === 'vip' ? 'text-amber-600' : 'text-red-600'}`}></i>
                  </div>
                  Geçerli Rotalar
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.routes.map((route, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-4 rounded-xl border-2 ${campaign.type === 'vip' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full ${campaign.type === 'vip' ? 'bg-amber-200' : 'bg-red-200'}`}>
                        <i className={`ri-plane-line text-lg ${campaign.type === 'vip' ? 'text-amber-700' : 'text-red-700'}`}></i>
                      </div>
                      <span className="font-semibold text-gray-900">{route}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full ${campaign.type === 'vip' ? 'bg-amber-100' : 'bg-red-100'}`}>
                    <i className={`ri-file-list-3-line text-xl ${campaign.type === 'vip' ? 'text-amber-600' : 'text-red-600'}`}></i>
                  </div>
                  Genel Koşullar
                </h2>
                <div className="space-y-3">
                  {campaign.terms.map((term, idx) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() => setActiveAccordion(activeAccordion === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <span className="text-sm font-medium text-gray-900 text-left">Koşul {idx + 1}</span>
                        <i className={`ri-arrow-down-s-line text-xl text-gray-500 transition-transform ${activeAccordion === idx ? 'rotate-180' : ''}`}></i>
                      </button>
                      {activeAccordion === idx && (
                        <div className="px-4 pb-4 pt-2 bg-gray-50 border-t border-gray-200">
                          <p className="text-sm text-gray-700">{term}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* Info Box */}
                <div className={`bg-white rounded-2xl shadow-xl border-2 p-6 ${campaign.type === 'vip' ? 'border-amber-300' : 'border-red-300'}`}>
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${campaign.type === 'vip' ? 'bg-amber-100' : 'bg-red-100'}`}>
                      <i className={`ri-plane-line text-3xl ${campaign.type === 'vip' ? 'text-amber-600' : 'text-red-600'}`}></i>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Bu Hizmet Hakkında</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      {campaign.routes.map((route, idx) => (
                        <div key={idx} className="flex items-center justify-center gap-2">
                          <i className={`ri-map-pin-line ${campaign.type === 'vip' ? 'text-amber-500' : 'text-red-500'}`}></i>
                          <span>{route}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Link
                    to="/ucus-ara"
                    state={(() => {
                      const firstRoute = campaign.routes?.[0];
                      if (!firstRoute) return undefined;
                      const parts = firstRoute.split(/\s*[-→↔]\s*/);
                      if (parts.length >= 2) return { from: parts[0].trim(), to: parts[1].trim() };
                      return undefined;
                    })()}
                    className={`block w-full text-center font-semibold py-4 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer ${
                      campaign.type === 'vip'
                        ? 'bg-amber-500 hover:bg-amber-600 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    Uçuş Ara <i className="ri-arrow-right-line ml-2"></i>
                  </Link>
                </div>

                {/* Help Card */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <i className="ri-question-line text-red-600"></i>
                    Yardıma mı ihtiyacınız var?
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">Hizmetlerimiz hakkında detaylı bilgi almak için bize ulaşın.</p>
                  <Link
                    to="/yardim"
                    className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium py-3 rounded-xl transition-all whitespace-nowrap cursor-pointer text-sm"
                  >
                    Yardım Merkezi
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Campaigns */}
          {similarCampaigns.length > 0 && (
            <div className="mt-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Benzer Hizmetler</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {similarCampaigns.map((similar) => (
                  <Link
                    key={similar.id}
                    to={`/kampanyalar/${similar.slug}`}
                    className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 cursor-pointer ${
                      similar.type === 'vip' ? 'border-amber-300' : 'border-red-100'
                    }`}
                  >
                    <div className="relative h-48 w-full overflow-hidden">
                      {similar.image ? (
                        <img src={similar.image} alt={similar.title} className="w-full h-full object-cover object-top" loading="lazy" />
                      ) : (
                        <div className="bg-gradient-to-r from-red-500 to-red-700 w-full h-full" />
                      )}
                      <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${similar.type === 'vip' ? 'bg-amber-500' : 'bg-red-600'}`}>
                        {similar.badge}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        {similar.type === 'vip' && <i className="ri-vip-crown-fill text-amber-500"></i>}
                        {similar.title}
                      </h3>
                      <p className="text-gray-500 text-sm">{similar.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
