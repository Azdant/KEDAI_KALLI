import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

let currentId = "";
let stream;

export function setupScanQR() {
  const video = document.getElementById("preview");
  const hasil = document.getElementById("hasil-scan");
  hasil.classList.add("hidden");

  if (!video) return;

  navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
    .then(s => {
      stream = s;
      video.srcObject = stream;
      startScan(video);
    })
    .catch(err => alert("Tidak dapat mengakses kamera: " + err.message));
}

function startScan(video) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const tick = () => {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = window.jsQR(imageData.data, canvas.width, canvas.height);
      if (code) {
        stream.getTracks().forEach(t => t.stop());
        prosesQR(code.data);
        return;
      }
    }
    requestAnimationFrame(tick);
  };

  tick();
}

async function prosesQR(teks) {
  const match = teks.match(/ID:\s*([a-zA-Z0-9]{20,})/);
  if (!match) return alert("QR tidak valid!");

  const id = match[1];
  currentId = id;

  const ref = doc(window.db, "pesanan", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return alert("Pesanan tidak ditemukan!");

  const data = snap.data();

  // Tampilkan data
  document.getElementById("nama").textContent = data.nama || "-";
  document.getElementById("total").textContent = "Rp " + data.total.toLocaleString();
  document.getElementById("metode-pembayaran").value = data.metode || "tunai";

  const ul = document.getElementById("daftar-item");
  ul.innerHTML = "";
  (data.isi || []).forEach(item => {
    let detail = "";
    if (item.detail) {
      detail = " (" + Object.values(item.detail).join(", ") + ")";
    }
    ul.innerHTML += `<li>${item.nama}${detail} x${item.jumlah}</li>`;
  });

  document.getElementById("hasil-scan").classList.remove("hidden");
}

window.tandaiSelesai = async function () {
  if (!currentId) return alert("Tidak ada pesanan aktif.");

  const metode = document.getElementById("metode-pembayaran")?.value || "tunai";

  try {
    await updateDoc(doc(window.db, "pesanan", currentId), {
      status: "selesai",
      metode
    });

    alert("Pesanan ditandai selesai!");

    // Reset
    document.getElementById("hasil-scan").classList.add("hidden");
    document.getElementById("preview").srcObject = null;
    currentId = "";
  } catch (err) {
    alert("Gagal menyelesaikan pesanan: " + err.message);
  }
};

// ⬇ Load jsQR script (hanya sekali)
if (!window.jsQR) {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
  document.head.appendChild(script);
}
