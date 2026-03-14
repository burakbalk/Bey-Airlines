import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { useAuth } from '../contexts/AuthContext';

export interface ExtraServicesData {
  baggage?: number | string[];
  meal?: string;
  insurance?: boolean;
  priorityBoarding?: boolean;
}

export interface SavedPassenger {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  tc_no: string;
  birth_date: string;
  phone: string | null;
  email: string | null;
  firstName?: string;
  lastName?: string;
  tcNo?: string;
  birthDate?: string;
}

interface Passenger {
  first_name: string;
  last_name: string;
  tc_no: string;
  birth_date: string;
  gender: string;
  seat_number: string;
  passenger_type?: string;
}

export interface Reservation {
  id: string;
  pnr: string;
  user_id: string | null;
  flight_id: number | null;
  flight_number: string;
  route: string;
  flight_date: string;
  flight_time: string;
  status: string;
  total_price: number;
  flight_class: string;
  contact_email: string;
  contact_phone: string;
  extra_services: ExtraServicesData | null;
  payment_method: string | null;
  payment_card_last4: string | null;
  created_at: string;
  passengers?: Passenger[];
}

function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomValues = crypto.getRandomValues(new Uint32Array(6));
  let pnr = 'BEY';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(randomValues[i] % chars.length);
  }
  return pnr;
}

export function useUserReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!user) { setReservations([]); setLoading(false); return; }
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from('reservations')
      .select('id, pnr, user_id, flight_id, flight_number, route, flight_date, flight_time, status, total_price, flight_class, contact_email, contact_phone, extra_services, payment_method, payment_card_last4, created_at, passengers(first_name, last_name, tc_no, birth_date, gender, seat_number, passenger_type)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!mountedRef.current) return;
    if (queryError) {
      logger.error('[useUserReservations] Supabase hatası:', queryError.message);
      setError(queryError.message);
    }
    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => { mountedRef.current = false; };
  }, [refresh]);

  return { reservations, loading, error, refresh };
}

export function useAdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('reservations')
      .select('id, pnr, user_id, flight_id, flight_number, route, flight_date, flight_time, status, total_price, flight_class, contact_email, contact_phone, extra_services, payment_method, payment_card_last4, created_at, passengers(first_name, last_name, tc_no, birth_date, gender, seat_number, passenger_type)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!mountedRef.current) return;
    if (queryError) {
      logger.error('[useAdminReservations] Supabase hatası:', queryError.message);
      setError(queryError.message);
    }
    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => { mountedRef.current = false; };
  }, [refresh]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  return { reservations, loading, error, refresh, updateStatus };
}

export function useCreateReservation() {
  const { user } = useAuth();

  const create = async (data: {
    flightId: number;
    flightNumber: string;
    route: string;
    flightDate: string;
    flightTime: string;
    flightClass: string;
    totalPrice: number;
    contactEmail: string;
    contactPhone: string;
    extraServices: ExtraServicesData;
    paymentMethod: string;
    paymentCardLast4: string;
    passengers: Passenger[];
  }) => {
    const pnr = generatePNR();

    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert({
        pnr,
        user_id: user?.id || null,
        flight_id: data.flightId,
        flight_number: data.flightNumber,
        route: data.route,
        flight_date: data.flightDate,
        flight_time: data.flightTime,
        status: 'Onaylandı',
        total_price: data.totalPrice,
        flight_class: data.flightClass,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        extra_services: data.extraServices,
        payment_method: data.paymentMethod,
        payment_card_last4: data.paymentCardLast4,
      })
      .select()
      .single();

    if (resError || !reservation) {
      return { pnr: null, error: resError?.message ?? 'Rezervasyon oluşturulamadı' };
    }

    if (data.passengers.length > 0) {
      const { error: passError } = await supabase
        .from('passengers')
        .insert(
          data.passengers.map((p) => ({
            reservation_id: reservation.id,
            first_name: p.first_name,
            last_name: p.last_name,
            tc_no: p.tc_no,
            birth_date: p.birth_date,
            gender: p.gender,
            seat_number: p.seat_number,
            passenger_type: p.passenger_type || 'Yetişkin',
          }))
        );

      if (passError) {
        return { pnr, error: 'Yolcular kaydedilirken hata: ' + passError.message };
      }
    }

    if (user) {
      for (const p of data.passengers) {
        await supabase
          .from('saved_passengers')
          .upsert({
            user_id: user.id,
            first_name: p.first_name,
            last_name: p.last_name,
            tc_no: p.tc_no,
            birth_date: p.birth_date,
            phone: data.contactPhone,
            email: data.contactEmail,
          }, { onConflict: 'user_id,tc_no' });
      }
    }

    const { data: seatResult, error: rpcError } = await supabase.rpc('increment_booked_seats', {
      p_flight_id: data.flightId,
      p_count: data.passengers.length,
    });
    if (rpcError) {
      logger.error('increment_booked_seats hatası:', rpcError.message);
    } else if (seatResult === false) {
      await supabase.from('passengers').delete().eq('reservation_id', reservation.id);
      await supabase.from('reservations').delete().eq('id', reservation.id);
      return { pnr: null, error: 'Bu uçuşta yeterli koltuk kalmadı. Lütfen başka bir uçuş seçin.' };
    }

    return { pnr, error: null };
  };

  return { create };
}

export function useSavedPassengers() {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState<SavedPassenger[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('saved_passengers')
          .select('*')
          .eq('user_id', user.id);
        if (cancelled) return;
        if (fetchError) {
          logger.error('[useSavedPassengers] Supabase hatası:', fetchError.message);
          setError(fetchError.message);
        }
        if (data) setPassengers(data.map(p => ({
          ...p,
          firstName: p.first_name,
          lastName: p.last_name,
          tcNo: p.tc_no,
          birthDate: p.birth_date,
        })));
      } catch (err) {
        if (cancelled) return;
        logger.error('[useSavedPassengers] Beklenmeyen hata:', err);
        setError('Kayıtlı yolcular yüklenirken hata oluştu');
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [user]);

  return { savedPassengers: passengers, loading, error };
}
