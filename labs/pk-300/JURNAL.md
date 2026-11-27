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

## 3. Triage sinyal

## 4. Catatan pengukuran

## 5. Dugaan awal vs temuan (isi di akhir)
