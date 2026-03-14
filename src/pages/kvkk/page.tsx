import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { usePageTitle } from '../../hooks/usePageTitle';

type TabType = 'kvkk' | 'cerez' | 'yolcu-haklari';

function getActiveTab(pathname: string): TabType {
  if (pathname.includes('cerez-politikasi')) return 'cerez';
  if (pathname.includes('yolcu-haklari')) return 'yolcu-haklari';
  return 'kvkk';
}

const PAGE_TITLES: Record<TabType, string> = {
  'kvkk': 'KVKK / Gizlilik Politikası',
  'cerez': 'Çerez Politikası',
  'yolcu-haklari': 'Yolcu Hakları',
};

export default function KVKKPage() {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);
  usePageTitle(PAGE_TITLES[activeTab]);

  const tabs = [
    { id: 'kvkk' as TabType, label: 'KVKK', path: '/kvkk' },
    { id: 'cerez' as TabType, label: 'Çerez Politikası', path: '/cerez-politikasi' },
    { id: 'yolcu-haklari' as TabType, label: 'Yolcu Hakları', path: '/yolcu-haklari' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 text-white pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <i className="ri-file-text-line text-5xl"></i>
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-center mb-6">Yasal Bilgiler</h1>
          <p className="text-xl text-center text-white/90 max-w-3xl mx-auto">
            Kişisel verilerinizin korunması, çerez kullanımı ve yolcu haklarınız hakkında detaylı bilgiler
          </p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="bg-bg-alt border-b border-gray-200 sticky top-[4.5rem] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex gap-2">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={tab.path}
                className={`px-6 py-4 font-semibold text-sm transition-all duration-200 border-b-2 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-gray-600 border-transparent hover:text-primary hover:border-primary/30'
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-8">
          {activeTab === 'kvkk' && <KVKKContent />}
          {activeTab === 'cerez' && <CerezContent />}
          {activeTab === 'yolcu-haklari' && <YolcuHaklariContent />}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function KVKKContent() {
  const [openSection, setOpenSection] = useState<number | null>(0);

  const sections = [
    {
      title: 'Veri Sorumlusu',
      content: `BeyAir Havayolları A.Ş. olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla hareket etmekteyiz.

**İletişim Bilgilerimiz:**
• Adres: Atatürk Havalimanı, Terminal 1, 34149 Yeşilköy/İstanbul
• E-posta: kvkk@beyair.com
• Telefon: 444 7 239`
    },
    {
      title: 'Toplanan Kişisel Veriler',
      content: `Hizmetlerimizi sunabilmek için aşağıdaki kişisel verilerinizi işlemekteyiz:

**Kimlik Bilgileri:** Ad, soyad, T.C. kimlik numarası, pasaport numarası, doğum tarihi
**İletişim Bilgileri:** Telefon numarası, e-posta adresi, adres bilgileri
**Müşteri İşlem Bilgileri:** Rezervasyon kayıtları, uçuş geçmişi, ödeme bilgileri
**Pazarlama Bilgileri:** Kampanya tercihleri, sadakat programı bilgileri
**İşlem Güvenliği Bilgileri:** IP adresi, çerez kayıtları, cihaz bilgileri`
    },
    {
      title: 'Verilerin İşlenme Amaçları',
      content: `Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:

• Uçuş rezervasyonlarınızın oluşturulması ve yönetilmesi
• Havayolu taşımacılık hizmetlerinin sunulması
• Yasal yükümlülüklerin yerine getirilmesi
• Müşteri memnuniyetinin artırılması
• Pazarlama ve kampanya faaliyetlerinin yürütülmesi (onayınız dahilinde)
• İstatistiksel analiz ve raporlama çalışmaları
• Güvenlik ve dolandırıcılık önleme faaliyetleri`
    },
    {
      title: 'Haklarınız',
      content: `KVKK kapsamında aşağıdaki haklara sahipsiniz:

• Kişisel verilerinizin işlenip işlenmediğini öğrenme
• İşlenmişse buna ilişkin bilgi talep etme
• İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme
• Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme
• Eksik veya yanlış işlenmişse düzeltilmesini isteme
• KVKK'da öngörülen şartlar çerçevesinde silinmesini veya yok edilmesini isteme
• Aktarıldığı üçüncü kişilere yukarıdaki işlemlerin bildirilmesini isteme
• Münhasıran otomatik sistemler ile analiz edilmesi nedeniyle aleyhinize bir sonuç doğmasına itiraz etme
• Kanuna aykırı işleme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme

**Başvuru Yöntemi:** kvkk@beyair.com adresine veya şirket adresimize yazılı olarak başvurabilirsiniz.`
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg mb-8">
        <div className="flex items-start gap-3">
          <i className="ri-information-line text-2xl text-blue-600 mt-1"></i>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Kişisel Verileriniz Güvende</h3>
            <p className="text-sm text-blue-800">
              BeyAir olarak kişisel verilerinizin güvenliğini en üst düzeyde tutmak için gerekli tüm teknik ve idari tedbirleri almaktayız.
            </p>
          </div>
        </div>
      </div>

      {sections.map((section, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <button
            onClick={() => setOpenSection(openSection === index ? null : index)}
            className="w-full px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <h3 className="text-lg font-bold text-primary">{section.title}</h3>
            <i className={`ri-arrow-${openSection === index ? 'up' : 'down'}-s-line text-2xl text-primary transition-transform`}></i>
          </button>
          {openSection === index && (
            <div className="px-6 pb-6 text-gray-700 whitespace-pre-line leading-relaxed">
              {section.content}
            </div>
          )}
        </div>
      ))}

      <div className="bg-gray-50 rounded-2xl p-8 mt-8">
        <h3 className="text-xl font-bold text-primary mb-4">İletişim</h3>
        <p className="text-gray-700 mb-4">
          KVKK kapsamındaki haklarınızı kullanmak veya sorularınız için bizimle iletişime geçebilirsiniz:
        </p>
        <div className="flex flex-col gap-2 text-gray-700">
          <div className="flex items-center gap-3">
            <i className="ri-mail-line text-primary"></i>
            <span>kvkk@beyair.com</span>
          </div>
          <div className="flex items-center gap-3">
            <i className="ri-phone-line text-primary"></i>
            <span>444 7 239</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CerezContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Çerez Politikası</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          BeyAir web sitesi, kullanıcı deneyimini geliştirmek, site performansını analiz etmek ve kişiselleştirilmiş içerik sunmak amacıyla çerezler kullanmaktadır.
        </p>
        
        <h3 className="text-xl font-bold text-primary mb-4 mt-8">Çerez Nedir?</h3>
        <p className="text-gray-700 leading-relaxed">
          Çerezler, web sitelerini ziyaret ettiğinizde cihazınıza (bilgisayar, tablet, telefon) kaydedilen küçük metin dosyalarıdır. Çerezler, web sitesinin düzgün çalışmasını sağlar ve kullanıcı deneyimini iyileştirir.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Çerez Türü</th>
                <th className="px-6 py-4 text-left font-semibold">Açıklama</th>
                <th className="px-6 py-4 text-left font-semibold">Süre</th>
                <th className="px-6 py-4 text-left font-semibold">Zorunlu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-primary">Zorunlu Çerezler</td>
                <td className="px-6 py-4 text-gray-700">Web sitesinin temel işlevlerini yerine getirmesi için gerekli çerezler. Oturum yönetimi, güvenlik ve dil tercihleri.</td>
                <td className="px-6 py-4 text-gray-600">Oturum / 1 yıl</td>
                <td className="px-6 py-4">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Evet</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-primary">Performans Çerezleri</td>
                <td className="px-6 py-4 text-gray-700">Site performansını ölçmek ve iyileştirmek için kullanılır. Hangi sayfaların en çok ziyaret edildiğini ve kullanıcıların sitede nasıl gezindiğini analiz eder.</td>
                <td className="px-6 py-4 text-gray-600">2 yıl</td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Hayır</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-primary">İşlevsellik Çerezleri</td>
                <td className="px-6 py-4 text-gray-700">Tercihlerinizi hatırlamak için kullanılır. Dil seçimi, bölge tercihleri ve kişiselleştirilmiş ayarlar.</td>
                <td className="px-6 py-4 text-gray-600">1 yıl</td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Hayır</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 font-semibold text-primary">Pazarlama Çerezleri</td>
                <td className="px-6 py-4 text-gray-700">İlgi alanlarınıza uygun reklamlar göstermek için kullanılır. Üçüncü taraf reklam ağları tarafından yerleştirilebilir.</td>
                <td className="px-6 py-4 text-gray-600">2 yıl</td>
                <td className="px-6 py-4">
                  <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">Hayır</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-primary mb-4">Çerezleri Nasıl Yönetebilirsiniz?</h3>
        <div className="space-y-4 text-gray-700 leading-relaxed">
          <p>
            Tarayıcınızın ayarlarından çerezleri kabul etmeme, silme veya belirli çerezler için uyarı alma seçeneklerini kullanabilirsiniz.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <i className="ri-chrome-line text-2xl text-primary mt-1"></i>
              <div>
                <h4 className="font-bold text-primary mb-1">Google Chrome</h4>
                <p className="text-sm">Ayarlar &gt; Gizlilik ve güvenlik &gt; Çerezler ve diğer site verileri</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-safari-line text-2xl text-primary mt-1"></i>
              <div>
                <h4 className="font-bold text-primary mb-1">Safari</h4>
                <p className="text-sm">Tercihler &gt; Gizlilik &gt; Çerezler ve web sitesi verileri</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-firefox-line text-2xl text-primary mt-1"></i>
              <div>
                <h4 className="font-bold text-primary mb-1">Firefox</h4>
                <p className="text-sm">Seçenekler &gt; Gizlilik ve Güvenlik &gt; Çerezler ve Site Verileri</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mt-6">
            <p className="text-sm text-amber-900">
              <strong>Not:</strong> Zorunlu çerezleri devre dışı bırakırsanız, web sitesinin bazı özellikleri düzgün çalışmayabilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function YolcuHaklariContent() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h2 className="text-2xl font-bold text-primary mb-4">Yolcu Hakları</h2>
        <p className="text-gray-700 leading-relaxed">
          AB 261/2004 sayılı tüzük ve Türk Sivil Havacılık mevzuatı kapsamında yolcu haklarınız korunmaktadır. Uçuşunuzda yaşanabilecek aksaklıklarda aşağıdaki haklara sahipsiniz.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
          <i className="ri-time-line text-3xl"></i>
          Uçuş Gecikmesi Hakları
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-primary mb-3">2 Saat ve Üzeri Gecikme</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Ücretsiz yiyecek ve içecek hizmeti</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>İki adet ücretsiz telefon görüşmesi, e-posta veya faks hakkı</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-primary mb-3">5 Saat ve Üzeri Gecikme</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Yukarıdaki tüm haklar</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Bilet ücretinin tam iadesi veya alternatif uçuş seçeneği</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Gerekirse ücretsiz otel konaklaması ve havalimanı transferi</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
          <i className="ri-close-circle-line text-3xl"></i>
          Uçuş İptali Tazminat Hakları
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200">
            <div className="text-center mb-4">
              <i className="ri-plane-line text-4xl text-green-700"></i>
            </div>
            <h4 className="font-bold text-green-900 text-center mb-2">1500 km'ye Kadar</h4>
            <p className="text-3xl font-bold text-green-700 text-center">250 €</p>
            <p className="text-sm text-green-800 text-center mt-2">Tazminat tutarı</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
            <div className="text-center mb-4">
              <i className="ri-plane-line text-4xl text-blue-700"></i>
            </div>
            <h4 className="font-bold text-blue-900 text-center mb-2">1500-3500 km Arası</h4>
            <p className="text-3xl font-bold text-blue-700 text-center">400 €</p>
            <p className="text-sm text-blue-800 text-center mt-2">Tazminat tutarı</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border-2 border-purple-200">
            <div className="text-center mb-4">
              <i className="ri-plane-line text-4xl text-purple-700"></i>
            </div>
            <h4 className="font-bold text-purple-900 text-center mb-2">3500 km Üzeri</h4>
            <p className="text-3xl font-bold text-purple-700 text-center">600 €</p>
            <p className="text-sm text-purple-800 text-center mt-2">Tazminat tutarı</p>
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-lg mt-6">
          <p className="text-sm text-amber-900">
            <strong>Önemli:</strong> Olağanüstü durumlar (hava koşulları, güvenlik riskleri, grev vb.) nedeniyle gerçekleşen iptallerde tazminat hakkı doğmaz.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
          <i className="ri-luggage-cart-line text-3xl"></i>
          Bagaj Hakları
        </h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-primary mb-3">Kayıp veya Hasarlı Bagaj</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Kayıp bagaj için 21 gün içinde başvuru yapılmalıdır</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Hasarlı bagaj için 7 gün içinde bildirim gereklidir</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Maksimum tazminat: 1.288 SDR (yaklaşık 1.700 USD)</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Gecikmeli bagaj için acil ihtiyaç giderleri karşılanır</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-primary mb-3">Kabine Bagaj Hakları</h4>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Economy: 1 adet 8 kg kabine bagajı (55x40x23 cm)</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Business: 2 adet 8 kg kabine bagajı</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="ri-check-line text-green-600 mt-1"></i>
                <span>Kişisel eşya (çanta, laptop çantası) ek olarak kabul edilir</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-8">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
          <i className="ri-wheelchair-line text-3xl"></i>
          Özel Yardım Gerektiren Yolcular
        </h3>
        <div className="bg-gray-50 rounded-xl p-6">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-1"></i>
              <span>Engelli yolcular için ücretsiz tekerlekli sandalye ve yardım hizmeti</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-1"></i>
              <span>Hamile yolcular için öncelikli boarding ve özel koltuk düzenlemesi</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-1"></i>
              <span>Bebek ve çocuklu aileler için öncelikli hizmet</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="ri-check-line text-green-600 mt-1"></i>
              <span>Özel yardım talebi en az 48 saat önceden bildirilmelidir</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-gradient-to-br from-primary to-red-700 text-white rounded-2xl p-8">
        <h3 className="text-2xl font-bold mb-4">Haklarınızı Kullanın</h3>
        <p className="mb-6 text-white/90">
          Uçuşunuzda yaşadığınız herhangi bir sorun için müşteri hizmetlerimizle iletişime geçebilir veya Sivil Havacılık Genel Müdürlüğü'ne başvurabilirsiniz.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="tel:4447239"
            className="bg-white text-primary px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-2"
          >
            <i className="ri-phone-line"></i>
            Bizi Arayın
          </a>
          <Link
            to="/yardim"
            className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-full font-semibold hover:bg-white/30 transition-colors whitespace-nowrap cursor-pointer inline-flex items-center gap-2"
          >
            <i className="ri-customer-service-line"></i>
            Yardım Merkezi
          </Link>
        </div>
      </div>
    </div>
  );
}