# Menjalankan sendiri

Berkas ini untuk yang ingin menjalankan aplikasi PasarKita dan mengulang pengukuran di repo contoh ini. Untuk membaca
contohnya saja, cukup [`README.md`](README.md) dan [`KRONOLOGI.md`](KRONOLOGI.md).

Angkamu akan berbeda dari angka di repo ini karena komputernya berbeda; yang dibandingkan adalah polanya. Hasil ukur di
repo ini diambil di komputer uji Intel Core i5-5250U (2 core, 4 thread), RAM 8 GB, macOS 12, tanpa Docker, data skala S.

## Prasyarat

JDK 21, Docker Desktop (backend WSL2 di Windows), Git, k6, dan Task (go-task).
Di Windows:

```powershell
winget install EclipseAdoptium.Temurin.21.JDK
winget install Git.Git
winget install Task.Task
```

Docker Desktop dan k6 dipasang dari installer resmi masing-masing.

## Mulai cepat

```powershell
task doctor                          # periksa lingkungan
task up PROFILE=core,observability   # PostgreSQL, Prometheus, Grafana, Tempo, WireMock
task seed SCALE=S                    # migrasi skema + data contoh (skala M untuk Lab 0)
task app                             # aplikasi di http://localhost:8080
task test                            # test fungsional (butuh Docker untuk Testcontainers)
```

Ketik `task --list` untuk semua perintah.

Tidak bisa memakai Docker (misalnya macOS 12)? Lihat [`infra/native/README.md`](infra/native/README.md)
untuk menjalankan semua komponen pendukung tanpa Docker (`task native:up`).

Baru di proyek ini? Mulai dari [`docs/MATERI-DASAR.md`](docs/MATERI-DASAR.md): daftar isi
dan jalur belajar untuk sembilan bagian materi (fondasi, lingkungan kerja, memahami sistem,
mengukur, mutu dan desain, diagnosa dan latihan, menyerahkan hasil, contoh pengerjaan tiket,
dari diagnosis ke perbaikan) beserta referensi.

| Alamat | Isi |
| --- | --- |
| http://localhost:8080/actuator/health | Status aplikasi |
| http://localhost:3000 | Grafana, dashboard "PasarKita Overview" di folder PasarKita |
| http://localhost:9090 | Prometheus |
| http://localhost:8089 | WireMock: API pajak, payment gateway, dan notifikasi tiruan |

Akun contoh: `user1@pasarkita.test` sampai `userN@pasarkita.test`, password `rahasia123`.
Endpoint keranjang dan checkout memakai header `X-Customer-Id`.

Petunjuk lab ada di [`labs/README.md`](labs/README.md). Repo ini tidak berubah sendiri saat repo induk PasarKita
diperbarui; cara mengambil pembaruan ada di [`docs/PANDUAN-PEMBARUAN.md`](docs/PANDUAN-PEMBARUAN.md).

## Mengulang pengukuran contoh

**Diagnosis #4821** (tanpa perubahan kode):

```bash
task native:up PROFILE=core,observability   # atau: task up PROFILE=core,observability bila memakai Docker
task native:seed SCALE=S
task app                                     # terminal lain
k6 run labs/latihan/profile.k6.js            # sebelum flag menyala
task latihan:mulai
RATE=1 k6 run labs/latihan/profile.k6.js     # sesudah flag menyala; turunkan RATE bila banyak request gagal
task latihan:selesai
```

Hasil di komputer uji: sebelum flag menyala p95 sekitar 19 ms; sesudahnya p50 sekitar 0,6 detik pada 1 req/detik.
Rincian: [`labs/latihan/LAPORAN-4821.md`](labs/latihan/LAPORAN-4821.md).

**Perbaikan PK-200:**

```bash
./mvnw test -Dtest=ThumbnailServiceTest -Dsurefire.failIfNoSpecifiedTests=false   # tanpa Docker
java -Djava.awt.headless=true -Dn=255 labs/pk-200/BandingThumbnail.java          # URL berbeda: 0 dari 255
task native:seed SCALE=S && task app                                             # terminal lain
task latihan:selesai && task reproduce LAB=pk-200                                # patokan flag mati
task latihan:mulai   && task reproduce LAB=pk-200                                # flag menyala
task evidence LAB=pk-200                                                         # dari commit yang bersih
```

Untuk melihat keadaan sebelum perbaikan, jalankan aplikasi dari commit `48cab1c` (`git checkout 48cab1c`), lalu kembali
dengan `git checkout main`. Rincian: [`labs/pk-200/JURNAL.md`](labs/pk-200/JURNAL.md).

## Modul

catalog, customer, order, pricing, inventory, payment, invoice, loyalty, notification,
shipping, booking, reporting, jobs, files, audit. Lihat `task modules` untuk verifikasi
struktur dan dokumentasi yang dihasilkan Spring Modulith.

## Deployment

Diagram lengkap, tabel port, dan varian tanpa Docker ada di [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).
Semua komponen berjalan di satu laptop. Aplikasi dan k6 berjalan langsung di host,
infrastruktur pendukung berjalan di Docker Compose.

```mermaid
flowchart LR
  subgraph host["Laptop (host)"]
    k6["k6<br/>task reproduce / traffic"]
    app["JVM 21 · Spring Boot 3.5<br/>task app · :8080"]
  end
  subgraph docker["Docker Desktop · compose project pasarkita"]
    flyway["Flyway 10.20.1<br/>profil tools, sekali jalan"]
    pg[("PostgreSQL 16<br/>:5432 · volume pgdata")]
    wm["WireMock 3.9.1<br/>:8089 · pajak, payment, notifikasi"]
    tempo["Tempo 2.6.1<br/>OTLP :4318 · query :3200"]
    prom["Prometheus 2.55.1<br/>:9090"]
    graf["Grafana 11.3.0<br/>:3000"]
  end
  k6 -->|"HTTP :8080"| app
  app -->|"JDBC :5432"| pg
  app -->|"HTTP :8089"| wm
  app -->|"OTLP :4318"| tempo
  flyway -->|"migrasi"| pg
  prom -->|"scrape 5 dtk via host.docker.internal:8080"| app
  graf -->|"PromQL"| prom
  graf -->|"traces :3200"| tempo
```

Profil compose: `core` (PostgreSQL, WireMock, Prometheus, Grafana), `observability` (Tempo),
`tools` (Flyway). Aplikasi tidak dikemas dalam container: Prometheus menariknya lewat
`host.docker.internal`. Satu WireMock menggantikan tiga layanan luar, dibedakan oleh path.
Data bertahan di volume `pgdata` sampai `task reset`.

## Teknologi dan alat

**Library aplikasi** (Spring Boot 3.5.0, Spring Modulith 1.4.0)

| Kelompok | Library |
| --- | --- |
| Web dan data | `spring-boot-starter-web`, `-data-jpa`, `-validation`, PostgreSQL JDBC |
| Keamanan | `spring-security-crypto` (BCrypt) |
| Migrasi | `flyway-core`, `flyway-database-postgresql` |
| Modul | `spring-modulith-starter-core`, `spring-modulith-observability` |
| Observability | `spring-boot-starter-actuator`, `micrometer-registry-prometheus`, `micrometer-tracing-bridge-otel`, `opentelemetry-exporter-otlp` |
| Test | `spring-boot-starter-test`, Testcontainers (`junit-jupiter`, `postgresql`), `spring-modulith-starter-test`, `spring-modulith-docs` |

**Infrastruktur (image Docker):** `postgres:16`, `flyway/flyway:10.20.1`,
`wiremock/wiremock:3.9.1`, `prom/prometheus:v2.55.1`, `grafana/grafana:11.3.0`,
`grafana/tempo:2.6.1`.

**Alat di mesin pengembang:** JDK 21, Docker Desktop, Task (go-task), k6, Git, dan Maven
Wrapper. Skrip bantu `tools/Doctor.java` (cek lingkungan) dan `tools/Evidence.java`
(file bukti dengan hash SHA-256) dijalankan langsung oleh JDK.

## Uji beban dengan k6

| Script | Tujuan | Laju |
| --- | --- | --- |
| `labs/0/reproduce.k6.js` | Baseline 8 endpoint (Lab 0) | 31 iterasi/detik, 3 menit |
| `labs/latihan/profile.k6.js` | Beban ke halaman profil penjual | 2 req/detik (ubah dengan `RATE=n`), 3 menit |
| `traffic/simulator.k6.js` | Traffic latar belakang | 7 iterasi/detik, 8 jam |

Semuanya memakai model terbuka (`constant-arrival-rate`), jadi laju request tetap walau
server melambat. Status 402 dan 409 pada checkout dianggap normal. Lihat `labs/0/LAB.md`
untuk catatan penggunaan.

## Catatan Windows

- Simpan repo di path pendek, misalnya `C:\dev\pasarkita`, dan jalankan
  `git config --global core.longpaths true`.
- Memori Docker diatur lewat `%UserProfile%\.wslconfig`, lalu `wsl --shutdown`.
- Gunakan `curl.exe`, bukan `curl`, di Windows PowerShell 5.1.
- Kecualikan folder repo dan `%UserProfile%\.m2` dari pemindaian Microsoft Defender.
