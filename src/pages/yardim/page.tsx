import { useState } from 'react';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { faqData } from '../../mocks/faq';

export default function YardimPage() {
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const categories = ['Tümü', 'Bagaj Kuralları', 'Check-in', 'İptal ve Değişiklik', 'Ödeme', 'VIP Hizmetler'];

  const filteredFaqs = selectedCategory === 'Tümü' 
    ? faqData 
    : faqData.filter(faq => faq.category === selectedCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        {/* Hero Section - diğer sayfalarla tutarlı */}
        <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 pt-16 pb-16">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
          <div className="relative z-10 max-w-4xl mx-auto px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
              <i className="ri-customer-service-2-line text-3xl text-white"></i>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">Yardım Merkezi</h1>
            <p className="text-xl text-red-100">Size nasıl yardımcı olabiliriz?</p>
            <div className="flex items-center justify-center gap-8 mt-8">
              {['7/24 Destek', 'Hızlı Yanıt', 'Uzman Ekip'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                  <i className="ri-check-line text-red-200"></i>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-8 pb-16">
          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 -mt-10 relative z-10 mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all cursor-pointer border border-gray-100">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-phone-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Telefon Desteği</h3>
              <p className="text-gray-500 text-sm mb-3">7/24 Müşteri Hizmetleri</p>
              <a href="tel:08508502020" className="text-red-600 font-bold text-lg hover:text-red-700">0850 850 20 20</a>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all cursor-pointer border border-gray-100">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-whatsapp-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">WhatsApp Destek</h3>
              <p className="text-gray-500 text-sm mb-3">Hızlı ve Kolay İletişim</p>
              <a href="https://wa.me/908508502020" className="text-red-600 font-bold text-lg hover:text-red-700">WhatsApp ile Yaz</a>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all cursor-pointer border border-gray-100">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">E-posta Desteği</h3>
              <p className="text-gray-500 text-sm mb-3">24 Saat İçinde Yanıt</p>
              <a href="mailto:destek@beyairlines.com" className="text-red-600 font-bold hover:text-red-700 text-sm">destek@beyairlines.com</a>
            </div>
          </div>

          {/* SSS Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Sıkça Sorulan Sorular</h2>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-sm ${
                    selectedCategory === category
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-red-400 hover:text-red-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="max-w-4xl mx-auto space-y-3">
              {filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-red-200 transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-all cursor-pointer"
                  >
                    <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-red-50 text-red-600 text-xs font-medium rounded-full mb-2">
                        {faq.category}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900">{faq.question}</h3>
                    </div>
                    <i className={`ri-arrow-down-s-line text-2xl text-gray-400 transition-transform flex-shrink-0 ml-4 ${
                      openFaqId === faq.id ? 'rotate-180' : ''
                    }`}></i>
                  </button>
                  {openFaqId === faq.id && (
                    <div className="px-6 pb-5 pt-1 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed text-sm">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bagaj Kuralları */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bagaj Kuralları</h2>
            <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-red-600 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Bagaj Tipi</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Normal Uçuş</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">VIP Uçuş</th>
                      <th className="px-6 py-4 text-left font-semibold text-sm">Boyut Sınırı</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      { type: 'Kabin Bagajı', normal: '8 kg', vip: '12 kg', size: '55x40x23 cm' },
                      { type: 'Kayıtlı Bagaj', normal: '20 kg (Ücretsiz)', vip: '30 kg (Ücretsiz)', size: '158 cm (Toplam)' },
                      { type: 'Fazla Bagaj', normal: '15 TL/kg', vip: '10 TL/kg', size: '-' },
                      { type: 'Kişisel Eşya', normal: '1 Adet', vip: '1 Adet', size: '40x30x15 cm' },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-red-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 text-sm">{row.type}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{row.normal}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{row.vip}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{row.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Check-in ve İade Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
                <i className="ri-checkbox-circle-line text-xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Check-in Kuralları</h3>
              <ul className="space-y-3">
                {[
                  'Online check-in uçuştan 24 saat önce açılır',
                  'Kalkıştan 2 saat öncesine kadar yapılabilir',
                  'Dijital biniş kartı yeterlidir',
                  'Havalimanında en az 90 dakika önceden bulunun',
                  'Kimlik belgesi zorunludur',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-red-600 text-base"></i>
                    </div>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center mb-4">
                <i className="ri-refund-2-line text-xl text-white"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">İptal ve İade</h3>
              <ul className="space-y-3">
                {[
                  'Uçuştan 24 saat öncesine kadar iptal edilebilir',
                  'VIP biletlerde iptal ücretsizdir',
                  'Normal biletlerde %20 iptal ücreti uygulanır',
                  'İade süresi 7-14 iş günüdür',
                  'Tarih değişikliği fark ücreti ile yapılabilir',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <i className="ri-check-line text-red-600 text-base"></i>
                    </div>
                    <span className="text-gray-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* İletişim Formu */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Bize Ulaşın</h2>
            <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
              {formSubmitted ? (
                <div className="text-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-4xl text-green-600"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Mesajınız Alındı!</h3>
                  <p className="text-gray-600">En kısa sürede size geri dönüş yapacağız.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Ad Soyad <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm"
                        placeholder="Adınız ve soyadınız"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        E-posta <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Konu <span className="text-red-600">*</span>
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all text-sm cursor-pointer"
                    >
                      <option value="">Konu seçiniz</option>
                      <option value="rezervasyon">Rezervasyon</option>
                      <option value="bagaj">Bagaj</option>
                      <option value="check-in">Check-in</option>
                      <option value="iptal">İptal ve İade</option>
                      <option value="diger">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Mesajınız <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-red-500 focus:outline-none transition-all resize-none text-sm"
                      placeholder="Mesajınızı buraya yazın..."
                    ></textarea>
                    <p className="text-xs text-gray-400 mt-1">{formData.message.length}/500 karakter</p>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-base hover:bg-red-700 transition-all whitespace-nowrap cursor-pointer shadow-lg shadow-red-100"
                  >
                    <i className="ri-send-plane-line mr-2"></i>Mesaj Gönder
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}