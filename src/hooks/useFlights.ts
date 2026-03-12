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
    flightNumber: 'BEY' + f.flight_number.slice(2),
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

  useEffect(() => {
    if (!date) return;
    setLoading(true);

    let query = supabase
      .from('flights')
      .select('*')
      .eq('flight_date', date)
      .order('departure_time');

    if (from) query = query.eq('from_city', from);
    if (to) query = query.eq('to_city', to);

    query.then(({ data, error }) => {
      if (!error && data) setFlights(data as FlightResult[]);
      setLoading(false);
    });
  }, [date, from, to]);

  return { flights, loading };
}

export function useFlightStatus() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (
    searchType: 'flightNumber' | 'route',
    value: string,
    from?: string,
    to?: string
  ) => {
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];

    let query = supabase
      .from('flights')
      .select('*')
      .eq('flight_date', today);

    if (searchType === 'flightNumber') {
      // BEY prefix'i BY'ye çevir
      const flightNum = value.toUpperCase().replace('BEY', 'BY');
      query = query.ilike('flight_number', `%${flightNum}%`);
    } else if (from && to) {
      query = query.eq('from_city', from).eq('to_city', to);
    }

    const { data, error } = await query;
    if (!error && data) setFlights(data as FlightResult[]);
    setLoading(false);
  }, []);

  return { flights, loading, search };
}

export function useAllFlights() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('flights')
      .select('*')
      .gte('flight_date', new Date().toISOString().split('T')[0])
      .order('flight_date')
      .order('departure_time')
      .limit(200);
    if (data) setFlights(data as FlightResult[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { flights, loading, refresh };
}
