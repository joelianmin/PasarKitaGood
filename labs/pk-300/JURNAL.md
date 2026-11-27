# Jurnal diagnosis

> Satu berkas per tiket: `labs/pk-30x/JURNAL.md`. Isi **berurutan**: prediksi dulu, sebelum menyentuh alat.
> Panduan: `docs/materi/09-dari-diagnosis-ke-perbaikan.md`. Waktu dalam WIB. Jangan menulis kata sandi, token, atau `GROUP_SEED`.

| | |
| --- | --- |
| Tiket | `PK-300` (tiket contoh 27 Nov – 3 Des 2026), Issue `#21`; rencana sesi Issue `#20` |
| Pemilik | Ayu (peran contoh; akun repo ini) |
| Peninjau PR | Bimo, Citra (peran contoh) |

## 1. Prediksi (isi sebelum mengukur)

> Dugaan penyebab, satu atau dua, ditandai belum terbukti. Tidak dinilai benar atau salah.

| # | Dugaan (belum terbukti) | Yang akan saya ukur | Hasil yang saya harapkan |
| --- | --- | --- | --- |
| 1 | Aplikasi mengubah jawaban kosong atau error dari layanan pajak menjadi tarif 0, tanpa error | Jawaban layanan pajak untuk produk yang pesanannya berpajak Rp0, dan jalur kode dari checkout ke tarif | Layanan pajak membalas sesuatu yang bukan angka, dan kode mengubahnya menjadi 0 |
| 2 | Menolak checkout akan mengosongkan keranjang pelanggan, karena checkout menghapus keranjang | Isi `cart_item` sebelum dan sesudah checkout yang ditolak | Keranjang hilang, jadi perbaikan butuh langkah tambahan untuk menyimpannya |
| 3 | Perbaikan tidak memengaruhi waktu checkout produk bertarif | p95 baris "produk bertarif" sebelum dan sesudah | Selisih di bawah 10% |

Waktu menulis (WIB): `09.55`, sebelum mengukur apa pun untuk PK-300.

## 2. Daftar asumsi dan batasan

> Satu baris per batasan dari paket konteks. Jenis: **keras** (kebijakan, kontrak, SLA, keputusan resmi), **konteks**, **pendapat**, atau **tidak relevan** (tulis alasannya).

| Batasan | Sumber (berkas dan bagian) | Jenis | Dampak pada pilihan |
| --- | --- | --- | --- |
| Tarif ditentukan layanan pajak; aplikasi tidak boleh menetapkan, menebak, atau memakai tarif cadangan | `konteks/01-aturan-pajak.md` poin 1 | Keras | Usul Pak Hendra (pakai 11%) tidak boleh |
| Salah pungut, terlalu rendah maupun terlalu tinggi, didenda; 11% hanya untuk sebagian kategori | `konteks/01-aturan-pajak.md` poin 2 | Keras | Tarif 0 dan tarif tebakan sama-sama salah |
| Transaksi tanpa tarif tidak boleh selesai; pelanggan diberi tahu; keranjang tidak boleh hilang | `konteks/01-aturan-pajak.md` poin 3 | Keras | Perbaikan: tolak checkout dengan pesan jelas, keranjang tetap |
| Koreksi pesanan lama dikerjakan Tim Keuangan; tim teknis cukup menyerahkan daftar | `konteks/01-aturan-pajak.md` poin 4 | Keras | PR tidak mengubah data lama, hanya menyerahkan query |
| Untuk kategori baru, layanan pajak membalas 200 dengan `"rate": null` sampai tarif ditetapkan (perkiraan pertengahan Desember) | `konteks/02-thread-tim-pajak.md` (Yoga, 10.15) | Konteks | `null` berarti "tarif belum ada", bukan error jaringan |
| Layanan pajak kadang membalas 5xx saat pemeliharaan, Minggu dini hari, kurang dari 10 menit | `konteks/02-thread-tim-pajak.md` (Yoga, 10.42) | Konteks | Di luar gejala tiket ini (lihat catatan pengukuran); masuk tindak lanjut |
| Pajak Rp0 baru muncul November; Oktober nol | `konteks/03-rekap-pajak-november.md` | Konteks | Cocok dengan kategori baru mulai 1 November |
| Selisih pembulatan Rp1 | `konteks/03-rekap-pajak-november.md` | Tidak relevan | Sudah diterima auditor sejak 2025 |

## 3. Triage sinyal

> Satu baris per sinyal di tiket. Kategori: gejala utama, akibat, kebetulan waktu, noise, dugaan keliru, solusi titipan.

| Sinyal | Kategori | Alasan dan bukti |
| --- | --- | --- |
| Pesanan November berpajak Rp0, padahal produknya kena pajak (Lestari) | Gejala utama | Pengukuran di bagian 4 |
| "Belum tahu sejak kapan" (Lestari) | Konteks | Rekap: mulai November, bersamaan dengan kategori baru 1 November |
| "Nilainya kecil, abaikan dulu" (Bayu) | Dugaan keliru | Rp61,3 juta sampai 22 Nov dan salah pungut didenda (aturan pajak poin 2) |
| "Kalau tarif kosong, pakai saja 11%" (Pak Hendra) | Solusi titipan | Melanggar aturan pajak poin 1 dan 2 |

## 4. Catatan pengukuran

> Urut waktu. Tiap baris: jam (WIB), apa yang diukur, hasil (angka dan satuan), lokasi bukti.

Komputer uji: Intel Core i5-5250U (2 core, 4 thread), RAM 8 GB, macOS 12, tanpa Docker, data skala S. Skrip: `task reproduce LAB=pk-300` (2 iterasi/detik, 3 menit, sekitar 20% produk tanpa tarif), didahului `task lab:siapkan LAB=pk-300` sebelum tiap run.

- **Jalur kode dibaca:** `CheckoutService.checkout` memanggil `PricingService.quote`, yang memanggil `TaxClient.rateFor` sekali per baris keranjang. `TaxClient.rateFor` mengembalikan `BigDecimal.ZERO` bila jawaban kosong atau `rate` bernilai `null` (`TaxClient.java` baris 23).
- **Layanan pajak:** `GET /tax/rate?productId=1200` dan `4300` membalas `{"rate":null}`; `1201` membalas `{"rate":0.11}`. `labs/pk-300/produk-tanpa-tarif.k6.js` menemukan 50 dari 5.000 produk tanpa tarif. Script ini dijalankan sekali saat run patokan berlangsung (sekitar 10.05 WIB, 100 permintaan ke layanan tiruan); pengaruhnya pada waktu respons tidak diukur.
- **Prediksi 1 benar:** layanan pajak membalas `null`, kode mengubahnya menjadi tarif 0.
- **Patokan (kode lama), 09.58 sampai 10.10 WIB:** pemanasan dibuang, lalu tiga run.

| Run (mulai WIB) | Bertarif p50 / p95 (ms) | Bertarif: 200 / 409 | Tanpa tarif: 200 / 409 | Pesanan berpajak Rp0 di database |
| --- | --- | --- | --- | --- |
| 1 (10.01.36) | 317 / 369 | 288 / 0 | 72 / 1 | 72 |
| 2 (10.04.39) | 321 / 388 | 288 / 0 | 67 / 6 | 67 |
| 3 (10.07.42) | 318 / 346 | 288 / 0 | 72 / 0 | 72 |

  409 berarti stok produk acak itu habis, bukan masalah pajak. Jumlah pesanan berpajak Rp0 dihitung per jendela jam run, dan sama dengan jumlah checkout produk tanpa tarif yang berhasil. Median p95 produk bertarif: **369 ms**, jadi target sesudah perbaikan: ≤ 1,1 × 369 = **406 ms**.

## Alternatif

| Alternatif | Akar masalah | Batasan | Biaya dan risiko | Bisa dibatalkan |
| --- | --- | --- | --- | --- |
| A. Abaikan dulu (Bayu) | Tidak | **Melanggar** aturan pajak poin 2 (denda) dan 3 | Pajak tak terpungut terus bertambah | - |
| B. Pakai 11% bila tarif kosong (Pak Hendra) | Menutupi | **Melanggar** aturan pajak poin 1 dan 2: tarif ditebak, 11% hanya sebagian kategori | Salah pungut ke atas juga didenda | Mudah |
| C. Simpan pesanan dengan status "menunggu tarif" | Sebagian | **Melanggar** aturan pajak poin 3: transaksi tanpa tarif tidak boleh diselesaikan | Saldo dan stok sudah berkurang untuk pesanan yang belum sah | Sulit |
| D. Tolak checkout dengan kode status dan pesan jelas | **Ya**: tarif kosong tidak lagi dianggap 0 | Terpenuhi: tidak menebak, tidak menyelesaikan, keranjang tetap | Pelanggan belum bisa membeli produk itu sampai tarif ditetapkan (perkiraan pertengahan Desember) | Mudah (dua berkas) |
| E. Sembunyikan produk tanpa tarif dari katalog | Mencegah, tidak memperbaiki | Terpenuhi | Katalog harus bertanya ke layanan pajak untuk setiap produk; tetap butuh D sebagai pengaman | Sedang |

Dipilih **D**. E dicatat sebagai tindak lanjut untuk Product: pelanggan sebaiknya tahu sebelum checkout.

## Perbaikan dan pengukuran ulang

- **10.12 WIB:** commit `d930833` menambah `TaxClientTest` (4 test) dan `TaxRateUnavailableException` yang belum dipakai. Pada kode lama: **3 dari 4 gagal** ("Expecting code to raise a throwable"); test produk bertarif lulus.
- **10.13 WIB:** commit `3012ece`: `TaxClient` melempar `TaxRateUnavailableException` untuk tarif `null` atau jawaban tanpa tarif; `CheckoutController` menjawab 422 dengan `ProblemDetail`. Test yang sama: **4 dari 4 lulus**; `ThumbnailServiceTest` (PK-200) dan `ModularityTests` tetap lulus.
- **10.14 WIB:** aplikasi dijalankan ulang dari cabang `pk-300`.
- **Prediksi 2 diuji:** pelanggan 6999, keranjang berisi produk 1200, checkout: 422 `{"title":"Tarif pajak belum tersedia","detail":"Produk 1200 belum bisa dibeli: tarif pajaknya belum tersedia.","productId":1200}`. Keranjang sebelum 1 item, sesudah 1 item; pesanan baru 0. **Salah:** checkout berjalan dalam satu transaksi, jadi penghapusan keranjang ikut dibatalkan. Tidak perlu langkah tambahan.
- **10.14 sampai 10.27 WIB, kode baru, flag dan data sama:** pemanasan dibuang, lalu tiga run.

| Run (mulai WIB) | Bertarif p50 / p95 (ms) | Bertarif: 200 / 409 | Tanpa tarif: 200 / 422 | Pesanan berpajak Rp0 di database |
| --- | --- | --- | --- | --- |
| 1 (10.18.02) | 315 / 400 | 288 / 0 | 0 / 72 | 0 |
| 2 (10.21.07) | 315 / 346 | 286 / 2 | 0 / 72 | 0 |
| 3 (10.24.10) | 314 / 355 | 287 / 1 | 0 / 73 | 0 |

  Median p95 produk bertarif **355 ms** (patokan 369 ms). Checkout produk tanpa tarif sekarang ditolak dalam sekitar 60 ms, karena berhenti sebelum stok, gateway, dan notifikasi.
- **10.27 WIB:** `task evidence LAB=pk-300` dari commit `3012ece` dengan pohon kerja bersih (jurnal disimpan sementara dengan `git stash`), hash `35e75cea...029bedfe`.
- **10.29 WIB, pesanan lama:** `produk-tanpa-tarif.k6.js` (50 produk), lalu `pesanan-terdampak.sql`: **448 pesanan** sejak 1 November. 166 berasal dari riwayat data (termasuk 2 pesanan seed bertanggal 27 November dini hari), 282 dibuat oleh run patokan sebelum perbaikan (71 + 72 + 67 + 72). Query tidak mengubah data; daftar diserahkan ke Tim Keuangan.

| Target tiket | Hasil | Terpenuhi? |
| --- | --- | --- |
| Tidak ada pesanan baru berpajak Rp0 untuk produk tanpa tarif | 0 di ketiga run (sebelumnya 72, 67, 72) | Ya |
| Checkout ditolak dengan kode status dan pesan jelas, keranjang tetap | 422 dengan pesan yang menyebut produk; keranjang tetap 1 item | Ya |
| Produk bertarif tetap berhasil, p95 ≤ 1,1 × patokan | 200; 355 ms ≤ 406 ms | Ya |
| Pesanan lama ditemukan dengan satu query | `pesanan-terdampak.sql`: 448 pesanan | Ya |

## 5. Dugaan awal vs temuan (isi di akhir)

Prediksi 1 (tarif kosong dianggap 0) **benar**, terlihat langsung di `TaxClient`. Prediksi 2 (keranjang hilang bila checkout ditolak) **salah**: seluruh checkout satu transaksi, jadi penolakan membatalkan penghapusan keranjang juga; tanpa mengujinya, saya akan menambah kode penyimpan keranjang yang tidak perlu. Prediksi 3 (waktu produk bertarif tidak berubah) **benar**: 369 lalu 355 ms, selisih dalam variasi antar run.
