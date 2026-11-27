// PK-300: daftar produk yang tarif pajaknya belum tersedia, ditanyakan langsung ke layanan pajak.
// Dipakai untuk menemukan pesanan lama yang terdampak (lihat pesanan-terdampak.sql).
// Jalankan: k6 run -e PRODUCTS=5000 labs/pk-300/produk-tanpa-tarif.k6.js
// Hasil: labs/pk-300/out/produk-tanpa-tarif.csv (satu id per baris). Tidak ikut Git.
import http from 'k6/http';

const TAX_URL = __ENV.TAX_URL || 'http://localhost:8089';
const PRODUCTS = Number(__ENV.PRODUCTS || 5000);
const OUT = __ENV.OUT || 'labs/pk-300/out';

export const options = { vus: 1, iterations: 1 };

export function setup() {
  // Endpoint kumpulan menerima paling banyak 50 produk per permintaan (dokumentasi layanan pajak).
  const kosong = [];
  for (let awal = 1; awal <= PRODUCTS; awal += 50) {
    const ids = [];
    for (let id = awal; id < awal + 50 && id <= PRODUCTS; id++) ids.push(id);
    const res = http.post(`${TAX_URL}/tax/rates`, JSON.stringify({ productIds: ids }),
      { headers: { 'Content-Type': 'application/json' } });
    const rates = res.json('rates');
    for (const id of ids) {
      if (rates[String(id)] === null) kosong.push(id);
    }
  }
  console.log(`Produk tanpa tarif: ${kosong.length} dari ${PRODUCTS}`);
  return { kosong };
}

export default function () {}

export function handleSummary(data) {
  const kosong = data.setup_data ? data.setup_data.kosong : [];
  return { [`${OUT}/produk-tanpa-tarif.csv`]: `${kosong.join('\n')}\n` };
}
