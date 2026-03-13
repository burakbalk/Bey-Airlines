import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string | null;
  badge: string | null;
  type: string | null;
  image: string | null;
  benefits: string[];
  terms: string[];
  routes: string[];
  is_active: boolean;
  created_at: string;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: queryError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (queryError) {
        console.error('[useCampaigns] Supabase hatası:', queryError.message, queryError.details);
        setError(queryError.message);
      }
      if (data) setCampaigns(data as Campaign[]);
    } catch (err) {
      console.error('[useCampaigns] Beklenmeyen hata:', err);
      setError('Kampanyalar yüklenirken bir hata oluştu');
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { campaigns, loading, error, refresh };
}

export function useCampaignBySlug(slug: string | undefined) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [similarCampaigns, setSimilarCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }

    const fetchCampaign = async () => {
      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('slug', slug)
        .single();

      if (fetchError) {
        console.error('[useCampaignBySlug] Supabase hatası:', fetchError.message);
        setError(fetchError.message);
      }
      if (data) {
        setCampaign(data as Campaign);
        // Benzer kampanyaları getir
        const { data: similar } = await supabase
          .from('campaigns')
          .select('*')
          .eq('is_active', true)
          .eq('type', data.type)
          .neq('id', data.id)
          .limit(3);
        if (similar) setSimilarCampaigns(similar as Campaign[]);
      }
      setLoading(false);
    };

    fetchCampaign();
  }, [slug]);

  return { campaign, similarCampaigns, loading, error };
}

export function useAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: queryError } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (queryError) {
      console.error('[useAdminCampaigns] Supabase hatası:', queryError.message);
      setError(queryError.message);
    }
    if (data) setCampaigns(data as Campaign[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (campaign: Partial<Campaign>) => {
    const { error } = await supabase.from('campaigns').insert(campaign);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  const update = async (id: string, updates: Partial<Campaign>) => {
    const { error } = await supabase.from('campaigns').update(updates).eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  return { campaigns, loading, error, refresh, create, update, remove };
}
