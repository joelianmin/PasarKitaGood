# Notulen Rapat Arsitektur

**Tanggal:** 15 Juni 2026 · **Hadir:** Tim Platform, Pak Hendra, Bayu

- PasarKita tetap modulith: satu aplikasi, modul dengan batas yang jelas, satu database.
- Modul dipecah menjadi layanan terpisah hanya bila: (a) dikelola tim yang berbeda, (b) **data menunjukkan** kebutuhan skala modul itu jauh berbeda dari modul lain, atau (c) perlu dirilis terpisah secara rutin.
- Memecah layanan menambah pemanggilan jaringan di antara modul.
- Usul pindah bahasa pemrograman ditunda.
