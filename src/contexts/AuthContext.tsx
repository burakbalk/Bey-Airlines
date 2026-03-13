import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  birth_date: string | null;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null; profile: Profile | null }>;
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      // Önce doğrudan sorgu dene
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
        return data as Profile;
      }

      // RLS engelledi veya hata — SECURITY DEFINER RPC ile role'ü al
      const { data: rpcRole, error: rpcError } = await supabase.rpc('check_admin_role', {
        p_user_id: userId,
      });

      if (rpcError) {
        console.error('[AuthContext] check_admin_role RPC hatası:', rpcError.message);
        return null;
      }

      // Minimal profile nesnesi oluştur (role bilgisi garanti)
      const minimalProfile: Profile = {
        id: userId,
        first_name: '',
        last_name: '',
        phone: null,
        birth_date: null,
        role: (rpcRole as 'user' | 'admin') ?? 'user',
      };
      setProfile(minimalProfile);
      return minimalProfile;
    } catch (err) {
      console.error('[AuthContext] fetchProfile exception:', err);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) await fetchProfile(s.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message, profile: null };
    // Profile'i hemen fetch et — onAuthStateChange'i beklemeye gerek yok
    let fetchedProfile: Profile | null = null;
    if (data.user) {
      fetchedProfile = await fetchProfile(data.user.id);
    }
    return { error: null, profile: fetchedProfile };
  };

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName, last_name: lastName },
      },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    // Eski localStorage verileri temizle
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userName');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'Giriş yapmanız gerekiyor' };
    // GÜVENLİK: role alanını client tarafında da soyar (DB trigger zaten engelliyor)
    const { role: _role, ...safeData } = data;
    const { error } = await supabase
      .from('profiles')
      .update(safeData)
      .eq('id', user.id);
    if (!error && profile) {
      setProfile({ ...profile, ...safeData });
    }
    return { error: error?.message ?? null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        isAdmin: profile?.role === 'admin',
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
