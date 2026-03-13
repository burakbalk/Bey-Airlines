import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface FlightResult {
  id: number;
  flight_number: string;
  flight_class: string;
  flight_date: string;
  from_code: string;
  from_city: string;
  to_code: string;
  to_city: string;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  baggage: boolean;
  meal: boolean;
  changeable: boolean;
  status: string;
  gate: string | null;
  terminal: string | null;
  estimated_departure: string | null;
  estimated_arrival: string | null;
  capacity: number;
  booked_seats: number;
}

// Uçuşları UI formatına dönüştür (FlightCard uyumu)
export function toFlightCardFormat(f: FlightResult) {
  return {
    id: f.id,
    flightNumber: f.flight_number,
    flightClass: f.flight_class,
    departure: { time: f.departure_time?.slice(0, 5), airport: f.from_code, city: f.from_city },
    arrival: { time: f.arrival_time?.slice(0, 5), airport: f.to_code, city: f.to_city },
    duration: f.duration,
    type: 'Direkt' as const,
    price: Number(f.price),
    baggage: f.baggage,
    meal: f.meal,
    changeable: f.changeable,
    date: f.flight_date,
  };
}

// Uçuş durumu UI formatına dönüştür
export function toStatusCardFormat(f: FlightResult) {
  return {
    flightNumber: f.flight_number,
    from: f.from_city,
    to: f.to_city,
    date: f.flight_date,
    departureTime: f.departure_time?.slice(0, 5),
    arrivalTime: f.arrival_time?.slice(0, 5),
    estimatedDeparture: f.estimated_departure?.slice(0, 5) || f.departure_time?.slice(0, 5),
    estimatedArrival: f.estimated_arrival?.slice(0, 5) || f.arrival_time?.slice(0, 5),
    status: f.status,
    gate: f.gate || '-',
    terminal: f.terminal || '1',
    flightType: f.flight_class,
  };
}

export function useFlightsByDate(date: string | null, from?: string, to?: string) {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError(null);

    let query = supabase
      .from('flights')
      .select('*')
      .eq('flight_date', date)
      .order('departure_time');

    if (from) query = query.eq('from_city', from);
    if (to) query = query.eq('to_city', to);

    query.then(({ data, error: fetchError }) => {
      if (fetchError) {
        console.error('[useFlightsByDate] Supabase hatası:', fetchError.message);
        setError(fetchError.message);
      }
      if (data) setFlights(data as FlightResult[]);
      setLoading(false);
    });
  }, [date, from, to]);

  return { flights, loading, error };
}

export function useFlightStatus() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (
    searchType: 'flightNumber' | 'route' | 'pnr',
    value: string,
    from?: string,
    to?: string,
    date?: string
  ) => {
    setLoading(true);
    setError(null);
    setFlights([]);

    if (searchType === 'pnr') {
      const { data, error: rpcError } = await supabase.rpc('get_reservation_by_pnr', {
        p_pnr: value.toUpperCase(),
      });

      if (rpcError || !data) {
        setError('Rezervasyon bulunamadı.');
        setLoading(false);
        return;
      }

      // Fetch the actual flight record to get full details
      if (data.flight_id) {
        const { data: flightData } = await supabase
          .from('flights')
          .select('*')
          .eq('id', data.flight_id)
          .single();

        if (flightData) setFlights([flightData as FlightResult]);
      }
      setLoading(false);
      return;
    }

    const searchDate = date || new Date().toISOString().split('T')[0];

    let query = supabase
      .from('flights')
      .select('*')
      .eq('flight_date', searchDate);

    if (searchType === 'flightNumber') {
      const flightNum = value.toUpperCase();
      query = query.ilike('flight_number', `%${flightNum}%`);
    } else if (from && to) {
      query = query.eq('from_city', from).eq('to_city', to);
    }

    const { data, error: fetchError } = await query;
    if (fetchError) {
      setError(fetchError.message);
    }
    if (data) setFlights(data as FlightResult[]);
    setLoading(false);
  }, []);

  return { flights, loading, error, search };
}

const ALL_FLIGHTS_FIELDS = 'id, flight_number, flight_class, flight_date, from_code, from_city, to_code, to_city, departure_time, arrival_time, duration, price, status, gate, terminal, estimated_departure, estimated_arrival, capacity, booked_seats, baggage, meal, changeable, aircraft_id';
const PAGE_SIZE = 50;

export function useAllFlights() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const refresh = useCallback(async (p?: number) => {
    const currentPage = p ?? page;
    setLoading(true);
    setError(null);
    const today = new Date().toISOString().split('T')[0];

    // Get total count
    const { count } = await supabase
      .from('flights')
      .select('id', { count: 'exact', head: true })
      .gte('flight_date', today);
    setTotalCount(count ?? 0);

    const from = currentPage * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error: fetchError } = await supabase
      .from('flights')
      .select(ALL_FLIGHTS_FIELDS)
      .gte('flight_date', today)
      .order('flight_date')
      .order('departure_time')
      .range(from, to);
    if (fetchError) {
      setError(fetchError.message);
    }
    if (data) setFlights(data as FlightResult[]);
    setLoading(false);
  }, [page]);

  useEffect(() => { refresh(); }, [refresh]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
  }, []);

  return { flights, loading, error, refresh, page, setPage: goToPage, totalCount, pageSize: PAGE_SIZE };
}

// ---------- aircraft tablosu ----------

export interface Aircraft {
  id: number;
  registration: string;
  model: string;
  capacity: number;
  aircraft_type: 'normal' | 'vip';
  is_active: boolean;
}

export function useAircraft() {
  const [aircraft, setAircraft] = useState<Aircraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('aircraft')
      .select('*')
      .order('id');
    if (fetchError) {
      console.error('[useAircraft] Supabase hatası:', fetchError.message);
      setError(fetchError.message);
    }
    if (data) setAircraft(data as Aircraft[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (entry: { registration: string; model: string; capacity: number; aircraft_type: string }) => {
    const { error } = await supabase.from('aircraft').insert(entry);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [refresh]);

  const updateStatus = useCallback(async (id: number, is_active: boolean) => {
    const { error } = await supabase.from('aircraft').update({ is_active }).eq('id', id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [refresh]);

  return { aircraft, loading, error, refresh, add, updateStatus };
}

// ---------- flight_schedule tablosu ----------

export interface ScheduleEntry {
  id: number;
  flight_code: string;
  flight_number: string; // alias for flight_code (UI uyumu)
  aircraft_id: number;
  from_city: string;
  to_city: string;
  from_code: string;
  to_code: string;
  day_of_week: number;
  departure_time: string;
  arrival_time: string;
  duration: string;
  price: number;
  flight_class: string;
  baggage: boolean;
  meal: boolean;
  changeable: boolean;
  is_active: boolean;
  aircraft_registration: string | null;
  capacity: number;
}

export function useFlightSchedule() {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await supabase
      .from('flight_schedule')
      .select('*, aircraft:aircraft_id(capacity, aircraft_type, registration)')
      .order('flight_code');
    if (fetchError) {
      console.error('[useFlightSchedule] Supabase hatası:', fetchError.message);
      setError(fetchError.message);
    }
    if (data) {
      setSchedule(data.map((s: Record<string, unknown>) => {
        const aircraft = s.aircraft as { capacity?: number; aircraft_type?: string; registration?: string } | null;
        return {
          ...s,
          flight_number: s.flight_code,
          aircraft_registration: aircraft?.registration || null,
          capacity: aircraft?.capacity || 180,
        };
      }) as ScheduleEntry[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  /** Fiyatı hem flight_schedule'da hem gelecekteki flights'ta günceller */
  const updatePrice = useCallback(async (scheduleId: number, flightCode: string, newPrice: number) => {
    const today = new Date().toISOString().split('T')[0];
    const [schedResult, flightsResult] = await Promise.all([
      supabase.from('flight_schedule').update({ price: newPrice }).eq('id', scheduleId),
      supabase.from('flights').update({ price: newPrice })
        .eq('flight_number', flightCode)
        .gte('flight_date', today),
    ]);
    const error = schedResult.error?.message || flightsResult.error?.message || null;
    await refresh();
    return { error };
  }, [refresh]);

  /** Yeni tarife slotu ekle */
  const addSchedule = useCallback(async (entry: {
    flight_code: string; aircraft_id: number;
    from_code: string; from_city: string; to_code: string; to_city: string;
    day_of_week: number; departure_time: string; arrival_time: string; duration: string;
    flight_class: string; price: number; baggage: boolean; meal: boolean; changeable: boolean;
  }) => {
    const { error } = await supabase.from('flight_schedule').insert(entry);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [refresh]);

  /** Tarife slotunu güncelle */
  const updateSchedule = useCallback(async (id: number, entry: Partial<{
    flight_code: string; aircraft_id: number;
    from_code: string; from_city: string; to_code: string; to_city: string;
    day_of_week: number; departure_time: string; arrival_time: string; duration: string;
    flight_class: string; price: number; baggage: boolean; meal: boolean; changeable: boolean; is_active: boolean;
  }>) => {
    const { error } = await supabase.from('flight_schedule').update(entry).eq('id', id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [refresh]);

  /** Tarife slotunu sil */
  const deleteSchedule = useCallback(async (id: number) => {
    const { error } = await supabase.from('flight_schedule').delete().eq('id', id);
    if (!error) await refresh();
    return { error: error?.message ?? null };
  }, [refresh]);

  /** Manuel uçuş üretimi */
  const generateFlights = useCallback(async (startDate: string, numWeeks: number) => {
    const { error } = await supabase.rpc('generate_weekly_flights', {
      start_date: startDate,
      num_weeks: numWeeks,
    });
    return { error: error?.message ?? null };
  }, []);

  /** Gelecekte en son üretilmiş uçuş tarihini döner */
  const getMaxFlightDate = useCallback(async () => {
    const { data } = await supabase
      .from('flights')
      .select('flight_date')
      .order('flight_date', { ascending: false })
      .limit(1)
      .single();
    return data?.flight_date ?? null;
  }, []);

  return { schedule, loading, error, refresh, updatePrice, addSchedule, updateSchedule, deleteSchedule, generateFlights, getMaxFlightDate };
}
