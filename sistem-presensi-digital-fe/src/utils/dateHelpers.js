export const MONTH_NAMES_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

// Ambil rentang Senin-Minggu dari sebuah tanggal
export function getWeekRange(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 = Minggu
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    from: monday.toISOString().split("T")[0],
    to: sunday.toISOString().split("T")[0],
  };
}

export function getYearRange(year) {
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

export function formatWeekLabel(from, to) {
  const f = new Date(from);
  const t = new Date(to);
  const fMonth = MONTH_NAMES_ID[f.getMonth()];
  const tMonth = MONTH_NAMES_ID[t.getMonth()];
  const year = t.getFullYear();
  if (fMonth === tMonth) {
    return `${f.getDate()} - ${t.getDate()} ${fMonth} ${year}`;
  }
  return `${f.getDate()} ${fMonth} - ${t.getDate()} ${tMonth} ${year}`;
}