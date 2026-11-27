# PK-306: Checkout lambat untuk keranjang besar

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-306` · Data: skala M*

> **Dewi, Tim Mobile (Kamis, 09.15):** Pelanggan grosir yang membeli 10 produk sekaligus menunggu lebih dari satu detik saat checkout. Kalau hanya satu produk, cepat.

> **Pak Hendra, Senior Developer (09.30):** Pasti karena lock di tabel stok. Semakin banyak produk, semakin banyak baris yang dikunci.

> **Bayu, Product Manager (09.45):** Sepertinya modulith kita sudah tidak sanggup. Apa sudah waktunya dipecah menjadi microservice?

**Yang diharapkan**

- p95 checkout dengan 10 produk turun minimal 50% dari patokan, dan p95 checkout dengan 1 produk tidak naik.
- Total, pajak, dan isi invoice setiap order sama persis dengan sebelum perbaikan, untuk keranjang yang sama.
- Rekomendasi arsitektur (perlu dipecah atau tidak) ditulis di komentar penutupan dan didukung data waktu per modul dari trace.

## Perintah

1. `task lab LAB=pk-306`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task reproduce LAB=pk-306` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-306/out/baseline-table.md`.
4. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
5. Commit semua perubahan, lalu `task evidence LAB=pk-306` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-306`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-dokumentasi-api-pajak.md`](konteks/01-dokumentasi-api-pajak.md)
- [`02-notulen-arsitektur.md`](konteks/02-notulen-arsitektur.md)
- [`03-profil-pelanggan-grosir.md`](konteks/03-profil-pelanggan-grosir.md)

## Catatan script k6

- Dua skenario bersamaan: checkout keranjang 1 produk dan keranjang 10 produk, masing-masing 1 iterasi/detik, 3 menit.
- Trace per request ada di Tempo (Grafana, menu Explore). Pakai untuk melihat waktu per modul.
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-306/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-306`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
