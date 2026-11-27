# Temuan Audit Konfigurasi Aplikasi

**Disusun oleh:** Tim Platform · **Tanggal:** 20 November 2026

| Item | Dokumen | Hasil pemeriksaan |
| --- | --- | --- |
| Koneksi database maksimum per instance | 10 | Sesuai |
| Thread Tomcat per instance | 200 (bawaan) | Sesuai |
| Batas waktu pemanggilan layanan luar | Laporan insiden 4 November menyebut 5 detik | Belum diverifikasi |
| Log level produksi | INFO | Sesuai |

- Batas koneksi database tetap 10 per instance sampai penambahan memori server (kuartal 2 tahun 2027). Lihat dokumen kapasitas database.
- Menambah thread Tomcat menambah memori per instance; memori instance saat ini terpakai 78%.
