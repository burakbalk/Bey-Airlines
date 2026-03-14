import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface AdminGeneralSettings {
  siteName: string;
  contactEmail: string;
  contactPhone: string;
  supportEmail: string;
  address: string;
}

export interface AdminNotificationSettings {
  emailNewReservation: boolean;
  emailCancellation: boolean;
  emailNewMessage: boolean;
  emailLowStock: boolean;
  smsNewReservation: boolean;
  smsCancellation: boolean;
}

export interface AdminFlightMessages {
  onTime: string;
  delayed: string;
  cancelled: string;
  boarding: string;
  departed: string;
}

export interface AdminSettings {
  general: AdminGeneralSettings;
  notifications: AdminNotificationSettings;
  flightMessages: AdminFlightMessages;
}

const defaultSettings: AdminSettings = {
  general: {
    siteName: 'BeyAir Havayolları',
    contactEmail: 'info@beyair.com',
    contactPhone: '444 7 239',
    supportEmail: 'destek@beyair.com',
    address: 'Atatürk Havalimanı, Terminal 1, İstanbul',
  },
  notifications: {
    emailNewReservation: true,
    emailCancellation: true,
    emailNewMessage: true,
    emailLowStock: false,
    smsNewReservation: false,
    smsCancellation: true,
  },
  flightMessages: {
    onTime: 'Uçuşunuz zamanında kalkacaktır.',
    delayed: 'Uçuşunuz gecikmiştir. Lütfen bilgi ekranlarını takip edin.',
    cancelled: 'Uçuşunuz iptal edilmiştir. Lütfen gişelerimize başvurun.',
    boarding: 'Uçuşunuz için biniş başlamıştır. Lütfen kapıya geçin.',
    departed: 'Uçuşunuz kalkış yapmıştır.',
  },
};

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setError(null);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setError('Kullanıcı oturumu bulunamadı.');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('admin_settings')
        .eq('id', userData.user.id)
        .single();

      if (fetchError) {
        logger.error('[useAdminSettings] Supabase hatası:', fetchError.message);
        setError(fetchError.message);
      } else if (data?.admin_settings) {
        setSettings({ ...defaultSettings, ...(data.admin_settings as Partial<AdminSettings>) });
      }
    } catch (err) {
      logger.error('[useAdminSettings] Beklenmeyen hata:', err);
      setError('Ayarlar yüklenirken bir hata oluştu.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (updated: Partial<AdminSettings>): Promise<boolean> => {
    const merged = { ...settings, ...updated };
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return false;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ admin_settings: merged })
        .eq('id', userData.user.id);

      if (updateError) {
        logger.error('[useAdminSettings] Kaydetme hatası:', updateError.message);
        return false;
      }

      setSettings(merged);
      return true;
    } catch (err) {
      logger.error('[useAdminSettings] Beklenmeyen hata:', err);
      return false;
    }
  }, [settings]);

  return { settings, loading, error, saveSettings, refresh: fetchSettings };
}
