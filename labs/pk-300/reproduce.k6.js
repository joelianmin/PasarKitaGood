// PK-300: checkout produk yang tarif pajaknya tersedia dan yang belum. Dijalankan lewat: task reproduce LAB=pk-300
// Sebelum tiap run: task lab:siapkan LAB=pk-300 (mengosongkan keranjang pelanggan 6001 sampai 7000).
// Tiap iterasi memakai pelanggan baru: tambah satu produk ke keranjang, lalu checkout.
// Sekitar 20% iterasi memakai produk yang tarifnya belum ditetapkan (layanan pajak membalas "rate": null).
import http from 'k6/http';
import exec from 'k6/execution';
import { ambangPerEndpoint, skenarioLajuTetap } from '../_bersama/ringkasan.js';
import { siapkan, catat } from '../_bersama/status.js';
import { ringkasanGabung } from '../_bersama/gabung.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OUT = __ENV.OUT || 'labs/pk-300/out';
const DURATION = __ENV.DURATION || '3m';
const RATE = Number(__ENV.RATE || 2);
const PRODUCTS = Number(__ENV.PRODUCTS || 5000);

const ROWS = [
  { key: 'bertarif', label: 'POST /api/checkout (produk bertarif)' },
  { key: 'tanpa_tarif', label: 'POST /api/checkout (produk tanpa tarif)' },
];
const KASUS = [
  { key: 'bertarif', label: 'Checkout produk bertarif', diharapkan: '200' },
  { key: 'tanpa_tarif', label: 'Checkout produk tanpa tarif', diharapkan: 'ditolak dengan jelas (4xx)' },
];
const KODE = [200, 400, 409, 422, 500];
const alat = siapkan(KASUS, KODE);

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 499 }));

export const options = {
  scenarios: { checkout: skenarioLajuTetap('checkout', RATE, DURATION) },
  thresholds: ambangPerEndpoint(ROWS.map((r) => r.key)),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

export function checkout() {
  const i = exec.scenario.iterationInTest;
  const customer = 6001 + (i % 1000);
  const tanpaTarif = i % 5 === 0;
  const dasar = 1 + Math.floor(Math.random() * (PRODUCTS / 100 - 1));
  const productId = tanpaTarif ? dasar * 100 : dasar * 100 + 1 + Math.floor(Math.random() * 98);
  const key = tanpaTarif ? 'tanpa_tarif' : 'bertarif';
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(customer) };
  http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId, quantity: 1 }), { headers });
  const res = http.post(`${BASE_URL}/api/checkout`, null, { headers, tags: { endpoint: key } });
  catat(alat, key, res);
}

export function handleSummary(data) {
  return ringkasanGabung(data, OUT, ROWS, KASUS, KODE,
    'Periksa juga di database: pesanan dari run ini yang pajaknya Rp0 (query di LAB.md, bagian Catatan script k6).');
}
