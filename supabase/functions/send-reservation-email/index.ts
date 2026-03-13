import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Passenger {
  firstName: string;
  lastName: string;
  tcNo: string;
  seatNumber?: string;
}

interface ReservationEmailData {
  pnr: string;
  email: string;
  flight: {
    from: string;
    to: string;
    fromCode: string;
    toCode: string;
    date: string;
    time: string;
    flightNumber: string;
    duration: string;
    airline: string;
  };
  passengers: Passenger[];
  extras: {
    baggage: number;
    meal: string;
    insurance: boolean;
    priority: boolean;
  };
  payment: {
    total: number;
  };
}

function buildEmailHtml(data: ReservationEmailData): string {
  const passengerRows = data.passengers
    .map(
      (p, i) => `
      <tr>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;">${i + 1}. ${p.firstName} ${p.lastName}</td>
        <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;text-align:center;font-weight:700;color:#CC0000;">${p.seatNumber || '-'}</td>
      </tr>`
    )
    .join('');

  const extrasList = [
    data.extras.baggage > 0 && `+${data.extras.baggage}kg Ekstra Bagaj`,
    data.extras.meal !== 'none' && data.extras.meal !== '' && `Yemek Hizmeti`,
    data.extras.insurance && `Seyahat Sigortası`,
    data.extras.priority && `Öncelikli Biniş`,
  ]
    .filter(Boolean)
    .join(', ');

  const flightDateFormatted = new Date(data.flight.date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Rezervasyon Onayı - ${data.pnr}</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#CC0000,#E31E24);padding:32px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:2px;">BEY AIRLINES</div>
              <div style="font-size:13px;color:rgba(255,255,255,0.8);margin-top:4px;">Rezervasyon Onayı</div>
            </td>
          </tr>

          <!-- PNR Banner -->
          <tr>
            <td style="background:#fff8f8;padding:24px;text-align:center;border-bottom:2px dashed #ffd0d0;">
              <div style="font-size:13px;color:#888;margin-bottom:8px;">PNR KODUNUZ</div>
              <div style="font-size:36px;font-weight:900;color:#CC0000;letter-spacing:6px;">${data.pnr}</div>
              <div style="font-size:12px;color:#aaa;margin-top:8px;">Bu kodu check-in sırasında gösteriniz</div>
            </td>
          </tr>

          <!-- Flight Info -->
          <tr>
            <td style="padding:28px 32px;">
              <div style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Uçuş Bilgileri</div>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align:center;width:40%;">
                    <div style="font-size:40px;font-weight:900;color:#1A1A1A;">${data.flight.fromCode}</div>
                    <div style="font-size:14px;color:#666;margin-top:4px;">${data.flight.from}</div>
                    <div style="font-size:20px;font-weight:700;color:#CC0000;margin-top:8px;">${data.flight.time}</div>
                  </td>
                  <td style="text-align:center;width:20%;">
                    <div style="color:#CC0000;font-size:24px;">✈</div>
                    <div style="font-size:11px;color:#aaa;margin-top:4px;">${data.flight.duration}</div>
                  </td>
                  <td style="text-align:center;width:40%;">
                    <div style="font-size:40px;font-weight:900;color:#1A1A1A;">${data.flight.toCode}</div>
                    <div style="font-size:14px;color:#666;margin-top:4px;">${data.flight.to}</div>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;background:#f8f8f8;border-radius:10px;padding:16px;">
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#666;">Tarih:</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1A1A1A;text-align:right;">${flightDateFormatted}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#666;">Uçuş No:</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1A1A1A;text-align:right;">${data.flight.flightNumber}</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:13px;color:#666;">Havayolu:</td>
                  <td style="padding:4px 0;font-size:13px;font-weight:600;color:#1A1A1A;text-align:right;">${data.flight.airline}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Passengers -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Yolcular</div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:10px;overflow:hidden;">
                <tr style="background:#f8f8f8;">
                  <th style="padding:10px 16px;text-align:left;font-size:12px;color:#888;font-weight:600;">AD SOYAD</th>
                  <th style="padding:10px 16px;text-align:center;font-size:12px;color:#888;font-weight:600;">KOLTUK</th>
                </tr>
                ${passengerRows}
              </table>
            </td>
          </tr>

          ${
            extrasList
              ? `<!-- Extras -->
          <tr>
            <td style="padding:0 32px 28px;">
              <div style="font-size:13px;font-weight:700;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:12px;">Ek Hizmetler</div>
              <div style="background:#fff8f8;border-radius:10px;padding:14px 16px;font-size:13px;color:#444;">${extrasList}</div>
            </td>
          </tr>`
              : ''
          }

          <!-- Total -->
          <tr>
            <td style="padding:0 32px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#CC0000;border-radius:10px;padding:16px 20px;">
                <tr>
                  <td style="font-size:14px;color:rgba(255,255,255,0.8);">Toplam Tutar</td>
                  <td style="font-size:22px;font-weight:900;color:#fff;text-align:right;">${data.payment.total.toLocaleString('tr-TR')} TL</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Info -->
          <tr>
            <td style="padding:0 32px 32px;">
              <div style="background:#f0f7ff;border-radius:10px;padding:16px 20px;">
                <div style="font-size:12px;font-weight:700;color:#2563eb;margin-bottom:8px;">📋 ÖNEMLİ BİLGİLER</div>
                <ul style="margin:0;padding-left:16px;font-size:12px;color:#555;line-height:2;">
                  <li>Uçuştan 24 saat önce online check-in yapabilirsiniz</li>
                  <li>Havalimanına en az 2 saat önce gelmeniz önerilir</li>
                  <li>Kimlik belgenizi yanınızda bulundurmayı unutmayın</li>
                </ul>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1A1A1A;padding:20px 32px;text-align:center;">
              <div style="font-size:12px;color:#888;">© 2026 Bey Airlines. Tüm hakları saklıdır.</div>
              <div style="font-size:11px;color:#555;margin-top:4px;">Bu e-posta otomatik olarak oluşturulmuştur.</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: ReservationEmailData = await req.json();

    if (!body.pnr || !body.email) {
      return new Response(JSON.stringify({ error: 'pnr ve email zorunludur' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: 'E-posta servisi yapılandırılmamış' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const html = buildEmailHtml(body);

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Bey Airlines <onboarding@resend.dev>',
        to: [body.email],
        subject: `Rezervasyon Onayı - PNR: ${body.pnr}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errBody = await resendResponse.text();
      console.error('Resend error:', errBody);
      return new Response(JSON.stringify({ error: 'E-posta gönderilemedi' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(JSON.stringify({ error: 'Sunucu hatası' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
