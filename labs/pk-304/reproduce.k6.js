// PK-304: checkout saat layanan email normal dan saat gangguan. Dijalankan lewat: task reproduce LAB=pk-304
// Ukur dua kali: tanpa gangguan (patokan), lalu sesudah `task chaos SCENARIO=email-error`.
// Sesudah run dengan gangguan: `task chaos:selesai`, tunggu sesuai batas waktu di paket konteks, lalu
// `k6 run labs/pk-304/periksa-email.k6.js` untuk menghitung email konfirmasi per pesanan.
// Catatan permintaan WireMock dikosongkan di awal run, jadi jalankan periksa-email sebelum run berikutnya.
import http from 'k6/http';
import { ambangPerEndpoint, skenarioLajuTetap } from '../_bersama/ringkasan.js';
import { siapkan, catat } from '../_bersama/status.js';
import { ringkasanGabung } from '../_bersama/gabung.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const WIREMOCK = __ENV.WIREMOCK_URL || 'http://localhost:8089';
const OUT = __ENV.OUT || 'labs/pk-304/out';
const DURATION = __ENV.DURATION || '3m';
const RATE = Number(__ENV.RATE || 2);
const PRODUCTS = Number(__ENV.PRODUCTS || 50000);
const CUSTOMERS = Number(__ENV.CUSTOMERS || 200000);

const ROWS = [{ key: 'checkout', label: 'POST /api/checkout' }];
const KASUS = [{ key: 'checkout', label: 'Checkout', diharapkan: '200 (402 dan 409 normal)' }];
const KODE = [200, 402, 409, 500];
const alat = siapkan(KASUS, KODE);

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 402, 409));

export const options = {
  scenarios: { checkout: skenarioLajuTetap('checkout', RATE, DURATION) },
  thresholds: ambangPerEndpoint(['checkout']),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

const rand = (n) => 1 + Math.floor(Math.random() * n);

export function setup() {
  http.del(`${WIREMOCK}/__admin/requests`);
  return { mulai: new Date().toISOString() };
}

export function checkout() {
  let p = rand(PRODUCTS);
  if (p % 100 === 0) p += 1;
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(rand(CUSTOMERS)) };
  http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: p, quantity: 1 }), { headers });
  catat(alat, 'checkout', http.post(`${BASE_URL}/api/checkout`, null, { headers, tags: { endpoint: 'checkout' } }));
}

export function handleSummary(data) {
  const mulai = data.setup_data ? data.setup_data.mulai : '-';
  return ringkasanGabung(data, OUT, ROWS, KASUS, KODE,
    `Run dimulai ${mulai} (UTC). Hitung pesanan sejak jam itu di database, lalu bandingkan dengan periksa-email.k6.js.`);
}
