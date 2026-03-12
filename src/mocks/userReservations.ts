export const userReservations = [
  {
    id: 'BEY2024001',
    pnr: 'ABC123',
    route: 'İstanbul → Dubai',
    date: '15 Mayıs 2024',
    time: '14:30',
    flightNumber: 'BEY 101',
    type: 'VIP',
    status: 'Onaylandı',
    passengers: 2,
    seat: '1A, 1B',
    price: '12.500 TL',
    departure: 'IST',
    arrival: 'DXB',
    duration: '4s 30dk',
    passengerDetails: [
      { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '1A' },
      { name: 'Ayşe', surname: 'Yılmaz', tcNo: '98765432109', birthDate: '22.08.1988', gender: 'Kadın', seat: '1B' }
    ],
    contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
    extraServices: {
      baggage: ['+20 kg'],
      meals: ['Standart Menü'],
      insurance: true,
      priorityBoarding: true
    }
  },
  {
    id: 'BEY2024002',
    pnr: 'DEF456',
    route: 'Ankara → İzmir',
    date: '22 Mayıs 2024',
    time: '09:15',
    flightNumber: 'BEY 205',
    type: 'Normal',
    status: 'Onaylandı',
    passengers: 1,
    seat: '12C',
    price: '1.850 TL',
    departure: 'ANK',
    arrival: 'IZM',
    duration: '1s 15dk',
    passengerDetails: [
      { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '12C' }
    ],
    contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
    extraServices: {
      baggage: [],
      meals: [],
      insurance: false,
      priorityBoarding: false
    }
  },
  {
    id: 'BEY2024003',
    pnr: 'GHI789',
    route: 'İzmir → İstanbul',
    date: '10 Nisan 2024',
    time: '18:45',
    flightNumber: 'BEY 312',
    type: 'Normal',
    status: 'Tamamlandı',
    passengers: 1,
    seat: '8D',
    price: '1.650 TL',
    departure: 'IZM',
    arrival: 'IST',
    duration: '1s 10dk',
    passengerDetails: [
      { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '8D' }
    ],
    contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
    extraServices: {
      baggage: ['+15 kg'],
      meals: ['Vejetaryen Menü'],
      insurance: true,
      priorityBoarding: false
    }
  },
  {
    id: 'BEY2024004',
    pnr: 'JKL012',
    route: 'Dubai → İstanbul',
    date: '5 Mart 2024',
    time: '22:00',
    flightNumber: 'BEY 102',
    type: 'VIP',
    status: 'Tamamlandı',
    passengers: 2,
    seat: '2A, 2B',
    price: '13.200 TL',
    departure: 'DXB',
    arrival: 'IST',
    duration: '4s 15dk',
    passengerDetails: [
      { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '2A' },
      { name: 'Ayşe', surname: 'Yılmaz', tcNo: '98765432109', birthDate: '22.08.1988', gender: 'Kadın', seat: '2B' }
    ],
    contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
    extraServices: {
      baggage: ['+30 kg'],
      meals: ['Standart Menü'],
      insurance: true,
      priorityBoarding: true
    }
  }
];

export const savedPassengers = [
  {
    id: '1',
    name: 'Ahmet',
    surname: 'Yılmaz',
    tcNo: '12345678901',
    birthDate: '15.06.1985',
    phone: '+90 532 123 4567',
    email: 'ahmet.yilmaz@email.com'
  },
  {
    id: '2',
    name: 'Ayşe',
    surname: 'Yılmaz',
    birthDate: '22.08.1988',
    tcNo: '98765432109',
    phone: '+90 532 765 4321',
    email: 'ayse.yilmaz@email.com'
  }
];
