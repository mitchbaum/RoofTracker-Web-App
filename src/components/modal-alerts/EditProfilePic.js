import React from "react";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field"; //DOCS: https://bestofreactjs.com/repo/cchanxzy-react-currency-input-field-react-masked-input
import { motion } from "framer-motion";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserAuth } from "../../context/AuthContext";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

const EditProfilePic = ({ open, onClose }) => {
  const { user } = UserAuth();

  const [dismiss, setDismiss] = useState(false);
  const [message, setMessage] = useState("");

  const [imageUploadName, setImageUploadName] = useState(null);

  if (!open) return null;
  if (dismiss == true) return console.log("saved");

  const uploadImage = async () => {
    if (imageUploadName == null) {
      return;
    }
    const imageRef = ref(storage, `user profile photos/${user?.uid}`);
    console.log("uploading profile picture");
    setMessage("Saving...");
    await uploadBytes(imageRef, imageUploadName).then((snapshot) => {
      // run this function when upload is complete
      getDownloadURL(snapshot.ref).then((url) => {
        updateDoc(doc(db, "Users", user?.uid), {
          "profile pic url": url,
        });
      });
      return setDismiss(true);
    });
  };

  return (
    <div className="overlay">
      <motion.div
        className="modal-container"
        variants={dropIn}
        inital="hidden"
        animate="visible"
        exit="exit"
      >
        <h1 className="header-large">Change Picture</h1>

        <div className="input-group" style={{ marginBottom: "1rem" }}>
          <input
            className="file"
            type="file"
            onChange={(e) => {
              setImageUploadName(e.target.files[0]);
            }}
          />
        </div>

        <button
          className="status-btn deactivate show-summary-btn"
          onClick={uploadImage}
          style={{ marginLeft: "0", marginTop: "0" }}
        >
          Save Picture
        </button>
        <button
          className="status-btn security-access show-summary-btn"
          onClick={onClose}
          style={{ marginTop: "0" }}
        >
          Cancel
        </button>
        <p
          className="error-message"
          style={{ color: "#676767", display: "block" }}
        >
          {message}
        </p>
      </motion.div>
    </div>
  );
};

export default EditProfilePic;
