# Fasilitas Platform untuk Pekerjaan Latar

**Disusun oleh:** Tim Platform

- Belum ada message broker (Kafka, RabbitMQ, dan sejenisnya) di produksi. Pengadaannya belum dianggarkan.
- Pekerjaan latar boleh memakai penjadwal di dalam aplikasi dan tabel di database PasarKita.
- Ingat: aplikasi berjalan di 8 instance. Pekerjaan latar yang berjalan di semua instance sekaligus harus aman bila dijalankan bersamaan.
