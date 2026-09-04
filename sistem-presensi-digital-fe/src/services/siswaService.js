import api from "@/services/api";

// ── Siswa ──────────────────────────────────────────────────────────────────
export async function getSiswa() {
  const res = await api.get("/siswa");
  return res.data;
}

export async function createSiswa(payload) {
  const res = await api.post("/siswa", payload);
  return res.data;
}

export async function updateSiswa(id, payload) {
  const res = await api.put(`/siswa/${id}`, payload);
  return res.data;
}

export async function deleteSiswa(id) {
  const res = await api.delete(`/siswa/${id}`);
  return res.data;
}

// ── Kelas ──────────────────────────────────────────────────────────────────
export async function getKelas() {
  const res = await api.get("/kelas");
  return res.data;
}

export async function getSiswaByKelas(kelasId) {
  const res = await api.get(`/siswa/kelas/${kelasId}`);
  return res.data;
}
