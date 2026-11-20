# Laporan latihan membedah tiket: #4821

> Repo contoh. "Ayu" adalah peran contoh yang dimainkan oleh akun repo ini. Semua angka diukur sungguhan.

| | |
| --- | --- |
| Repo kelompok | `PasarKitaGood` |
| Anggota yang mengerjakan | Ayu (pengukuran, penelusuran kode, laporan) |
| Tiket | `#4821`, Issue kelompok: `#2` |
| Kondisi dinyalakan | 19.18.58 WIB (12.18.58 UTC), Jumat 20 November 2026 |
| Jam tiket dilaporkan | 19.28 WIB (12.28 UTC) |
| Laju beban dan lingkungan | `RATE=2` dan `RATE=1`, macOS 12, tanpa Docker (`task native:up`), Intel Core i5-5250U (2 core, 4 thread), RAM 8 GB, data skala S (`task native:seed SCALE=S`) |

## Gejala

Halaman profil toko (`GET /api/sellers/{id}/profile`) melambat dari puluhan milidetik menjadi lebih dari satu detik sejak 12.19 UTC (19.19 WIB), satu menit setelah kondisi dinyalakan. Semua toko terdampak, tetapi toko dengan produk terbanyak (penjual 1) paling lambat. Endpoint lain tidak berubah.

## Reproduksi

1. `task native:up PROFILE=core,observability`, `task native:seed SCALE=S`, `task app`.
2. Sebelum kondisi: `k6 run labs/latihan/profile.k6.js` (2 req/detik, 3 menit, 30% ke penjual 1), didahului pemanasan 30 detik yang dibuang.
3. `task latihan:mulai` pukul 19.18.58 WIB, lalu `task traffic DURATION=12m` untuk pengamatan di Prometheus/Grafana. Traffic dihentikan (selesai 19.31 WIB) **sebelum** pengukuran k6, supaya angka k6 tidak tercampur beban lain.
4. Sesudah kondisi: `k6 run labs/latihan/profile.k6.js` pada 2 req/detik, lalu `RATE=1` karena laptop jenuh (lihat bukti 2).
5. Per penjual: 10 request berurutan dengan `curl -w "%{time_total}"` ke penjual 1, 2, dan 77.
6. Query: `select pg_stat_statements_reset();`, 10 request ke penjual 1, lalu baca `pg_stat_statements`.

## Bukti

| # | Sumber | Pengamatan (fakta, berangka) | Lokasi |
| --- | --- | --- | --- |
| 1 | k6, kondisi mati, 2 req/detik | p50 11,4 ms, p95 18,8 ms, p99 31,8 ms, 0 dari 361 gagal | run 19.15.15 WIB |
| 2 | k6, kondisi menyala, 2 req/detik | **12,5% gagal** (39 dari 311), p50 1,96 s, p95 40,0 s: laptop jenuh, angka ini mengukur antrean | run 19.32.01 WIB |
| 3 | k6, kondisi menyala, 1 req/detik | 0 dari 180 gagal, p50 613 ms, p95 1,67 s, p99 2,56 s | run 19.37.22 WIB |
| 4 | Prometheus, panel "p95 per endpoint" (UTC) | p95 profil 15 sampai 20 ms pada 12.16 sampai 12.19 UTC, lalu 11,7 s pada 12.20 dan 1,7 sampai 3,5 s pada 12.21 sampai 12.31 UTC; p95 katalog tetap 21 sampai 121 ms | query `histogram_quantile(0.95, ...)` dashboard "PasarKita Overview" |
| 5 | Prometheus, panel "CPU proses" | 1 sampai 3% sebelum 12.19 UTC, 16 sampai 35% sesudahnya (traffic latar). Satuan: bagian dari **seluruh** CPU mesin, 4 thread = 100% | `process_cpu_usage` |
| 6 | `ps`, CPU proses aplikasi selama k6 | kondisi mati 1 sampai 6%; menyala 1 req/detik 62 sampai 93%; menyala 2 req/detik sampai 339,5%. Satuan: **per core**, 4 thread = 400% | sampel tiap 8 detik |
| 7 | `curl`, 10 request berurutan | kondisi mati: penjual 1 median 6 ms, penjual 2 7 ms, penjual 77 9 ms. Menyala: penjual 1 **1.403 ms**, penjual 2 665 ms, penjual 77 592 ms | sesudah run 3 |
| 8 | `pg_stat_statements`, 10 request ke penjual 1 | 2 query per request: `seller` 0,038 ms dan `product` (`findTop60...`) 0,241 ms; plus `feature_flag` 2 kali dalam 10 request | sesudah run 3 |
| 9 | Database | `feature_flag`: `seller.dynamic-thumbnail = t` | `select name, enabled from feature_flag` |
| 10 | Kode | `SellerProfileController.profile` membaca flag `seller.dynamic-thumbnail`; bila menyala, `ThumbnailService.thumbnailFor` dipanggil **untuk setiap produk** (sampai 60, dari `findTop60BySellerIdOrderByIdAsc`). `thumbnailFor` membuat gambar 1600 x 1600, mengecilkannya 0,125 kali dengan bicubic, lalu membaca satu piksel untuk membentuk string URL | `catalog/SellerProfileController.java`, `catalog/ThumbnailService.java`, `catalog/FeatureFlags.java` |

## Hipotesis

1. (belum terbukti) Waktu habis di CPU aplikasi untuk membuat gambar thumbnail per produk, bukan di database. Pendukung: query di bawah 1 ms dan hanya satu koneksi aktif (bukti 6, 8), CPU naik tajam (bukti 5, 6), dan waktu penjual 1 dengan 60 produk sekitar dua kali penjual dengan 25 produk (1.403 lawan 665 dan 592 ms; 60/25 = 2,4).
2. (belum terbukti) Pemicunya flag `seller.dynamic-thumbnail` yang menyala pada jam kondisi. Pendukung: lonjakan p95 dimulai satu menit setelah 12.18.58 UTC (bukti 4), dan flag bernilai `t` (bukti 9).

## Yang diabaikan

- `WARN Property 'pasarkita.legacy.timeout' is deprecated`: 54 baris tiap 30 detik sejak aplikasi menyala 19.14.56 WIB, **sebelum** kondisi dinyalakan juga. Tidak berubah saat gejala muncul.
- Lonjakan p95 katalog 121 ms pada 12.20 UTC: hanya satu menit, saat traffic latar baru mulai; menit berikutnya kembali 22 sampai 80 ms.

## Langkah berikutnya

- Matikan flag sebentar (`task latihan:selesai`) dan ukur lagi: bila p95 kembali ke sekitar 19 ms, hipotesis 2 terbukti.
- Ukur waktu `thumbnailFor` sendiri (misalnya 60 panggilan dalam program kecil atau trace di Tempo) untuk membuktikan hipotesis 1.
- Profil JVM atau trace untuk memastikan tidak ada sumber CPU lain.

## Keterbatasan

- Satu laptop dengan 2 core; pada 2 req/detik laptop jenuh, jadi angka utama memakai 1 req/detik.
- Data skala S, satu run per kondisi (ditambah pemanasan yang dibuang).
- Tabel `feature_flag` tidak menyimpan waktu perubahan; jam perubahan flag disimpulkan dari jam `task latihan:mulai` dan panel Prometheus, bukan dari database.
- Penjual 77 sedikit lebih cepat dari penjual 2 dengan jumlah produk sama (592 lawan 665 ms); belum dijelaskan.
