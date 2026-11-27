# PK-302: Saldo wallet terpotong dua kali

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-302` · Data: skala S*

> **Rina, Customer Service (Senin, 14.20):** Beberapa pelanggan melapor saldo wallet terpotong dua kali, dan di akun mereka muncul dua order yang sama persis dengan selisih kurang dari satu detik.

> **Dewi, Tim Mobile (14.35):** Aplikasi kita otomatis mengulang request kalau koneksi lambat, dan sebagian pengguna juga suka menekan tombol bayar dua kali. Apa kita matikan saja retry otomatisnya?

**Yang diharapkan**

- Pada skenario klik ganda dan retry `task reproduce LAB=pk-302`, setiap percobaan bayar menghasilkan tepat satu order dan satu debit, termasuk saat dua request datang bersamaan.
- Pelanggan yang memang membeli dua kali (dua percobaan bayar yang berbeda) tetap mendapat dua order.
- Untuk setiap wallet: saldo awal dikurangi jumlah total order sama dengan saldo akhir. Query pemeriksaannya dilampirkan di PR.
- Request ulangan mendapat jawaban yang sama dengan request pertama, dan p95 checkout tidak lebih dari 20% di atas patokan.

## Perintah

1. `task lab LAB=pk-302`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task lab:siapkan LAB=pk-302`: mengisi data khusus lab ini. Ulangi sebelum **setiap** run, karena checkout mengubah stok, saldo, dan keranjang.
4. `task reproduce LAB=pk-302` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-302/out/baseline-table.md`.
5. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
6. Commit semua perubahan, lalu `task evidence LAB=pk-302` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-302`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-kontrak-api-mobile.md`](konteks/01-kontrak-api-mobile.md)
- [`02-keputusan-retry.md`](konteks/02-keputusan-retry.md)
- [`03-aturan-wallet.md`](konteks/03-aturan-wallet.md)

## Catatan script k6

- Endpoint: `POST /api/cart/items` lalu `POST /api/checkout` dengan header `Idempotency-Key`, 2 iterasi/detik, 2 menit, pelanggan 3001 sampai 3600.
- Separuh iterasi meniru klik ganda (dua request bersamaan dengan kunci sama), separuh meniru retry (request ulangan 0,5 detik kemudian). Sekitar 20% pelanggan juga membeli lagi dengan kunci baru.
- Script mencetak jumlah percobaan bayar. Hitung order sebenarnya: `SELECT count(*) FROM orders WHERE customer_id BETWEEN 3001 AND 3600 AND created_at > now() - interval '10 minutes';`
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-302/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-302`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
