/**
 * Bey Airlines — Haftalık Otomatik Uçuş Üreticisi
 *
 * Supabase Scheduled Edge Function.
 * Her Pazar gece yarısı (00:00 UTC) çalışır ve sonraki 4 haftanın
 * uçuşlarını generate_weekly_flights() stored procedure ile üretir.
 *
 * Zamanlama (Supabase Dashboard → Edge Functions → Schedule):
 *   Cron: 0 0 * * 0   (Her Pazar 00:00 UTC)
 *
 * Manuel test:
 *   curl -X POST "SUPABASE_URL/functions/v1/generate-weekly-flights" \
 *     -H "Authorization: Bearer SUPABASE_SERVICE_ROLE_KEY"
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Service role key ile çalış — RLS'i bypass etmek gerekiyor
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { error } = await supabase.rpc('generate_weekly_flights', {
      num_weeks: 4,
    });

    if (error) {
      console.error('generate_weekly_flights hatası:', error.message);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const now = new Date().toISOString();
    console.log(`[${now}] Haftalık uçuşlar başarıyla üretildi.`);

    return new Response(
      JSON.stringify({ success: true, generated_at: now }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Beklenmedik hata:', err);
    return new Response(
      JSON.stringify({ success: false, error: 'Sunucu hatası' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
