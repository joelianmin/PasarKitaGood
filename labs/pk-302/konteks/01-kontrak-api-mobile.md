# Kontrak API Aplikasi Mobile untuk Checkout

**Pemilik:** Dewi (Tim Mobile) · **Berlaku sejak:** aplikasi versi 4.2 (Agustus 2026)

- Setiap **percobaan bayar** membawa header `Idempotency-Key` berisi UUID.
- Request ulangan untuk percobaan bayar yang sama, baik karena retry otomatis maupun tombol ditekan lagi, memakai kunci yang **sama**.
- Percobaan bayar baru (pelanggan sengaja membeli lagi) memakai kunci **baru**.
- Retry otomatis: maksimal 2 kali, bila tidak ada jawaban dalam 3 detik.
- Aplikasi web dan aplikasi mobile versi lama (di bawah 4.2, sekitar 6% pengguna) tidak mengirim header ini.
