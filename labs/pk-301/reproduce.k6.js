// PK-301: flash sale. Dijalankan lewat: task reproduce LAB=pk-301
// Sebelum tiap run: task lab:siapkan LAB=pk-301 (stok produk 4242 kembali 300, keranjang pelanggan dikosongkan).
// 600 pelanggan berbeda (1001 sampai 1600) masing-masing membeli 1 unit produk 4242 dalam 75 detik:
// permintaan dua kali lipat stok, beberapa checkout selalu berjalan bersamaan.
import http from 'k6/http';
import exec from 'k6/execution';
import { ambangPerEndpoint } from '../_bersama/ringkasan.js';
import { siapkan, catat } from '../_bersama/status.js';
import { ringkasanGabung } from '../_bersama/gabung.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const OUT = __ENV.OUT || 'labs/pk-301/out';
const RATE = Number(__ENV.RATE || 8);
const DURATION = __ENV.DURATION || '75s';
const PRODUK = 4242;
const STOK = 300;

const ROWS = [{ key: 'checkout', label: 'POST /api/checkout (flash sale)' }];
const KASUS = [{ key: 'checkout', label: 'Checkout flash sale', diharapkan: `200 paling banyak ${STOK}, sisanya 409` }];
const KODE = [200, 409, 500];
const alat = siapkan(KASUS, KODE);

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 409));

export const options = {
  scenarios: {
    flash: {
      executor: 'constant-arrival-rate', exec: 'beli', rate: RATE, timeUnit: '1s', duration: DURATION,
      preAllocatedVUs: 50, maxVUs: 300,
    },
  },
  thresholds: ambangPerEndpoint(['checkout']),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

export function beli() {
  const customer = 1001 + exec.scenario.iterationInTest;
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(customer) };
  http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: PRODUK, quantity: 1 }), { headers });
  const res = http.post(`${BASE_URL}/api/checkout`, null, { headers, tags: { endpoint: 'checkout' } });
  catat(alat, 'checkout', res);
}

export function handleSummary(data) {
  const m = data.metrics.hasil_checkout_200;
  const terjual = m ? m.values.count : 0;
  return ringkasanGabung(data, OUT, ROWS, KASUS, KODE,
    `Unit terjual menurut respons (status 200): ${terjual} dari stok ${STOK}.`
    + ' Periksa juga di database: SELECT quantity FROM stock WHERE product_id = 4242;');
}
