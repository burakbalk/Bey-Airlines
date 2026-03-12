import { Link } from 'react-router-dom';
import { useCampaigns } from '../../../hooks/useCampaigns';

export default function CampaignsSection() {
  const { campaigns, loading } = useCampaigns();

  if (loading) {
    return (
      <section id="kampanyalar" className="bg-white py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-8 text-center">
          <i className="ri-loader-4-line text-4xl text-red-600 animate-spin"></i>
        </div>
      </section>
    );
  }

  const featuredCampaign = campaigns.find(c => c.type === 'vip');
  const otherCampaigns = campaigns.filter(c => c.id !== featuredCampaign?.id).slice(0, 2);

  return (
    <section id="kampanyalar" className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em] mb-3">Keşfedin</p>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900">Öne Çıkan Hizmetler</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {featuredCampaign && (
            <Link to={`/kampanyalar/${featuredCampaign.id}`} className="lg:col-span-2 bg-gradient-to-br from-red-900 to-red-800 rounded-2xl p-12 relative overflow-hidden group cursor-pointer border border-red-700/30">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute top-6 left-6">
                <span className="bg-white text-primary px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                  {featuredCampaign.badge}
                </span>
              </div>
              <div className="relative z-10 mt-6">
                <h3 className="text-4xl lg:text-5xl font-bold text-white mb-4">
                  {featuredCampaign.title}
                </h3>
                <p className="text-red-200 text-lg mb-8">
                  {featuredCampaign.description}
                </p>
                <span className="inline-block border border-white/60 text-white px-8 py-3 rounded-2xl group-hover:bg-white group-hover:text-red-900 transition-all font-medium whitespace-nowrap">
                  Detaylar
                </span>
              </div>
            </Link>
          )}

          <div className="flex flex-col gap-6">
            {otherCampaigns.map((campaign) => (
              <Link
                to={`/kampanyalar/${campaign.id}`}
                key={campaign.id}
                className="relative rounded-2xl overflow-hidden flex-1 min-h-[200px] group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl"
              >
                <div className="w-full h-full absolute inset-0">
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 text-gray-900 backdrop-blur-sm px-4 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {campaign.badge}
                  </span>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h3 className="text-xl font-bold text-white mb-1">
                    {campaign.title}
                  </h3>
                  <p className="text-white/70 text-sm">
                    {campaign.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
