// PK-306: checkout keranjang 1 produk dan 10 produk. Dijalankan lewat: task reproduce LAB=pk-306
// Tiap iterasi memakai pelanggan acak, mengisi keranjang, lalu checkout.
import http from 'k6/http';
import { ambangPerEndpoint, skenarioLajuTetap, ringkasan } from '../_bersama/ringkasan.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OUT = __ENV.OUT || 'labs/pk-306/out';
const DURATION = __ENV.DURATION || '3m';
const RATE = Number(__ENV.RATE || 1);
const PRODUCTS = Number(__ENV.PRODUCTS || 50000);
const CUSTOMERS = Number(__ENV.CUSTOMERS || 200000);

const ROWS = [
  { key: 'satu', label: 'POST /api/checkout (1 produk)' },
  { key: 'sepuluh', label: 'POST /api/checkout (10 produk)' },
];

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 402, 409));

export const options = {
  scenarios: {
    satu: skenarioLajuTetap('satu', RATE, DURATION),
    sepuluh: skenarioLajuTetap('sepuluh', RATE, DURATION),
  },
  thresholds: ambangPerEndpoint(ROWS.map((r) => r.key)),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

const rand = (n) => 1 + Math.floor(Math.random() * n);

function beli(jumlah, key) {
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(rand(CUSTOMERS)) };
  for (let i = 0; i < jumlah; i++) {
    let p = rand(PRODUCTS);
    if (p % 100 === 0) p += 1;
    http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: p, quantity: 1 }), { headers });
  }
  http.post(`${BASE_URL}/api/checkout`, null, { headers, tags: { endpoint: key } });
}

export function satu() { beli(1, 'satu'); }
export function sepuluh() { beli(10, 'sepuluh'); }

export function handleSummary(data) {
  return ringkasan(data, OUT, ROWS);
}
