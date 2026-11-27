# Kebijakan Pembayaran

**Versi:** 2.1 · **Berlaku sejak:** 16 November 2026 · **Pemilik:** Tim Pembayaran · Menggantikan versi 2.0

1. Otorisasi gateway harus **berhasil sebelum** stok dan saldo dikurangi secara permanen.
2. Pesanan tidak boleh tersimpan tanpa otorisasi yang berhasil.
3. Bila otorisasi sudah berhasil tetapi pesanan tidak tersimpan, apa pun alasannya, kejadian itu wajib dicatat di log aplikasi pada level **ERROR** dengan format:
   `REKONSILIASI customerId=<id pelanggan> amount=<jumlah> reason=<alasan singkat>`
   Rekonsiliasi harian pukul 01.00 WIB memproses catatan itu. Tidak ada pembatalan otorisasi secara real-time.
4. Notifikasi pesanan bersifat **best-effort**. Kegagalan notifikasi tidak boleh membatalkan pesanan yang sudah berhasil.
5. Pemanggilan gateway tidak boleh diulang otomatis oleh aplikasi, karena berisiko menagih dua kali.
6. **Baru di 2.1:** pelanggan yang saldonya tidak cukup ditolak dengan kode status 402. Aplikasi mobile menyerah bila checkout tidak dijawab dalam **10 detik**, jadi checkout harus selesai (berhasil atau ditolak) sebelum batas itu.
7. **Baru di 2.1:** otorisasi yang tidak dijawab gateway dalam batas waktu klien dianggap gagal, dan diperlakukan sama dengan poin 3.
