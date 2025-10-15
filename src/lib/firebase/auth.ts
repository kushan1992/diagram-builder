import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./config";
import { User, UserRole } from "../types";

export const signUp = async (
  email: string,
  password: string,
  role: UserRole = "editor"
): Promise<User> => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const firebaseUser = userCredential.user;

  const newUser: User = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || email,
    role,
    createdAt: new Date(),
  };

  await setDoc(doc(db, "users", firebaseUser.uid), {
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt,
  });

  return newUser;
};

export const signIn = async (
  email: string,
  password: string
): Promise<User> => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  return await getUserData(userCredential.user);
};

export const signOut = async (): Promise<void> => {
  await firebaseSignOut(auth);
};

export const getUserData = async (
  firebaseUser: FirebaseUser
): Promise<User> => {
  const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

  if (!userDoc.exists()) {
    throw new Error("User data not found");
  }

  const userData = userDoc.data();

  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || userData.email,
    role: userData.role as UserRole,
    createdAt: userData.createdAt?.toDate() || new Date(),
  };
};
