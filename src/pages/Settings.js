import React, { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { updateEmail } from "firebase/auth";
import {
  setDoc,
  updateDoc,
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteField,
} from "firebase/firestore";
import Placeholder from "../logo/account-icon.png";
import EditProfilePic from "../components/modal-alerts/EditProfilePic";
import uuid from "react-native-uuid";
import AccountDetailsTemp from "../components/isPending-templates/AccountDetailsTemp";

const Settings = () => {
  const { user, resetPassword } = UserAuth();
  //console.log(user.uid);

  const [isPending, setIsPending] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showChangePic, setShowChangePic] = useState(false);
  const [pwError, setPwError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [joinCodeError, setJoinCodeError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [message, setMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");

  const [access, setAccess] = useState("");
  const [regCode, setRegCode] = useState("");
  const [enterRegCode, setEnterRegCode] = useState("");
  const [pic, setPic] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [code, setCode] = useState("");

  const [newName, setNewName] = useState("");
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCompany, setNewCompany] = useState("");
  const [newCode, setNewCode] = useState("");

  const [joinCompany, setJoinCompany] = useState("");
  const [joinCompanyCode, setJoinCompanyCode] = useState("");

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user?.uid}`), (doc) => {
      setName(doc.data()?.name);
      setEmail(doc.data()?.email);

      setAccess(doc.data()?.access);

      setPic(doc.data()?.["profile pic url"]);
      setCompanyId(doc.data()?.companyId);
      setIsPending(false);
    });
    onSnapshot(doc(db, "Admin", "Codes"), (doc) => {
      setRegCode(doc.data()?.company);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (companyId) {
      onSnapshot(doc(db, "Companies", `${companyId}`), (doc) => {
        setCompany(doc.data()?.name);
        setCode(doc.data()?.code);
      });
    }
  }, [companyId]);

  const handleResetPassword = async (e) => {
    // dont submit page every time I submit form
    e.preventDefault();
    setPwError("");
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("Reset email sent");
    } catch (error) {
      console.log(error.message);
      if (error.message == "Firebase: Error (auth/user-not-found).") {
        console.log(true);
        setPwError("User not found");
      } else {
        setPwError("Failed to send password reset email");
      }
    }
  };

  const handleSave = async () => {
    setCodeError("");
    setJoinCodeError("");
    setSaveMessage("");
    setEmailError("");
    if (newName !== name && newName !== "") {
      updateDoc(doc(db, "Users", user?.uid), {
        name: newName,
      });
      return setIsEditing(false);
    }
    if (newEmail !== email && newEmail !== "") {
      try {
        await updateEmail(user, newEmail);
        updateDoc(doc(db, "Users", user?.uid), {
          email: newEmail,
        });
        return setIsEditing(false);
      } catch (error) {
        return setEmailError(
          "This operation is sensitive. To Modify your email please log in again."
        );
      }
    }
    if (newCompany !== company && newCompany !== "" && access == "Superadmin") {
      if (regCode === Number(enterRegCode)) {
        let uniqueId = uuid.v1();
        let companyId = uniqueId.replace(/-/gi, "");
        updateDoc(doc(db, "Users", user?.uid), {
          organization: "company",
          companyId: companyId,
        });
        setDoc(doc(db, "Companies", companyId), {
          name: newCompany,
          companyId: companyId,
          code: "",
        });
        setEnterRegCode("");
        return setIsEditing(false);
      } else if (enterRegCode.length < 6 < enterRegCode.length) {
        return setCodeError("Incorrect registration code");
      }
    }

    if (newCode !== code && newCode.length === 6 && access == "Superadmin") {
      updateDoc(doc(db, "Companies", companyId), {
        code: newCode,
      });
      return setIsEditing(false);
    } else if (
      newCode !== code &&
      newCode.length < 6 < newCode.length &&
      access == "Superadmin"
    ) {
      return setCodeError("Code must be six digits in length");
    }

    if (
      newCompanyName !== company &&
      newCompanyName !== "" &&
      access == "Superadmin"
    ) {
      updateDoc(doc(db, "Companies", companyId), {
        name: newCompanyName,
      });
      return setIsEditing(false);
    }

    if (
      joinCompany !== "" &&
      joinCompanyCode !== "" &&
      access == "Superadmin"
    ) {
      if (joinCompanyCode.length == 6) {
        const collectionRef = collection(db, "Companies");
        // query operators: https://firebase.google.com/docs/firestore/query-data/queries#query_operators
        const q = query(
          collectionRef,
          where("name", "==", joinCompany),
          where("code", "==", joinCompanyCode)
        );
        const snapshot = await getDocs(q);
        const results = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        if (results.length < 1) {
          return setSaveMessage(
            "Unable to find company. Please double check the name (case sensitive) and registration code"
          );
        }
        let getCompanyId = "";
        results.forEach(async (result) => {
          getCompanyId = result.companyId;
        });
        updateDoc(doc(db, "Users", user?.uid), {
          companyId: getCompanyId,
          organization: "company",
          access: "User",
        });

        return setIsEditing(false);
      } else {
        return setJoinCodeError("Code must be six digits in length");
      }
    }
    return setSaveMessage("Unable to save. Double check your entry");
  };

  return (
    <>
      {user && access !== "Inactive" && (
        <>
          {showChangePic && (
            <EditProfilePic
              open={showChangePic}
              onClose={() => setShowChangePic(false)}
            />
          )}
          <div className="header">
            <p className="header-small">My Account</p>
            <h1 className="header-large">Settings</h1>
          </div>
          {isPending ? (
            <div className="header">{isPending && <AccountDetailsTemp />}</div>
          ) : (
            <>
              <div className="profile-container">
                <div className="left-column">
                  {pic == "" ? (
                    <img className="profile-pic border" src={Placeholder}></img>
                  ) : (
                    <img className="profile-pic" src={pic}></img>
                  )}
                </div>
                <div className="middle-column">
                  <p className="role">
                    {" "}
                    {company == "" ? "Independent" : access}{" "}
                  </p>

                  <p className="name">{name}</p>
                  <p className="email">{email}</p>
                </div>

                <ul className="button-container">
                  <li>
                    <button
                      className="status-btn security-access"
                      onClick={() => setShowChangePic(!showChangePic)}
                    >
                      Change Picture
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleResetPassword}
                      className="status-btn security-access"
                    >
                      Reset Password
                    </button>
                  </li>
                  {pwError ? (
                    <li>
                      <p className="error-message" style={{ display: "block" }}>
                        {" "}
                        {pwError}{" "}
                      </p>
                    </li>
                  ) : (
                    <li>
                      <p
                        className="error-message"
                        style={{ color: "#676767", display: "block" }}
                      >
                        {" "}
                        {message}{" "}
                      </p>
                    </li>
                  )}
                </ul>
              </div>

              <p
                className="error-message"
                style={{ display: "block", margin: "0", textAlign: "center" }}
              >
                {saveMessage}
              </p>

              <div className="save-container">
                <div className="middle-column" style={{ marginTop: "-1.5rem" }}>
                  <div className="header">
                    <p className="header-small">Account Information</p>
                  </div>
                </div>

                {isEditing ? (
                  <>
                    <div style={{ marginTop: "-1.5rem" }}>
                      <button
                        className="status-btn deactivate save-btn"
                        onClick={handleSave}
                      >
                        Save
                      </button>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>

              <div className="account-info-container">
                <div className="input-group account-info">
                  <label htmlFor="name">Full name</label>
                  <input
                    type="name"
                    name="name"
                    placeholder={name}
                    onChange={(e) => {
                      setIsEditing(true);
                      setNewName(e.target.value);
                    }}
                  />
                </div>
                <div className="input-group account-info">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder={email}
                    onChange={(e) => {
                      setIsEditing(true);
                      setNewEmail(e.target.value);
                    }}
                  />

                  <p className="error-message" style={{ display: "block" }}>
                    {" "}
                    {emailError}{" "}
                  </p>
                </div>
              </div>

              {access == "Superadmin" && company == "" ? (
                <>
                  <div className="save-container">
                    <div
                      className="middle-column"
                      style={{ marginTop: "-1.5rem" }}
                    >
                      <div className="header">
                        <p className="header-small">Register A Company</p>
                      </div>
                    </div>
                  </div>

                  <div className="account-info-container">
                    <div className="input-group" style={{ margin: "1.5rem" }}>
                      <label htmlFor="name">Company name</label>
                      <input
                        type="text"
                        name="company-name"
                        placeholder="Enter company name"
                        onChange={(e) => {
                          setIsEditing(true);
                          setNewCompany(e.target.value);
                        }}
                      />
                    </div>
                    <div className="input-group" style={{ margin: "1.5rem" }}>
                      <label htmlFor="reg-code">registration code</label>
                      <input
                        type="number"
                        name="reg-company-code"
                        value={enterRegCode}
                        placeholder="Enter 6 digit registration code"
                        onChange={(e) => {
                          setIsEditing(true);
                          setEnterRegCode(e.target.value);
                        }}
                      />
                      <p
                        style={{
                          color: "darkgray",
                          fontStyle: "italic",
                          marginTop: "5px",
                        }}
                      >
                        This code can be aquired by contacting RoofTracker
                        support at rtsupport@gmail.com
                      </p>
                      <p className="error-message" style={{ display: "block" }}>
                        {" "}
                        {codeError}{" "}
                      </p>
                    </div>
                  </div>

                  <div className="save-container">
                    <div
                      className="middle-column"
                      style={{ marginTop: "-1.5rem" }}
                    >
                      <div className="header">
                        <p className="header-small">Join A Company</p>
                      </div>
                    </div>
                  </div>

                  <div className="account-info-container">
                    <div className="input-group" style={{ margin: "1.5rem" }}>
                      <label htmlFor="name">Company name</label>
                      <input
                        type="text"
                        name="company-name"
                        placeholder="Enter company name"
                        onChange={(e) => {
                          setIsEditing(true);
                          setJoinCompany(e.target.value);
                        }}
                      />
                    </div>
                    <div className="input-group" style={{ margin: "1.5rem" }}>
                      <label htmlFor="reg-code">registration code</label>
                      <input
                        type="number"
                        name="reg-company-code"
                        placeholder="Enter 6 digit registration code"
                        onChange={(e) => {
                          setIsEditing(true);
                          setJoinCompanyCode(e.target.value);
                        }}
                      />
                      <p
                        style={{
                          color: "darkgray",
                          fontStyle: "italic",
                          marginTop: "5px",
                        }}
                      >
                        This code can be aquired by contacting the manager or
                        account holder of the company you are joining
                      </p>
                      <p className="error-message" style={{ display: "block" }}>
                        {" "}
                        {joinCodeError}{" "}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="save-container">
                    <div
                      className="middle-column"
                      style={{ marginTop: "-1.5rem" }}
                    >
                      <div className="header">
                        <p className="header-small">Company Information</p>
                      </div>
                    </div>
                  </div>

                  {access == "Superadmin" ? (
                    <div className="account-info-container">
                      <div className="input-group account-info">
                        <label htmlFor="name">Company name</label>
                        <input
                          type="text"
                          name="name"
                          placeholder={company}
                          onChange={(e) => {
                            setIsEditing(true);
                            setNewCompanyName(e.target.value);
                          }}
                        />
                      </div>
                      <div className="input-group account-info">
                        <label htmlFor="reg-code">
                          New user registration code
                        </label>
                        <input
                          type="number"
                          name="reg-code"
                          placeholder={code}
                          onChange={(e) => {
                            setIsEditing(true);
                            setNewCode(e.target.value);
                          }}
                        />
                        <p
                          className="error-message"
                          style={{ display: "block" }}
                        >
                          {" "}
                          {codeError}{" "}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="account-info-container">
                      <div className="input-group account-info">
                        <label htmlFor="name">Company name</label>
                        <input
                          type="text"
                          name="name"
                          value={company}
                          readOnly
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
      {user && access === "Inactive" && (
        <>
          <div className="header">
            <p className="header-small">
              You're account has been deactivated. Contact your company admin to
              reactivate your account.
            </p>
            <h1 className="header-large">Invalid access</h1>
          </div>
        </>
      )}
    </>
  );
};

export default Settings;
