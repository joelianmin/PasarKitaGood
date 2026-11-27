// Pembantu bersama untuk lab PK-3xx: satu summary.json berisi tabel waktu per endpoint dan tabel kode status per kasus.
import { ringkasan } from './ringkasan.js';
import { ringkasanStatus } from './status.js';

export function ringkasanGabung(data, out, rows, kasus, kodeStatus, catatan) {
  const waktu = ringkasan(data, out, rows);
  const status = ringkasanStatus(data, out, kasus, kodeStatus);
  const tambahan = catatan ? `\n${catatan}\n` : '';
  const table = `${waktu[`${out}/baseline-table.md`]}\n${status[`${out}/baseline-table.md`]}${tambahan}`;
  return {
    [`${out}/summary.json`]: JSON.stringify(data, null, 2),
    [`${out}/baseline-table.md`]: table,
    stdout: `\nRingkasan per endpoint\n\n${waktu[`${out}/baseline-table.md`]}\nKode status per kasus\n\n${status[`${out}/baseline-table.md`]}${tambahan}`,
  };
}

// Menghitung permintaan di catatan WireMock (journal). Dipakai di setup() dan teardown().
export function hitungWireMock(http, wiremock, method, url) {
  const res = http.post(`${wiremock}/__admin/requests/count`, JSON.stringify({ method, url }),
    { headers: { 'Content-Type': 'application/json' } });
  return res.status === 200 ? res.json('count') : null;
}
