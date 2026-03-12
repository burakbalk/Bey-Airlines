import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Message {
  id: number;
  sender_name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  category: string | null;
  status: string;
  admin_reply: string | null;
  created_at: string;
}

export function useAdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setMessages(data as Message[]);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const updateStatus = async (id: number, status: string) => {
    const { error } = await supabase.from('messages').update({ status }).eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  const reply = async (id: number, admin_reply: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ admin_reply, status: 'replied' })
      .eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (!error) refresh();
    return { error: error?.message ?? null };
  };

  return { messages, loading, refresh, updateStatus, reply, remove };
}

export function useSendMessage() {
  const send = async (data: {
    sender_name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    category?: string;
  }) => {
    const { error } = await supabase.from('messages').insert(data);
    return { error: error?.message ?? null };
  };

  return { send };
}
