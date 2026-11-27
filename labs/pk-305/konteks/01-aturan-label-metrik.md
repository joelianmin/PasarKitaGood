# Aturan Label Metrik

**Pemilik:** Tomi (Pemantauan)

1. Satu label metrik boleh punya **paling banyak 100 nilai berbeda**. Label dengan nilai tak terbatas membuat Prometheus kehabisan memori.
2. ID penjual, ID pelanggan, dan ID pesanan **tidak boleh** dipakai sebagai label metrik. PasarKita punya puluhan ribu penjual.
3. Pengelompokan dengan jumlah nilai tetap (misalnya beberapa kelompok ukuran) boleh dipakai.
4. Dashboard "PasarKita Overview": panel "Latency" menampilkan rata-rata seluruh request; panel "p95 per endpoint" menggabungkan semua penjual dalam satu garis per endpoint.
