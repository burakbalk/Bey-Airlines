import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

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
  extra_services: any;
  payment_method: string | null;
  payment_card_last4: string | null;
  created_at: string;
  passengers?: Passenger[];
}

function generatePNR(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pnr = 'BEY';
  for (let i = 0; i < 6; i++) {
    pnr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pnr;
}

export function useUserReservations() {
  const { user } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) { setReservations([]); setLoading(false); return; }
    setLoading(true);

    const { data } = await supabase
      .from('reservations')
      .select('*, passengers(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { reservations, loading, refresh };
}

export function useAdminReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reservations')
      .select('*, passengers(*)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (data) setReservations(data as Reservation[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('reservations')
      .update({ status })
      .eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  return { reservations, loading, refresh, updateStatus };
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
    extraServices: any;
    paymentMethod: string;
    paymentCardLast4: string;
    passengers: Passenger[];
  }) => {
    const pnr = generatePNR();

    // Rezervasyon oluştur
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

    // Yolcuları ekle
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

    // Kayıtlı yolcuları güncelle
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

    // Uçuş koltuk sayısını güncelle
    await supabase.rpc('increment_booked_seats', {
      p_flight_id: data.flightId,
      p_count: data.passengers.length,
    }).then(() => {});

    return { pnr, error: null };
  };

  return { create };
}

export function useSavedPassengers() {
  const { user } = useAuth();
  const [passengers, setPassengers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('saved_passengers')
      .select('*')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setPassengers(data);
      });
  }, [user]);

  return passengers;
}
