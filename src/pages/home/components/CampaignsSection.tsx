import { Link } from 'react-router-dom';
import { useCampaigns } from '../../../hooks/useCampaigns';

function SkeletonCampaign() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
      <div className="lg:col-span-2 bg-gray-200 rounded-2xl h-80"></div>
      <div className="flex flex-col gap-6">
        <div className="bg-gray-200 rounded-2xl flex-1"></div>
        <div className="bg-gray-200 rounded-2xl flex-1"></div>
      </div>
    </div>
  );
}

export default function CampaignsSection() {
  const { campaigns, loading } = useCampaigns();

  const featuredCampaign = campaigns.find(c => c.type === 'vip') ?? campaigns[0] ?? null;
  const otherCampaigns = campaigns.filter(c => c.id !== featuredCampaign?.id).slice(0, 2);

  return (
    <section id="kampanyalar" className="bg-white py-24 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-0.5 bg-primary rounded-full"></div>
              <p className="text-primary text-xs font-semibold uppercase tracking-[0.3em]">Özel Teklifler</p>
            </div>
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900">
              Öne Çıkan Hizmetler
            </h2>
            <p className="text-text-secondary mt-2 text-sm sm:text-base">
              Size özel kampanya ve avantajlı fırsatları kaçırmayın
            </p>
          </div>
          <Link
            to="/kampanyalar"
            className="flex-shrink-0 flex items-center gap-2 border border-primary/30 hover:border-primary text-primary hover:bg-primary hover:text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all self-start sm:self-auto"
          >
            Tüm Kampanyalar
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        {loading ? (
          <SkeletonCampaign />
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <i className="ri-coupon-3-line text-5xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500">Şu anda aktif kampanya bulunmuyor.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Featured Campaign */}
            {featuredCampaign && (
              <Link
                to={`/kampanyalar/${featuredCampaign.slug}`}
                className="lg:col-span-2 relative rounded-2xl overflow-hidden group cursor-pointer min-h-[320px] flex flex-col justify-end"
              >
                {/* Background — image if available, else gradient */}
                {featuredCampaign.image ? (
                  <>
                    <img
                      src={featuredCampaign.image}
                      alt={featuredCampaign.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10"></div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-red-900 to-red-800"></div>
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-black/30 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>
                  </>
                )}

                {/* Badge */}
                <div className="absolute top-5 left-5 z-10">
                  <span className="bg-white text-primary px-4 py-1.5 rounded-full text-xs font-bold shadow-lg inline-flex items-center gap-1.5">
                    <i className="ri-star-fill text-amber-400 text-xs"></i>
                    {featuredCampaign.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 p-7 sm:p-10">
                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-3 leading-tight">
                    {featuredCampaign.title}
                  </h3>
                  <p className="text-white/70 text-base mb-8 max-w-md leading-relaxed">
                    {featuredCampaign.description}
                  </p>
                  <span className="inline-flex items-center gap-2 bg-white text-gray-900 group-hover:bg-primary group-hover:text-white px-7 py-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-lg">
                    Detayları Gör
                    <i className="ri-arrow-right-line group-hover:translate-x-1 transition-transform duration-300"></i>
                  </span>
                </div>
              </Link>
            )}

            {/* Other Campaigns */}
            <div className="flex flex-col gap-6">
              {otherCampaigns.map((campaign) => (
                <Link
                  to={`/kampanyalar/${campaign.slug}`}
                  key={campaign.id}
                  className="relative rounded-2xl overflow-hidden flex-1 min-h-[148px] group cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-black/10"
                >
                  <div className="absolute inset-0">
                    <img
                      src={campaign.image}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                  {/* Badge */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="bg-white/90 text-gray-900 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      {campaign.badge}
                    </span>
                  </div>

                  {/* Hover arrow */}
                  <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <i className="ri-arrow-right-up-line text-white text-sm"></i>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight">{campaign.title}</h3>
                    <p className="text-white/60 text-xs line-clamp-2">{campaign.description}</p>
                  </div>
                </Link>
              ))}

              {/* All campaigns CTA if not enough */}
              {otherCampaigns.length < 2 && (
                <Link
                  to="/kampanyalar"
                  className="flex-1 min-h-[148px] rounded-2xl border-2 border-dashed border-gray-200 hover:border-primary/40 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary transition-all group"
                >
                  <i className="ri-add-circle-line text-3xl group-hover:scale-110 transition-transform"></i>
                  <span className="text-sm font-medium">Tüm Kampanyalar</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
