# Raptika Frontend Web App

Aplikasi frontend untuk **Raptika (Sistem Pendataan 6 Aplikasi di bawah Dinas Komunikasi dan Informatika Jawa Barat)**.

Project ini dibangun menggunakan:

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Node.js 20**

Frontend menggunakan **Next.js Standalone Output** sehingga dapat dijalankan dengan dua metode:

1. **Tanpa Docker** — menggunakan Node.js dan npm secara langsung.
2. **Dengan Docker** — menggunakan Docker dan Docker Compose.

Kedua metode tersebut telah disiapkan agar anggota tim dapat memilih metode yang sesuai dengan lingkungan development masing-masing.

---

## Daftar Isi

* [Teknologi](#teknologi)
* [Prasyarat](#prasyarat)
* [Clone Repository](#clone-repository)
* [Konfigurasi Environment](#konfigurasi-environment)
* [Pilihan Menjalankan Project](#pilihan-menjalankan-project)
* [Menjalankan Tanpa Docker](#menjalankan-tanpa-docker)
* [Menjalankan Dengan Docker](#menjalankan-dengan-docker)
* [Perbandingan Docker dan Tanpa Docker](#perbandingan-docker-dan-tanpa-docker)
* [Mengubah API URL](#mengubah-api-url)
* [Rebuild Setelah Perubahan Environment](#rebuild-setelah-perubahan-environment)
* [Production Railway](#production-railway)
* [Struktur Project](#struktur-project)
* [Perintah Docker](#perintah-docker)
* [Troubleshooting](#troubleshooting)
* [Alur Setup Anggota Tim](#alur-setup-anggota-tim)
* [Catatan untuk Kontributor](#catatan-untuk-kontributor)
* [Repository](#repository)

---

## Teknologi

Project menggunakan teknologi berikut:

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Node.js 20**
* **npm**
* **Docker**
* **Docker Compose**
* **Next.js Standalone Output**

Docker bersifat **opsional untuk development**. Anggota tim dapat menjalankan project menggunakan Node.js tanpa Docker.

---

# Prasyarat

Prasyarat bergantung pada metode yang dipilih.

## Untuk Menjalankan Tanpa Docker

Install:

1. **Git**
2. **Node.js 20 atau versi yang kompatibel**
3. **npm**
4. Backend Laravel APTIKA TOOLS

Periksa instalasi:

```powershell
git --version
node --version
npm --version
```

Backend Laravel harus dapat diakses, misalnya:

```text
http://127.0.0.1:8000
```

---

## Untuk Menjalankan Dengan Docker

Install:

1. **Git**
2. **Docker Desktop**
3. Backend Laravel APTIKA TOOLS

Pastikan Docker Desktop dalam kondisi **Running**.

Periksa Docker:

```powershell
docker --version
docker compose version
```

---

# Clone Repository

Clone repository frontend:

```bash
git clone https://github.com/tabahmp/fe_aptika.git
```

Masuk ke folder project:

```bash
cd fe_aptika
```

---

# Konfigurasi Environment

Project menggunakan environment variable untuk menentukan alamat backend API.

Template environment yang disediakan di repository adalah:

```text
.env.example
```

Isi `.env.example` saat ini:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

File `.env.example` **boleh dan harus disimpan di repository** karena hanya berfungsi sebagai template.

File berikut **jangan di-commit ke GitHub**:

```text
.env
.env.local
.env.development
.env.production
```

---

## Membuat File `.env`

Setelah clone repository, buat file `.env` berdasarkan `.env.example`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Periksa:

```powershell
Get-Content .env
```

Hasil yang diharapkan untuk backend lokal:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Jika backend menggunakan alamat lain, sesuaikan nilai tersebut.

---

# Pilihan Menjalankan Project

Setelah konfigurasi environment selesai, anggota tim dapat memilih salah satu metode:

```text
                    RAPTIKA FRONTEND
                           │
              ┌────────────┴────────────┐
              │                         │
              ▼                         ▼
       TANPA DOCKER                 DENGAN DOCKER
              │                         │
        Node.js + npm              Docker Desktop
              │                         │
       npm install                  docker compose
              │                         │
       npm run dev                 docker compose up
              │                         │
              └────────────┬────────────┘
                           │
                           ▼
                    RAPTIKA FRONTEND
```

Kedua metode menggunakan backend API yang dikonfigurasi melalui:

```env
NEXT_PUBLIC_API_URL=...
```

---

# Menjalankan Tanpa Docker

Metode ini cocok untuk developer yang ingin menjalankan project secara langsung menggunakan Node.js.

## 1. Pastikan Backend Berjalan

Pastikan backend Laravel berjalan pada:

```text
http://127.0.0.1:8000
```

Contoh menjalankan backend Laravel:

```bash
php artisan serve
```

Backend API kemudian tersedia di:

```text
http://127.0.0.1:8000/api
```

---

## 2. Install Dependency

Dari folder `fe_aptika`:

```bash
npm install
```

---

## 3. Pastikan Environment

Pastikan `.env` berisi:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

---

## 4. Jalankan Development Server

```bash
npm run dev
```

Jika port `3000` tersedia, Next.js akan berjalan di:

```text
http://localhost:3000
```

Jika port `3000` sedang digunakan, Next.js dapat menggunakan port lain secara otomatis, misalnya:

```text
http://localhost:3002
```

Perhatikan alamat yang ditampilkan pada terminal.

---

## 5. Buka Frontend

Buka alamat yang ditampilkan oleh Next.js.

Contoh:

```text
http://localhost:3000
```

atau:

```text
http://localhost:3002
```

---

## 6. Menghentikan Development Server

Pada terminal yang menjalankan Next.js:

```text
Ctrl + C
```

---

# Menjalankan Dengan Docker

Metode ini cocok untuk developer yang ingin menjalankan frontend dalam container.

## 1. Pastikan Backend Berjalan

Backend Laravel tetap harus dapat diakses oleh browser melalui:

```text
http://127.0.0.1:8000
```

API:

```text
http://127.0.0.1:8000/api
```

---

## 2. Pastikan File `.env` Tersedia

Jika belum ada:

```powershell
Copy-Item .env.example .env
```

Pastikan isinya:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Docker Compose menggunakan nilai tersebut sebagai build argument untuk proses build Next.js.

---

## 3. Build dan Jalankan Docker

Jalankan:

```bash
docker compose up --build
```

Atau jika ingin menjalankan container di background:

```bash
docker compose up -d --build
```

Docker akan melakukan proses:

```text
docker compose
      │
      ▼
Dockerfile
      │
      ▼
Install dependency
      │
      ▼
npm run build
      │
      ▼
Next.js Standalone
      │
      ▼
Docker Image
      │
      ▼
raptika_frontend
      │
      ▼
localhost:3000
```

---

## 4. Buka Frontend

Setelah container berhasil berjalan:

```text
http://localhost:3000
```

---

## 5. Melihat Status Container

```bash
docker ps
```

Container frontend seharusnya terlihat dengan nama:

```text
raptika_frontend
```

---

## 6. Menghentikan Docker

Jika menggunakan:

```bash
docker compose up
```

tekan:

```text
Ctrl + C
```

Jika container dijalankan dengan mode background:

```bash
docker compose down
```

---

# Perbandingan Docker dan Tanpa Docker

| Kebutuhan        | Tanpa Docker     | Dengan Docker                           |
| ---------------- | ---------------- | --------------------------------------- |
| Git              | ✅                | ✅                                       |
| Node.js          | ✅                | Tidak wajib untuk menjalankan container |
| npm              | ✅                | Tidak wajib untuk menjalankan container |
| Docker Desktop   | ❌                | ✅                                       |
| `npm install`    | ✅                | Dilakukan saat Docker build             |
| `npm run dev`    | ✅                | ❌                                       |
| `docker compose` | ❌                | ✅                                       |
| Mode             | Development      | Production container                    |
| Port default     | 3000             | 3000                                    |
| Backend Laravel  | Tetap diperlukan | Tetap diperlukan                        |

### Rekomendasi

Gunakan **tanpa Docker** jika:

* sedang melakukan development aktif;
* ingin perubahan kode langsung terlihat melalui Next.js development server;
* tidak ingin menggunakan Docker Desktop.

Gunakan **Docker** jika:

* ingin menjalankan environment dalam container;
* ingin menguji production build;
* ingin menggunakan environment yang lebih terisolasi;
* ingin menggunakan konfigurasi container yang sama dengan deployment.

---

# Mengubah API URL

Alamat backend tidak perlu diubah langsung di source code.

Jangan mengubah:

```text
src/services/api.ts
```

hanya untuk mengganti alamat backend.

Gunakan:

```env
NEXT_PUBLIC_API_URL=...
```

Contoh backend lokal:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Jika backend berada di alamat lain:

```env
NEXT_PUBLIC_API_URL=http://alamat-backend/api
```

Sesuaikan dengan environment yang digunakan.

---

# Penting: NEXT_PUBLIC_API_URL

`NEXT_PUBLIC_API_URL` merupakan environment variable yang digunakan oleh Next.js.

Nilainya digunakan pada proses build aplikasi.

Oleh karena itu, jika nilai:

```env
NEXT_PUBLIC_API_URL
```

diubah, aplikasi perlu dijalankan kembali atau di-build ulang sesuai metode yang digunakan.

## Tanpa Docker

Jika menggunakan development server:

```bash
npm run dev
```

Setelah perubahan environment, hentikan server dengan:

```text
Ctrl + C
```

kemudian jalankan kembali:

```bash
npm run dev
```

---

## Dengan Docker

Jika menggunakan Docker, lakukan rebuild:

```bash
docker compose down
```

Kemudian:

```bash
docker compose up -d --build
```

---

# Production Railway

Frontend Raptika dapat digunakan untuk deployment production pada **Railway**.

Pada environment production, nilai:

```env
NEXT_PUBLIC_API_URL
```

harus diarahkan ke backend production yang digunakan.

Contoh konsep:

```text
Frontend Railway
       │
       ▼
NEXT_PUBLIC_API_URL
       │
       ▼
Backend Railway
       │
       ▼
Database
```

Environment variable production **tidak disimpan di repository GitHub**.

Konfigurasi production dilakukan melalui environment variable pada platform deployment.

Jangan memasukkan credential, password, API key, token, atau secret production ke dalam:

```text
.env.example
```

atau source code.

---

# Struktur Project

Struktur utama frontend:

```text
fe_aptika/
│
├── public/
├── src/
│
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── docker-compose.yml
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
│
└── README.md
```

File environment lokal seperti:

```text
.env
.env.local
```

tidak disimpan di repository GitHub.

---

# Konfigurasi Docker

Project menggunakan:

```text
Dockerfile
docker-compose.yml
.dockerignore
```

Next.js dikonfigurasi menggunakan:

```ts
output: "standalone"
```

Konfigurasi tersebut menghasilkan production build yang dapat dijalankan menggunakan Node.js standalone di dalam Docker container.

Docker Compose menjalankan frontend pada:

```text
localhost:3000
```

Nama container:

```text
raptika_frontend
```

---

# Perintah Docker

## Menjalankan Container

```bash
docker compose up
```

---

## Menjalankan di Background

```bash
docker compose up -d
```

---

## Build dan Menjalankan Ulang

```bash
docker compose up -d --build
```

Gunakan perintah ini setelah melakukan perubahan yang memengaruhi proses build, termasuk perubahan:

```env
NEXT_PUBLIC_API_URL
```

---

## Menghentikan Container

```bash
docker compose down
```

---

## Melihat Container yang Berjalan

```bash
docker ps
```

---

## Melihat Semua Container

```bash
docker ps -a
```

---

## Melihat Log

```bash
docker compose logs -f
```

---

# Troubleshooting

## Port 3000 Sudah Digunakan

Periksa proses yang menggunakan port 3000:

```powershell
Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
```

Periksa container Docker:

```bash
docker ps
```

Jika frontend Docker masih berjalan:

```bash
docker compose down
```

Kemudian jalankan kembali:

```bash
docker compose up -d --build
```

Jika menjalankan tanpa Docker dan port 3000 digunakan, Next.js dapat memilih port lain secara otomatis.

Perhatikan alamat yang muncul di terminal.

---

## Frontend Tidak Terhubung ke Backend

Periksa environment:

```powershell
Get-Content .env
```

Pastikan terdapat:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Pastikan backend Laravel berjalan:

```text
http://127.0.0.1:8000
```

Jika backend belum berjalan, jalankan:

```bash
php artisan serve
```

---

## Setelah Mengubah API URL Frontend Tidak Berubah

### Tanpa Docker

Hentikan Next.js:

```text
Ctrl + C
```

Kemudian jalankan kembali:

```bash
npm run dev
```

### Dengan Docker

Jalankan:

```bash
docker compose down
```

Kemudian:

```bash
docker compose up -d --build
```

---

## Container Tidak Berjalan

Periksa:

```bash
docker ps -a
```

Kemudian periksa log:

```bash
docker compose logs
```

Jika diperlukan:

```bash
docker compose down
```

Kemudian:

```bash
docker compose up -d --build
```

---

## Docker Build Gagal

Pastikan:

1. Docker Desktop sedang berjalan.
2. File `Dockerfile` tersedia.
3. File `package.json` tersedia.
4. File `package-lock.json` tersedia.
5. Environment `NEXT_PUBLIC_API_URL` tersedia.
6. Tidak ada masalah koneksi ke Docker Hub.

Kemudian coba:

```bash
docker compose down
```

dan:

```bash
docker compose up --build
```

---

# Alur Setup Anggota Tim

Anggota tim yang baru melakukan clone dapat memilih salah satu dari dua metode berikut.

## Opsi A — Tanpa Docker

```text
Clone Repository
       │
       ▼
Masuk ke fe_aptika
       │
       ▼
Copy .env.example → .env
       │
       ▼
Pastikan Backend Laravel :8000
       │
       ▼
npm install
       │
       ▼
npm run dev
       │
       ▼
http://localhost:3000
```

Perintah lengkap:

```bash
git clone https://github.com/tabahmp/fe_aptika.git
cd fe_aptika
```

Buat environment:

```powershell
Copy-Item .env.example .env
```

Install dependency:

```bash
npm install
```

Jalankan:

```bash
npm run dev
```

Kemudian buka alamat yang ditampilkan Next.js.

---

# Opsi B — Dengan Docker

```text
Clone Repository
       │
       ▼
Masuk ke fe_aptika
       │
       ▼
Copy .env.example → .env
       │
       ▼
Pastikan Backend Laravel :8000
       │
       ▼
docker compose up -d --build
       │
       ▼
http://localhost:3000
```

Perintah lengkap:

```bash
git clone https://github.com/tabahmp/fe_aptika.git
cd fe_aptika
```

Buat environment:

```powershell
Copy-Item .env.example .env
```

Jalankan Docker:

```bash
docker compose up -d --build
```

Kemudian buka:

```text
http://localhost:3000
```

---

# Catatan untuk Kontributor

Sebelum melakukan perubahan pada project:

1. Pastikan repository menggunakan branch yang sesuai.
2. Jangan commit `.env`.
3. Jangan commit `.env.local`.
4. Jangan menyimpan credential atau secret di repository.
5. Gunakan `.env.example` sebagai template environment.
6. Jangan mengubah `src/services/api.ts` hanya untuk mengganti API URL.
7. Gunakan `NEXT_PUBLIC_API_URL` untuk menentukan alamat backend.
8. Setelah perubahan environment yang digunakan saat build, lakukan restart atau rebuild sesuai metode yang digunakan.
9. Pastikan frontend dapat berjalan dengan normal sebelum commit.
10. Pastikan fitur yang berkaitan dengan backend juga telah diuji.
11. Gunakan pesan commit sesuai standar **Conventional Commits**.

Contoh:

```text
feat: tambah halaman dashboard
fix: perbaiki koneksi API pengguna
docs: perbarui dokumentasi setup frontend
refactor: rapikan struktur komponen
```

---

# Repository

Repository frontend:

```text
https://github.com/tabahmp/fe_aptika
```

---

# Status Setup

Frontend Raptika telah disiapkan untuk dua metode deployment/development:

```text
┌─────────────────────────────────────┐
│       RAPTIKA FRONTEND WEB APP      │
├─────────────────────────────────────┤
│                                     │
│  TANPA DOCKER                       │
│  Node.js + npm                      │
│  npm install                        │
│  npm run dev                        │
│  Berhasil diuji                     │
│                                     │
│  DENGAN DOCKER                      │
│  Docker + Docker Compose            │
│  docker compose up --build          │
│  localhost:3000                     │
│  Berhasil diuji                     │
│                                     │
└─────────────────────────────────────┘
```

**Docker bersifat opsional untuk anggota tim.**

Setiap anggota tim bebas memilih metode **Docker** atau **tanpa Docker** sesuai kebutuhan development masing-masing.
