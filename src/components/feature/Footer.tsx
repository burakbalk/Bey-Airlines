import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { to: '/ucus-ara', label: 'Uçuş Ara', icon: 'ri-flight-takeoff-line' },
  { to: '/check-in', label: 'Online Check-in', icon: 'ri-qr-code-line' },
  { to: '/ucus-durumu', label: 'Uçuş Durumu', icon: 'ri-radar-line' },
  { to: '/rezervasyon-yonetimi', label: 'Rezervasyon Yönetimi', icon: 'ri-file-list-3-line' },
  { to: '/kampanyalar', label: 'Kampanyalar', icon: 'ri-price-tag-3-line' },
];

const SUPPORT_LINKS = [
  { to: '/yardim', label: 'Yardım Merkezi' },
  { to: '/yardim', label: 'Sıkça Sorulan Sorular' },
  { to: '/yardim', label: 'İletişim' },
  { to: '/kvkk', label: 'KVKK / Gizlilik' },
  { to: '/cerez-politikasi', label: 'Çerez Politikası' },
  { to: '/yolcu-haklari', label: 'Yolcu Hakları' },
];

const CERTIFICATIONS = [
  { icon: 'ri-shield-check-fill', label: 'IATA Üyesi' },
  { icon: 'ri-safe-2-fill', label: 'SSL Güvenli' },
  { icon: 'ri-award-fill', label: 'DGCA Sertifikalı' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">

      {/* Main Footer */}
      <div className="pt-10 sm:pt-16 pb-8 sm:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 mb-12">
            {/* Brand */}
            <div>
              <Link to="/" className="flex items-center gap-2 mb-5 group">
                <img src="/logo.png" alt="Bey Airlines" className="h-11 w-11 object-contain brightness-0 invert group-hover:brightness-100 transition-all duration-300" />
                <span className="text-[1.4rem] font-playfair font-bold italic uppercase tracking-[0.12em] text-white leading-none">
                  Bey <span className="text-red-400">Airlines</span>
                </span>
              </Link>
              <p className="text-gray-500 leading-relaxed text-sm mb-6">
                Gökyüzünde güvenle uçmanın adresi. Konforlu ve güvenli uçuş deneyimi için Türkiye'nin gururu.
              </p>

              {/* Social Links */}
              <div className="flex gap-2.5 mb-6">
                {[
                  { href: 'https://facebook.com', icon: 'ri-facebook-fill', label: 'Facebook' },
                  { href: 'https://twitter.com', icon: 'ri-twitter-x-fill', label: 'Twitter' },
                  { href: 'https://instagram.com', icon: 'ri-instagram-fill', label: 'Instagram' },
                  { href: 'https://linkedin.com', icon: 'ri-linkedin-fill', label: 'LinkedIn' },
                  { href: 'https://youtube.com', icon: 'ri-youtube-fill', label: 'YouTube' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="w-9 h-9 bg-white/[0.06] hover:bg-primary/80 border border-white/[0.06] hover:border-primary/50 rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110 duration-200"
                  >
                    <i className={`${s.icon} text-sm`}></i>
                  </a>
                ))}
              </div>

              {/* Certifications */}
              <div className="space-y-2">
                {CERTIFICATIONS.map((cert) => (
                  <div key={cert.label} className="flex items-center gap-2 text-xs text-gray-600">
                    <i className={`${cert.icon} text-green-500 text-sm`}></i>
                    {cert.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary rounded-full"></span>
                Hızlı Erişim
              </h3>
              <ul className="space-y-2.5">
                {QUICK_LINKS.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="flex items-center gap-2.5 text-gray-500 hover:text-white transition-colors text-sm group"
                    >
                      <i className={`${link.icon} text-gray-700 group-hover:text-primary transition-colors text-sm flex-shrink-0`}></i>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary rounded-full"></span>
                Destek
              </h3>
              <ul className="space-y-2.5">
                {SUPPORT_LINKS.map((link, i) => (
                  <li key={i}>
                    <Link to={link.to} className="text-gray-500 hover:text-white transition-colors text-sm flex items-center gap-2 group">
                      <i className="ri-arrow-right-s-line text-gray-700 group-hover:text-primary text-sm transition-colors"></i>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                <span className="w-3 h-0.5 bg-primary rounded-full"></span>
                İletişim
              </h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-phone-fill text-primary text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm mb-0.5">Çağrı Merkezi</p>
                    <a href="tel:4447239" className="text-gray-500 hover:text-white transition-colors text-sm">
                      444 7 239
                    </a>
                    <p className="text-gray-700 text-xs mt-0.5">7/24 Destek</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-mail-fill text-primary text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm mb-0.5">E-posta</p>
                    <a href="mailto:info@beyairlines.com" className="text-gray-500 hover:text-white transition-colors text-sm">
                      info@beyairlines.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary/15 border border-primary/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="ri-map-pin-fill text-primary text-sm"></i>
                  </div>
                  <div>
                    <p className="font-medium text-white text-sm mb-0.5">Genel Merkez</p>
                    <p className="text-gray-500 text-sm leading-relaxed">İstanbul Havalimanı, Terminal 1<br />İstanbul, Türkiye</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/[0.05] pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-700 text-xs">
                © 2026 Bey Airlines A.Ş. Tüm hakları saklıdır.
              </p>
              <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs">
                <Link to="/kvkk" className="text-gray-700 hover:text-gray-400 transition-colors">
                  Gizlilik Politikası
                </Link>
                <Link to="/cerez-politikasi" className="text-gray-700 hover:text-gray-400 transition-colors">
                  Çerez Politikası
                </Link>
                <Link to="/yolcu-haklari" className="text-gray-700 hover:text-gray-400 transition-colors">
                  Kullanım Koşulları
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
