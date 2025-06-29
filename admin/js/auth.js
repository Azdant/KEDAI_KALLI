// admin/js/auth.js
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

// Tunggu status login user
window.auth.onAuthStateChanged(async (user) => {
  if (!user) {
    // Belum login → kembali ke login page
    window.location.href = "index.html";
    return;
  }

  const docRef = doc(window.db, "pengguna", user.uid);
  const snap = await getDoc(docRef);

  if (!snap.exists()) {
    alert("Akun tidak terdaftar dalam sistem.");
    window.auth.signOut();
    window.location.href = "index.html";
    return;
  }

  const role = snap.data().role;
  if (!["master", "admin", "kasir"].includes(role)) {
    alert("Role tidak valid.");
    window.auth.signOut();
    window.location.href = "index.html";
  }

  // Jika valid, lanjut ke halaman
});
