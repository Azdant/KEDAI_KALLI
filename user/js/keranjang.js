// js/keranjang.js

function tambahKeKeranjang(kategori, index) {
  const item = menuData[kategori][index];
  const existingIndex = keranjang.findIndex(k => k.nama === item.nama && !k.detail);

  if (existingIndex !== -1) {
    keranjang[existingIndex].jumlah += 1;
  } else {
    keranjang.push({ ...item, jumlah: 1 });
  }

  tampilkanKeranjang();
  tampilkanKategori(kategori);
  perbaruiVisibilitasKeranjang();
}

function ubahJumlah(kategori, index, perubahan) {
  const item = menuData[kategori][index];
  const stok = window.dataStok?.[item.nama] ?? 99;

  const existingIndex = keranjang.findIndex(k => k.nama === item.nama && !k.detail);
  if (existingIndex !== -1) {
    const jumlahBaru = keranjang[existingIndex].jumlah + perubahan;
    if (jumlahBaru < 1) {
      keranjang.splice(existingIndex, 1);
    } else if (jumlahBaru > stok) {
      alert("Jumlah melebihi stok.");
      return;
    } else {
      keranjang[existingIndex].jumlah = jumlahBaru;
    }
  }

  tampilkanKeranjang();
  tampilkanKategori(kategori);
}

function ubahJumlahLangsung(index, perubahan) {
  const item = keranjang[index];
  const stok = window.dataStok?.[item.nama] ?? 99;

  const jumlahBaru = item.jumlah + perubahan;
  if (jumlahBaru < 1) return;
  if (jumlahBaru > stok) {
    alert("Jumlah melebihi stok yang tersedia.");
    return;
  }

  item.jumlah = jumlahBaru;
  tampilkanKeranjang();
}

function tampilkanKeranjang() {
  const ringkasanAktif = document.getElementById("halaman-ringkasan")?.classList.contains("section") &&
                         !document.getElementById("halaman-ringkasan").classList.contains("hidden");

  if (keranjang.length === 0 && ringkasanAktif) {
    alert("Keranjang kosong. Kembali ke menu utama.");
    kembaliKeHome();
    return;
  }

  const totalSpan = document.getElementById("keranjang-total");
  const isiBox = document.getElementById("isi-keranjang");
  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  totalSpan.textContent = `Total : Rp. ${total.toLocaleString()}`;

  if (!isiBox) return;
  isiBox.innerHTML = '';

  keranjang.forEach((item, i) => {
    let detail = '';
    if (item.detail) {
      for (let k in item.detail) {
        detail += `<br><small>${k}: ${item.detail[k]}</small>`;
      }
    }

    const catatan = item.catatan ? `<br><em>Catatan: ${item.catatan}</em>` : '';

    isiBox.innerHTML += `
      <div class="keranjang-item">
        <img src="${item.gambar}" style="width:40px;height:40px;border-radius:6px;margin-right:8px;">
        <span>
          ${item.nama} - Rp ${(item.harga * item.jumlah).toLocaleString()}${detail}${catatan}
          <div class="horizontal-center" style="margin-top:6px;">
            <button class="quantity-btn" onclick="ubahJumlahLangsung(${i}, -1)">–</button>
            <span>${item.jumlah}</span>
            <button class="quantity-btn" onclick="ubahJumlahLangsung(${i}, 1)">+</button>
          </div>
        </span>
        ${item.detail ? `<button class="button" onclick="editPesanan(${i})">Edit</button>` : ""}
        <button class="button" onclick="hapusDariKeranjang(${i})">Hapus</button>
      </div>
    `;
  });
}

function hapusDariKeranjang(index) {
  keranjang.splice(index, 1);
  tampilkanKeranjang();
}

function bukaPilihan(kategori, index) {
  const item = menuData[kategori][index];
  const modal = document.getElementById("modal-pilihan");
  const content = document.getElementById("konten-modal");

  if (!modal || !content) {
    console.error("Elemen modal-pilihan atau konten-modal tidak ditemukan di DOM");
    return;
  }

  let html = `<h3 class="modal-title">Pilihan untuk ${item.nama}</h3><form id="form-pilihan" class="modal-form">`;

  for (let k in item.pilihan) {
    html += `<div class="modal-field"><label>${k}</label><select name="${k}" required>`;
    item.pilihan[k].forEach(opt => {
      html += `<option value="${opt}">${opt}</option>`;
    });
    html += `</select></div>`;
  }

  html += `<div class="modal-actions"><button type="submit" class="button">Simpan</button></div></form>`;

  content.innerHTML = html;
  modal.classList.remove("hidden");

  document.getElementById("form-pilihan").onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const detail = {};
    for (let [k, v] of formData.entries()) detail[k] = v;

    keranjang.push({ ...item, jumlah: 1, detail });
    modal.classList.add("hidden");
    tampilkanKeranjang();
  };

  modal.addEventListener("click", function (e) {
    if (e.target === this) this.classList.add("hidden");
  });
}

function editPesanan(index) {
  const item = keranjang[index];
  if (!item.detail) return alert("Item ini tidak memiliki opsi untuk diedit.");

  const modal = document.getElementById("modal-pilihan");
  const content = document.getElementById("konten-modal");

  let html = `<h3 class="modal-title">Edit ${item.nama}</h3><form id="form-edit-pilihan" class="modal-form">`;

  for (let k in item.detail) {
    html += `<div class="modal-field"><label>${k}</label><select name="${k}" required>`;
    const opsi = menuData.paket.find(p => p.nama === item.nama)?.pilihan?.[k] || [];
    opsi.forEach(opt => {
      const selected = item.detail[k] === opt ? "selected" : "";
      html += `<option value="${opt}" ${selected}>${opt}</option>`;
    });
    html += `</select></div>`;
  }

  html += `<div class="modal-actions"><button type="submit" class="button">Simpan</button></div></form>`;

  content.innerHTML = html;
  modal.classList.remove("hidden");

  document.getElementById("form-edit-pilihan").onsubmit = function(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    for (let [k, v] of formData.entries()) {
      item.detail[k] = v;
    }
    modal.classList.add("hidden");
    tampilkanKeranjang();
  };

  modal.addEventListener("click", function (e) {
    if (e.target === this) this.classList.add("hidden");
  });
}

function perbaruiVisibilitasKeranjang() {
  const keranjangBar = document.querySelector(".keranjang-bar");
  if (!keranjangBar) return;

  if (keranjang.length > 0) {
    keranjangBar.classList.remove("hidden");
  } else {
    keranjangBar.classList.add("hidden");
  }
}
