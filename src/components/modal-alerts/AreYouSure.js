import React from "react";
import { motion } from "framer-motion";
import { useState } from "react";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import { updateDoc, doc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { getStorage, ref, deleteObject } from "firebase/storage";
import moment from "moment"; // reference how to use moment https://momentjs.com/

const AreYouSure = ({
  fileData,
  open,
  onClose,
  action,
  uid,
  itemData,
  permission,
  authUserId,
}) => {
  const [error, setError] = useState("");

  if (!open) return null;

  const storage = getStorage();

  const handleSubmit = async () => {
    const getFromattedDate = moment().format("LL");
    if (action == "Deactivate Account") {
      updateDoc(doc(db, "Users", uid), {
        access: "Inactive",
      });
    }
    if (action == "Reactivate Account") {
      updateDoc(doc(db, "Users", uid), {
        access: "User",
      });
    }
    if (action == "Promote to Superadmin") {
      updateDoc(doc(db, "Users", uid), {
        access: "Superadmin",
      });
    }
    if (action == "Promote to Admin") {
      updateDoc(doc(db, "Users", uid), {
        access: "Admin",
      });
    }
    if (action == "Demote to Admin") {
      updateDoc(doc(db, "Users", uid), {
        access: "Admin",
      });
    }
    if (action == "Demote to User") {
      updateDoc(doc(db, "Users", uid), {
        access: "User",
      });
    }
    if (action == "Delete File") {
      const storageRef = ref(storage, `${uid}/${fileData.id}.png`);
      if (permission === "view" && authUserId !== uid) {
        return setError("Unable to delete file. You are a viewer");
      }
      if (fileData.imageData === "") {
        return deleteDoc(doc(db, `Users/${uid}/Files/${fileData.id}`));
      }
      // Delete the file image in storage
      deleteObject(storageRef)
        .then(() => {
          deleteDoc(doc(db, `Users/${uid}/Files/${fileData.id}`));
        })
        .catch((error) => {
          console.log(error);
          return setError("Unable to delete file");
        });
    }

    if (action == "Delete Check") {
      if (permission === "view" && authUserId !== uid) {
        return setError("Unable to delete check. You are a viewer");
      }
      await deleteDoc(
        doc(
          db,
          `Users/${uid}/Files/${fileData.id}/FileInformation/${itemData.id}`
        )
      )
        .then(() => {
          return;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    if (action == "Delete ACV Item") {
      if (permission === "view" && authUserId !== uid) {
        return setError("Unable to delete ACV item. You are a viewer");
      }
      await deleteDoc(
        doc(
          db,
          `Users/${uid}/Files/${fileData.id}/FileInformation/${itemData.id}`
        )
      )
        .then(() => {
          return;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (action == "Delete RCV Item") {
      if (permission === "view" && authUserId !== uid) {
        return setError("Unable to delete RCV item. You are a viewer");
      }
      await deleteDoc(
        doc(
          db,
          `Users/${uid}/Files/${fileData.id}/FileInformation/${itemData.id}`
        )
      )
        .then(() => {
          return;
        })
        .catch((error) => {
          console.log(error);
        });
    }

    if (action == "Delete Cash Item") {
      if (permission === "view" && authUserId !== uid) {
        return setError("Unable to delete cash item. You are a viewer");
      }
      await deleteDoc(
        doc(
          db,
          `Users/${uid}/Files/${fileData.id}/FileInformation/${itemData.id}`
        )
      )
        .then(() => {
          return;
        })
        .catch((error) => {
          console.log(error);
        });
    }
    updateDoc(doc(db, `Users/${uid}/Files/${fileData.id}`), {
      timeStamp: getFromattedDate,
      modified: serverTimestamp(),
    });

    return;
  };

  const getCurrencyLabel = (data, placeholder) => {
    if (data == "") {
      return placeholder;
    } else {
      return (
        "$" + (data * 1).toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
      );
    }
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
        <h1 className="header-large">Are you sure?</h1>
        {action == "Delete File" && (
          <p
            className="error-message"
            style={{ color: "#676767", display: "block" }}
          >
            This file will not be recoverable
          </p>
        )}
        {action == "Delete Check" && (
          <>
            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Check number:{" "}
              <span className="FI-message">{itemData.itemName}</span>
            </p>
            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Check amount:{" "}
              <span className="FI-message">
                {getCurrencyLabel(itemData.checkAmount, "$0.00")}
              </span>
            </p>
          </>
        )}

        {(action == "Delete ACV Item" || action == "Delete RCV Item") && (
          <>
            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Line item: <span className="FI-message">{itemData.itemName}</span>
            </p>

            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Price:{" "}
              <span className="FI-message">
                {getCurrencyLabel(itemData.linePrice, "$0.00")}
              </span>
            </p>
            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Line number:{" "}
              <span className="FI-message">{itemData.lineNumber}</span>
            </p>
          </>
        )}

        {action == "Delete Cash Item" && (
          <>
            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Job title: <span className="FI-message">{itemData.itemName}</span>
            </p>
            <p
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              Price:{" "}
              <span className="FI-message">
                {getCurrencyLabel(itemData.linePrice, "$0.00")}
              </span>
            </p>
          </>
        )}

        <button
          className="status-btn deactivate "
          onClick={handleSubmit}
          style={{ marginLeft: "0", marginTop: "1rem" }}
        >
          {action}
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
          style={{ color: "#d30b0e", display: "block" }}
        >
          {error}
        </p>
      </motion.div>
    </div>
  );
};

export default AreYouSure;
