import { useState } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { useAdminCampaigns, Campaign } from '../../../hooks/useCampaigns';

export default function AdminCampaignsPage() {
  const { campaigns, loading, create, update, remove } = useAdminCampaigns();
  const [showModal, setShowModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('Tümü');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<{ title?: string; description?: string }>({});

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    badge: '',
    type: 'normal' as string,
    image: '',
    routes: ''
  });

  const typeFilters = ['Tümü', 'VIP', 'Normal'];

  const handleAdd = () => {
    setEditingCampaign(null);
    setFormData({
      title: '',
      description: '',
      badge: '',
      type: 'normal',
      image: '',
      routes: ''
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEdit = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setFormData({
      title: campaign.title,
      description: campaign.description,
      badge: campaign.badge || '',
      type: campaign.type || 'normal',
      image: campaign.image || '',
      routes: (campaign.routes || []).join(', ')
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    const errors: { title?: string; description?: string } = {};
    if (!formData.title.trim()) errors.title = 'Kampanya başlığı zorunludur.';
    if (!formData.description.trim()) errors.description = 'Açıklama zorunludur.';
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);
    const routesArray = formData.routes.split(',').map(r => r.trim()).filter(Boolean);
    if (editingCampaign) {
      await update(editingCampaign.id, {
        title: formData.title,
        description: formData.description,
        badge: formData.badge,
        type: formData.type,
        image: formData.image,
        routes: routesArray,
      });
    } else {
      await create({
        title: formData.title,
        description: formData.description,
        badge: formData.badge,
        type: formData.type,
        image: formData.image,
        routes: routesArray,
        is_active: true,
      });
    }
    setSaving(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    await remove(id);
    setShowDeleteConfirm(null);
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    await update(id, { is_active: !currentState });
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'Tümü' ||
                       (typeFilter === 'VIP' && c.type === 'vip') ||
                       (typeFilter === 'Normal' && c.type === 'normal');
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kampanya Yönetimi</h1>
              <p className="text-gray-600 mt-2">Tüm kampanyaları görüntüleyin ve yönetin</p>
            </div>
            <button
              onClick={handleAdd}
              className="bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg whitespace-nowrap"
            >
              <i className="ri-add-line text-xl"></i>
              Yeni Kampanya Ekle
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  placeholder="Kampanya ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {typeFilters.map(t => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      typeFilter === t
                        ? t === 'VIP' ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {t === 'VIP' && <i className="ri-vip-crown-fill mr-1"></i>}
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map(campaign => (
              <div key={campaign.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="relative h-48 w-full">
                  <img
                    src={campaign.image || '/images/campaigns/default.jpg'}
                    alt={campaign.title}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold text-white ${campaign.type === 'vip' ? 'bg-amber-500' : 'bg-red-600'}`}>
                    {campaign.badge || campaign.type?.toUpperCase()}
                  </div>
                  <div className="absolute top-4 left-4">
                    <button
                      onClick={() => toggleActive(campaign.id, campaign.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.is_active
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}
                    >
                      {campaign.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      {campaign.type === 'vip' && <i className="ri-vip-crown-fill text-amber-500"></i>}
                      {campaign.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{campaign.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {(campaign.routes || []).map((route: string, idx: number) => (
                      <span key={idx} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-lg">{route}</span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(campaign)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <i className="ri-edit-line"></i>
                      Düzenle
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(campaign.id)}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center whitespace-nowrap"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredCampaigns.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">Kampanya bulunamadı</p>
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCampaign ? 'Kampanya Düzenle' : 'Yeni Kampanya Ekle'}
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kampanya Başlığı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => { setFormData({...formData, title: e.target.value}); setFormErrors({...formErrors, title: undefined}); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${formErrors.title ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    placeholder="Örn: VIP Uçuş Deneyimi"
                  />
                  {formErrors.title && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>{formErrors.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => { setFormData({...formData, description: e.target.value}); setFormErrors({...formErrors, description: undefined}); }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm ${formErrors.description ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                    rows={3}
                    placeholder="Kampanya detaylarını yazın..."
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <i className="ri-error-warning-line"></i>{formErrors.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rozet</label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({...formData, badge: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      placeholder="Örn: VIP HİZMET"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tür</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm cursor-pointer"
                    >
                      <option value="normal">Normal</option>
                      <option value="vip">VIP</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="/images/campaigns/..."
                  />
                  {formData.image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formData.image}
                        alt="Önizleme"
                        className="h-16 w-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                      />
                      <span className="text-xs text-gray-500">Görsel önizleme</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Rotalar (virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formData.routes}
                    onChange={(e) => setFormData({...formData, routes: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    placeholder="Örn: İstanbul - Dubai, Dubai - İstanbul"
                  />
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-50"
                >
                  İptal
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {saving && <i className="ri-loader-4-line animate-spin"></i>}
                  {editingCampaign ? 'Güncelle' : 'Ekle'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Kampanyayı Sil</h3>
              <p className="text-gray-600 text-center mb-6">
                Bu kampanyayı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  İptal
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
    </AdminLayout>
  );
}
