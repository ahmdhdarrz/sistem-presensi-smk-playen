import api from "@/services/api";

export async function submitAbsensi(payload) {
  const res = await api.post("/absensi", payload);
  return res.data;
}

export async function getAbsensi(params) {
  const res = await api.get("/absensi", { params });
  return res.data;
}

export async function getRekapBulanan(params) {
  const res = await api.get("/absensi/rekap/bulanan", { params });
  return res.data;
}

export async function getRekapPeriode(params) {
  const res = await api.get("/absensi/rekap/periode", { params });
  return res.data;
}

export async function getAbsensiHarian(kelasId, tanggal) {
  const [pagiRes, soreRes] = await Promise.all([
    getAbsensi({ kelas_id: kelasId, tanggal, sesi: "pagi" }),
    getAbsensi({ kelas_id: kelasId, tanggal, sesi: "sore" }),
  ]);
  return {
    pagi: pagiRes.data || pagiRes,
    sore: soreRes.data || soreRes,
  };
}

export async function updateAbsensi(id, payload) {
  const res = await api.put(`/absensi/${id}`, payload);
  return res.data;
}

export async function deleteAbsensi(id) {
  const res = await api.delete(`/absensi/${id}`);
  return res.data;
}

export async function exportAbsensiExcel(params) {
  const res = await api.get("/absensi/export/excel", {
    params,
    responseType: "blob",
  });
  return res.data;
}