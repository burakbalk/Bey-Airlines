import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-20 lg:pt-24 pb-10">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-16">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <img src="/logo.png" alt="Bey Airlines" className="h-11 w-11 object-contain brightness-0 invert" />
              <span className="text-xl font-bold tracking-tight">
                Bey <span className="text-red-400">Airlines</span>
              </span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-6 text-sm">
              Gökyüzünde güvenle uçmanın adresi. Konforlu ve güvenli uçuş deneyimi için bizi tercih edin.
            </p>
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.06] hover:bg-white/[0.12] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-facebook-fill text-lg"></i>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.06] hover:bg-white/[0.12] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-twitter-x-fill text-lg"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.06] hover:bg-white/[0.12] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-instagram-fill text-lg"></i>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-white/[0.06] hover:bg-white/[0.12] rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <i className="ri-linkedin-fill text-lg"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-5">Hızlı Erişim</h3>
            <ul className="space-y-3">
              <li><Link to="/ucus-ara" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Uçuş Ara</Link></li>
              <li><Link to="/check-in" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Online Check-in</Link></li>
              <li><Link to="/ucus-durumu" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Uçuş Durumu</Link></li>
              <li><Link to="/rezervasyon-yonetimi" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Rezervasyon Yönetimi</Link></li>
              <li><Link to="/kampanyalar" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Kampanyalar</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-5">Destek</h3>
            <ul className="space-y-3">
              <li><Link to="/yardim" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Yardım Merkezi</Link></li>
              <li><Link to="/yardim" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">SSS</Link></li>
              <li><Link to="/yardim" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">İletişim</Link></li>
              <li><Link to="/kvkk" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">KVKK</Link></li>
              <li><Link to="/cerez-politikasi" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Çerez Politikası</Link></li>
              <li><Link to="/yolcu-haklari" className="text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">Yolcu Hakları</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-300 mb-5">İletişim</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-500">
                <i className="ri-phone-fill text-primary text-lg flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="font-medium text-white text-sm mb-0.5">Çağrı Merkezi</p>
                  <a href="tel:+908501234567" className="hover:text-white transition-colors text-sm">
                    0850 123 45 67
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <i className="ri-mail-fill text-primary text-lg flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="font-medium text-white text-sm mb-0.5">E-posta</p>
                  <a href="mailto:info@beyairlines.com" className="hover:text-white transition-colors text-sm">
                    info@beyairlines.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-500">
                <i className="ri-map-pin-fill text-primary text-lg flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="font-medium text-white text-sm mb-0.5">Adres</p>
                  <p className="text-sm">İstanbul Havalimanı, Terminal 1, İstanbul, Türkiye</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/[0.06] pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-xs">
              © 2024 Bey Airlines. Tüm hakları saklıdır.
            </p>
            <div className="flex gap-6 text-xs">
              <Link to="/kvkk" className="text-gray-600 hover:text-white transition-colors cursor-pointer">
                Gizlilik Politikası
              </Link>
              <Link to="/cerez-politikasi" className="text-gray-600 hover:text-white transition-colors cursor-pointer">
                Çerez Politikası
              </Link>
              <Link to="/yolcu-haklari" className="text-gray-600 hover:text-white transition-colors cursor-pointer">
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
