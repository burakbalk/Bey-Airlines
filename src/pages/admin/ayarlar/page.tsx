import { useState } from 'react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'password' | 'notifications' | 'messages'>('general');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Genel Ayarlar
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'BeyAir Havayolları',
    contactEmail: 'info@beyair.com',
    contactPhone: '+90 850 123 4567',
    supportEmail: 'destek@beyair.com',
    address: 'Atatürk Havalimanı, Terminal 1, İstanbul'
  });

  // Şifre Değiştirme
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Bildirim Tercihleri
  const [notifications, setNotifications] = useState({
    emailNewReservation: true,
    emailCancellation: true,
    emailNewMessage: true,
    emailLowStock: false,
    smsNewReservation: false,
    smsCancellation: true
  });

  // Uçuş Durumu Mesajları
  const [flightMessages, setFlightMessages] = useState({
    onTime: 'Uçuşunuz zamanında kalkacaktır.',
    delayed: 'Uçuşunuz gecikmiştir. Lütfen bilgi ekranlarını takip edin.',
    cancelled: 'Uçuşunuz iptal edilmiştir. Lütfen gişelerimize başvurun.',
    boarding: 'Uçuşunuz için biniş başlamıştır. Lütfen kapıya geçin.',
    departed: 'Uçuşunuz kalkış yapmıştır.'
  });

  const handleSaveGeneral = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('Şifre en az 6 karakter olmalıdır!');
      return;
    }
    setShowSuccessMessage(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleSaveNotifications = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleSaveMessages = () => {
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sistem Ayarları</h1>
        <p className="text-gray-600">Genel sistem ayarlarını yönetin</p>
      </div>

      {/* Başarı Mesajı */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <i className="ri-check-line text-xl text-green-600"></i>
          </div>
          <div>
            <p className="font-semibold text-green-900">Başarılı!</p>
            <p className="text-sm text-green-700">Ayarlarınız kaydedildi.</p>
          </div>
        </div>
      )}

      {/* Sekmeler */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-settings-3-line mr-2"></i>
              Genel Ayarlar
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-lock-password-line mr-2"></i>
              Şifre Değiştir
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'notifications'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-notification-3-line mr-2"></i>
              Bildirimler
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === 'messages'
                  ? 'border-red-600 text-red-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className="ri-message-3-line mr-2"></i>
              Uçuş Mesajları
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Genel Ayarlar */}
          {activeTab === 'general' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Genel Bilgiler</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Adı
                  </label>
                  <input
                    type="text"
                    value={generalSettings.siteName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İletişim E-postası
                  </label>
                  <input
                    type="email"
                    value={generalSettings.contactEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destek E-postası
                  </label>
                  <input
                    type="email"
                    value={generalSettings.supportEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.contactPhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactPhone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres
                  </label>
                  <textarea
                    value={generalSettings.address}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, address: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveGeneral}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-save-line mr-2"></i>
                  Değişiklikleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* Şifre Değiştirme */}
          {activeTab === 'password' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Şifre Değiştir</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yeni Şifre (Tekrar)
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>

                <button
                  onClick={handleChangePassword}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-lock-password-line mr-2"></i>
                  Şifreyi Değiştir
                </button>
              </div>
            </div>
          )}

          {/* Bildirim Tercihleri */}
          {activeTab === 'notifications' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Bildirim Tercihleri</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">E-posta Bildirimleri</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">Yeni rezervasyon bildirimi</span>
                      <input
                        type="checkbox"
                        checked={notifications.emailNewReservation}
                        onChange={(e) => setNotifications({ ...notifications, emailNewReservation: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">İptal bildirimi</span>
                      <input
                        type="checkbox"
                        checked={notifications.emailCancellation}
                        onChange={(e) => setNotifications({ ...notifications, emailCancellation: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">Yeni müşteri mesajı</span>
                      <input
                        type="checkbox"
                        checked={notifications.emailNewMessage}
                        onChange={(e) => setNotifications({ ...notifications, emailNewMessage: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">Düşük koltuk uyarısı</span>
                      <input
                        type="checkbox"
                        checked={notifications.emailLowStock}
                        onChange={(e) => setNotifications({ ...notifications, emailLowStock: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">SMS Bildirimleri</h4>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">Yeni rezervasyon bildirimi</span>
                      <input
                        type="checkbox"
                        checked={notifications.smsNewReservation}
                        onChange={(e) => setNotifications({ ...notifications, smsNewReservation: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </label>
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="text-sm text-gray-700">İptal bildirimi</span>
                      <input
                        type="checkbox"
                        checked={notifications.smsCancellation}
                        onChange={(e) => setNotifications({ ...notifications, smsCancellation: e.target.checked })}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleSaveNotifications}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-save-line mr-2"></i>
                  Tercihleri Kaydet
                </button>
              </div>
            </div>
          )}

          {/* Uçuş Durumu Mesajları */}
          {activeTab === 'messages' && (
            <div className="max-w-2xl">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Uçuş Durumu Varsayılan Mesajları</h3>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-time-line mr-2 text-green-600"></i>
                    Zamanında (On Time)
                  </label>
                  <textarea
                    value={flightMessages.onTime}
                    onChange={(e) => setFlightMessages({ ...flightMessages, onTime: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-time-line mr-2 text-orange-600"></i>
                    Gecikmeli (Delayed)
                  </label>
                  <textarea
                    value={flightMessages.delayed}
                    onChange={(e) => setFlightMessages({ ...flightMessages, delayed: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-close-circle-line mr-2 text-red-600"></i>
                    İptal (Cancelled)
                  </label>
                  <textarea
                    value={flightMessages.cancelled}
                    onChange={(e) => setFlightMessages({ ...flightMessages, cancelled: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-plane-line mr-2 text-blue-600"></i>
                    Biniş Başladı (Boarding)
                  </label>
                  <textarea
                    value={flightMessages.boarding}
                    onChange={(e) => setFlightMessages({ ...flightMessages, boarding: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <i className="ri-flight-takeoff-line mr-2 text-purple-600"></i>
                    Kalktı (Departed)
                  </label>
                  <textarea
                    value={flightMessages.departed}
                    onChange={(e) => setFlightMessages({ ...flightMessages, departed: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                  />
                </div>

                <button
                  onClick={handleSaveMessages}
                  className="w-full bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-save-line mr-2"></i>
                  Mesajları Kaydet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}