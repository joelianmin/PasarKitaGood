// PK-304: hitung email konfirmasi per pesanan dari catatan permintaan WireMock.
// Jalankan sesudah layanan email pulih: k6 run labs/pk-304/periksa-email.k6.js
import http from 'k6/http';

const WIREMOCK = __ENV.WIREMOCK_URL || 'http://localhost:8089';

export const options = { vus: 1, iterations: 1 };

export default function () {
  const res = http.post(`${WIREMOCK}/__admin/requests/find`,
    JSON.stringify({ method: 'POST', url: '/notifications/send' }), { headers: { 'Content-Type': 'application/json' } });
  const req = res.json('requests') || [];
  // find tidak memuat status respons; ambil dari catatan lengkap.
  const semua = http.get(`${WIREMOCK}/__admin/requests?limit=100000`).json('requests') || [];
  const berhasil = {};
  let gagal = 0;
  for (const r of semua) {
    if (r.request.url !== '/notifications/send') continue;
    const status = r.response ? r.response.status : 0;
    if (status >= 300) { gagal += 1; continue; }
    let orderId = '?';
    try { orderId = String(JSON.parse(r.request.body).orderId); } catch (e) { /* abaikan */ }
    berhasil[orderId] = (berhasil[orderId] || 0) + 1;
  }
  const unik = Object.keys(berhasil).length;
  const dobel = Object.values(berhasil).filter((n) => n > 1).length;
  console.log(`Permintaan email tercatat: ${req.length}, gagal: ${gagal}`);
  console.log(`Pesanan dengan email terkirim: ${unik}; pesanan dengan lebih dari satu email terkirim: ${dobel}`);
  console.log('Bandingkan jumlah pesanan dengan email terkirim dengan jumlah pesanan berhasil di database sejak run dimulai.');
}
