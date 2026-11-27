// PK-303: katalog, login, dan checkout bersamaan. Dijalankan lewat: task reproduce LAB=pk-303
// Ukur dua kali: tanpa gangguan (patokan), lalu sesudah `task chaos SCENARIO=gateway-hang`.
// Matikan gangguan dengan `task chaos:selesai`, lalu restart aplikasi bila masih tertahan.
// Batas waktu tiap request di k6: 30 detik. Checkout yang lebih dari 10 detik dihitung terpisah
// (batas aplikasi mobile, lihat paket konteks).
import http from 'k6/http';
import { Counter } from 'k6/metrics';
import { ambangPerEndpoint, skenarioLajuTetap } from '../_bersama/ringkasan.js';
import { siapkan, catat } from '../_bersama/status.js';
import { ringkasanGabung } from '../_bersama/gabung.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OUT = __ENV.OUT || 'labs/pk-303/out';
const DURATION = __ENV.DURATION || '3m';
const PRODUCTS = Number(__ENV.PRODUCTS || 50000);
const CUSTOMERS = Number(__ENV.CUSTOMERS || 200000);

const ROWS = [
  { key: 'katalog', label: 'GET /api/products/{id}' },
  { key: 'login', label: 'POST /api/auth/login' },
  { key: 'checkout', label: 'POST /api/checkout' },
];
const KASUS = [
  { key: 'katalog', label: 'Katalog', diharapkan: '200' },
  { key: 'login', label: 'Login', diharapkan: '200' },
  { key: 'checkout', label: 'Checkout', diharapkan: 'status jelas dalam 10 detik' },
];
const KODE = [200, 402, 409, 500, 502, 503, 504];
const alat = siapkan(KASUS, KODE);
const lewat10 = new Counter('checkout_lebih_10_detik');

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 402, 409));

export const options = {
  scenarios: {
    katalog: skenarioLajuTetap('katalog', Number(__ENV.RATE_KATALOG || 8), DURATION),
    login: skenarioLajuTetap('login', Number(__ENV.RATE_LOGIN || 1), DURATION),
    checkout: skenarioLajuTetap('checkout', Number(__ENV.RATE_CHECKOUT || 2), DURATION),
  },
  thresholds: ambangPerEndpoint(ROWS.map((r) => r.key)),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

const rand = (n) => 1 + Math.floor(Math.random() * n);
const BATAS = { timeout: '30s' };

export function katalog() {
  const res = http.get(`${BASE_URL}/api/products/${rand(PRODUCTS)}`, { ...BATAS, tags: { endpoint: 'katalog' } });
  catat(alat, 'katalog', res);
}

export function login() {
  const res = http.post(`${BASE_URL}/api/auth/login`,
    JSON.stringify({ email: `user${rand(CUSTOMERS)}@pasarkita.test`, password: 'rahasia123' }),
    { ...BATAS, headers: { 'Content-Type': 'application/json' }, tags: { endpoint: 'login' } });
  catat(alat, 'login', res);
}

export function checkout() {
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(rand(CUSTOMERS)) };
  http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: rand(PRODUCTS), quantity: 1 }), { ...BATAS, headers });
  const res = http.post(`${BASE_URL}/api/checkout`, null, { ...BATAS, headers, tags: { endpoint: 'checkout' } });
  catat(alat, 'checkout', res);
  if (res.timings.duration > 10000) lewat10.add(1);
}

export function handleSummary(data) {
  const n = data.metrics.checkout_lebih_10_detik ? data.metrics.checkout_lebih_10_detik.values.count : 0;
  return ringkasanGabung(data, OUT, ROWS, KASUS, KODE, `Checkout yang selesai lebih dari 10 detik: ${n}.`);
}
