import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth, db } from "../config/firebase"; // Ensure 'db' is exported in your firebase.js
import { doc, getDoc, setDoc } from "firebase/firestore";

/**
 * SIGN UP USER
 * Creates a user in Firebase Auth and a corresponding profile in Firestore
 */
export const signupUser = async (email, password, role = "user") => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // Create the user document in Firestore with the assigned role
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    role: role,
    createdAt: new Date().toISOString(),
  });

  return { ...user, role };
};

/**
 * LOGIN USER
 * Authenticates with Firebase Auth and fetches the Role from Firestore
 */
export const loginUser = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;

  // FETCH THE ROLE: This is the key fix for your navigation issue
  const userDoc = await getDoc(doc(db, "users", user.uid));
  
  if (userDoc.exists()) {
    const userData = userDoc.data();
    // Return the Auth object merged with the Firestore 'role' string
    return { ...user, role: userData.role }; 
  } else {
    console.error("No user role found in Firestore for UID:", user.uid);
    return { ...user, role: null };
  }
};

/**
 * LOGOUT USER
 */
export const logoutUser = async () => {
  await signOut(auth);
};

/**
 * AUTH STATE TRACKER
 * Monitors login status and fetches role updates
 */
export const trackAuthState = (callback) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const role = userDoc.exists() ? userDoc.data().role : null;
      
      console.log("🔐 Auth State Updated | Role:", role);
      if (callback) callback({ ...user, role });
    } else {
      console.log("🔓 Auth State: Logged Out");
      if (callback) callback(null);
    }
  });
};

/**
 * RESET PASSWORD
 */
export const resetPassword = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }
  await sendPasswordResetEmail(auth, email);
};