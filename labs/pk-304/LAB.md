# PK-304: Checkout gagal saat layanan email bermasalah

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-304` · Data: skala M*

> **Rina, Customer Service (Rabu, 10.00):** Hari ini banyak checkout gagal. Pelanggan mendapat pesan error saat membayar, padahal saldonya cukup.

> **Tim Infrastruktur (10.12):** Vendor email kita sedang gangguan. Sekitar 30% permintaan kirim email gagal.

> **Bayu, Product Manager (10.20):** Apa hubungannya email dengan checkout? Sepertinya kebetulan saja.

> **Pak Hendra, Senior Developer (10.31):** Kalau memang terkait, tambahkan retry lima kali untuk pengiriman email.

**Yang diharapkan**

- Saat 30% pengiriman email gagal (`task chaos SCENARIO=email-error`), tidak ada checkout yang gagal karena email: tingkat keberhasilan checkout sama dengan saat email normal.
- Setelah layanan email pulih (`task chaos:selesai`), setiap order yang berhasil menerima **tepat satu** email konfirmasi dalam batas waktu di paket konteks. Hitung dari catatan permintaan di WireMock.
- p95 checkout saat email normal tidak lebih dari 10% di atas patokan.

## Perintah

1. `task lab LAB=pk-304`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task reproduce LAB=pk-304` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-304/out/baseline-table.md`.
4. `task chaos SCENARIO=email-error`, lalu `task reproduce LAB=pk-304` lagi untuk mengukur saat gangguan. Matikan dengan `task chaos:selesai`.
5. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
6. Commit semua perubahan, lalu `task evidence LAB=pk-304` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-304`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-kebijakan-notifikasi.md`](konteks/01-kebijakan-notifikasi.md)
- [`02-laporan-vendor-email.md`](konteks/02-laporan-vendor-email.md)
- [`03-fasilitas-platform.md`](konteks/03-fasilitas-platform.md)

## Catatan script k6

- Endpoint: `POST /api/cart/items` lalu `POST /api/checkout`, 2 iterasi/detik, 3 menit.
- Ukur patokan tanpa gangguan, lalu ulangi sesudah `task chaos SCENARIO=email-error` (3 dari setiap 10 email gagal).
- Sesudah run dengan gangguan: `task chaos:selesai`, tunggu, lalu `k6 run labs/pk-304/periksa-email.k6.js` untuk menghitung email konfirmasi per pesanan. Catatan permintaan WireMock dikosongkan di awal setiap run reproduce.
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-304/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-304`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
