# PK-300: Invoice tanpa pajak untuk sebagian produk

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-300` · Data: skala S · Tiket contoh · Dikerjakan di https://github.com/joelianmin/PasarKitaGood*

> **Lestari, Tim Keuangan (Senin, 09.05):** Rekap pajak November tidak cocok. Ada pesanan yang kolom pajaknya Rp0, padahal produknya kena pajak. Kami belum tahu sejak kapan.

> **Bayu, Product Manager (09.20):** Nilainya kecil dibanding total penjualan. Bisa kita abaikan dulu?

> **Pak Hendra, Senior Developer (09.35):** Kalau tarifnya kosong, pakai saja 11%. Itu tarif yang paling umum.

**Yang diharapkan**

- Tidak ada pesanan baru yang tersimpan dengan pajak Rp0 untuk produk yang tarifnya belum tersedia.
- Checkout yang ditolak memberi kode status dan pesan yang jelas, dan keranjang pelanggan tidak berubah.
- Checkout untuk produk yang tarifnya tersedia tetap berhasil, dengan p95 tidak lebih dari 10% di atas patokan.
- Pesanan lama yang terdampak (pajak produk yang tarifnya belum tersedia tercatat Rp0) bisa ditemukan dengan satu query SQL yang dilampirkan di PR.

## Perintah

1. `task lab LAB=pk-300`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task lab:siapkan LAB=pk-300`: mengisi data khusus lab ini. Ulangi sebelum **setiap** run, karena checkout mengubah stok, saldo, dan keranjang.
4. `task reproduce LAB=pk-300` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-300/out/baseline-table.md`.
5. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
6. Commit semua perubahan, lalu `task evidence LAB=pk-300` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-300`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-aturan-pajak.md`](konteks/01-aturan-pajak.md)
- [`02-thread-tim-pajak.md`](konteks/02-thread-tim-pajak.md)
- [`03-rekap-pajak-november.md`](konteks/03-rekap-pajak-november.md)

## Catatan script k6

- Tiket contoh. Pengerjaan lengkapnya (Issue, jurnal, PR, tinjauan, bukti, komentar penutupan) ada di https://github.com/joelianmin/PasarKitaGood.
- Endpoint: `POST /api/cart/items` lalu `POST /api/checkout`, laju 2 iterasi/detik, 3 menit, satu pelanggan baru per iterasi (6001 sampai 7000). Sekitar 20% iterasi memakai produk yang tarifnya belum ditetapkan.
- Ringkasan dipisah: checkout produk bertarif dan checkout produk tanpa tarif, beserta jumlah per kode status.
- `task lab:siapkan LAB=pk-300` juga membuat data lama seperti di produksi: pesanan sejak 1 November yang memuat produk tanpa tarif.
- Pesanan dari run ini yang pajaknya Rp0: `SELECT count(*) FROM orders WHERE customer_id BETWEEN 6001 AND 7000 AND tax = 0;`
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-300/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-300`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
