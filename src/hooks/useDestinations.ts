import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Destination {
  id: number;
  city: string;
  country: string;
  image: string | null;
  hero_image: string | null;
  price: number;
  description: string | null;
  weather: any;
  highlights: any[];
  gallery: any[];
  popular_flights: any[];
}

export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('destinations')
      .select('*')
      .order('city')
      .then(({ data }) => {
        if (data) setDestinations(data as Destination[]);
        setLoading(false);
      });
  }, []);

  return { destinations, loading };
}

export function useDestinationById(id: string | number | undefined) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    supabase
      .from('destinations')
      .select('*')
      .eq('id', Number(id))
      .single()
      .then(({ data }) => {
        if (data) setDestination(data as Destination);
        setLoading(false);
      });
  }, [id]);

  return { destination, loading };
}
