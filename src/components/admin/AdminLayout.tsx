import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { messages } from '../../mocks/messages';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const handleQuickAction = (path: string) => {
    navigate(path);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: 'ri-dashboard-line', label: 'Dashboard' },
    { path: '/admin/ucuslar', icon: 'ri-plane-line', label: 'Uçuşlar' },
    { path: '/admin/rezervasyonlar', icon: 'ri-ticket-line', label: 'Rezervasyonlar' },
    { path: '/admin/musteriler', icon: 'ri-user-line', label: 'Müşteriler' },
    { path: '/admin/mesajlar', icon: 'ri-mail-line', label: 'Mesajlar', badge: unreadCount },
    { path: '/admin/kampanyalar', icon: 'ri-gift-line', label: 'Kampanyalar' },
    { path: '/admin/raporlar', icon: 'ri-bar-chart-line', label: 'Raporlar' },
    { path: '/admin/ayarlar', icon: 'ri-settings-3-line', label: 'Ayarlar' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                <i className="ri-plane-line text-xl text-white"></i>
              </div>
              <div>
                <h1 className="font-bold text-gray-900 text-sm">Bey Airlines</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center mx-auto">
              <i className="ri-plane-line text-xl text-white"></i>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative ${
                  isActive
                    ? 'bg-red-50 text-red-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-red-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  <i className={`ri-${item.icon} text-xl`}></i>
                </div>
                {sidebarOpen && (
                  <>
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors shadow-sm"
        >
          <i className={`ri-arrow-${sidebarOpen ? 'left' : 'right'}-s-line text-sm text-gray-600`}></i>
        </button>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-gray-900">
              {menuItems.find(item => item.path === location.pathname)?.label || 'Admin Panel'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
              <i className="ri-notification-line text-xl text-gray-600"></i>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{adminUser.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">{adminUser.role || 'Yönetici'}</p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center cursor-pointer hover:bg-red-100 transition-colors"
              >
                <i className="ri-logout-box-r-line text-lg text-red-600"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-4">
              <i className="ri-logout-box-r-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Çıkış Yap</h3>
            <p className="text-gray-600 mb-6">
              Admin panelinden çıkış yapmak istediğinize emin misiniz?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                İptal
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}