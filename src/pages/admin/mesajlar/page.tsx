import { useState } from 'react';
import { useAdminMessages, Message } from '../../../hooks/useMessages';

export default function AdminMessagesPage() {
  const { messages, loading, updateStatus, reply, remove } = useAdminMessages();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

  const filteredMessages = messages.filter(msg => {
    const matchesSearch =
      msg.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || msg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const unreadCount = messages.filter(m => m.status === 'unread').length;

  const handleMarkAsRead = async (id: number) => {
    await updateStatus(id, 'read');
  };

  const handleMarkAsReplied = async (id: number) => {
    await reply(id, 'Yanıtlandı olarak işaretlendi');
  };

  const handleDelete = async (id: number) => {
    if (confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      await remove(id);
      setSelectedMessage(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      unread: 'bg-red-100 text-red-700',
      read: 'bg-blue-100 text-blue-700',
      replied: 'bg-green-100 text-green-700'
    };
    const labels = {
      unread: 'Okunmadı',
      read: 'Okundu',
      replied: 'Yanıtlandı'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  const getCategoryLabel = (category: string | null) => {
    if (!category) return 'Genel';
    const labels: Record<string, string> = {
      complaint: 'Şikayet',
      reservation: 'Rezervasyon',
      miles: 'Miles',
      'special-assistance': 'Özel Yardım',
      refund: 'İade',
      campaign: 'Kampanya',
      compensation: 'Tazminat',
      'group-booking': 'Grup Rezervasyonu',
      technical: 'Teknik',
      feedback: 'Geri Bildirim'
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Müşteri Mesajları</h1>
        <p className="text-gray-600">İletişim formundan gelen mesajları yönetin</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Toplam Mesaj</p>
              <p className="text-3xl font-bold text-gray-900">{messages.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Okunmadı</p>
              <p className="text-3xl font-bold text-red-600">{unreadCount}</p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-unread-line text-2xl text-red-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Okundu</p>
              <p className="text-3xl font-bold text-blue-600">
                {messages.filter(m => m.status === 'read').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-open-line text-2xl text-blue-600"></i>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Yanıtlandı</p>
              <p className="text-3xl font-bold text-green-600">
                {messages.filter(m => m.status === 'replied').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ri-mail-check-line text-2xl text-green-600"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg"></i>
              <input
                type="text"
                placeholder="Gönderen, konu veya e-posta ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                statusFilter === 'all'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                statusFilter === 'unread'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Okunmadı
            </button>
            <button
              onClick={() => setStatusFilter('read')}
              className={`px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                statusFilter === 'read'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Okundu
            </button>
            <button
              onClick={() => setStatusFilter('replied')}
              className={`px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
                statusFilter === 'replied'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Yanıtlandı
            </button>
          </div>
        </div>
      </div>

      {/* Mesaj Listesi */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Gönderen
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Konu
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredMessages.map((message) => (
                <tr
                  key={message.id}
                  className={`hover:bg-gray-50 transition-colors ${
                    message.status === 'unread' ? 'bg-red-50/30' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {message.sender_name.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-medium text-gray-900 text-sm ${
                          message.status === 'unread' ? 'font-bold' : ''
                        }`}>
                          {message.sender_name}
                        </p>
                        <p className="text-xs text-gray-500">{message.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className={`text-sm text-gray-900 ${
                      message.status === 'unread' ? 'font-bold' : ''
                    }`}>
                      {message.subject}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {getCategoryLabel(message.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">
                      {new Date(message.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(message.status)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => {
                        setSelectedMessage(message);
                        if (message.status === 'unread') {
                          handleMarkAsRead(message.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700 font-medium text-sm whitespace-nowrap"
                    >
                      Detay Gör
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-mail-line text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500 text-lg">Mesaj bulunamadı</p>
          </div>
        )}
      </div>

      {/* Mesaj Detay Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Mesaj Detayı</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Gönderen Bilgileri */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {selectedMessage.sender_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1">{selectedMessage.sender_name}</p>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <i className="ri-mail-line"></i>
                        <span>{selectedMessage.email}</span>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <i className="ri-phone-line"></i>
                          <span>{selectedMessage.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(selectedMessage.status)}
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(selectedMessage.created_at).toLocaleDateString('tr-TR', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Konu ve Kategori */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-lg font-bold text-gray-900">{selectedMessage.subject}</h4>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                    {getCategoryLabel(selectedMessage.category)}
                  </span>
                </div>
              </div>

              {/* Mesaj İçeriği */}
              <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Admin Reply */}
              {selectedMessage.admin_reply && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
                  <p className="text-sm font-semibold text-green-700 mb-2">Admin Yanıtı:</p>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedMessage.admin_reply}
                  </p>
                </div>
              )}

              {/* İşlem Butonları */}
              <div className="flex gap-3">
                {selectedMessage.status === 'unread' && (
                  <button
                    onClick={async () => {
                      await handleMarkAsRead(selectedMessage.id);
                      setSelectedMessage({ ...selectedMessage, status: 'read' });
                    }}
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-mail-open-line mr-2"></i>
                    Okundu İşaretle
                  </button>
                )}
                {selectedMessage.status !== 'replied' && (
                  <button
                    onClick={async () => {
                      await handleMarkAsReplied(selectedMessage.id);
                      setSelectedMessage({ ...selectedMessage, status: 'replied' });
                    }}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                  >
                    <i className="ri-mail-check-line mr-2"></i>
                    Yanıtlandı İşaretle
                  </button>
                )}
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  <i className="ri-delete-bin-line mr-2"></i>
                  Mesajı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}