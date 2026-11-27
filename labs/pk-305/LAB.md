# PK-305: Penjual terbesar mengeluh, dashboard bilang aman

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-305` · Data: skala M*

> **Maya, Account Manager (Rabu, 15.00):** Toko Raksasa mengancam pindah platform. Mereka bilang back-office kita sering "hang" sejak awal minggu.

> **Bayu, Product Manager (15.20):** Saya cek dashboard Grafana, latency kita stabil di sekitar 100 ms. Mungkin jaringan di kantor mereka yang bermasalah.

**Yang diharapkan**

- Dashboard Grafana punya panel yang bisa menunjukkan bahwa sekelompok penjual tertentu mengalami latensi buruk, sesuai aturan label metrik di paket konteks. Ekspor JSON dashboard dilampirkan di PR.
- Akar masalah keluhan Toko Raksasa ditemukan dan diperbaiki: p99 endpoint yang dikeluhkan untuk Toko Raksasa turun minimal 80% dari patokan, dengan hasil yang sama untuk penjual lain.
- Komentar penutupan menjelaskan mengapa dashboard lama terlihat aman.

## Perintah

1. `task lab LAB=pk-305`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task reproduce LAB=pk-305` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-305/out/baseline-table.md`.
4. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
5. Commit semua perubahan, lalu `task evidence LAB=pk-305` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-305`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-aturan-label-metrik.md`](konteks/01-aturan-label-metrik.md)
- [`02-catatan-rilis.md`](konteks/02-catatan-rilis.md)
- [`03-profil-akun-toko-raksasa.md`](konteks/03-profil-akun-toko-raksasa.md)

## Catatan script k6

- Tiga skenario bersamaan, 3 menit: Ringkasan Penjualan Toko Raksasa (penjual 1) satu request tiap 10 detik, Ringkasan Penjualan penjual lain 2 req/detik, dan katalog 3 req/detik.
- Endpoint Ringkasan Penjualan ada di modul `reporting`. Bila repomu belum memilikinya, ambil dengan langkah di bagian "Mengambil pembaruan" di `labs/MINGGU-27Nov-3Des2026.md`.
- Dashboard Grafana ada di `infra/compose/grafana`. Ekspor JSON dashboard yang kamu ubah dan lampirkan di PR.
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-305/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-305`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
