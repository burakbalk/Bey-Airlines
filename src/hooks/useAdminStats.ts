import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

interface DashboardStats {
  totalFlights: number;
  totalReservations: number;
  totalRevenue: number;
  totalPassengers: number;
  todayFlights: number;
  activeCampaigns: number;
  cancelledReservations: number;
}

interface RecentReservation {
  id: string;
  pnr: string;
  route: string;
  flight_date: string;
  status: string;
  total_price: number;
  flight_class: string;
  created_at: string;
  contact_email: string;
}

export function useAdminStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFlights: 0,
    totalReservations: 0,
    totalRevenue: 0,
    totalPassengers: 0,
    todayFlights: 0,
    activeCampaigns: 0,
    cancelledReservations: 0,
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    const fetchStats = async () => {
      setError(null);
      try {
        const today = new Date().toISOString().split('T')[0];

        const results = await Promise.all([
          supabase.from('flights').select('*', { count: 'exact', head: true }).gte('flight_date', today),
          supabase.from('reservations').select('*', { count: 'exact', head: true }),
          supabase.rpc('get_total_revenue'),
          supabase.from('passengers').select('*', { count: 'exact', head: true }),
          supabase.from('flights').select('*', { count: 'exact', head: true }).eq('flight_date', today),
          supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('reservations').select('id, pnr, route, flight_date, status, total_price, flight_class, created_at, contact_email').order('created_at', { ascending: false }).limit(10),
          supabase.from('reservations').select('*', { count: 'exact', head: true }).in('status', ['cancelled', 'İptal']),
        ]);

        if (!mountedRef.current) return;

        const errors = results.filter(r => r.error).map(r => r.error!.message);
        if (errors.length > 0) {
          logger.error('[useAdminStats] Supabase hataları:', errors);
          setError(errors[0]);
        }

        const [
          { count: totalFlights },
          { count: totalReservations },
          { data: revenueResult },
          { count: totalPassengers },
          { count: todayFlights },
          { count: activeCampaigns },
          { data: recent },
          { count: cancelledReservations },
        ] = results;

        const totalRevenue = Number(revenueResult) || 0;

        setStats({
          totalFlights: totalFlights || 0,
          totalReservations: totalReservations || 0,
          totalRevenue,
          totalPassengers: totalPassengers || 0,
          todayFlights: todayFlights || 0,
          activeCampaigns: activeCampaigns || 0,
          cancelledReservations: cancelledReservations || 0,
        });

        if (recent) setRecentReservations(recent as RecentReservation[]);
      } catch (err) {
        if (!mountedRef.current) return;
        logger.error('[useAdminStats] Beklenmeyen hata:', err);
        setError('İstatistikler yüklenirken bir hata oluştu');
      }
      if (mountedRef.current) setLoading(false);
    };

    fetchStats();
    return () => { mountedRef.current = false; };
  }, []);

  return { stats, recentReservations, loading, error };
}
