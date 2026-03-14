import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export interface Faq {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export function useFaq() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    (async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('faq')
          .select('*')
          .order('category');
        if (fetchError) {
          logger.error('[useFaq] Supabase hatası:', fetchError.message);
          setError(fetchError.message);
        }
        if (data) setFaqs(data as Faq[]);
      } catch (err) {
        logger.error('[useFaq] Beklenmeyen hata:', err);
        setError('SSS yüklenirken bir hata oluştu');
      }
      setLoading(false);
    })();
  }, []);

  return { faqs, loading, error };
}
