// =============================================
// Bey Airlines — Haftalık Otomatik Uçuş Sistemi
// =============================================
// Filo: TC-BEY01/02/03 (Boeing 737-800, 180 koltuk, normal)
//       TC-BEY04 (Bombardier Global 7500, 24 koltuk, VIP)
//
// Sabit flight_code'lar — her hafta aynı (BEY101-106, BEY201-202)
// day_of_week: 1=Pazartesi, 2=Salı ... 7=Pazar (JS: 0=Pazar → 7)

// ---------- Tipler ----------

interface RouteDefinition {
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  duration: string;
}

interface ScheduleEntry {
  scheduleId: number;
  flightCode: string;       // Sabit: BEY101 ... BEY202
  dayOfWeek: number;        // 1=Pzt, 2=Sal, 3=Çar, 4=Per, 5=Cum, 7=Paz
  route: RouteDefinition;
  departureTime: string;
  arrivalTime: string;
  flightClass: 'normal' | 'vip';
  capacity: number;         // 180 (normal) | 24 (vip)
  price: number;
  baggage: boolean;
  meal: boolean;
  changeable: boolean;
}

// ---------- Rotalar ----------

const ROUTES = {
  IST_DXB: { fromCode: 'IST', fromCity: 'İstanbul', toCode: 'DXB', toCity: 'Dubai',    duration: '4s 30dk' },
  DXB_IST: { fromCode: 'DXB', fromCity: 'Dubai',    toCode: 'IST', toCity: 'İstanbul', duration: '4s 30dk' },
  ESB_DXB: { fromCode: 'ESB', fromCity: 'Ankara',   toCode: 'DXB', toCity: 'Dubai',    duration: '4s 45dk' },
  DXB_ESB: { fromCode: 'DXB', fromCity: 'Dubai',    toCode: 'ESB', toCity: 'Ankara',   duration: '4s 45dk' },
  ADB_DXB: { fromCode: 'ADB', fromCity: 'İzmir',    toCode: 'DXB', toCity: 'Dubai',    duration: '4s 40dk' },
  DXB_ADB: { fromCode: 'DXB', fromCity: 'Dubai',    toCode: 'ADB', toCity: 'İzmir',    duration: '4s 40dk' },
} as const;

// ---------- Haftalık Program (8 slot) ----------

const WEEKLY_SCHEDULE: ScheduleEntry[] = [
  // Normal — TC-BEY01 (Uçak 1)
  { scheduleId: 101, flightCode: 'BEY101', dayOfWeek: 1, route: ROUTES.IST_DXB, departureTime: '09:00', arrivalTime: '13:30', flightClass: 'normal', capacity: 180, price: 3499, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 102, flightCode: 'BEY102', dayOfWeek: 3, route: ROUTES.DXB_IST, departureTime: '09:00', arrivalTime: '13:30', flightClass: 'normal', capacity: 180, price: 3499, baggage: true,  meal: true,  changeable: true  },
  // Normal — TC-BEY02 (Uçak 2)
  { scheduleId: 103, flightCode: 'BEY103', dayOfWeek: 2, route: ROUTES.ESB_DXB, departureTime: '08:00', arrivalTime: '12:45', flightClass: 'normal', capacity: 180, price: 3699, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 104, flightCode: 'BEY104', dayOfWeek: 4, route: ROUTES.DXB_ESB, departureTime: '09:00', arrivalTime: '13:45', flightClass: 'normal', capacity: 180, price: 3699, baggage: true,  meal: true,  changeable: true  },
  // Normal — TC-BEY03 (Uçak 3)
  { scheduleId: 105, flightCode: 'BEY105', dayOfWeek: 5, route: ROUTES.ADB_DXB, departureTime: '10:00', arrivalTime: '14:40', flightClass: 'normal', capacity: 180, price: 3599, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 106, flightCode: 'BEY106', dayOfWeek: 7, route: ROUTES.DXB_ADB, departureTime: '10:00', arrivalTime: '14:40', flightClass: 'normal', capacity: 180, price: 3599, baggage: true,  meal: true,  changeable: false },
  // VIP — TC-BEY04 (Jet)
  { scheduleId: 201, flightCode: 'BEY201', dayOfWeek: 1, route: ROUTES.IST_DXB, departureTime: '14:00', arrivalTime: '18:30', flightClass: 'vip',    capacity: 24,  price: 7999, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 202, flightCode: 'BEY202', dayOfWeek: 3, route: ROUTES.DXB_IST, departureTime: '14:00', arrivalTime: '18:30', flightClass: 'vip',    capacity: 24,  price: 7999, baggage: true,  meal: true,  changeable: true  },
];

// ---------- Gate / Terminal Atamaları ----------

const GATE_MAP: Record<string, string> = {
  BEY101: 'A3', BEY102: 'A7',
  BEY103: 'B3', BEY104: 'B8',
  BEY105: 'C5', BEY106: 'C9',
  BEY201: 'D2', BEY202: 'D7',
};

const TERMINAL_MAP: Record<string, string> = {
  BEY101: '1', BEY102: '2',
  BEY103: '1', BEY104: '2',
  BEY105: '1', BEY106: '2',
  BEY201: '1', BEY202: '2',
};

// ---------- Tarih Yardımcıları ----------

function formatDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDateTR(date: Date): string {
  const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

/** JS Date.getDay() → 1=Pzt...7=Paz (DB formatı) */
function jsToScheduleDay(date: Date): number {
  const jsDay = date.getDay(); // 0=Paz, 1=Pzt...6=Cmt
  return jsDay === 0 ? 7 : jsDay;
}

// ---------- Uçuş Üretici Fonksiyonlar ----------

/** Verilen tarihte kalkması gereken uçuşları döndürür (gün bazlı filtreleme) */
export function generateFlightsForDate(dateStr: string) {
  const date = parseDate(dateStr);
  const dayOfWeek = jsToScheduleDay(date);

  return WEEKLY_SCHEDULE
    .filter((entry) => entry.dayOfWeek === dayOfWeek)
    .map((entry) => ({
      id: entry.scheduleId,                // DB'deki schedule_id ile aynı
      flightNumber: entry.flightCode,      // Sabit kod: BEY101 vb.
      flightClass: entry.flightClass,
      departure: {
        time: entry.departureTime,
        airport: entry.route.fromCode,
        city: entry.route.fromCity,
      },
      arrival: {
        time: entry.arrivalTime,
        airport: entry.route.toCode,
        city: entry.route.toCity,
      },
      duration: entry.route.duration,
      type: 'Direkt' as const,
      price: entry.price,
      baggage: entry.baggage,
      meal: entry.meal,
      changeable: entry.changeable,
      capacity: entry.capacity,
      date: dateStr,
    }));
}

/** Bugünden itibaren `days` gün içindeki tüm uçuşları döndürür */
export function generateFlightResults(dateStr?: string) {
  const date = dateStr || formatDateStr(new Date());
  return generateFlightsForDate(date);
}

/** Admin / dashboard için 21 günlük uçuş listesi */
export function generateFlights() {
  const today = new Date();
  const allFlights: {
    id: string;
    flightNumber: string;
    from: string;
    to: string;
    date: string;
    departureTime: string;
    arrivalTime: string;
    price: number;
    class: string;
    capacity: number;
  }[] = [];

  for (let i = 0; i < 21; i++) {
    const d = addDays(today, i);
    const dateStr = formatDateStr(d);
    const flights = generateFlightsForDate(dateStr);

    flights.forEach((f) => {
      allFlights.push({
        id: String(f.id),
        flightNumber: f.flightNumber,
        from: f.departure.airport,
        to: f.arrival.airport,
        date: dateStr,
        departureTime: f.departure.time,
        arrivalTime: f.arrival.time,
        price: f.price,
        class: f.flightClass === 'vip' ? 'VIP' : 'Ekonomi',
        capacity: f.capacity,
      });
    });
  }

  return allFlights;
}

// ---------- Uçuş Durumu (tüm haftalık program) ----------

export function generateFlightStatusData() {
  const today = new Date();
  const todayStr = formatDateStr(today);
  const nowTotal = today.getHours() * 60 + today.getMinutes();

  return WEEKLY_SCHEDULE.map((entry) => {
    const [depH, depM] = entry.departureTime.split(':').map(Number);
    const [arrH, arrM] = entry.arrivalTime.split(':').map(Number);
    const depTotal = depH * 60 + depM;
    const arrTotal = arrH < depH ? (arrH + 24) * 60 + arrM : arrH * 60 + arrM;

    let status: 'zamaninda' | 'gecikmeli' | 'kalkti' | 'indi' | 'iptal';
    let estimatedDeparture = entry.departureTime;
    let estimatedArrival   = entry.arrivalTime;

    // Deterministik gecikme: BEY103 ve BEY104 gecikir
    const isDelayed = entry.flightCode === 'BEY103' || entry.flightCode === 'BEY104';

    if (nowTotal < depTotal - 30) {
      if (isDelayed) {
        status = 'gecikmeli';
        const delayMin = 45;
        const newDep = depTotal + delayMin;
        const newArr = arrTotal + delayMin;
        estimatedDeparture = `${String(Math.floor(newDep / 60) % 24).padStart(2, '0')}:${String(newDep % 60).padStart(2, '0')}`;
        estimatedArrival   = `${String(Math.floor(newArr / 60) % 24).padStart(2, '0')}:${String(newArr % 60).padStart(2, '0')}`;
      } else {
        status = 'zamaninda';
      }
    } else if (nowTotal < depTotal + 30) {
      status = 'kalkti';
    } else if (nowTotal < arrTotal) {
      status = 'kalkti';
    } else {
      status = 'indi';
    }

    return {
      flightNumber: entry.flightCode,
      from: entry.route.fromCity,
      to: entry.route.toCity,
      date: todayStr,
      departureTime: entry.departureTime,
      arrivalTime: entry.arrivalTime,
      estimatedDeparture,
      estimatedArrival,
      status,
      gate: GATE_MAP[entry.flightCode] || 'A1',
      terminal: TERMINAL_MAP[entry.flightCode] || '1',
      flightType: entry.flightClass,
    };
  });
}

// ---------- Mock Rezervasyonlar (geçmiş uçuşlar) ----------

export function generateReservations() {
  const lastWeek    = addDays(new Date(), -7);
  const twoWeeksAgo = addDays(new Date(), -14);

  return [
    {
      pnr: 'BEY123',
      surname: 'YILMAZ',
      flightNumber: 'BEY201',
      from: 'İstanbul',
      to: 'Dubai',
      date: formatDateTR(lastWeek),
      time: '14:00',
      passengers: [
        { name: 'Ahmet YILMAZ', seat: '1A', type: 'Yetişkin' },
        { name: 'Ayşe YILMAZ',  seat: '1B', type: 'Yetişkin' },
      ],
      class: 'VIP',
      status: 'Onaylandı',
      baggage: '2 x 30 kg',
      totalPrice: '15.998 TL',
    },
    {
      pnr: 'BEY456',
      surname: 'KAYA',
      flightNumber: 'BEY103',
      from: 'Ankara',
      to: 'Dubai',
      date: formatDateTR(lastWeek),
      time: '08:00',
      passengers: [{ name: 'Mehmet KAYA', seat: '8C', type: 'Yetişkin' }],
      class: 'Normal',
      status: 'Onaylandı',
      baggage: '1 x 20 kg',
      totalPrice: '3.699 TL',
    },
    {
      pnr: 'BEY789',
      surname: 'DEMİR',
      flightNumber: 'BEY106',
      from: 'Dubai',
      to: 'İzmir',
      date: formatDateTR(twoWeeksAgo),
      time: '10:00',
      passengers: [
        { name: 'Zeynep DEMİR', seat: '15F', type: 'Yetişkin' },
        { name: 'Can DEMİR',    seat: '15E', type: 'Çocuk' },
      ],
      class: 'Normal',
      status: 'Tamamlandı',
      baggage: '2 x 20 kg',
      totalPrice: '7.198 TL',
    },
  ];
}

// ---------- Mock Kullanıcı Rezervasyonları ----------

export function generateUserReservations() {
  const now         = new Date();
  const lastWeek    = addDays(now, -7);
  const twoWeeksAgo = addDays(now, -14);
  const nextWeek    = addDays(now, 7);

  return [
    {
      id: 'BEY201-001',
      pnr: 'ABC123',
      route: 'İstanbul → Dubai',
      date: formatDateTR(addDays(now, 3)),
      time: '14:00',
      flightNumber: 'BEY201',
      type: 'VIP',
      status: 'Onaylandı',
      passengers: 2,
      seat: '1A, 1B',
      price: '15.998 TL',
      departure: 'IST',
      arrival: 'DXB',
      duration: '4s 30dk',
      passengerDetails: [
        { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '1A' },
        { name: 'Ayşe',  surname: 'Yılmaz', tcNo: '98765432109', birthDate: '22.08.1988', gender: 'Kadın', seat: '1B' },
      ],
      contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
      extraServices: { baggage: ['+20 kg'], meals: ['Standart Menü'], insurance: true, priorityBoarding: true },
    },
    {
      id: 'BEY103-002',
      pnr: 'DEF456',
      route: 'Ankara → Dubai',
      date: formatDateTR(nextWeek),
      time: '08:00',
      flightNumber: 'BEY103',
      type: 'Normal',
      status: 'Onaylandı',
      passengers: 1,
      seat: '12C',
      price: '3.699 TL',
      departure: 'ESB',
      arrival: 'DXB',
      duration: '4s 45dk',
      passengerDetails: [
        { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '12C' },
      ],
      contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
      extraServices: { baggage: [], meals: [], insurance: false, priorityBoarding: false },
    },
    {
      id: 'BEY106-003',
      pnr: 'GHI789',
      route: 'Dubai → İzmir',
      date: formatDateTR(lastWeek),
      time: '10:00',
      flightNumber: 'BEY106',
      type: 'Normal',
      status: 'Tamamlandı',
      passengers: 1,
      seat: '8D',
      price: '3.599 TL',
      departure: 'DXB',
      arrival: 'ADB',
      duration: '4s 40dk',
      passengerDetails: [
        { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '8D' },
      ],
      contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
      extraServices: { baggage: ['+15 kg'], meals: ['Vejetaryen Menü'], insurance: true, priorityBoarding: false },
    },
    {
      id: 'BEY202-004',
      pnr: 'JKL012',
      route: 'Dubai → İstanbul',
      date: formatDateTR(twoWeeksAgo),
      time: '14:00',
      flightNumber: 'BEY202',
      type: 'VIP',
      status: 'Tamamlandı',
      passengers: 2,
      seat: '2A, 2B',
      price: '15.998 TL',
      departure: 'DXB',
      arrival: 'IST',
      duration: '4s 30dk',
      passengerDetails: [
        { name: 'Ahmet', surname: 'Yılmaz', tcNo: '12345678901', birthDate: '15.06.1985', gender: 'Erkek', seat: '2A' },
        { name: 'Ayşe',  surname: 'Yılmaz', tcNo: '98765432109', birthDate: '22.08.1988', gender: 'Kadın', seat: '2B' },
      ],
      contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
      extraServices: { baggage: ['+30 kg'], meals: ['Standart Menü'], insurance: true, priorityBoarding: true },
    },
  ];
}
