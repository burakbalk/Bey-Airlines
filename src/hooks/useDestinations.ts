import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface DestinationWeather {
  temp: string;
  condition: string;
  humidity: string;
}

export interface DestinationHighlight {
  icon: string;
  title: string;
  description: string;
}

export interface DestinationPopularFlight {
  from: string;
  duration: string;
  date: string;
  price: string;
}

export interface Destination {
  id: string;
  city: string;
  slug: string;
  country: string;
  image: string | null;
  hero_image: string | null;
  price: number;
  description: string | null;
  weather: DestinationWeather | null;
  highlights: DestinationHighlight[];
  gallery: string[];
  popular_flights: DestinationPopularFlight[];
}

export function useDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    supabase
      .from('destinations')
      .select('*')
      .order('city')
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error('[useDestinations] Supabase hatası:', fetchError.message, fetchError.details);
          setError(fetchError.message);
        }
        if (data) setDestinations(data as Destination[]);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useDestinations] Beklenmeyen hata:', err);
        setError('Destinasyonlar yüklenirken bir hata oluştu');
        setLoading(false);
      });
  }, []);

  return { destinations, loading, error };
}

export function useDestinationBySlug(slug: string | undefined) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    setError(null);
    supabase
      .from('destinations')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          console.error('[useDestinationBySlug] Supabase hatası:', fetchError.message);
          setError(fetchError.message);
        }
        if (data) setDestination(data as Destination);
        setLoading(false);
      })
      .catch((err) => {
        console.error('[useDestinationBySlug] Beklenmeyen hata:', err);
        setError('Destinasyon yüklenirken bir hata oluştu');
        setLoading(false);
      });
  }, [slug]);

  return { destination, loading, error };
}
