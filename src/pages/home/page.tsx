import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import HeroSection from './components/HeroSection';
import PopularDestinations from './components/PopularDestinations';
import CampaignsSection from './components/CampaignsSection';
import MobileApp from './components/MobileApp';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <PopularDestinations />
        {/* Divider between light sections */}
        <div className="w-full max-w-7xl mx-auto px-8">
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
        </div>
        <CampaignsSection />
        <MobileApp />
      </main>
      <Footer />
    </div>
  );
}
