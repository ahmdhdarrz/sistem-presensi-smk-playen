# Sistem Presensi Digital
### SMK Muhammadiyah 1 Playen

Sistem Presensi Digital merupakan aplikasi berbasis website yang dikembangkan untuk mendigitalisasi proses pencatatan dan rekapitulasi kehadiran siswa di SMK Muhammadiyah 1 Playen.

Sistem ini menggantikan proses absensi manual berbasis kertas dan rekapitulasi menggunakan Microsoft Excel dengan proses pencatatan dan pengelolaan data secara digital.

---

## Daftar Isi

- [Tentang Project](#tentang-project)
- [Latar Belakang](#latar-belakang)
- [Tujuan](#tujuan)
- [Ruang Lingkup](#ruang-lingkup)
- [Pengguna Sistem](#pengguna-sistem)
- [Fitur Utama](#fitur-utama)
- [Halaman Sistem](#halaman-sistem)
- [Alur Sistem](#alur-sistem)
- [Tech Stack](#tech-stack)
- [Arsitektur Sistem](#arsitektur-sistem)
- [Struktur Project](#struktur-project)
- [Database](#database)
- [API](#api)
- [Instalasi](#instalasi)
- [Environment Variable](#environment-variable)
- [Menjalankan Project](#menjalankan-project)
- [Development Workflow](#development-workflow)
- [Tim Pengembang](#tim-pengembang)
- [Status Project](#status-project)

---

# Tentang Project

Sistem Presensi Digital merupakan aplikasi website yang dirancang untuk membantu proses pencatatan, pengelolaan, dan rekapitulasi kehadiran siswa secara digital.

Sistem dikembangkan untuk lingkungan SMK Muhammadiyah 1 Playen dengan akses utama untuk:

- Guru
- Admin (Waka Sekolah/Kepala Sekolah)

Sistem berdiri sendiri dan tidak terintegrasi dengan sistem e-point yang sudah tersedia di sekolah.

---

# Latar Belakang

SMK Muhammadiyah 1 Playen saat ini masih menggunakan sistem absensi manual berbasis kertas.

Pada proses yang berjalan, guru memanggil siswa satu per satu kemudian mencatat kehadiran pada kertas. Data tersebut selanjutnya direkap oleh petugas piket ke dalam Microsoft Excel secara manual.

Proses tersebut membutuhkan waktu dan tenaga tambahan, khususnya dalam proses rekapitulasi data.

Oleh karena itu, dikembangkan Sistem Presensi Digital berbasis website untuk meningkatkan efisiensi proses pencatatan dan pengelolaan data kehadiran.

---

# Tujuan

Sistem dikembangkan untuk:

1. Menggantikan proses pencatatan absensi dari kertas ke digital.
2. Mempermudah guru dalam melakukan input absensi melalui perangkat masing-masing.
3. Menghasilkan rekap absensi secara otomatis tanpa perlu melakukan input ulang ke Microsoft Excel.
4. Memberikan akses terhadap rekap absensi keseluruhan kepada Waka Sekolah dan Kepala Sekolah.

---

# Ruang Lingkup

Sistem merupakan aplikasi berbasis website yang dapat diakses oleh guru dan admin.

### Guru

Guru dapat:

- Melakukan input absensi kelas yang dipegang.
- Melihat rekap absensi kelas sendiri.
- Melakukan export rekap absensi kelas sendiri.

### Admin

Admin dalam sistem terdiri dari Waka Sekolah/Kepala Sekolah.

Admin dapat:

- Melihat dan mengelola absensi seluruh kelas.
- Melakukan export rekap absensi seluruh kelas.
- Mengelola data siswa.
- Mengelola akun guru.

> Sistem berdiri sendiri dan tidak terintegrasi dengan sistem e-point sekolah.

---

# Pengguna Sistem

| Role | Akses |
|---|---|
| Guru | Input dan melihat rekap absensi kelas yang diampu |
| Admin | Mengelola dan melihat data absensi seluruh kelas |

---

# Fitur Utama

## 1. Autentikasi

- Login menggunakan username dan password.
- Sistem membedakan role Guru dan Admin.
- Sistem melakukan validasi akses berdasarkan role.

## 2. Input Absensi

Guru dapat:

- Memilih kelas.
- Memilih sesi pagi atau sore.
- Memilih tanggal.
- Melihat daftar siswa.
- Menentukan status kehadiran setiap siswa:
  - Hadir
  - Alpa
  - Izin
  - Sakit
- Menyimpan data absensi.

## 3. Dashboard

### Dashboard Guru

Menampilkan:

- Ringkasan absensi kelas pada hari berjalan.
- Grafik perbandingan hadir dan tidak hadir.
- Grafik tren absensi minggu berjalan.
- Informasi status input sesi pagi/sore.

### Dashboard Admin

Menampilkan:

- Ringkasan absensi seluruh kelas.
- Grafik perbandingan hadir dan tidak hadir per kelas.
- Grafik tren absensi minggu berjalan.
- Data siswa yang paling sering alpa.
- Informasi status input sesi pagi/sore setiap kelas.

## 4. Rekap Absensi

- Filter berdasarkan hari.
- Filter berdasarkan bulan.
- Filter berdasarkan semester.
- Filter berdasarkan kelas.
- Filter berdasarkan siswa.
- Export ke Excel.
- Export ke PDF.

## 5. Manajemen Data Siswa

Admin dapat:

- Menambah data siswa.
- Mengubah data siswa.
- Menghapus data siswa.
- Melihat riwayat absensi siswa.

## 6. Manajemen Akun Guru

Admin dapat:

- Menambah akun guru.
- Mengubah akun guru.
- Menghapus akun guru.
- Mengatur role akses.

---

# Halaman Sistem

| No. | Halaman | Akses |
|---|---|---|
| 1 | Login | Guru & Admin |
| 2 | Dashboard | Guru & Admin |
| 3 | Input Absensi | Guru |
| 4 | Rekap Absensi | Guru & Admin |
| 5 | Data Siswa | Admin |
| 6 | Manajemen Akun Guru | Admin |

---

# Alur Sistem

```text
                    LOGIN
                      │
                      ▼
              Validasi Role User
                 ┌────┴────┐
                 │         │
               GURU      ADMIN
                 │         │
                 ▼         ▼
             Dashboard  Dashboard
                 │         │
                 ▼         ├── Data Siswa
          Input Absensi    │
                 │         ├── Akun Guru
                 ▼         │
          Rekap Kelas      ├── Absensi Semua Kelas
                           │
                           ▼
                    Rekap Absensi
```

---

# Tech Stack

| Komponen                | Teknologi            |
| ----------------------- | -------------------- |
| Frontend                | React JS             |
| Backend                 | Laravel (PHP)        |
| Database                | MySQL                |
| API Documentation       | Swagger (L5-Swagger) |
| Server                  | Server Lokal Sekolah |
| Development Environment | XAMPP                |

---

# Arsitektur Sistem

Sistem menggunakan arsitektur berbasis client-server.
```text
┌──────────────────────┐
│      User Browser    │
│  Laptop / Smartphone │
└──────────┬───────────┘
           │
           │ HTTP / API
           ▼
┌──────────────────────┐
│       Frontend       │
│       React JS       │
└──────────┬───────────┘
           │
           │ REST API
           ▼
┌──────────────────────┐
│       Backend        │
│    Laravel / PHP     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       Database       │
│        MySQL         │
└──────────────────────┘
```

---

# Struktur Project

## Frontend

Struktur awal Front-End: 

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── students/
│   │   └── teachers/
│   ├── services/
│   ├── hooks/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
├── .env
├── .gitignore
├── package.json
└── README.md
```

--- 

## Database

Database menggunakan MySQL.

## Tabel Utama 

### Users

| Field    | Tipe    | Keterangan           |
| -------- | ------- | -------------------- |
| id       | INT     | Primary Key          |
| nama     | VARCHAR | Nama lengkap         |
| username | VARCHAR | Username login       |
| password | VARCHAR | Password terenkripsi |
| role     | ENUM    | Guru / Admin         |
| kelas_id | INT     | Foreign Key ke Kelas |

### Kelas

| Field      | Tipe    | Keterangan   |
| ---------- | ------- | ------------ |
| id         | INT     | Primary Key  |
| nama_kelas | VARCHAR | Nama kelas   |
| jurusan    | VARCHAR | Nama jurusan |
| tingkat    | ENUM    | 10 / 11 / 12 |

### Siswa 

| Field         | Tipe    | Keterangan           |
| ------------- | ------- | -------------------- |
| id            | INT     | Primary Key          |
| nama          | VARCHAR | Nama lengkap         |
| nis           | VARCHAR | Nomor Induk Siswa    |
| kelas_id      | INT     | Foreign Key ke Kelas |
| jenis_kelamin | ENUM    | L / P                |

### Absensi 

| Field      | Tipe | Keterangan                  |
| ---------- | ---- | --------------------------- |
| id         | INT  | Primary Key                 |
| siswa_id   | INT  | Foreign Key ke Siswa        |
| kelas_id   | INT  | Foreign Key ke Kelas        |
| tanggal    | DATE | Tanggal absensi             |
| sesi       | ENUM | Pagi / Sore                 |
| status     | ENUM | Hadir / Alpa / Izin / Sakit |
| guru_id    | INT  | Foreign Key ke Users        |
| keterangan | TEXT | Keterangan tambahan         |

## Relasi Database

```text
Users
  │
  │ guru_id
  ▼
Absensi
  │
  ├──────────► Siswa
  │              │
  │              │ kelas_id
  │              ▼
  └──────────► Kelas
```

Relasi utama:

- Users (Guru) → memiliki → Kelas
- Kelas → memiliki banyak → Siswa
- Siswa → memiliki banyak → Absensi
- Users (Guru) → menginput → Absensi

--- 

# API 

API dikembangkan menggunakan Laravel dan dokumentasinya menggunakan Swagger melalui L5-Swagger.

Dokumentasi endpoint akan tersedia pada bagian ini setelah implementasi API selesai. 

## Endpoint

| Modul          | Method | Endpoint     | Keterangan               |
| -------------- | ------ | ------------ | ------------------------ |
| Authentication | POST   | `/api/login` | Login user               |
| Attendance     | -      | -            | [DIISI SAAT API SELESAI] |
| Students       | -      | -            | [DIISI SAAT API SELESAI] |
| Teachers       | -      | -            | [DIISI SAAT API SELESAI] |
| Reports        | -      | -            | [DIISI SAAT API SELESAI] |

---

# Kebutuhan Non-Fungsional 

Kebutuhan Non-Fungsional

Sistem ditargetkan untuk:
- Dapat diakses melalui browser pada laptop maupun smartphone.
- Mendukung data hingga 1.000 siswa dan 50 guru.
- Memiliki antarmuka yang responsif dan mudah digunakan.
- Menyimpan data secara aman pada server lokal sekolah.

---

# Instalasi 

## 1. Clone Repository
```bash
git clone <repository-url>
```

## 2. Masuk ke Directory
```bash
cd <project-directory>
```

## 3. Install Frontend Dependencies
```bash
npm install
```

## 4. Konfigurasi Environment 
Buat file:
```text
.env
```

Kemudian isi konfigurasi API sesuai environment development.
```env
VITE_API_URL=<URL_BACKEND>
```

## 5. Jalankan Frontend 
```bash
npm run dev
```

--- 

# Development Workflow

Pengembangan sistem dilakukan melalui beberapa tahap:
```text

Analisis Kebutuhan
        ↓
Perancangan Sistem
        ↓
Perancangan Database
        ↓
Pengembangan Backend & API
        ↓
Pengembangan Frontend
        ↓
Integrasi
        ↓
Pengujian
        ↓
Validasi
        ↓
Implementasi
```

--- 

# Tim Pengembang 

| Role                | Tanggung Jawab                                          |
| ------------------- | ------------------------------------------------------- |
| Front-End Developer | Pengembangan UI dan implementasi sisi client            |
| Back-End Developer  | Pengembangan API, server, dan database                  |
| System Analyst      | Analisis kebutuhan, perancangan sistem, dan dokumentasi |

--- 

# Status Project

Development




