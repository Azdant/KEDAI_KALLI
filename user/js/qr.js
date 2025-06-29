import {
  collection,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
  setDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

async function tampilkanQRCode(metode = "tunai") {
  const namaPembeli = document.getElementById("nama-pembeli").value.trim();
  if (!namaPembeli) {
    alert("Silakan isi nama terlebih dahulu.");
    return;
  }

  const catatan = document.getElementById("catatan")?.value.trim() || "";
  if (catatan.length > 100) {
    alert("Catatan tidak boleh lebih dari 100 karakter.");
    return;
  }

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  const pesanan = {
    nama: namaPembeli,
    catatan,
    total,
    metode,
    status: "menunggu",
    isi: keranjang,
    waktu: serverTimestamp()
  };

  try {
    const docRef = await addDoc(collection(window.db, "pesanan"), pesanan);
    localStorage.setItem("id_pesanan_kalli", docRef.id);
    await kurangiStokSetelahPesan(keranjang);

    document.querySelector("main").classList.add("hidden");
    document.querySelector(".keranjang-bar").classList.add("hidden");
    document.getElementById("halaman-ringkasan").classList.add("hidden");
    document.getElementById("halaman-qr").classList.remove("hidden");

    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = "";

    let teksQR = `Kedai Kalli\nNama: ${namaPembeli}\n`;

    keranjang.forEach(item => {
      let detailText = '';
      if (item.detail) {
        detailText = ' (' + Object.values(item.detail).join(', ') + ')';
      }
      teksQR += `- ${item.nama}${detailText} x${item.jumlah} = Rp ${(item.harga * item.jumlah).toLocaleString()}\n`;
    });

    teksQR += `Metode: ${metode}\n`;
    teksQR += `Total: Rp ${total.toLocaleString()}\n`;
    teksQR += `ID: ${docRef.id}`;

    new QRCode(qrContainer, {
      text: teksQR,
      width: 250,
      height: 250
    });

    // Tambahkan pesan status
    const infoText = document.createElement("p");
    infoText.id = "animasi-menunggu";
    infoText.textContent = "Menunggu konfirmasi dari kasir";
    infoText.style.marginTop = "10px";
    infoText.style.textAlign = "center";
    infoText.style.color = "#555";
    qrContainer.appendChild(infoText);

    // Tambahkan animasi titik-titik
    let dotCount = 0;
    setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      infoText.textContent = "Menunggu konfirmasi dari kasir" + ".".repeat(dotCount);
    }, 700);

    window.namaPembeliKalli = namaPembeli;

    // 🔁 Pantau status real-time
    pantauStatusPesanan(docRef.id);

  } catch (err) {
    alert("Gagal menyimpan pesanan: " + err.message);
  }
}

// 🔄 Kurangi stok dari Firestore
async function kurangiStokSetelahPesan(keranjang) {
  for (const item of keranjang) {
    const ref = doc(window.db, "stok", idDariNama(item.nama));
    const snap = await getDoc(ref);
    if (!snap.exists()) continue;

    const data = snap.data();
    let stokBaru = (data.jumlah || 0) - item.jumlah;
    if (stokBaru < 0) stokBaru = 0;

    await setDoc(ref, {
      nama: data.nama,
      jumlah: stokBaru
    });
  }
}

// 🔍 Ubah nama jadi ID (misal: "Sate Ayam" → "sate_ayam")
function idDariNama(nama) {
  return nama.toLowerCase().replace(/\s+/g, "_");
}

// 🔁 Pantau status pesanan dari Firestore (real-time)
function pantauStatusPesanan(id) {
  const ref = doc(window.db, "pesanan", id);
  onSnapshot(ref, (snap) => {
    const data = snap.data();
    if (data?.status === "selesai") {
      tampilkanStruk();
    }
  });
}

// ✅ Cek saat reload (kalau sudah punya ID sebelumnya)
document.addEventListener("DOMContentLoaded", () => {
  const id = localStorage.getItem("id_pesanan_kalli");
  const qrPageVisible = document.getElementById("halaman-qr")?.classList.contains("hidden") === false;

  if (id && qrPageVisible) {
    pantauStatusPesanan(id);
  }
});

window.tampilkanQRCode = tampilkanQRCode;
