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
| | | | |

## 3. Triage sinyal

> Satu baris per sinyal di tiket. Kategori: gejala utama, akibat, kebetulan waktu, noise, dugaan keliru, solusi titipan.

| Sinyal | Kategori | Alasan dan bukti |
| --- | --- | --- |
| | | |

## 4. Catatan pengukuran

> Urut waktu. Tiap baris: jam (WIB), apa yang diukur, hasil (angka dan satuan), lokasi bukti.

-

## 5. Dugaan awal vs temuan (isi di akhir)

> Dugaan awal benar, sebagian, atau salah? Apa yang mengubahnya? Satu sampai tiga kalimat.

