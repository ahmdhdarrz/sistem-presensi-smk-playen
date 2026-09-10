# Laporan Inspeksi & Implementasi Fitur Izin Harian

**Tanggal:** 8 September 2026
**Proyek:** sistem-presensi-smk-playen
**Frontend:** `sistem-presensi-digital-fe`

---

## Bagian A — Hasil Inspeksi Fitur Izin Harian

### 1. Fitur yang Sudah Tersedia

Halaman **Izin Harian** (`src/pages/attendance/AttendancePermissions.jsx`) sudah memiliki:

- List data izin harian per tanggal (filter tanggal default hari ini)
- Filter pencarian berdasarkan nama siswa & NIS
- Filter kelas (dropdown)
- Statistik: Total Izin (tanggal terpilih) & Izin Hari Ini
- Tambah Izin Harian (dialog form: Kelas → Siswa → Tanggal → Waktu → Alasan)
- Hapus Izin Harian (dengan konfirmasi AlertDialog)
- RBAC: Halaman, tombol Tambah, dan tombol Hapus **hanya untuk role ADMIN**

### 2. Endpoint API yang Digunakan

| Endpoint | Keterangan |
|---|---|
| `GET /izin-harian?tanggal=YYYY-MM-DD` | Ambil data izin per tanggal |
| `GET /izin-harian/today` | Ambil izin hari ini (service tersedia, belum dipakai di halaman) |
| `POST /izin-harian` | Tambah izin harian |
| `DELETE /izin-harian/{id}` | Hapus izin harian |
| `GET /kelas` | Ambil daftar kelas (untuk filter & form) |
| `GET /siswa/kelas/{kelasId}` | Ambil siswa per kelas (untuk form) |

Base URL: `http://192.168.110.8:8000/api` (dari `.env`)

###3. Method HTTP Masing-Masing Endpoint

- `GET` → `/izin-harian`, `/izin-harian/today`, `/kelas`, `/siswa/kelas/{kelasId}`
- `POST` → `/izin-harian`
- `DELETE` → `/izin-harian/{id}`
- **Tidak ada** `PUT` / `PATCH` (sebelum implementasi)

###4. Payload Request

**POST `/izin-harian`** (dari `handleFormSubmit`):

```json
{
  "siswa_id": 123,
  "tanggal": "2026-09-08",
  "waktu_keluar": "07:00",
  "alasan": "Sakit"
}
```

**GET `/izin-harian`**: query param `?tanggal=YYYY-MM-DD`

###5. Struktur Response API

**GET `/izin-harian`** — diakses sebagai `data.data || data` (array):

```json
[
  {
    "id": 1,
    "siswa_id": 123,
    "siswa": {
      "nama": "Budi",
      "nis": "12345",
      "kelas": { "nama_kelas": "XII RPL 1" }
    },
    "tanggal": "2026-09-08",
    "waktu_keluar": "07:00",
    "alasan": "Sakit"
  }
]
```

**GET `/kelas`**: array `{ id, nama_kelas }`
**GET `/siswa/kelas/{kelasId}`**: array `{ id, nama, nis }`

###6. Field Data Izin Harian yang Tersedia

Field yang dipakai frontend (dari response API):

- `id`
- `siswa_id`
- `siswa.nama`
- `siswa.nis`
- `siswa.kelas.nama_kelas`
- `tanggal`
- `waktu_keluar`
- `alasan`

> Catatan: `dummyPermissions.js` punya field tambahan (`description`, `status`, `studentId`, `studentName`, `className`, `date`, `time`, `reason`) — **hanya data dummy**, tidak dipakai di halaman real.



###7. Apakah Create, Read, Update, Delete Sudah Didukung?

| Operasi | Status | Keterangan |
|---|---|---|
| **Create** | ✅ Didukung | `POST /izin-harian` |
| **Read** | ✅ Didukung | `GET /izin-harian?tanggal` & `GET /izin-harian/today` |
| **Update** | ❌ **TIDAK didukung** (sebelum implementasi) | Tidak ada service `updateIzinHarian`, tidak ada endpoint PUT/PATCH, tidak ada tombol edit di UI |
| **Delete** | ✅ Didukung | `DELETE /izin-harian/{id}` |

###8. Apakah `tanggal_kembali` dan `jam_kembali` Sudah Tersedia?

**❌ TIDAK tersedia.**

- Form `PermissionFormDialog.jsx` hanya punya: `tanggal` (date), `waktu_keluar` (time), `alasan`
- Payload POST hanya: `siswa_id`, `tanggal`, `waktu_keluar`, `alasan`
- Service `izinHarianService.js` tidak menyebut `tanggal_kembali` / `jam_kembali`
- Mapping data di halaman tidak membaca field tersebut
- Dummy data juga tidak punya field tersebut

###9. Perubahan Backend yang Diperlukan

1. **Tambah endpoint Update**: `PUT` / `PATCH /izin-harian/{id}` agar fitur edit tersedia (saat ini hanya Create/Read/Delete)
2. **Tambah field `tanggal_kembali` & `jam_kembali`**:
   - Di tabel/database backend (migration)
   - Di payload request `POST` / `PUT` (terima field baru)
   - Di response `GET /izin-harian` (sertakan field baru agar bisa ditampilkan frontend)

3. **Pastikan endpoint `GET /izin-harian/today` tersedia** di backend — service frontend sudah memanggilnya, meski belum dipakai di halaman saat ini.

4. **Pastikan `GET /izin-harian` mendukung filter `?tanggal=`** — frontend mengirim query param ini setiap fetch.‌
5. **Pastikan `GET /kelas` & `GET /siswa/kelas/{kelasId}` tersedia** — dibutuhkan form tambah izin (dropdown kelas & siswa).
6. **Validasi backend**: `siswa_id` wajib ada (foreign key), `tanggal` wajib, `waktu_keluar` wajib, `alasan` wajib.
7. **RBAC backend**: Batasi akses `POST` / `DELETE` (dan `PUT` jika ada) hanya untuk role **ADMIN**, sesuai aturan frontend saat ini.

---

## Bagian B — Implementasi yang Dilakukan

### File yang Diubah

| File | Perubahan |
|---|---|
| `sistem-presensi-digital-fe/src/services/izinHarianService.js` | Ditambahkan function `updateIzinHarian` |

### Kode yang Ditambahkan

Di akhir file `izinHarianService.js` (setelah `deleteIzinHarian`):

```js
// Update izin harian
export const updateIzinHarian = async (id, payload) => {
  const response = await api.put(`/izin-harian/${id}`, payload);
  return response.data;
};
```

### Detail Implementasi

- **Method HTTP:** `PUT`
- **Endpoint:** `/izin-harian/{id}`
- **Parameter:**
  - `id` — ID data izin harian yang akan diupdate
  - `payload` — object berisi field yang akan diupdate (contoh: `siswa_id`, `tanggal`, `waktu_keluar`, `alasan`)
- **Pattern:** Mengikuti pattern function existing di file tersebut (async/await, `api.put`, return `response.data`)
- **Function existing yang TIDAK diubah:**
  - `getIzinHarian`
  - `getIzinHarianToday`
  - `createIzinHarian`
  - `deleteIzinHarian`
- **File lain:** Tidak ada yang diubah
- **UI / Routing / RBAC / API client:** Tidak diubah
- **Commit:** Tidak dibuat

---

## Ringkasan Status CRUD Setelah Implementasi

| Operasi | Sebelum | Sesudah |
|---|---|---|
| **Create** | ✅ | ✅ |
| **Read** | ✅ | ✅ |
| **Update** | ❌ | ✅ (service saja, UI belum) |
| **Delete** | ✅ | ✅ |

> Catatan: Function `updateIzinHarian` sudah tersedia di service layer. UI (tombol edit, dialog edit) **belum** diimplementasikan — sesuai batasan tugas yang hanya mengubah file service.