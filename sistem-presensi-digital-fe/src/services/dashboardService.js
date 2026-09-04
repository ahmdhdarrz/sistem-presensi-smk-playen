import api from "@/services/api";

export async function getDashboard() {
  const res = await api.get("/absensi/dashboard");
  return res.data;
}