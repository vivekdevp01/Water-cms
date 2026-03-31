// // Import Firebase core
// import { initializeApp } from "firebase/app";

// // Import Firestore
// import { getFirestore } from "firebase/firestore";

// // (Optional) Analytics – you can REMOVE this if you want
// import { getAnalytics } from "firebase/analytics";
// import { getAuth } from "firebase/auth";
// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyBVHNSW7iIfGO_j5kC_HRXCpDNARL5p478",
//   authDomain: "complaint-system-ef4ef.firebaseapp.com",
//   projectId: "complaint-system-ef4ef",
//   storageBucket: "complaint-system-ef4ef.firebasestorage.app",
//   messagingSenderId: "162891964834",
//   appId: "1:162891964834:web:6bfec802784202a7f992fb",
//   measurementId: "G-MD9NMYZWZT",
// };

// // Initialize Firebase app
// const app = initializeApp(firebaseConfig);

// // Initialize Firestore and EXPORT it
// export const db = getFirestore(app);

// // export const auth=getAuth(app);
// export const auth=getAuth(app);

// // Optional: Analytics (safe to keep)
// export const analytics = getAnalytics(app);
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBcUmb9Af2Oa2nft5SF0yI0XzktAerj0Eo",
  authDomain: "mentor-erp.firebaseapp.com",
  projectId: "mentor-erp",
  storageBucket: "mentor-erp.firebasestorage.app",
  messagingSenderId: "215270012016",
  appId: "1:215270012016:web:f7325a0b26b577431870b5",
  measurementId: "G-5RYYDDEJKJ",
  databaseURL:
    "https://mentor-erp-default-rtdb.asia-southeast1.firebasedatabase.app",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
// export const auth=getAuth(app);
export const auth = getAuth(app);

// Optional: Analytics (safe to keep)
export const analytics = getAnalytics(app);
export const realtimeDB = getDatabase(app); // ✅ EXPORT THIS
