// admin/js/main.js
import "./auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";
import { ambilPesanan, tandaiSelesai } from "./pesanan.js";
import { updateRingkasan, tampilkanTabelLaporan, downloadLaporan } from "./laporan.js";
import { tampilkanStok, ubahStok } from "./stok.js";
import { setupScanQR } from "./scanner.js";
import { buatAkunBaru } from "./akun.js";

// 🔁 Akses global
window.tandaiSelesai = tandaiSelesai;
window.ubahStok = ubahStok;
window.downloadLaporan = downloadLaporan;

// Ganti halaman
window.tampilkanHalaman = function (id) {
  document.querySelectorAll(".halaman").forEach(el => el.classList.remove("aktif"));
  document.getElementById(id)?.classList.add("aktif");
  if (id === "scan") setupScanQR();
};

// Logout
window.logout = async function () {
  await window.auth.signOut();
  window.location.href = "index.html";
};

// 🔐 Cek role dan inisialisasi dashboard
window.auth.onAuthStateChanged(async (user) => {
  if (!user) return (window.location.href = "index.html");

  try {
    const snap = await getDoc(doc(window.db, "pengguna", user.uid));
    const data = snap.data();

    if (!data?.role) return alert("Role tidak ditemukan.");
    const role = data.role;

    console.log("Login sebagai:", role);

    // Tampilkan fitur khusus master
    if (role === "master") {
      document.getElementById("menu-akun")?.classList.remove("hidden");
    }

    // Tampilkan data awal
    updateRingkasan("harian");
    tampilkanTabelLaporan("harian");
    tampilkanStok();
    ambilPesanan();

    // Event: saat dropdown laporan diganti
    const filter = document.querySelector("select[onchange*='gantiTipeLaporan']");
    if (filter) {
      filter.addEventListener("change", (e) => {
        const tipe = e.target.value;
        updateRingkasan(tipe);
        tampilkanTabelLaporan(tipe);
      });
    }

  } catch (err) {
    console.error("Gagal memuat data pengguna:", err);
    alert("Gagal memuat role pengguna.");
  }
});

// 🔐 Buat akun baru (khusus master)
const form = document.getElementById("form-akun");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email-baru").value.trim();
    const password = document.getElementById("password-baru").value.trim();
    const role = document.getElementById("role-baru").value;
    const pesan = document.getElementById("pesan-akun");

    try {
      await buatAkunBaru(email, password, role);
      pesan.textContent = "Akun berhasil dibuat.";
      form.reset();
    } catch (err) {
      pesan.textContent = "Gagal: " + err.message;
    }
  });
}
