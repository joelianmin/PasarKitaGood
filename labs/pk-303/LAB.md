# PK-303: Seluruh aplikasi lumpuh saat payment gateway tidak membalas

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-303` · Data: skala M*

> **Alert monitoring (Selasa, 14.02):** Rasio error semua endpoint di atas 50%.

> **Rina, Customer Service (14.05):** Bukan cuma pembayaran yang error. Katalog dan login juga tidak bisa dibuka.

> **Halaman status payment gateway (14.06):** Sebagian permintaan otorisasi tidak mendapat jawaban sama sekali sejak pukul 13.55. Kami sedang menyelidiki.

> **Pak Hendra, Senior Developer (14.15):** Pool koneksi dan thread Tomcat kita terlalu kecil untuk kondisi seperti ini. Besarkan keduanya.

**Yang diharapkan**

- Saat gateway tidak membalas (`task chaos SCENARIO=gateway-hang`), p95 katalog dan login tidak lebih dari dua kali patokan, dan tingkat error keduanya 0%.
- Setiap checkout selesai dalam batas waktu yang ditetapkan di paket konteks, dengan kode status yang jelas.
- Tidak ada pembayaran yang berakhir tanpa status yang jelas: setiap percobaan bayar berakhir sebagai order tersimpan, atau ditolak tanpa saldo dan stok berubah.
- Pengaturan pool koneksi database tidak diubah.

## Perintah

1. `task lab LAB=pk-303`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task reproduce LAB=pk-303` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-303/out/baseline-table.md`.
4. `task chaos SCENARIO=gateway-hang`, lalu `task reproduce LAB=pk-303` lagi untuk mengukur saat gangguan. Matikan dengan `task chaos:selesai`.
5. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
6. Commit semua perubahan, lalu `task evidence LAB=pk-303` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-303`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-kebijakan-pembayaran.md`](konteks/01-kebijakan-pembayaran.md)
- [`02-sla-vendor-gateway.md`](konteks/02-sla-vendor-gateway.md)
- [`03-temuan-audit-konfigurasi.md`](konteks/03-temuan-audit-konfigurasi.md)

## Catatan script k6

- Tiga skenario bersamaan: katalog `GET /api/products/{id}` 8 req/detik, login 1 req/detik, checkout 2 iterasi/detik, 3 menit. Batas waktu tiap request di k6 30 detik.
- Ukur patokan tanpa gangguan, lalu ulangi sesudah `task chaos SCENARIO=gateway-hang`. Script menghitung checkout yang lebih dari 10 detik.
- Sesudah run dengan gangguan: `task chaos:selesai`, lalu restart aplikasi (`task app`) bila request masih tertahan.
- Orang yang mengerjakan PK-207 pada 20–26 Nov tidak mengambil tiket ini.
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-303/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-303`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
