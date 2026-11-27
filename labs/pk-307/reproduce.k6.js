// PK-307: checkout pelanggan bersaldo cukup dan kurang. Dijalankan lewat: task reproduce LAB=pk-307
// Sebelum tiap run: task lab:siapkan LAB=pk-307 (pelanggan 5001 sampai 5150 saldonya tidak cukup).
// Catatan permintaan WireMock dikosongkan di awal run. Di akhir run, script mencetak jumlah otorisasi
// ke gateway; bandingkan dengan jumlah order (status 200) dan baris REKONSILIASI di log aplikasi.
import http from 'k6/http';
import exec from 'k6/execution';
import { ambangPerEndpoint, skenarioLajuTetap } from '../_bersama/ringkasan.js';
import { siapkan, catat } from '../_bersama/status.js';
import { ringkasanGabung, hitungWireMock } from '../_bersama/gabung.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080';
const WIREMOCK = __ENV.WIREMOCK_URL || 'http://localhost:8089';
const OUT = __ENV.OUT || 'labs/pk-307/out';
const DURATION = __ENV.DURATION || '2m';
const RATE = Number(__ENV.RATE || 3);
const PRODUCTS = Number(__ENV.PRODUCTS || 5000);

const ROWS = [{ key: 'checkout', label: 'POST /api/checkout' }];
const KASUS = [{ key: 'checkout', label: 'Checkout', diharapkan: '200 atau 402 (saldo kurang)' }];
const KODE = [200, 402, 409, 500];
const alat = siapkan(KASUS, KODE);

http.setResponseCallback(http.expectedStatuses({ min: 200, max: 399 }, 402, 409));

export const options = {
  scenarios: { checkout: skenarioLajuTetap('checkout', RATE, DURATION) },
  thresholds: ambangPerEndpoint(['checkout']),
  summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max'],
};

export function setup() {
  http.del(`${WIREMOCK}/__admin/requests`);
}

export function checkout() {
  // 600 pelanggan berbeda, diacak urutannya (7 dan 600 tidak punya faktor bersama).
  const customer = 5001 + ((exec.scenario.iterationInTest * 7) % 600);
  let p = 1 + Math.floor(Math.random() * (PRODUCTS - 1));
  if (p % 100 === 0) p += 1;
  const headers = { 'Content-Type': 'application/json', 'X-Customer-Id': String(customer) };
  http.post(`${BASE_URL}/api/cart/items`, JSON.stringify({ productId: p, quantity: 1 }), { headers });
  catat(alat, 'checkout', http.post(`${BASE_URL}/api/checkout`, null, { headers, tags: { endpoint: 'checkout' } }));
}

export function teardown() {
  const n = hitungWireMock(http, WIREMOCK, 'POST', '/payments/authorize');
  console.log(`Otorisasi ke gateway selama run (catatan WireMock): ${n}`);
  console.log('Bandingkan: otorisasi = order tersimpan (status 200) + baris REKONSILIASI di log aplikasi selama run.');
}

export function handleSummary(data) {
  return ringkasanGabung(data, OUT, ROWS, KASUS, KODE,
    'Jumlah otorisasi ke gateway dicetak di akhir run (teardown). Salin angkanya ke laporanmu.');
}
