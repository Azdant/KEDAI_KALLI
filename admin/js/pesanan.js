import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Fungsi untuk mengambil dan menampilkan pesanan
export async function ambilPesanan() {
  const snapshot = await getDocs(collection(window.db, "pesanan"));
  const tbody = document.getElementById("isi-tabel");
  if (!tbody) return;

  tbody.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();
    if (!data?.waktu) return;

    const waktu = data.waktu.toDate().toLocaleString();
    const nama = data.nama || "-";
    const total = data.total || 0;
    const metode = data.metode || "-";
    const status = data.status || "menunggu";

    const isi = (data.isi || []).map(item => {
      const det = item.detail ? ` (${Object.values(item.detail).join(", ")})` : "";
      return `${item.nama}${det} x${item.jumlah}`;
    }).join("<br>");

    const baris = document.createElement("tr");
    baris.innerHTML = `
      <td>${nama}</td>
      <td>${isi}</td>
      <td>Rp ${total.toLocaleString()}</td>
      <td>${waktu}</td>
      <td>${status}</td>
      <td>${status !== "selesai" ? `<button onclick="tandaiSelesaiManual('${doc.id}')">Selesai</button>` : "-"}</td>
    `;

    tbody.appendChild(baris);
  });
}

// Fungsi untuk menandai selesai dari dashboard (manual)
export async function tandaiSelesai(docId) {
  const { updateDoc, doc } = await import("https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js");
  await updateDoc(doc(window.db, "pesanan", docId), {
    status: "selesai"
  });
  alert("Pesanan ditandai selesai.");
  ambilPesanan(); // Refresh ulang tabel
}

// Versi global agar tombol bisa memanggil
window.tandaiSelesaiManual = tandaiSelesai;
