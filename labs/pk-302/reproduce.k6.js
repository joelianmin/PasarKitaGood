// PK-302: klik ganda dan retry otomatis. Dijalankan lewat: task reproduce LAB=pk-302
// Sebelum tiap run: task lab:siapkan LAB=pk-302 (keranjang pelanggan 3001 sampai 3600 kosong, saldo 10.000.000).
// Tiap iterasi = satu pelanggan baru dengan satu percobaan bayar (satu Idempotency-Key):
// - klik ganda: dua request checkout dengan kunci sama dikirim bersamaan;
// - retry: satu request, lalu request ulangan dengan kunci sama 0,5 detik kemudian;
// - pembelian kedua yang sah (sekitar 20% pelanggan): produk lain, percobaan bayar baru dengan kunci baru.
import http from 'k6/http';
import exec from 'k6/execution';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';
import { ambangPerEndpoint, skenarioLajuTetap } from '../_bersama/ringkasan.js';
import { siapkan, catat } from '../_bersama/status.js';
import { ringkasanGabung } from '../_bersama/gabung.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OUT = __ENV.OUT || 'labs/pk-302/out';
const DURATION = __ENV.DURATION || '2m';
const RATE = Number(__ENV.RATE || 2);
const PRODUCTS = Number(__ENV.PRODUCTS || 5000);

const ROWS = [
  { key: 'pertama', label: 'POST /api/checkout (request pertama)' },
  { key: 'ulangan', label: 'POST /api/checkout (ulangan, kunci sama)' },
];
const KASUS = [
  { key: 'pertama', label: 'Request pertama tiap percobaan bayar', diharapkan: '200' },
  { key: 'ulangan', label: 'Request ulangan (klik ganda dan retry)', diharapkan: '200, jawaban sama dengan yang pertama' },
];
const KODE = [200, 400, 402, 409, 500];
const alat = siapkan(KASUS, KODE);
const percobaan = new Counter('percobaan_bayar');

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 499 }));

export const options = {
  scenarios: { bayar: skenarioLajuTetap('bayar', RATE, DURATION) },
  thresholds: ambangPerEndpoint(ROWS.map((r) => r.key)),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    return (c === 'x' ? r : (r % 4) + 8).toString(16);
  });
}

function produk() {
  // Hindari produk tanpa tarif pajak (id berakhiran 00), supaya tiket ini tidak tercampur PK-300.
  const p = 1 + Math.floor(Math.random() * (PRODUCTS - 1));
  return p % 100 === 0 ? p + 1 : p;
}

function satuPercobaan(customer, gaya) {
  const key = uuid();
  percobaan.add(1);
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(customer), 'Idempotency-Key': key };
  http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: produk(), quantity: 1 }), { headers });
  const req = { method: 'POST', url: `${BASE_URL}/api/checkout`, body: null };
  if (gaya === 'klik-ganda') {
    const [a, b] = http.batch([
      { ...req, params: { headers, tags: { endpoint: 'pertama' } } },
      { ...req, params: { headers, tags: { endpoint: 'ulangan' } } },
    ]);
    catat(alat, 'pertama', a);
    catat(alat, 'ulangan', b);
  } else {
    catat(alat, 'pertama', http.post(req.url, null, { headers, tags: { endpoint: 'pertama' } }));
    sleep(0.5);
    catat(alat, 'ulangan', http.post(req.url, null, { headers, tags: { endpoint: 'ulangan' } }));
  }
}

export function bayar() {
  const i = exec.scenario.iterationInTest;
  const customer = 3001 + (i % 600);
  satuPercobaan(customer, i % 2 === 0 ? 'klik-ganda' : 'retry');
  if (i % 5 === 0) {
    satuPercobaan(customer, 'retry');
  }
}

export function handleSummary(data) {
  const n = data.metrics.percobaan_bayar ? data.metrics.percobaan_bayar.values.count : 0;
  return ringkasanGabung(data, OUT, ROWS, KASUS, KODE,
    `Percobaan bayar (Idempotency-Key berbeda): ${n}. Order yang diharapkan: ${n}.`
    + ' Hitung order dan debit sebenarnya di database (query di LAB.md).');
}
