import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Campaign {
  id: number;
  title: string;
  description: string;
  long_description: string | null;
  badge: string | null;
  type: string | null;
  image: string | null;
  benefits: any[];
  terms: any[];
  routes: any[];
  is_active: boolean;
  created_at: string;
}

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data as Campaign[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { campaigns, loading, refresh };
}

export function useAdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCampaigns(data as Campaign[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const create = async (campaign: Partial<Campaign>) => {
    const { error } = await supabase.from('campaigns').insert(campaign);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  const update = async (id: number, updates: Partial<Campaign>) => {
    const { error } = await supabase.from('campaigns').update(updates).eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  return { campaigns, loading, refresh, create, update, remove };
}
