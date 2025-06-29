import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js";
import { setDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

export async function buatAkunBaru(email, password, role) {
  const secondaryApp = getAuth().app || window.firebaseApp;

  const secondaryAuth = getAuth(secondaryApp);

  // Buat user baru
  const userCred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
  const uid = userCred.user.uid;

  // Simpan role pengguna baru di Firestore
  await setDoc(doc(window.db, "pengguna", uid), {
    role: role
  });

  // Logout dari akun yang baru dibuat agar tidak menimpa sesi master admin
  await secondaryAuth.signOut();
}
