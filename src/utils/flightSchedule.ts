// =============================================
// Bey Airlines — Haftalık Otomatik Uçuş Sistemi
// =============================================
// Tek seferlik tanım, her hafta otomatik tekrar.
// Aynı güzergah, aynı saat, aynı gün — sadece uçuş numaraları değişir.

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
  route: RouteDefinition;
  departureTime: string;
  arrivalTime: string;
  flightClass: 'normal' | 'vip';
  price: number;
  baggage: boolean;
  meal: boolean;
  changeable: boolean;
}

// ---------- Haftalık Program (12 slot) ----------

const ROUTES = {
  IST_DXB: { fromCode: 'IST', fromCity: 'İstanbul', toCode: 'DXB', toCity: 'Dubai', duration: '4s 30dk' },
  DXB_IST: { fromCode: 'DXB', fromCity: 'Dubai', toCode: 'IST', toCity: 'İstanbul', duration: '4s 30dk' },
  ESB_DXB: { fromCode: 'ESB', fromCity: 'Ankara', toCode: 'DXB', toCity: 'Dubai', duration: '4s 45dk' },
  DXB_ESB: { fromCode: 'DXB', fromCity: 'Dubai', toCode: 'ESB', toCity: 'Ankara', duration: '4s 45dk' },
  ADB_DXB: { fromCode: 'ADB', fromCity: 'İzmir', toCode: 'DXB', toCity: 'Dubai', duration: '4s 40dk' },
  DXB_ADB: { fromCode: 'DXB', fromCity: 'Dubai', toCode: 'ADB', toCity: 'İzmir', duration: '4s 40dk' },
} as const;

const WEEKLY_SCHEDULE: ScheduleEntry[] = [
  { scheduleId: 1,  route: ROUTES.IST_DXB, departureTime: '06:30', arrivalTime: '11:00', flightClass: 'normal', price: 3499, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 2,  route: ROUTES.IST_DXB, departureTime: '09:00', arrivalTime: '13:30', flightClass: 'vip',    price: 7999, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 3,  route: ROUTES.IST_DXB, departureTime: '15:00', arrivalTime: '19:30', flightClass: 'normal', price: 3299, baggage: true,  meal: true,  changeable: false },
  { scheduleId: 4,  route: ROUTES.DXB_IST, departureTime: '08:00', arrivalTime: '12:30', flightClass: 'normal', price: 3499, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 5,  route: ROUTES.DXB_IST, departureTime: '22:00', arrivalTime: '02:30', flightClass: 'vip',    price: 7999, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 6,  route: ROUTES.ESB_DXB, departureTime: '07:00', arrivalTime: '11:45', flightClass: 'normal', price: 3699, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 7,  route: ROUTES.ESB_DXB, departureTime: '13:00', arrivalTime: '17:45', flightClass: 'vip',    price: 8499, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 8,  route: ROUTES.DXB_ESB, departureTime: '10:00', arrivalTime: '14:45', flightClass: 'normal', price: 3699, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 9,  route: ROUTES.ADB_DXB, departureTime: '10:00', arrivalTime: '14:40', flightClass: 'normal', price: 3599, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 10, route: ROUTES.ADB_DXB, departureTime: '16:00', arrivalTime: '20:40', flightClass: 'vip',    price: 8299, baggage: true,  meal: true,  changeable: true  },
  { scheduleId: 11, route: ROUTES.DXB_ADB, departureTime: '12:00', arrivalTime: '16:40', flightClass: 'normal', price: 3599, baggage: true,  meal: true,  changeable: false },
  { scheduleId: 12, route: ROUTES.DXB_ADB, departureTime: '20:00', arrivalTime: '00:40', flightClass: 'vip',    price: 8299, baggage: true,  meal: true,  changeable: true  },
];

// ---------- Tarih Yardımcıları ----------

function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

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

function makeFlightNumber(weekNum: number, scheduleId: number): string {
  return `BY${weekNum}${String(scheduleId).padStart(2, '0')}`;
}

function makeFlightId(weekNum: number, scheduleId: number): number {
  return weekNum * 100 + scheduleId;
}

// ---------- Uçuş Üretici Fonksiyonlar ----------

export function generateFlightsForDate(dateStr: string) {
  const date = parseDate(dateStr);
  const weekNum = getISOWeekNumber(date);

  return WEEKLY_SCHEDULE.map((entry) => ({
    id: makeFlightId(weekNum, entry.scheduleId),
    flightNumber: makeFlightNumber(weekNum, entry.scheduleId),
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
    date: dateStr,
  }));
}

export function generateFlightResults(dateStr?: string) {
  const date = dateStr || formatDateStr(new Date());
  return generateFlightsForDate(date);
}

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
  }[] = [];

  // Bugün + 21 gün (3 hafta)
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
      });
    });
  }

  return allFlights;
}

// ---------- Uçuş Durumu Üretici ----------

const GATES = ['A3', 'A7', 'A12', 'B3', 'B8', 'C5', 'C9', 'D2', 'D7', 'D14', 'E1', 'E5'];
const TERMINALS = ['1', '2', '1', '2', '1', '2', '1', '2', '1', '2', '1', '2'];

export function generateFlightStatusData() {
  const today = new Date();
  const todayStr = formatDateStr(today);
  const weekNum = getISOWeekNumber(today);
  const nowHours = today.getHours();
  const nowMinutes = today.getMinutes();
  const nowTotal = nowHours * 60 + nowMinutes;

  return WEEKLY_SCHEDULE.map((entry) => {
    const flightNumber = `BEY${weekNum}${String(entry.scheduleId).padStart(2, '0')}`;
    const [depH, depM] = entry.departureTime.split(':').map(Number);
    const [arrH, arrM] = entry.arrivalTime.split(':').map(Number);
    const depTotal = depH * 60 + depM;
    const arrTotal = arrH < depH ? (arrH + 24) * 60 + arrM : arrH * 60 + arrM;

    let status: 'zamaninda' | 'gecikmeli' | 'kalkti' | 'indi' | 'iptal';
    let estimatedDeparture = entry.departureTime;
    let estimatedArrival = entry.arrivalTime;

    // Deterministik gecikme: scheduleId 3 ve 8 gecikir
    const isDelayed = entry.scheduleId === 3 || entry.scheduleId === 8;

    if (nowTotal < depTotal - 30) {
      // Kalkışa 30+ dk var
      if (isDelayed) {
        status = 'gecikmeli';
        const delayMin = 45;
        const newDep = depTotal + delayMin;
        const newArr = arrTotal + delayMin;
        estimatedDeparture = `${String(Math.floor(newDep / 60) % 24).padStart(2, '0')}:${String(newDep % 60).padStart(2, '0')}`;
        estimatedArrival = `${String(Math.floor(newArr / 60) % 24).padStart(2, '0')}:${String(newArr % 60).padStart(2, '0')}`;
      } else {
        status = 'zamaninda';
      }
    } else if (nowTotal >= depTotal - 30 && nowTotal < depTotal + 30) {
      // Kalkış civarı
      status = 'kalkti';
    } else if (nowTotal >= depTotal + 30 && nowTotal < arrTotal) {
      // Havada
      status = 'kalkti';
    } else {
      // Varış saati geçti
      status = 'indi';
    }

    return {
      flightNumber,
      from: entry.route.fromCity,
      to: entry.route.toCity,
      date: todayStr,
      departureTime: entry.departureTime,
      arrivalTime: entry.arrivalTime,
      estimatedDeparture,
      estimatedArrival,
      status,
      gate: GATES[entry.scheduleId - 1],
      terminal: TERMINALS[entry.scheduleId - 1],
      flightType: entry.flightClass,
    };
  });
}

// ---------- Rezervasyon Üretici ----------

export function generateReservations() {
  // Geçmiş haftadan uçuş numaraları
  const lastWeek = addDays(new Date(), -7);
  const lastWeekNum = getISOWeekNumber(lastWeek);
  const twoWeeksAgo = addDays(new Date(), -14);
  const twoWeeksAgoNum = getISOWeekNumber(twoWeeksAgo);

  const lastWeekDate = formatDateTR(lastWeek);
  const twoWeeksAgoDate = formatDateTR(twoWeeksAgo);
  const lastWeekDateIso = formatDateStr(lastWeek);

  return [
    {
      pnr: 'BEY123',
      surname: 'YILMAZ',
      flightNumber: makeFlightNumber(lastWeekNum, 2),
      from: 'İstanbul',
      to: 'Dubai',
      date: lastWeekDate,
      time: '09:00',
      passengers: [
        { name: 'Ahmet YILMAZ', seat: '1A', type: 'Yetişkin' },
        { name: 'Ayşe YILMAZ', seat: '1B', type: 'Yetişkin' },
      ],
      class: 'VIP',
      status: 'Onaylandı',
      baggage: '2 x 30 kg',
      totalPrice: '15.998 TL',
    },
    {
      pnr: 'BEY456',
      surname: 'KAYA',
      flightNumber: makeFlightNumber(lastWeekNum, 6),
      from: 'Ankara',
      to: 'Dubai',
      date: lastWeekDate,
      time: '07:00',
      passengers: [
        { name: 'Mehmet KAYA', seat: '8C', type: 'Yetişkin' },
      ],
      class: 'Normal',
      status: 'Onaylandı',
      baggage: '1 x 20 kg',
      totalPrice: '3.699 TL',
    },
    {
      pnr: 'BEY789',
      surname: 'DEMİR',
      flightNumber: makeFlightNumber(twoWeeksAgoNum, 11),
      from: 'Dubai',
      to: 'İzmir',
      date: twoWeeksAgoDate,
      time: '12:00',
      passengers: [
        { name: 'Zeynep DEMİR', seat: '15F', type: 'Yetişkin' },
        { name: 'Can DEMİR', seat: '15E', type: 'Çocuk' },
      ],
      class: 'Normal',
      status: 'Tamamlandı',
      baggage: '2 x 20 kg',
      totalPrice: '7.198 TL',
    },
  ];
}

// ---------- Kullanıcı Rezervasyonları Üretici ----------

export function generateUserReservations() {
  const now = new Date();
  const lastWeek = addDays(now, -7);
  const twoWeeksAgo = addDays(now, -14);
  const nextWeek = addDays(now, 7);

  const lastWeekNum = getISOWeekNumber(lastWeek);
  const twoWeeksAgoNum = getISOWeekNumber(twoWeeksAgo);
  const thisWeekNum = getISOWeekNumber(now);
  const nextWeekNum = getISOWeekNumber(nextWeek);

  return [
    {
      id: `BEY${thisWeekNum}001`,
      pnr: 'ABC123',
      route: 'İstanbul → Dubai',
      date: formatDateTR(addDays(now, 3)),
      time: '09:00',
      flightNumber: `BEY ${thisWeekNum}${String(2).padStart(2, '0')}`,
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
        { name: 'Ayşe', surname: 'Yılmaz', tcNo: '98765432109', birthDate: '22.08.1988', gender: 'Kadın', seat: '1B' },
      ],
      contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
      extraServices: { baggage: ['+20 kg'], meals: ['Standart Menü'], insurance: true, priorityBoarding: true },
    },
    {
      id: `BEY${nextWeekNum}002`,
      pnr: 'DEF456',
      route: 'Ankara → Dubai',
      date: formatDateTR(addDays(now, 10)),
      time: '07:00',
      flightNumber: `BEY ${nextWeekNum}${String(6).padStart(2, '0')}`,
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
      id: `BEY${lastWeekNum}003`,
      pnr: 'GHI789',
      route: 'Dubai → İzmir',
      date: formatDateTR(lastWeek),
      time: '12:00',
      flightNumber: `BEY ${lastWeekNum}${String(11).padStart(2, '0')}`,
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
      id: `BEY${twoWeeksAgoNum}004`,
      pnr: 'JKL012',
      route: 'Dubai → İstanbul',
      date: formatDateTR(twoWeeksAgo),
      time: '22:00',
      flightNumber: `BEY ${twoWeeksAgoNum}${String(5).padStart(2, '0')}`,
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
        { name: 'Ayşe', surname: 'Yılmaz', tcNo: '98765432109', birthDate: '22.08.1988', gender: 'Kadın', seat: '2B' },
      ],
      contact: { email: 'ahmet.yilmaz@email.com', phone: '+90 532 123 4567' },
      extraServices: { baggage: ['+30 kg'], meals: ['Standart Menü'], insurance: true, priorityBoarding: true },
    },
  ];
}
