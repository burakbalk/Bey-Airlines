import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'bey-airlines-auth',
    // Web Locks API kilitlenmesini önle — doğrudan callback çağır
    lock: async <T>(_name: string, _acquireTimeout: number, fn: () => Promise<T>): Promise<T> => {
      return await fn();
    },
  },
  global: {
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  },
});
