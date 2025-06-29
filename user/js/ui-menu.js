function tampilkanKategori(kategori) {
  const daftar = document.getElementById("daftar-menu");
  daftar.innerHTML = "";
  document.getElementById("judul-kategori").textContent = kategori.toUpperCase();

  const data = window.menuData[kategori];
  data.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "menu-item";

    let tombolHTML = "";

    // Cek jumlah dalam keranjang
    const stokTersedia = window.dataStok?.[item.nama] ?? 99;

    // === KATEGORI NON-PAKET ===
    if (kategori !== "paket") {
      const existingItem = keranjang.find(k => k.nama === item.nama && !k.detail);
      const jumlah = existingItem?.jumlah || 0;

      if (stokTersedia <= 0) {
        tombolHTML = `<div class="habis-label">HABIS</div>`;
      } else if (jumlah > 0) {
        tombolHTML = `
          <div class="horizontal-center">
            <button class="quantity-btn" onclick="ubahJumlah('${kategori}', ${index}, -1)">–</button>
            <span>${jumlah}</span>
            <button class="quantity-btn" onclick="ubahJumlah('${kategori}', ${index}, 1)">+</button>
          </div>`;
      } else {
        tombolHTML = `<button class="button" onclick="tambahKeKeranjang('${kategori}', ${index})">Tambah</button>`;
      }

    // === KATEGORI PAKET ===
    } else {
      const existingItem = keranjang.find(k => k.nama === item.nama && k.detail);
      const jumlah = existingItem?.jumlah || 0;

      if (stokTersedia <= 0) {
        tombolHTML = `<div class="habis-label">HABIS</div>`;
      } else if (jumlah > 0) {
        tombolHTML = `
          <div style="display:flex; flex-direction:column; align-items:center;">
            <div style="margin-bottom:6px;">${jumlah} item</div>
            <div class="horizontal-center">
              <button class="button" onclick="editPesanan(${keranjang.indexOf(existingItem)})">Edit</button>
              <button class="button" onclick="hapusDariKeranjang(${keranjang.indexOf(existingItem)})">Hapus</button>
            </div>
          </div>`;
      } else {
        tombolHTML = `<button class="button" onclick="bukaPilihan('${kategori}', ${index})">Tambah</button>`;
      }
    }

    div.innerHTML = `
      <img src="${item.gambar}" alt="${item.nama}" />
      <h3>${item.nama}</h3>
      <p>Rp ${item.harga.toLocaleString()}</p>
      ${tombolHTML}
    `;

    daftar.appendChild(div);
  });
}
