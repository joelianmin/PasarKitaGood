# Arsitektur Produksi PasarKita

**Disusun oleh:** Tim Platform · **Data per 1 Oktober 2026**

- Aplikasi berjalan di **8 instance** di belakang load balancer. Permintaan dibagi bergantian; tidak ada sesi lengket, jadi dua permintaan dari pelanggan yang sama bisa sampai ke instance berbeda.
- Satu database PostgreSQL primer melayani semua instance. Tingkat isolasi transaksi bawaan: `READ COMMITTED`.
- Mengubah tingkat isolasi untuk seluruh aplikasi memerlukan persetujuan DBA, karena memengaruhi semua modul.
- Penambahan instance di luar anggaran kuartal ini memerlukan persetujuan Komite Arsitektur, yang bersidang sebulan sekali.
