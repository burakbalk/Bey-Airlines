import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const NAV_LINKS = [
  { to: '/ucus-ara', label: 'Uçuş Ara', icon: 'ri-flight-takeoff-line' },
  { to: '/check-in', label: 'Check-in', icon: 'ri-qr-code-line' },
  { to: '/ucus-durumu', label: 'Uçuş Durumu', icon: 'ri-radar-line' },
  { to: '/rezervasyon-yonetimi', label: 'Rezervasyonlarım', icon: 'ri-file-list-3-line' },
  { to: '/kampanyalar', label: 'Kampanyalar', icon: 'ri-price-tag-3-line' },
  { to: '/yardim', label: 'Yardım', icon: 'ri-customer-service-2-line' },
];

export default function Header() {
  const { user, profile } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isLoggedIn = !!user;
  const displayName = profile?.first_name || '';

  return (
    <>
      {/* Top Info Bar */}
      <div className="hidden md:block bg-gray-950 text-gray-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-9">
          <div className="flex items-center gap-5">
            <a href="tel:+908501234567" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <i className="ri-phone-fill text-primary text-xs"></i>
              0850 123 45 67
            </a>
            <span className="text-gray-700">|</span>
            <span className="flex items-center gap-1.5">
              <i className="ri-time-line text-primary text-xs"></i>
              7/24 Destek
            </span>
            <span className="text-gray-700">|</span>
            <a href="mailto:info@beyairlines.com" className="flex items-center gap-1.5 hover:text-white transition-colors">
              <i className="ri-mail-line text-primary text-xs"></i>
              info@beyairlines.com
            </a>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" aria-label="Instagram">
              <i className="ri-instagram-fill"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" aria-label="Twitter">
              <i className="ri-twitter-x-fill"></i>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors cursor-pointer" aria-label="Facebook">
              <i className="ri-facebook-fill"></i>
            </a>
            <span className="text-gray-700">|</span>
            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer">
              <i className="ri-global-line"></i>
              TR
            </button>
          </div>
        </div>
      </div>

      <header className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50">
        {/* Red accent line */}
        <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-primary-dark"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[4.5rem]">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0" onClick={() => setMobileOpen(false)}>
              <img src="/logo.png" alt="Bey Airlines" className="h-11 w-11 object-contain" />
              <span className="text-xl font-bold tracking-tight text-gray-900">
                Bey <span className="text-primary">Airlines</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => {
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative px-3 py-2 text-sm font-medium tracking-wide transition-all rounded-lg ${
                      isActive
                        ? 'text-primary bg-red-50'
                        : 'text-gray-600 hover:text-primary hover:bg-red-50/60'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/5 h-0.5 bg-primary rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <Link
                  to="/hesabim"
                  className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-3 sm:px-5 py-2.5 rounded-full font-medium transition-all shadow-md hover:shadow-lg cursor-pointer text-sm"
                >
                  <i className="ri-user-line"></i>
                  <span className="hidden sm:inline whitespace-nowrap">{displayName || 'Hesabım'}</span>
                </Link>
              ) : (
                <>
                  <Link
                    to="/kayit"
                    className="hidden sm:flex border border-gray-200 hover:border-primary/50 text-gray-600 hover:text-primary px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer"
                  >
                    Kayıt Ol
                  </Link>
                  <Link
                    to="/giris"
                    className="bg-primary hover:bg-primary-dark text-white px-3 sm:px-5 py-2.5 rounded-full text-sm font-medium transition-all shadow-md hover:shadow-lg whitespace-nowrap cursor-pointer"
                  >
                    <i className="ri-user-line sm:mr-1.5"></i>
                    <span className="hidden sm:inline">Giriş Yap</span>
                  </Link>
                </>
              )}

              {/* Hamburger - mobile/tablet */}
              <button
                type="button"
                onClick={() => setMobileOpen((prev) => !prev)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-600 hover:text-primary hover:bg-gray-100 transition-colors cursor-pointer"
                aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
                aria-expanded={mobileOpen}
              >
                <i className={`text-xl ${mobileOpen ? 'ri-close-line' : 'ri-menu-line'}`}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Side Drawer */}
          <nav
            className="fixed top-0 left-0 bottom-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            aria-label="Mobil navigasyon"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
              <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <img src="/logo.png" alt="Bey Airlines" className="h-9 w-9 object-contain" />
                <span className="font-bold text-gray-900 text-base">
                  Bey <span className="text-primary">Airlines</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-200 transition-colors"
                aria-label="Menüyü kapat"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-3 px-3">
              <div className="space-y-0.5">
                {NAV_LINKS.map((link) => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? 'bg-red-50 text-primary'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                      }`}
                    >
                      <i className={`${link.icon} text-lg flex-shrink-0 ${isActive ? 'text-primary' : 'text-gray-400'}`}></i>
                      {link.label}
                      {isActive && <i className="ri-arrow-right-s-line ml-auto text-primary"></i>}
                    </Link>
                  );
                })}
              </div>

              {/* Contact Info */}
              <div className="mt-4 mx-1 p-4 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">İletişim</p>
                <a href="tel:+908501234567" className="flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors py-1">
                  <i className="ri-phone-line text-primary"></i>
                  0850 123 45 67
                </a>
                <p className="text-xs text-gray-400 mt-1">7/24 Çağrı Merkezi</p>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="p-4 border-t border-gray-100 space-y-2">
              {isLoggedIn ? (
                <Link
                  to="/hesabim"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                >
                  <i className="ri-user-line"></i>
                  Hesabım {displayName && `— ${displayName}`}
                </Link>
              ) : (
                <>
                  <Link
                    to="/giris"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <i className="ri-login-box-line"></i>
                    Giriş Yap
                  </Link>
                  <Link
                    to="/kayit"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center gap-2 w-full border-2 border-primary text-primary hover:bg-red-50 py-3.5 rounded-xl font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <i className="ri-user-add-line"></i>
                    Kayıt Ol
                  </Link>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
