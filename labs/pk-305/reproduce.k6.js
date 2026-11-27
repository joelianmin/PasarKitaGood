// PK-305: lalu lintas back-office dan katalog. Dijalankan lewat: task reproduce LAB=pk-305
// Tiga skenario bersamaan, 3 menit:
// - Ringkasan Penjualan Toko Raksasa (penjual 1): 1 request tiap 10 detik (lima staf admin membuka back-office);
// - Ringkasan Penjualan penjual lain: 2 req/detik (sekitar 4% pemanggil Ringkasan Penjualan adalah Toko Raksasa);
// - katalog: 3 req/detik.
// Ringkasan dipisah per kelompok supaya bisa dibandingkan dengan panel di dashboard.
import http from 'k6/http';
import { ambangPerEndpoint, skenarioLajuTetap, ringkasan } from '../_bersama/ringkasan.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OUT = __ENV.OUT || 'labs/pk-305/out';
const DURATION = __ENV.DURATION || '3m';
const SELLERS = Number(__ENV.SELLERS || 2000);
const PRODUCTS = Number(__ENV.PRODUCTS || 50000);

const ROWS = [
  { key: 'ringkasan_raksasa', label: 'GET /api/sellers/1/sales-summary (Toko Raksasa)' },
  { key: 'ringkasan_lain', label: 'GET /api/sellers/{id}/sales-summary (penjual lain)' },
  { key: 'katalog', label: 'GET /api/products/{id}' },
];

export const options = {
  scenarios: {
    raksasa: {
      executor: 'constant-arrival-rate', exec: 'raksasa', rate: 1, timeUnit: '10s', duration: DURATION,
      preAllocatedVUs: 5, maxVUs: 50,
    },
    lain: skenarioLajuTetap('lain', Number(__ENV.RATE_LAIN || 2), DURATION),
    katalog: skenarioLajuTetap('katalog', Number(__ENV.RATE_KATALOG || 3), DURATION),
  },
  thresholds: ambangPerEndpoint(ROWS.map((r) => r.key)),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

export function raksasa() {
  http.get(`${BASE_URL}/api/sellers/1/sales-summary`, { tags: { endpoint: 'ringkasan_raksasa' } });
}

export function lain() {
  const id = 2 + Math.floor(Math.random() * (SELLERS - 1));
  http.get(`${BASE_URL}/api/sellers/${id}/sales-summary`, { tags: { endpoint: 'ringkasan_lain' } });
}

export function katalog() {
  http.get(`${BASE_URL}/api/products/${1 + Math.floor(Math.random() * PRODUCTS)}`, { tags: { endpoint: 'katalog' } });
}

export function handleSummary(data) {
  return ringkasan(data, OUT, ROWS);
}
