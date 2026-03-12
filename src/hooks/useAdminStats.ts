import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalFlights: number;
  totalReservations: number;
  totalRevenue: number;
  totalPassengers: number;
  todayFlights: number;
  unreadMessages: number;
  activeCampaigns: number;
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
    unreadMessages: 0,
    activeCampaigns: 0,
  });
  const [recentReservations, setRecentReservations] = useState<RecentReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];

      const [
        { count: totalFlights },
        { count: totalReservations },
        { data: revenueData },
        { count: totalPassengers },
        { count: todayFlights },
        { count: unreadMessages },
        { count: activeCampaigns },
        { data: recent },
      ] = await Promise.all([
        supabase.from('flights').select('*', { count: 'exact', head: true }).gte('flight_date', today),
        supabase.from('reservations').select('*', { count: 'exact', head: true }),
        supabase.from('reservations').select('total_price'),
        supabase.from('passengers').select('*', { count: 'exact', head: true }),
        supabase.from('flights').select('*', { count: 'exact', head: true }).eq('flight_date', today),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('status', 'unread'),
        supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      const totalRevenue = revenueData?.reduce((sum, r) => sum + Number(r.total_price || 0), 0) || 0;

      setStats({
        totalFlights: totalFlights || 0,
        totalReservations: totalReservations || 0,
        totalRevenue,
        totalPassengers: totalPassengers || 0,
        todayFlights: todayFlights || 0,
        unreadMessages: unreadMessages || 0,
        activeCampaigns: activeCampaigns || 0,
      });

      if (recent) setRecentReservations(recent as RecentReservation[]);
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, recentReservations, loading };
}
