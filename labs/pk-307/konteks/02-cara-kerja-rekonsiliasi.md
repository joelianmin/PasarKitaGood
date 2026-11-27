# Cara Kerja Rekonsiliasi Harian

**Pemilik:** Sinta (Tim Pembayaran)

- Setiap pukul 01.00 WIB, job rekonsiliasi membaca log aplikasi hari sebelumnya dan mengambil baris level ERROR yang diawali `REKONSILIASI`.
- Job mencocokkan baris itu dengan laporan otorisasi dari gateway, lalu meminta pengembalian dana ke pelanggan dalam 1 x 24 jam.
- Otorisasi yang tidak punya pesanan **dan** tidak tercatat di log tidak akan pernah dikembalikan secara otomatis. Pelanggan harus mengajukan keluhan sendiri.
- Baris log dengan format lain diabaikan.
