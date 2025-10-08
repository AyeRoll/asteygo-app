import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { firebaseApp } from "./firebaseConfig";

const auth = getAuth(firebaseApp);

export const register = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logout = () => auth.signOut();
