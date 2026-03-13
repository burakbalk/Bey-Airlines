import { supabase } from '../lib/supabase';

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
