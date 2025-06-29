import { collection, getDocs, query } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// 🧠 Fungsi bantu tanggal
function parseTanggal(ts) {
  const d = ts?.toDate?.();
  return d ? new Date(d) : null;
}

function formatTanggal(d) {
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
}

function formatWaktu(ts) {
  const d = ts?.toDate?.();
  return d ? d.toLocaleString() : "-";
}

// 🧮 Fungsi filter waktu
function isDalamRentang(ts, tipe) {
  const d = parseTanggal(ts);
  const now = new Date();
  if (!d) return false;

  if (tipe === "harian")
    return d.toDateString() === now.toDateString();

  if (tipe === "mingguan") {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return d >= start && d < end;
  }

  if (tipe === "bulanan")
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

  if (tipe === "tahunan")
    return d.getFullYear() === now.getFullYear();

  return false;
}

// 📊 Update ringkasan dan grafik
export async function updateRingkasan(tipe = "harian") {
  const q = query(collection(window.db, "pesanan"));
  const snapshot = await getDocs(q);

  let jumlah = 0;
  let total = 0;
  const dataGrafik = {};

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.status !== "selesai") return;
    if (!isDalamRentang(data.waktu, tipe)) return;

    jumlah++;
    total += data.total;

    const d = parseTanggal(data.waktu);
    const label = tipe === "tahunan" ? `${d.getMonth()+1}/${d.getFullYear()}` :
                  tipe === "bulanan" ? formatTanggal(d) :
                  tipe === "mingguan" ? formatTanggal(d) :
                  d.toLocaleTimeString().slice(0,5); // jam:menit

    dataGrafik[label] = (dataGrafik[label] || 0) + 1;
  });

  // Ringkasan
  document.getElementById("laporan-ringkasan").innerHTML = `
    <strong>${jumlah} transaksi</strong><br>
    Total Pendapatan: <strong>Rp ${total.toLocaleString()}</strong>
  `;

  // Grafik
  const canvas = document.getElementById("grafik-ringkasan");
  const ctx = canvas.getContext("2d");
  const labels = Object.keys(dataGrafik);
  const values = Object.values(dataGrafik);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const max = Math.max(...values, 5);
  const stepX = canvas.width / Math.max(1, labels.length);
  const scaleY = (canvas.height - 20) / max;

  ctx.beginPath();
  ctx.moveTo(0, canvas.height - values[0] * scaleY);
  values.forEach((val, i) => {
    ctx.lineTo(i * stepX, canvas.height - val * scaleY);
  });
  ctx.strokeStyle = "#2c7be5";
  ctx.lineWidth = 2;
  ctx.stroke();

  // Titik
  values.forEach((val, i) => {
    ctx.beginPath();
    ctx.arc(i * stepX, canvas.height - val * scaleY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "#2c7be5";
    ctx.fill();
  });
}

// 📋 Tabel laporan
export async function tampilkanTabelLaporan(tipe = "harian") {
  const snapshot = await getDocs(query(collection(window.db, "pesanan")));
  const tbody = document.getElementById("isi-tabel-laporan");
  tbody.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    if (data.status !== "selesai") return;
    if (!isDalamRentang(data.waktu, tipe)) return;

    const tr = document.createElement("tr");

    const daftar = (data.isi || []).map(i => {
      const detail = i.detail ? ` (${Object.values(i.detail).join(", ")})` : "";
      return `${i.nama}${detail} x${i.jumlah}`;
    }).join("<br>");

    tr.innerHTML = `
      <td>${data.nama || "-"}</td>
      <td>${daftar}</td>
      <td>Rp ${data.total.toLocaleString()}</td>
      <td>${formatWaktu(data.waktu)}</td>
      <td>${data.metode || "-"}</td>
      <td>${data.status}</td>
    `;
    tbody.appendChild(tr);
  });
}

// 📥 Download laporan .CSV
export async function downloadLaporan() {
  const snapshot = await getDocs(query(collection(window.db, "pesanan")));
  const baris = [];

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.status !== "selesai") return;

    const waktu = formatWaktu(data.waktu);
    const nama = data.nama || "-";
    const total = data.total || 0;
    const metode = data.metode || "-";

    const detail = (data.isi || []).map(i => {
      const det = i.detail ? ` (${Object.values(i.detail).join(", ")})` : "";
      return `${i.nama}${det} x${i.jumlah}`;
    }).join(" | ");

    baris.push(`${waktu},${nama},${total},${metode},"${detail}"`);
  });

  const header = "Waktu,Nama,Total,Metode,Pesanan\n";
  const csv = header + baris.join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "laporan_penjualan_kedai_kalli.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

window.downloadLaporan = downloadLaporan;
