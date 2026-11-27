# Laporan Gangguan Vendor Email

**Vendor:** KirimMail · **Tanggal:** Rabu 25 November 2026, 09.30 sampai 11.40 WIB

- Sekitar 30% permintaan kirim gagal dengan status 5xx. Permintaan lain berhasil normal.
- Vendor membatasi **50 permintaan per detik per akun**. Permintaan di atas batas ditolak dan tetap dihitung sebagai kuota.
- Vendor meminta pelanggan tidak mengulang permintaan secara agresif saat gangguan, karena memperpanjang pemulihan.
- Gangguan serupa terjadi dua kali tahun ini, masing-masing kurang dari tiga jam.
