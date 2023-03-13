import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserAuth } from "../context/AuthContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { user } = UserAuth();
  const { uid } = useParams();
  const [companyId, setCompanyId] = useState("");
  const [access, setAccess] = useState("");

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user?.uid}`), (doc) => {
      setAccess(doc.data()?.access);
      setCompanyId(doc.data()?.companyId);
    });
  }, [user?.uid]);

  if (user && access == "Inactive" && uid !== user?.uid) {
    console.log(user);
    return <Navigate to="/error" />;
  } else {
    return children;
  }
};

export default ProtectedRoute;
