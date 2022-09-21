import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import {
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState();

  function signUp(email, password, name, organization, access, companyId) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        setDoc(doc(db, "Users", cred.user.uid), {
          email: email,
          name: name,
          password: password,
          "profile pic url": "",
          organization: organization,
          uid: cred.user.uid,
          access: access,
          companyId: companyId,
        });
      })
      .catch((error) => {
        if (error.code == "auth/email-already-in-use") {
          return "error";
        }
      });
    // db, "users" = collections name, email = document ID
  }

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  // when component mounts, check if user is signed in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => {
      unsubscribe();
    };
  });

  // these values (signUp, logIn, logOut, user) are used with the Login.js and SignUp.js to make authentication work in Firebase
  return (
    <AuthContext.Provider
      value={{ signUp, logIn, logOut, resetPassword, user }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function UserAuth() {
  return useContext(AuthContext);
}
