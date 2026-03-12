import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header() {
  const { user, profile } = useAuth();
  const isLoggedIn = !!user;
  const displayName = profile?.first_name || '';

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.05)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <img src="/logo.png" alt="Bey Airlines" className="h-11 w-11 object-contain" />
            <span className="text-xl font-bold tracking-tight text-gray-900">
              Bey <span className="text-primary">Airlines</span>
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            <Link to="/ucus-ara" className="text-gray-600 hover:text-primary text-sm font-medium tracking-wide transition-colors cursor-pointer">
              Uçuş Ara
            </Link>
            <Link to="/check-in" className="text-gray-600 hover:text-primary text-sm font-medium tracking-wide transition-colors cursor-pointer">
              Check-in
            </Link>
            <Link to="/ucus-durumu" className="text-gray-600 hover:text-primary text-sm font-medium tracking-wide transition-colors cursor-pointer">
              Uçuş Durumu
            </Link>
            <Link to="/rezervasyon-yonetimi" className="text-gray-600 hover:text-primary text-sm font-medium tracking-wide transition-colors cursor-pointer">
              Rezervasyon Yönetimi
            </Link>
            <Link to="/kampanyalar" className="text-gray-600 hover:text-primary text-sm font-medium tracking-wide transition-colors cursor-pointer">
              Kampanyalar
            </Link>
            <Link to="/yardim" className="text-gray-600 hover:text-primary text-sm font-medium tracking-wide transition-colors cursor-pointer">
              Yardım
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link
                to="/hesabim"
                className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-3 sm:px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg cursor-pointer"
              >
                <i className="ri-user-line"></i>
                <span className="hidden sm:inline whitespace-nowrap text-sm">{displayName}</span>
              </Link>
            ) : (
              <Link
                to="/hesabim"
                className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
              >
                <i className="ri-user-line mr-2"></i>
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
