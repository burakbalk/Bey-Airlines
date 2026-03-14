import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';
import { getTodayTR } from '../utils/date';

/**
 * App başlatıldığında gelecek uçuş sayısını kontrol eder.
 * Yeterli uçuş yoksa generate_weekly_flights RPC'sini çağırır.
 * Sayfa başına 1 kez çalışır (ref ile korunur).
 */
export function useFlightInit() {
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        const today = getTodayTR();

        // sessionStorage flag: aynı gün içinde başarılı init sonrası tekrar çalışma
        const flagKey = `flightInitDone_${today}`;
        if (sessionStorage.getItem(flagKey)) return;

        const { count, error } = await supabase
          .from('flights')
          .select('id', { count: 'exact', head: true })
          .gte('flight_date', today);

        if (error) {
          logger.error('Flight count sorgu hatası:', error.message);
          return;
        }

        // 8 slot × 4 hafta = 32 uçuş bekleniyor, 8'den azsa üret
        if ((count ?? 0) < 8) {
          const { error: rpcError } = await supabase.rpc('generate_weekly_flights', {
            start_date: today,
            num_weeks: 4,
          });
          if (rpcError) {
            logger.error('generate_weekly_flights hatası:', rpcError.message);
            // RPC başarısız: flag set etme, bir sonraki yüklemede tekrar denensin
            return;
          }
        }

        // Uçuşlar yeterliyse veya RPC başarılıysa flag set et
        sessionStorage.setItem(flagKey, '1');
      } catch (err) {
        logger.error('Flight init hatası:', err);
      }
    })();
  }, []);
}
