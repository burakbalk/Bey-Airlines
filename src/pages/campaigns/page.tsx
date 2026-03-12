import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { useCampaigns } from '../../hooks/useCampaigns';

export default function CampaignsPage() {
  const { campaigns, loading } = useCampaigns();
  const [filter, setFilter] = useState<'all' | 'vip' | 'normal'>('all');

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filter === 'all') return true;
    return campaign.type === filter;
  });

  const vipCount = campaigns.filter((c) => c.type === 'vip').length;
  const normalCount = campaigns.filter((c) => c.type === 'normal').length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-loader-4-line text-5xl text-red-600 animate-spin"></i>
            <p className="mt-4 text-gray-600">Hizmetler yükleniyor...</p>
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
        <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 pt-16 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
          <div className="relative z-10 max-w-7xl mx-auto px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <i className="ri-plane-line text-3xl text-white"></i>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Hizmetlerimiz</h1>
            <p className="text-xl text-red-100">Rotalarımız ve hizmetlerimiz hakkında bilgi alın</p>
            <div className="flex items-center justify-center gap-8 mt-8">
              {['Yurt İçi Seferler', 'VIP Hizmetler', 'Esnek Seçenekler'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                  <i className="ri-check-line text-red-200"></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="max-w-7xl mx-auto px-8 -mt-6 relative z-10">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-8 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-sm ${
                    filter === 'all' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  Tümü ({campaigns.length})
                </button>
                <button
                  onClick={() => setFilter('vip')}
                  className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-sm ${
                    filter === 'vip' ? 'bg-amber-500 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  <i className="ri-vip-crown-fill mr-2"></i>VIP ({vipCount})
                </button>
                <button
                  onClick={() => setFilter('normal')}
                  className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-sm ${
                    filter === 'normal' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600'
                  }`}
                >
                  Normal ({normalCount})
                </button>
              </div>
              <div className="text-sm text-gray-500">
                <strong className="text-gray-900">{filteredCampaigns.length}</strong> hizmet bulundu
              </div>
            </div>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/kampanyalar/${campaign.id}`}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 cursor-pointer ${
                  campaign.type === 'vip' ? 'border-amber-300' : 'border-red-100'
                }`}
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover object-top" />
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold text-white ${campaign.type === 'vip' ? 'bg-amber-500' : 'bg-red-600'}`}>
                    {campaign.badge}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                    {campaign.type === 'vip' && <i className="ri-vip-crown-fill text-amber-500"></i>}
                    {campaign.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{campaign.description}</p>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                      <i className="ri-flight-takeoff-line"></i>
                      <span className="font-medium">Rotalar:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {campaign.routes.map((route: string, idx: number) => (
                        <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-lg">{route}</span>
                      ))}
                    </div>
                  </div>
                  <div className="w-full mt-4 bg-red-600 text-white font-semibold py-3 rounded-xl text-center transition-all shadow-md hover:shadow-lg whitespace-nowrap">
                    Detayları Gör <i className="ri-arrow-right-line ml-2"></i>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
