import {
  collection,
  getDocs,
  setDoc,
  getDoc,
  doc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Tampilkan tabel stok
export async function tampilkanStok() {
  const snapshot = await getDocs(collection(window.db, "stok"));
  const tbody = document.getElementById("isi-stok");
  tbody.innerHTML = "";

  const role = window.currentRole;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.nama}</td>
      <td id="stok-${id}">${data.jumlah}</td>
      <td>
        ${
          (role === "admin" || role === "master") ? `
            <button onclick="ubahStok('${id}', -1)">–</button>
            <button onclick="ubahStok('${id}', 1)">+</button>
            <button onclick="hapusItemStok('${id}')">🗑️</button>
          ` : `<span style="color: #888;">Hanya lihat</span>`
        }
      </td>
    `;
    tbody.appendChild(row);
  });

  // Tampilkan tombol tambah hanya jika admin/master
  const btn = document.getElementById("btn-tambah-stok");
  if (btn) btn.style.display = (role === "admin" || role === "master") ? "inline-block" : "none";
}

// Ubah jumlah stok
export async function ubahStok(id, perubahan) {
  if (window.currentRole !== "admin" && window.currentRole !== "master") return;

  const ref = doc(window.db, "stok", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert("Item tidak ditemukan.");

  const data = snap.data();
  let jumlahBaru = (data.jumlah || 0) + perubahan;
  if (jumlahBaru < 0) jumlahBaru = 0;

  await setDoc(ref, {
    nama: data.nama,
    jumlah: jumlahBaru
  });

  document.getElementById(`stok-${id}`).textContent = jumlahBaru;
}

// Hapus item stok
export async function hapusItemStok(id) {
  if (window.currentRole !== "admin" && window.currentRole !== "master") return;

  const konfirmasi = confirm("Yakin ingin menghapus item ini?");
  if (!konfirmasi) return;

  await deleteDoc(doc(window.db, "stok", id));
  await tampilkanStok();
}

// Tambah item baru
window.tambahStokBaru = async function () {
  if (window.currentRole !== "admin" && window.currentRole !== "master") return;

  const nama = prompt("Nama item:");
  if (!nama) return;

  const jumlah = parseInt(prompt("Jumlah stok awal:"), 10);
  if (isNaN(jumlah)) return alert("Jumlah tidak valid.");

  const id = nama.toLowerCase().replace(/\s+/g, "_");

  await setDoc(doc(window.db, "stok", id), {
    nama,
    jumlah
  });

  await tampilkanStok();
};
