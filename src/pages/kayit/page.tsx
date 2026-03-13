import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { usePageTitle } from '../../hooks/usePageTitle';

export default function KayitPage() {
  usePageTitle('Kayıt Ol');
  const navigate = useNavigate();
  const { signUp, user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [kvkk, setKvkk] = useState(false);

  // If already logged in, redirect to account page
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/hesabim');
    }
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    const pw = formData.password;
    if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) {
      setError('Şifre tüm güvenlik kurallarını karşılamalıdır.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (!kvkk) {
      setError('Devam etmek için KVKK metnini onaylamanız gereklidir.');
      return;
    }

    setLoading(true);

    const { error: signUpError } = await signUp(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    );

    setLoading(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }

    setSuccess('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...');
    setTimeout(() => {
      navigate('/giris');
    }, 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50 -z-10"></div>

        <div className="w-full max-w-md">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-600 rounded-2xl mb-4 shadow-lg shadow-red-200">
              <i className="ri-user-add-line text-4xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Hesap Oluşturun</h1>
            <p className="text-gray-500">Bey Airlines ailesine katılmak için kayıt olun</p>
          </div>

          {/* Register Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 border border-gray-100">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                <i className="ri-error-warning-line text-xl text-red-600 mt-0.5"></i>
                <div>
                  <p className="font-semibold text-red-900 text-sm">Kayıt Başarısız</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
                <i className="ri-check-line text-xl text-green-600 mt-0.5"></i>
                <div>
                  <p className="font-semibold text-green-900 text-sm">Başarılı!</p>
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Fields - Two Columns */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ad
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-line text-lg text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                      placeholder="Adınız"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Soyad
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                      <i className="ri-user-line text-lg text-gray-400"></i>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                      placeholder="Soyadınız"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                    <i className="ri-mail-line text-lg text-gray-400"></i>
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                    <i className="ri-lock-line text-lg text-gray-400"></i>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                    placeholder="En az 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    <i className={showPassword ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'}></i>
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {[
                      { test: formData.password.length >= 8, label: 'En az 8 karakter' },
                      { test: /[A-Z]/.test(formData.password), label: 'En az 1 büyük harf (A-Z)' },
                      { test: /[a-z]/.test(formData.password), label: 'En az 1 küçük harf (a-z)' },
                      { test: /[0-9]/.test(formData.password), label: 'En az 1 rakam (0-9)' },
                      { test: /[^A-Za-z0-9]/.test(formData.password), label: 'En az 1 özel karakter (!@#$...)' },
                    ].map((rule, i) => (
                      <p key={i} className={`text-xs flex items-center gap-1.5 ${rule.test ? 'text-green-600' : 'text-gray-400'}`}>
                        <i className={rule.test ? 'ri-check-line' : 'ri-close-line'}></i>
                        {rule.label}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center pointer-events-none">
                    <i className="ri-lock-line text-lg text-gray-400"></i>
                  </div>
                  <input
                    type={showPasswordConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={formData.passwordConfirm}
                    onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                    className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all ${
                      formData.passwordConfirm.length > 0
                        ? formData.password === formData.passwordConfirm
                          ? 'border-green-400'
                          : 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    placeholder="Şifrenizi tekrar girin"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirm((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    aria-label={showPasswordConfirm ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    <i className={showPasswordConfirm ? 'ri-eye-off-line text-lg' : 'ri-eye-line text-lg'}></i>
                  </button>
                </div>
                {formData.passwordConfirm.length > 0 && (
                  <p className={`mt-1.5 text-xs flex items-center gap-1 ${formData.password === formData.passwordConfirm ? 'text-green-600' : 'text-red-500'}`}>
                    <i className={formData.password === formData.passwordConfirm ? 'ri-check-line' : 'ri-close-line'}></i>
                    {formData.password === formData.passwordConfirm ? 'Şifreler eşleşiyor' : 'Şifreler eşleşmiyor'}
                  </p>
                )}
              </div>

              {/* KVKK */}
              <div className="flex items-start gap-3">
                <input
                  id="kvkk"
                  type="checkbox"
                  checked={kvkk}
                  onChange={(e) => setKvkk(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-red-600 cursor-pointer flex-shrink-0"
                />
                <label htmlFor="kvkk" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                  <Link to="/kvkk" className="text-red-600 font-medium hover:text-red-700 transition-colors" target="_blank">
                    Kişisel Verilerin Korunması (KVKK)
                  </Link>{' '}
                  metnini okudum ve kabul ediyorum.
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer shadow-lg shadow-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-loader-4-line animate-spin"></i>
                    Kayıt yapılıyor...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <i className="ri-user-add-line"></i>
                    Kayıt Ol
                  </span>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                Zaten hesabınız var mı?{' '}
                <Link
                  to="/giris"
                  className="text-red-600 font-semibold hover:text-red-700 transition-colors"
                >
                  Giriş Yapın
                </Link>
              </p>
            </div>
          </div>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
            >
              <i className="ri-arrow-left-line"></i>
              Ana Sayfaya Dön
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
