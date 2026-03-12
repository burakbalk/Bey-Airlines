export const messages = [
  {
    id: 1,
    sender: 'Ahmet Yılmaz',
    email: 'ahmet.yilmaz@email.com',
    phone: '+90 532 123 4567',
    subject: 'Bagaj Kaybı Şikayeti',
    message: 'Merhaba, 15 Ocak tarihli İstanbul-Antalya uçuşumda bagajım kayboldu. PNR kodum: BEY123456. Acil yardım bekliyorum.',
    date: '2024-01-16T10:30:00',
    status: 'unread' as const,
    category: 'complaint'
  },
  {
    id: 2,
    sender: 'Zeynep Kaya',
    email: 'zeynep.kaya@email.com',
    phone: '+90 533 234 5678',
    subject: 'Rezervasyon Değişikliği Talebi',
    message: 'Merhaba, 20 Ocak tarihli uçuşumu 25 Ocak\'a almak istiyorum. PNR: BEY234567. Ücret farkı var mı?',
    date: '2024-01-15T14:20:00',
    status: 'read' as const,
    category: 'reservation'
  },
  {
    id: 3,
    sender: 'Mehmet Demir',
    email: 'mehmet.demir@email.com',
    phone: '+90 534 345 6789',
    subject: 'Bagaj Sorunu',
    message: 'Son uçuşumda bagajım hasar görmüştür. Uçuş tarihi: 10 Ocak 2024, PNR: BEY345678',
    date: '2024-01-14T09:15:00',
    status: 'replied' as const,
    category: 'bagaj'
  },
  {
    id: 4,
    sender: 'Ayşe Şahin',
    email: 'ayse.sahin@email.com',
    phone: '+90 535 456 7890',
    subject: 'Özel Yardım Talebi',
    message: 'Tekerlekli sandalye kullanıyorum. 22 Ocak tarihli İzmir-İstanbul uçuşum için özel yardım talep ediyorum. PNR: BEY456789',
    date: '2024-01-13T16:45:00',
    status: 'replied' as const,
    category: 'special-assistance'
  },
  {
    id: 5,
    sender: 'Can Özkan',
    email: 'can.ozkan@email.com',
    phone: '+90 536 567 8901',
    subject: 'İade Talebi',
    message: 'Sağlık sorunları nedeniyle 18 Ocak tarihli uçuşumu iptal etmek istiyorum. İade süreci nasıl işliyor? PNR: BEY567890',
    date: '2024-01-12T11:30:00',
    status: 'unread' as const,
    category: 'refund'
  },
  {
    id: 6,
    sender: 'Elif Yıldız',
    email: 'elif.yildiz@email.com',
    phone: '+90 537 678 9012',
    subject: 'Kampanya Kodu Sorunu',
    message: 'WINTER2024 kampanya kodunu kullanmaya çalışıyorum ama sistem kabul etmiyor. Yardımcı olabilir misiniz?',
    date: '2024-01-11T13:20:00',
    status: 'read' as const,
    category: 'campaign'
  },
  {
    id: 7,
    sender: 'Burak Arslan',
    email: 'burak.arslan@email.com',
    phone: '+90 538 789 0123',
    subject: 'Uçuş Gecikmesi Tazminat',
    message: '8 Ocak tarihli uçuşum 4 saat gecikti. Tazminat hakkım var mı? Uçuş no: BEY101, PNR: BEY678901',
    date: '2024-01-10T08:50:00',
    status: 'replied' as const,
    category: 'compensation'
  },
  {
    id: 8,
    sender: 'Selin Aydın',
    email: 'selin.aydin@email.com',
    phone: '+90 539 890 1234',
    subject: 'Grup Rezervasyonu',
    message: '15 kişilik grup için 25 Şubat tarihinde İstanbul-Bodrum uçuşu rezervasyonu yapmak istiyorum. Grup indirimi var mı?',
    date: '2024-01-09T15:10:00',
    status: 'unread' as const,
    category: 'group-booking'
  },
  {
    id: 9,
    sender: 'Emre Çelik',
    email: 'emre.celik@email.com',
    phone: '+90 530 901 2345',
    subject: 'Online Check-in Sorunu',
    message: 'Yarınki uçuşum için online check-in yapmaya çalışıyorum ama sistem hata veriyor. PNR: BEY789012',
    date: '2024-01-08T19:30:00',
    status: 'read' as const,
    category: 'technical'
  },
  {
    id: 10,
    sender: 'Deniz Koç',
    email: 'deniz.koc@email.com',
    phone: '+90 531 012 3456',
    subject: 'Teşekkür Mesajı',
    message: 'Geçen hafta yaşadığım bagaj sorununun çözümü için ekibinize çok teşekkür ederim. Harika bir hizmet aldım.',
    date: '2024-01-07T12:00:00',
    status: 'replied' as const,
    category: 'feedback'
  }
];