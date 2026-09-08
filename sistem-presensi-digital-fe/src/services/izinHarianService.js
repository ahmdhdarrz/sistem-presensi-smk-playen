import api from "./api";

// Ambil izin harian berdasarkan tanggal
export const getIzinHarian = async (tanggal) => {
  const response = await api.get("/izin-harian", {
    params: { tanggal },
  });
  return response.data;
};

// Ambil izin harian hari ini
export const getIzinHarianToday = async () => {
  const response = await api.get("/izin-harian/today");
  return response.data;
};

// Tambah izin harian
export const createIzinHarian = async (data) => {
  const response = await api.post("/izin-harian", data);
  return response.data;
};

// Hapus izin harian
export const deleteIzinHarian = async (id) => {
  const response = await api.delete(`/izin-harian/${id}`);
  return response.data;
};

// Update izin harian
export const updateIzinHarian = async (id, payload) => {
  const response = await api.put(`/izin-harian/${id}`, payload);
  return response.data;
};
