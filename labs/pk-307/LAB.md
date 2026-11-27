# PK-307: Otorisasi gateway tanpa pesanan lolos dari rekonsiliasi

> Aturan umum, alur kerja, label Issue, dan templat komentar penutupan ada di [`../MINGGU-27Nov-3Des2026.md`](../MINGGU-27Nov-3Des2026.md).
> Tiap anggota kelompok memegang satu tiket. Satu tiket hanya diambil satu orang di satu kelompok.

*Folder lab: `labs/pk-307` · Data: skala S*

> **Lestari, Tim Keuangan (Kamis, 08.30):** Laporan gateway bulan ini mencatat otorisasi yang tidak punya pesanan di sistem kita. Rekonsiliasi harian seharusnya menangkapnya, tapi daftarnya selalu kosong. Pelanggan baru tahu saat melihat mutasi rekening.

> **Sinta, Tim Pembayaran (08.45):** Rekonsiliasi membaca log aplikasi. Kalau daftarnya kosong, mungkin memang tidak ada masalah dan laporan gateway yang salah.

> **Pak Hendra, Senior Developer (09.00):** Biar aman, batalkan saja otorisasinya ke gateway setiap kali checkout gagal.

**Yang diharapkan**

- Pada skenario `task reproduce LAB=pk-307`, jumlah otorisasi di catatan WireMock sama dengan jumlah order tersimpan ditambah jumlah kejadian yang tercatat untuk rekonsiliasi. Tidak ada otorisasi yang hilang dari keduanya.
- Pelanggan yang saldonya tidak cukup ditolak dengan kode status 402, sesuai kebijakan pembayaran.
- Catatan untuk rekonsiliasi mengikuti format di paket konteks.
- p95 checkout tidak lebih dari 10% di atas patokan.

## Perintah

1. `task lab LAB=pk-307`: menyalakan infrastruktur dan mengisi data (lihat skala di atas).
2. `task app` di terminal terpisah.
3. `task lab:siapkan LAB=pk-307`: mengisi data khusus lab ini. Ulangi sebelum **setiap** run, karena checkout mengubah stok, saldo, dan keranjang.
4. `task reproduce LAB=pk-307` sekali untuk pemanasan, lalu tiga kali untuk pengukuran patokan.
   Ringkasan tersimpan di `labs/pk-307/out/baseline-table.md`.
5. Setelah perbaikanmu, ulangi pengukuran dengan cara yang sama dan bandingkan.
6. Commit semua perubahan, lalu `task evidence LAB=pk-307` dan lampirkan berkas bukti di PR. Jangan meng-commit berkas bukti.

Gunakan huruf kecil pada nilai `LAB` (`pk-307`).

## Paket konteks

Dokumen di folder [`konteks/`](konteks/). Tidak semua isinya relevan, dan beberapa isinya menjadi batasan yang harus kamu penuhi.

- [`01-kebijakan-pembayaran.md`](konteks/01-kebijakan-pembayaran.md)
- [`02-cara-kerja-rekonsiliasi.md`](konteks/02-cara-kerja-rekonsiliasi.md)
- [`03-laporan-gateway-november.md`](konteks/03-laporan-gateway-november.md)

## Catatan script k6

- Endpoint: `POST /api/cart/items` lalu `POST /api/checkout`, 3 iterasi/detik, 2 menit, pelanggan 5001 sampai 5600 (5001 sampai 5150 saldonya tidak cukup).
- Di akhir run, script mencetak jumlah otorisasi ke gateway dari catatan WireMock. Hitung baris `REKONSILIASI` di log aplikasi untuk periode run yang sama.
- Beban memakai laju tetap (model terbuka), tanpa threshold lulus atau gagal. Run ini mengukur.
- Jalankan dari root repo. Hasil mentah ada di `labs/pk-307/out/` dan tidak ikut Git.
- `RATE` dan `DURATION` bisa diubah lewat variabel lingkungan (macOS dan Linux: `RATE=1 task reproduce LAB=pk-307`; PowerShell: `$env:RATE=1`) atau `-e RATE=1` pada `k6 run` langsung. Catat perubahan itu di laporanmu.
