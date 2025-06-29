import {
  getDocs,
  collection
} from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// ========================
// === DATA & STOK ========
// ========================

window.keranjang = [];
window.dataStok = {}; // akan diisi dari Firestore

async function ambilStok() {
  const snapshot = await getDocs(collection(window.db, "stok"));
  const stok = {};
  snapshot.forEach(doc => {
    const data = doc.data();
    stok[data.nama] = data.jumlah;
  });
  window.dataStok = stok;

  // setelah stok siap, tampilkan kategori awal
  tampilkanKategori("paket");
}

// =====================
// === KERANJANG LOGIC ===
// =====================

function kembaliKeHome() {
  location.reload();
}

function kembaliKeMenu() {
  document.querySelector("main").classList.remove("hidden");
  document.querySelector(".keranjang-bar").classList.remove("hidden");
  document.getElementById("halaman-ringkasan").classList.add("hidden");
}

function lanjutkanKeRingkasan() {
  document.querySelector("main").classList.add("hidden");
  document.querySelector(".keranjang-bar").classList.add("hidden");
  document.getElementById("halaman-ringkasan").classList.remove("hidden");

  tampilkanKeranjang();

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  document.getElementById("total-harga").textContent = `Total: Rp ${total.toLocaleString()}`;
}

// ==================
// === CAROUSEL  ===
// ==================

let slideIndex = 0;
let slideTimer;

function geserSlide(offset) {
  const track = document.getElementById("carousel-track");
  const slides = track.children.length;
  slideIndex = (slideIndex + offset + slides) % slides;
  track.style.transform = `translateX(-${slideIndex * 100}%)`;
  updateDots();
  resetAutoSlide();
}

function updateDots() {
  const dots = document.querySelectorAll(".carousel-dots span");
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === slideIndex);
  });
}

function resetAutoSlide() {
  clearInterval(slideTimer);
  slideTimer = setInterval(() => geserSlide(1), 5000);
}

// ============================
// === SAAT HALAMAN DILOAD ===
// ============================

window.addEventListener("DOMContentLoaded", () => {
  ambilStok(); // ambil data stok dari firestore
  tampilkanKeranjang(); // langsung render keranjang

  const track = document.getElementById("carousel-track");
  const dotsContainer = document.getElementById("carousel-dots");

  if (track && dotsContainer) {
    const slides = track.children.length;
    for (let i = 0; i < slides; i++) {
      const dot = document.createElement("span");
      if (i === 0) dot.classList.add("active");
      dot.addEventListener("click", () => {
        slideIndex = i;
        track.style.transform = `translateX(-${slideIndex * 100}%)`;
        updateDots();
        resetAutoSlide();
      });
      dotsContainer.appendChild(dot);
    }
    resetAutoSlide();
  }
});

// ====================================
// === EKSPOR FUNGSI KE GLOBAL WINDOW ===
// ====================================
window.kembaliKeHome = kembaliKeHome;
window.kembaliKeMenu = kembaliKeMenu;
window.lanjutkanKeRingkasan = lanjutkanKeRingkasan;
window.geserSlide = geserSlide;
