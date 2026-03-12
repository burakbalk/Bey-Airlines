import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/feature/Header';
import Footer from '../../components/feature/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { useUserReservations, useSavedPassengers } from '../../hooks/useReservations';
import type { Reservation } from '../../hooks/useReservations';
import { supabase } from '../../lib/supabase';

export default function AccountPage() {
  const navigate = useNavigate();
  const { user, profile: authProfile, loading: authLoading, signIn, signUp, signOut, updateProfile } = useAuth();
  const isLoggedIn = !!user;
  const { reservations, loading: reservationsLoading } = useUserReservations();
  const savedPassengersFromHook = useSavedPassengers();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [activeSection, setActiveSection] = useState<'profile' | 'reservations' | 'passengers'>('profile');
  const [passengers, setPassengers] = useState<any[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showAddPassengerModal, setShowAddPassengerModal] = useState(false);
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    surname: '',
    tcNo: '',
    birthDate: '',
    phone: '',
    email: ''
  });
  const [editingPassengerId, setEditingPassengerId] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerSurname, setRegisterSurname] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPasswordConfirm, setRegisterPasswordConfirm] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Profile state
  const [profileForm, setProfileForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    birthDate: ''
  });
  const [profileSaved, setProfileSaved] = useState(false);

  // Sync profile form with auth profile
  useEffect(() => {
    if (authProfile && user) {
      setProfileForm({
        name: authProfile.first_name || '',
        surname: authProfile.last_name || '',
        email: user.email || '',
        phone: authProfile.phone || '',
        birthDate: authProfile.birth_date || ''
      });
    }
  }, [authProfile, user]);

  // Sync saved passengers from hook
  useEffect(() => {
    setPassengers(savedPassengersFromHook);
  }, [savedPassengersFromHook]);

  // Redirect to /giris if not logged in and not loading
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate('/giris');
    }
  }, [authLoading, isLoggedIn, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    const { error } = await signIn(loginEmail, loginPassword);

    setLoginLoading(false);
    if (error) {
      setLoginError(error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (registerPassword !== registerPasswordConfirm) {
      setRegisterError('Şifreler eşleşmiyor');
      return;
    }

    if (registerPassword.length < 6) {
      setRegisterError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    setRegisterLoading(true);

    const { error } = await signUp(registerEmail, registerPassword, registerName, registerSurname);

    setRegisterLoading(false);
    if (error) {
      setRegisterError(error);
    } else {
      setRegisterSuccess(true);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile({
      first_name: profileForm.name,
      last_name: profileForm.surname,
      phone: profileForm.phone || null,
      birth_date: profileForm.birthDate || null,
    });
    if (!error) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    }
  };

  const handleEditPassenger = (passenger: any) => {
    setEditingPassengerId(passenger.id);
    setNewPassenger({
      name: passenger.first_name,
      surname: passenger.last_name,
      tcNo: passenger.tc_no,
      birthDate: passenger.birth_date,
      phone: passenger.phone || '',
      email: passenger.email || ''
    });
    setShowAddPassengerModal(true);
  };

  const handleAddPassenger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editingPassengerId) {
      // Edit mode - update in Supabase
      const { error } = await supabase
        .from('saved_passengers')
        .update({
          first_name: newPassenger.name,
          last_name: newPassenger.surname,
          tc_no: newPassenger.tcNo,
          birth_date: newPassenger.birthDate,
          phone: newPassenger.phone,
          email: newPassenger.email,
        })
        .eq('id', editingPassengerId);

      if (!error) {
        setPassengers(passengers.map((p: any) =>
          p.id === editingPassengerId
            ? {
                ...p,
                first_name: newPassenger.name,
                last_name: newPassenger.surname,
                tc_no: newPassenger.tcNo,
                birth_date: newPassenger.birthDate,
                phone: newPassenger.phone,
                email: newPassenger.email,
              }
            : p
        ));
      }
    } else {
      // Add mode - insert into Supabase
      const { data, error } = await supabase
        .from('saved_passengers')
        .insert({
          user_id: user.id,
          first_name: newPassenger.name,
          last_name: newPassenger.surname,
          tc_no: newPassenger.tcNo,
          birth_date: newPassenger.birthDate,
          phone: newPassenger.phone,
          email: newPassenger.email,
        })
        .select()
        .single();

      if (!error && data) {
        setPassengers([...passengers, data]);
      }
    }

    setShowAddPassengerModal(false);
    setEditingPassengerId(null);
    setNewPassenger({
      name: '',
      surname: '',
      tcNo: '',
      birthDate: '',
      phone: '',
      email: ''
    });
  };

  const handleDeletePassenger = async (id: string) => {
    const { error } = await supabase
      .from('saved_passengers')
      .delete()
      .eq('id', id);

    if (!error) {
      setPassengers(passengers.filter(p => p.id !== id));
    }
  };

  // Helper to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price);
  };

  // Helper to get passenger count from reservation
  const getPassengerCount = (reservation: Reservation) => {
    return reservation.passengers?.length || 1;
  };

  // Helper to get seat numbers from reservation
  const getSeatNumbers = (reservation: Reservation) => {
    if (!reservation.passengers || reservation.passengers.length === 0) return '-';
    return reservation.passengers.map(p => p.seat_number).filter(Boolean).join(', ') || '-';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-red-600"></i>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    // Will redirect via useEffect, show loading in the meantime
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-red-600"></i>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* Hero */}
      <div className="relative bg-gradient-to-br from-red-600 via-red-500 to-red-700 pt-12 pb-16">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/20"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-0 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <i className="ri-user-line text-3xl text-white"></i>
            </div>
            <div>
              <p className="text-red-200 text-sm mb-1">Hoş geldiniz</p>
              <h1 className="text-3xl font-bold text-white">{profileForm.name} {profileForm.surname}</h1>
              <p className="text-red-100 text-sm mt-1">Hesabınızı yönetin</p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            className="px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer border border-white/30"
          >
            <i className="ri-logout-box-line mr-2"></i>Çıkış Yap
          </button>
        </div>
      </div>

      <main className="flex-1 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 -mt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-4 border border-gray-100">
                <nav className="space-y-1">
                  {[
                    { key: 'profile', icon: 'ri-user-line', label: 'Profilim' },
                    { key: 'reservations', icon: 'ri-flight-takeoff-line', label: 'Rezervasyonlarım', badge: reservations.length },
                    { key: 'passengers', icon: 'ri-group-line', label: 'Kayıtlı Yolcular', badge: passengers.length },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveSection(item.key as typeof activeSection)}
                      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap cursor-pointer flex items-center justify-between text-sm ${
                        activeSection === item.key ? 'bg-red-600 text-white shadow-md' : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <i className={`${item.icon} text-base`}></i>
                        {item.label}
                      </div>
                      {item.badge !== undefined && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          activeSection === item.key ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeSection === 'profile' && (
                <div className="bg-white rounded-2xl shadow-md p-4 sm:p-8 border border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Profil Bilgilerim</h2>
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                        <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                        <input type="text" value={profileForm.surname} onChange={(e) => setProfileForm({...profileForm, surname: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                      <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({...profileForm, email: e.target.value})} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi</label>
                      <input type="date" value={profileForm.birthDate} onChange={(e) => setProfileForm({...profileForm, birthDate: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm" />
                    </div>
                    <div className="pt-2 flex items-center gap-4">
                      <button type="submit" className="px-8 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-red-100">
                        Değişiklikleri Kaydet
                      </button>
                      {profileSaved && (
                        <span className="text-green-600 text-sm font-medium flex items-center gap-1">
                          <i className="ri-check-line"></i> Kaydedildi
                        </span>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {activeSection === 'reservations' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Rezervasyonlarım</h2>
                    <span className="text-sm text-gray-500">{reservations.length} Rezervasyon</span>
                  </div>
                  {reservationsLoading ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 border border-gray-100 text-center">
                      <i className="ri-loader-4-line animate-spin text-4xl text-red-600"></i>
                    </div>
                  ) : reservations.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md p-12 border border-gray-100 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-flight-takeoff-line text-4xl text-gray-400"></i>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz rezervasyonunuz yok</h3>
                      <p className="text-gray-500 mb-6">İlk uçuşunuzu rezerve edin ve seyahate başlayın!</p>
                      <a href="/ucus-ara" className="inline-block px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer">
                        Uçuş Ara
                      </a>
                    </div>
                  ) : (
                    reservations.map((reservation) => (
                      <div key={reservation.id} className="bg-white rounded-2xl shadow-md p-3 sm:p-6 border border-gray-100">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-bold text-gray-900">{reservation.route}</h3>
                              {reservation.flight_class === 'business' && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full flex items-center gap-1 whitespace-nowrap">
                                  <i className="ri-vip-crown-line text-xs"></i>Business
                                </span>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm">PNR: <span className="font-semibold text-gray-700">{reservation.pnr}</span></p>
                          </div>
                          <span className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap ${reservation.status === 'Onaylandi' || reservation.status === 'Onaylandı' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                            {reservation.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          {[
                            { label: 'Uçuş No', value: reservation.flight_number },
                            { label: 'Tarih', value: `${reservation.flight_date} ${reservation.flight_time}` },
                            { label: 'Yolcu', value: `${getPassengerCount(reservation)} Kişi` },
                            { label: 'Koltuk', value: getSeatNumbers(reservation) },
                          ].map((item, i) => (
                            <div key={i}>
                              <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                              <p className="font-semibold text-gray-900 text-sm">{item.value}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <p className="text-xl font-bold text-red-600">{formatPrice(reservation.total_price)}</p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => {
                                setSelectedReservation(reservation);
                                setShowReservationModal(true);
                              }}
                              className="px-5 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer text-sm"
                            >
                              Detaylar
                            </button>
                            {(reservation.status === 'Onaylandi' || reservation.status === 'Onaylandı') && (
                              <a
                                href="/check-in"
                                className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer text-sm"
                              >
                                Check-in Yap
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeSection === 'passengers' && (
                <div className="bg-white rounded-2xl shadow-md p-4 sm:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Kayıtlı Yolcular</h2>
                    <button
                      onClick={() => setShowAddPassengerModal(true)}
                      className="px-5 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer text-sm shadow-md shadow-red-100"
                    >
                      <i className="ri-add-line mr-2"></i>Yeni Yolcu Ekle
                    </button>
                  </div>
                  <div className="space-y-4">
                    {passengers.map((passenger) => (
                      <div key={passenger.id} className="p-5 border border-gray-100 rounded-xl hover:border-red-200 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <i className="ri-user-line text-xl text-red-600"></i>
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900 mb-2">{passenger.first_name} {passenger.last_name}</h3>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-8 gap-y-1 text-sm">
                                <div><span className="text-gray-500 text-xs">TC No:</span><span className="ml-2 font-medium text-gray-800 text-xs">{passenger.tc_no}</span></div>
                                <div><span className="text-gray-500 text-xs">Doğum:</span><span className="ml-2 font-medium text-gray-800 text-xs">{passenger.birth_date}</span></div>
                                <div><span className="text-gray-500 text-xs">Telefon:</span><span className="ml-2 font-medium text-gray-800 text-xs">{passenger.phone}</span></div>
                                <div><span className="text-gray-500 text-xs">E-posta:</span><span className="ml-2 font-medium text-gray-800 text-xs">{passenger.email}</span></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditPassenger(passenger)}
                              className="w-9 h-9 flex items-center justify-center border border-gray-200 text-gray-500 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                              <i className="ri-edit-line text-sm"></i>
                            </button>
                            <button
                              onClick={() => handleDeletePassenger(passenger.id)}
                              className="w-9 h-9 flex items-center justify-center border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Rezervasyon Detay Modal */}
      {showReservationModal && selectedReservation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowReservationModal(false)}>
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Bilet Üst Kısım */}
            <div className="bg-gradient-to-br from-red-600 to-red-700 p-4 sm:p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <i className="ri-flight-takeoff-fill text-2xl"></i>
                    </div>
                    <div>
                      <p className="text-red-200 text-xs">Bey Airlines</p>
                      <p className="text-lg font-bold">{selectedReservation.flight_number}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowReservationModal(false)}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="text-center">
                    <p className="text-red-200 text-xs mb-1">Kalkış</p>
                    <p className="text-2xl sm:text-4xl font-bold mb-1">{selectedReservation.route.split(' - ')[0] || '-'}</p>
                    <p className="text-sm text-red-100">{selectedReservation.flight_date}</p>
                    <p className="text-sm text-red-100">{selectedReservation.flight_time}</p>
                  </div>
                  <div className="flex-1 px-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <div className="h-px bg-white/30 flex-1"></div>
                      <i className="ri-plane-fill text-xl"></i>
                      <div className="h-px bg-white/30 flex-1"></div>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-red-200 text-xs mb-1">Varış</p>
                    <p className="text-2xl sm:text-4xl font-bold mb-1">{selectedReservation.route.split(' - ')[1] || '-'}</p>
                    <p className="text-sm text-red-100">{selectedReservation.flight_date}</p>
                    <p className="text-sm text-red-100">-</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Kesikli Ayırıcı */}
            <div className="relative h-8 bg-gray-50">
              <div className="absolute top-0 left-0 w-full h-full flex justify-between">
                <div className="w-8 h-8 bg-white rounded-full -ml-4"></div>
                <div className="flex-1 border-t-2 border-dashed border-gray-300 mt-4"></div>
                <div className="w-8 h-8 bg-white rounded-full -mr-4"></div>
              </div>
            </div>

            {/* Bilet Alt Kısım */}
            <div className="p-4 sm:p-8">
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Yolcu Bilgileri</h3>
                <div className="space-y-3">
                  {selectedReservation.passengers?.map((passenger, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <p className="font-semibold text-gray-900">{passenger.first_name} {passenger.last_name}</p>
                        <p className="text-sm text-gray-500">TC: {passenger.tc_no}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Koltuk</p>
                        <p className="font-bold text-red-600 text-lg">{passenger.seat_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">İletişim Bilgileri</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700"><i className="ri-mail-line mr-2 text-red-600"></i>{selectedReservation.contact_email}</p>
                    <p className="text-sm text-gray-700"><i className="ri-phone-line mr-2 text-red-600"></i>{selectedReservation.contact_phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Ek Hizmetler</h3>
                  <div className="space-y-2">
                    {selectedReservation.extra_services?.baggage?.map((bag: string, idx: number) => (
                      <p key={idx} className="text-sm text-gray-700"><i className="ri-luggage-cart-line mr-2 text-red-600"></i>{bag}</p>
                    ))}
                    {selectedReservation.extra_services?.priorityBoarding && (
                      <p className="text-sm text-gray-700"><i className="ri-vip-crown-line mr-2 text-red-600"></i>Öncelikli Biniş</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center mb-6">
                <div className="text-center">
                  <img src="/images/app/barcode.webp" alt="Barkod" className="h-16 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">PNR: <span className="font-bold text-gray-900">{selectedReservation.pnr}</span></p>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                  <i className="ri-download-line"></i>PDF İndir
                </button>
                <button className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                  <i className="ri-mail-send-line"></i>E-posta Gönder
                </button>
                <a href="/check-in" className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer flex items-center justify-center gap-2">
                  <i className="ri-checkbox-circle-line"></i>Check-in Yap
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Yolcu Ekleme Modal */}
      {showAddPassengerModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddPassengerModal(false); setEditingPassengerId(null); setNewPassenger({ name: '', surname: '', tcNo: '', birthDate: '', phone: '', email: '' }); }}>
          <div className="bg-white rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-3 sm:p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">{editingPassengerId ? 'Yolcu Düzenle' : 'Yeni Yolcu Ekle'}</h3>
                <button
                  onClick={() => { setShowAddPassengerModal(false); setEditingPassengerId(null); setNewPassenger({ name: '', surname: '', tcNo: '', birthDate: '', phone: '', email: '' }); }}
                  className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-gray-600"></i>
                </button>
              </div>
            </div>
            <form onSubmit={handleAddPassenger} className="p-3 sm:p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ad</label>
                    <input
                      type="text"
                      required
                      value={newPassenger.name}
                      onChange={(e) => setNewPassenger({...newPassenger, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Ad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Soyad</label>
                    <input
                      type="text"
                      required
                      value={newPassenger.surname}
                      onChange={(e) => setNewPassenger({...newPassenger, surname: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                      placeholder="Soyad"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TC Kimlik No</label>
                  <input
                    type="text"
                    required
                    value={newPassenger.tcNo}
                    onChange={(e) => setNewPassenger({...newPassenger, tcNo: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="12345678901"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doğum Tarihi</label>
                  <input
                    type="date"
                    required
                    value={newPassenger.birthDate}
                    onChange={(e) => setNewPassenger({...newPassenger, birthDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                  <input
                    type="tel"
                    required
                    value={newPassenger.phone}
                    onChange={(e) => setNewPassenger({...newPassenger, phone: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                  <input
                    type="email"
                    required
                    value={newPassenger.email}
                    onChange={(e) => setNewPassenger({...newPassenger, email: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => { setShowAddPassengerModal(false); setEditingPassengerId(null); setNewPassenger({ name: '', surname: '', tcNo: '', birthDate: '', phone: '', email: '' }); }}
                  className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  Iptal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium whitespace-nowrap cursor-pointer"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}