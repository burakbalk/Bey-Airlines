/**
 * Türkiye saatiyle (UTC+3) bugünün tarihini YYYY-MM-DD formatında döndürür.
 * `new Date().toISOString()` UTC kullandığından gece 00:00–03:00 arası
 * yanlış tarih döner — bu fonksiyon bu sorunu giderir.
 */
export function getTodayTR(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Istanbul' });
}
