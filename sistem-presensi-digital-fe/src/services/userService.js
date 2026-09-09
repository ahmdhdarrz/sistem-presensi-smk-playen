import api from "@/services/api";

// ── Users (Guru / Admin) ────────────────────────────────────────────────────
export async function getUsers() {
  const res = await api.get("/users");
  return res.data;
}

export async function createUser(payload) {
  const res = await api.post("/users", payload);
  return res.data;
}

export async function updateUser(id, payload) {
  const res = await api.put(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function importUsers(payload) {
  const res = await api.post("/users/import", payload);
  return res.data;
}

// ── Kelas (untuk dropdown kelas_id) ────────────────────────────────────────
export async function getKelas() {
  const res = await api.get("/kelas");
  return res.data;
}
