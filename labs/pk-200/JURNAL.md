# Jurnal diagnosis

> Satu berkas per tiket 20–26 Nov 2026: `labs/pk-20x/JURNAL.md` di repo kelompok (salin dari templat ini).
> Isi **berurutan**: prediksi dulu, sebelum menyentuh alat. Panduan: `docs/materi/09-dari-diagnosis-ke-perbaikan.md`.
> Waktu dalam WIB. Jangan menulis kata sandi, token, atau `GROUP_SEED`.

| | |
| --- | --- |
| Tiket | `PK-200` (lanjutan #4821), Issue kelompok `#5`; diagnosis di Issue `#2`, PR `#3` |
| Pemilik | Ayu (peran contoh; akun repo ini) |
| Peninjau PR | Bimo, Citra (peran contoh) |

## 1. Prediksi (isi sebelum mengukur)

> Dugaan penyebab, satu atau dua, ditandai belum terbukti. Tidak dinilai benar atau salah.

| # | Dugaan (belum terbukti) | Yang akan saya ukur | Hasil yang saya harapkan |
| --- | --- | --- | --- |
| 1 | Waktu habis di `ThumbnailService.thumbnailFor`, dipanggil per produk (sampai 60) | Waktu 60 panggilan `thumbnailFor` di luar aplikasi | Sekitar 1 detik, setara median penjual 1 di #2 (1.403 ms) |
| 2 | Mematikan flag mengembalikan p95 ke kondisi semula, tapi mengubah isi respons | `task reproduce` flag mati, lalu bandingkan JSON flag mati dan menyala | p95 sekitar 19 ms; field `thumbnail` berbeda |
| 3 | Membuat gambar langsung kecil akan mengubah URL thumbnail, jadi tidak boleh dipakai | URL dari cara sekarang dan cara langsung kecil untuk produk yang sama | URL berbeda |

Waktu menulis (WIB): `07.31`, sebelum mengukur apa pun untuk PK-200.

## 2. Daftar asumsi dan batasan

> Satu baris per batasan dari paket konteks. Jenis: **keras** (kebijakan, kontrak, SLA, keputusan resmi), **konteks**, **pendapat**, atau **tidak relevan** (tulis alasannya).

| Batasan | Sumber (berkas dan bagian) | Jenis | Dampak pada pilihan |
| --- | --- | --- | --- |
| Flag `seller.dynamic-thumbnail` tetap menyala; mematikan hanya darurat sementara, dengan persetujuan Product, dicatat sebagai insiden | `konteks/01-keputusan-produk-thumbnail.md` poin 1-2 | Keras | Usul Eko (matikan flag) bukan perbaikan |
| URL thumbnail `/thumbnails/<id>-<kode warna>.jpg` tidak boleh berubah | `konteks/01-keputusan-produk-thumbnail.md` poin 3, `konteks/02-thread-cdn.md` | Keras | Perbaikan harus menghasilkan URL yang sama persis |
| Perubahan kode warna membuat CDN membuat ulang semua gambar (lalu lintas server gambar naik 8 kali, ditagihkan) | `konteks/02-thread-cdn.md`, `konteks/03-anggaran-infrastruktur.md` | Konteks | Alasan biaya di balik batasan URL |
| Thumbnail profil ditampilkan 200 x 200; gambar 1600 x 1600 hanya untuk zoom di detail produk | `konteks/02-thread-cdn.md` (Rudi, 09.41) | Konteks | Profil tidak butuh gambar 1600 x 1600 |
| Tidak ada anggaran server aplikasi tambahan kuartal ini; di luar anggaran butuh Komite Arsitektur (sebulan sekali) | `konteks/03-anggaran-infrastruktur.md` | Keras | Usul Dimas (tambah server) tidak tersedia dalam tiket ini |

## 3. Triage sinyal

> Satu baris per sinyal di tiket. Kategori: gejala utama, akibat, kebetulan waktu, noise, dugaan keliru, solusi titipan.

| Sinyal | Kategori | Alasan dan bukti |
| --- | --- | --- |
| Profil butuh beberapa detik, toko besar paling parah | Gejala utama | #2 dan pengukuran di bawah |
| "Diagnosisnya sudah ada di tiket #4821" (Maya) | Konteks | Issue #2: hipotesis CPU thumbnail per produk |
| "Matikan saja flag thumbnail-nya" (Eko) | Solusi titipan | Melanggar keputusan produk (flag tetap menyala) dan mengubah URL di respons |
| "Tambah server aplikasi" (Dimas) | Solusi titipan | Tidak ada anggaran; dan pada 1 req/detik pun satu request penjual 1 butuh lebih dari 1 detik, jadi server tambahan tidak membuat satu request lebih cepat |

## 4. Catatan pengukuran

> Urut waktu. Tiap baris: jam (WIB), apa yang diukur, hasil (angka dan satuan), lokasi bukti.

Laptop: Intel Core i5-5250U (2 core, 4 thread), RAM 8 GB, macOS 12, tanpa Docker, data skala S. Skrip: `task reproduce LAB=pk-200` (sama dengan `k6 run labs/pk-200/reproduce.k6.js`), pemanasan 30 detik dibuang.

- **Jumat 20 Nov 19.45 sampai Sabtu 21 Nov 07.30 WIB: jeda.** Menunggu pembaruan templat (`labs/pk-200`); dicatat di Issue #1.
- **07.31 WIB, flag mati, 2 req/detik, 3 menit:** penjual 1 p50 8 ms, p95 22 ms; penjual lain p50 9 ms, p95 23 ms; 0% gagal.
- **07.35.36 WIB:** `task latihan:mulai` (flag menyala).
- **07.35 WIB, flag menyala, 2 req/detik:** penjual 1 40,7% gagal, penjual lain 35,9% gagal; p50 sekitar 30 s (batas k6 60 s). Laptop jenuh; CPU aplikasi (`ps`, per core, 4 thread = 400%) 137 sampai 299%.
- **07.41 WIB, flag menyala, 1 req/detik:** penjual 1 p50 1.741 ms, p95 4.537 ms; penjual lain p50 664 ms, p95 1.413 ms; 0% gagal. `curl` 10 request: penjual 1 median 2.373 ms, penjual 2 838 ms, penjual 77 711 ms. Angka ini lebih lambat daripada run #2 kemarin (penjual 1 1.403 ms); penyebab selisih belum diketahui (laptop sama, data sama).
- **`pg_stat_statements` (10 request penjual 1):** `seller` 0,048 ms, `product` 1,283 ms, `feature_flag` 2 kali. Database tetap bukan penyebab.
- **Prediksi 2 diuji:** JSON profil flag mati vs menyala, penjual 1, 2, 77: semua field sama kecuali `thumbnail` (60, 25, 25 produk berbeda; `/images/10.jpg` vs `/thumbnails/10-ffb9bbe3.jpg`). **Benar:** mematikan flag mengubah respons.
- **Prediksi 1 dan 3 diuji** dengan `java -Djava.awt.headless=true -Dn=255 labs/pk-200/BandingThumbnail.java`: 60 thumbnail cara sekarang 934 ms, cara langsung 200 x 200 16 ms. Prediksi 1 **benar** (setara waktu satu request penjual 1). URL berbeda: **0 dari 255** produk. Warna hanya bergantung pada `productId * 37 % 255`, dan karena 37 dan 255 tidak punya faktor bersama, produk 1 sampai 255 mencakup semua 255 kemungkinan warna. Prediksi 3 **salah**.

## Alternatif

| Alternatif | Akar masalah | Batasan | Biaya dan risiko | Bisa dibatalkan |
| --- | --- | --- | --- | --- |
| A. Matikan flag (Eko) | Menghindari | **Melanggar**: keputusan produk dan URL berubah | Insiden, butuh persetujuan Product | Mudah |
| B. Tambah server aplikasi (Dimas) | Tidak: satu request tetap lebih dari 1 detik | **Melanggar** anggaran | Biaya, Komite Arsitektur | Sulit |
| C. Simpan hasil per produk di memori | Sebagian: tiap produk tetap mahal sekali, request pertama tetap lambat | Terpenuhi | Memori bertambah sebanding jumlah produk | Mudah |
| D. Buat gambar langsung 200 x 200 | **Ya**: pekerjaan 1600 x 1600 dihapus | Terpenuhi: URL sama untuk 0 beda dari 255 | Tanpa state; 934 ms menjadi 16 ms per 60 thumbnail | Mudah (satu berkas) |

Dipilih **D**. Sebelum diuji, D hampir saya tolak karena prediksi 3; uji 255 warna menggugurkan prediksi itu.

## 5. Dugaan awal vs temuan (isi di akhir)

> Dugaan awal benar, sebagian, atau salah? Apa yang mengubahnya? Satu sampai tiga kalimat.

