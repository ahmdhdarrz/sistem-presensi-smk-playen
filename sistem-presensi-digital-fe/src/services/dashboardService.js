import api from "@/services/api";

export async function getDashboard(params = {}) {
  // TODO: Pastikan nama parameter sesuai dengan kontrak backend jika sudah ada.
  // Saat ini diasumsikan backend dapat menerima query params seperti ?kelas=X&periode=Y&semester=Z
  const res = await api.get("/absensi/dashboard", { params });
  return res.data;
}

export async function getKelas() {
  const res = await api.get("/kelas");
  return res.data;
}