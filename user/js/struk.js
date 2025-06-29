function tampilkanStruk() {
  document.getElementById("halaman-qr").classList.add("hidden");
  document.getElementById("halaman-struk").classList.remove("hidden");

  const nama = window.namaPembeliKalli || "Tanpa Nama";
  const id = localStorage.getItem("id_pesanan_kalli") || "-";
  const waktu = new Date().toLocaleString();
  const metode = "Kasir"; // bisa diganti kalau non-tunai

  document.getElementById("nama-struk").textContent = nama;
  document.getElementById("id-transaksi-struk").textContent = `ID: ${id}`;
  document.getElementById("tanggal-struk").textContent = `Tanggal: ${waktu}`;
  document.getElementById("metode-struk").textContent = metode;

  const tbody = document.getElementById("tabel-struk");
  tbody.innerHTML = "";
  let total = 0;

  keranjang.forEach(item => {
    const qty = item.jumlah;
    const harga = item.harga;
    const subtotal = qty * harga;
    total += subtotal;

    let detail = "";
    if (item.detail) {
      detail = " (" + Object.values(item.detail).join(", ") + ")";
    }

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.nama}${detail}</td>
      <td style="text-align:center;">${qty}</td>
      <td style="text-align:center;">Rp ${harga.toLocaleString()}</td>
      <td style="text-align:center;">Rp ${subtotal.toLocaleString()}</td>
    `;
    tbody.appendChild(row);
  });

  document.getElementById("total-struk").textContent = `Rp ${total.toLocaleString()}`;
}

function downloadStruk() {
  const element = document.getElementById("struk-wrapper");

  // Pastikan elemen tidak tersembunyi saat dirender PDF
  const strukHalaman = document.getElementById("halaman-struk");
  const sebelumnyaTersembunyi = strukHalaman.classList.contains("hidden");

  if (sebelumnyaTersembunyi) {
    strukHalaman.classList.remove("hidden");
  }

  const opt = {
    margin:       [5, 5], // atas/bawah, kiri/kanan (dalam mm)
    filename:     `struk_kedai_kalli_${Date.now()}.pdf`,
    image:        { type: 'jpeg', quality: 1 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a6', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save().then(() => {
    // Kembalikan ke hidden kalau awalnya tersembunyi
    if (sebelumnyaTersembunyi) {
      strukHalaman.classList.add("hidden");
    }
  });
}

function kirimStrukLangsungKeWA() {
  const wa = prompt("Masukkan nomor WhatsApp (contoh: 08xxxxxxx):");

  if (!wa) {
    alert("Nomor WhatsApp tidak boleh kosong.");
    return;
  }

  const nama = window.namaPembeliKalli || 'Tanpa Nama';
  let teks = `Halo, ini struk pesanan atas nama ${nama}\nPesanan:\n`;

  keranjang.forEach(item => {
    let baris = `- ${item.nama} x${item.jumlah}`;
    if (item.detail) {
      const det = Object.entries(item.detail).map(([k, v]) => `${k}: ${v}`).join(', ');
      baris += ` (${det})`;
    }
    teks += baris + `\n`;
  });

  const total = keranjang.reduce((sum, item) => sum + (item.harga * item.jumlah), 0);
  teks += `Total: Rp ${total.toLocaleString()}`;

  const link = `https://wa.me/62${wa.replace(/^0/, '')}?text=${encodeURIComponent(teks)}`;
  window.open(link, '_blank');
}

function kembaliKeHome() {
  // 🧼 Bersihkan ID pesanan dari localStorage
  localStorage.removeItem("id_pesanan_kalli");

  // 🔄 Reload ke awal
  location.reload();
}
