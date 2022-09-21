import React from "react";
import { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field"; //DOCS: https://bestofreactjs.com/repo/cchanxzy-react-currency-input-field-react-masked-input
import { motion } from "framer-motion";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import { collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { UserAuth } from "../../context/AuthContext";

const AddACV = ({ open, onClose, modify, uid, fileId, itemData }) => {
  const [name, setName] = useState(itemData.itemName ?? "");
  const [price, setPrice] = useState(itemData.linePrice ?? "");
  const [lineNumber, setLineNumber] = useState(itemData.lineNumber ?? "");
  const [note, setNote] = useState(itemData.lineNote ?? "");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const onSubmit = (e) => {
    setMessage("Saving...");
    setError("");
    // preventDefault means the form wont submit to a page
    e.preventDefault();

    const getFromattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    }).format(Date.now());

    if (
      name === itemData.itemName &&
      price === itemData.linePrice &&
      lineNumber === itemData.lineNumber &&
      note === itemData.lineNote
    ) {
      setMessage("No changes made");
    }

    if (name === "" || name === undefined) {
      setMessage("");
      return setError("You have not entered a line item description");
    }

    if (price === "" || price === undefined) {
      setMessage("");
      return setError("You have not entered a price");
    }

    //  submit and add file
    if (modify === "Edit") {
      editItem(`${getFromattedDate}`);
    } else {
      addItem(
        {
          checkAmount: "",
          checkDate: "",
          fileId: fileId,
          insCheckCounter: 0,
          itemName: name,
          itemType: "ACV owed to HO",
          lineNote: note,
          lineNumber: lineNumber,
          linePrice: price,
        },
        `${getFromattedDate}`
      );
    }
  };

  const addItem = async (item, timestamp) => {
    // add new document to collection "Files" with randomly generated id
    const docRef = doc(
      collection(db, `Users/${uid}/Files/${fileId}/FileInformation`)
    );
    const id = docRef.id;
    const newItem = { id, ...item };

    await setDoc(docRef, newItem)
      .then(() => {
        updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
          timeStamp: timestamp,
        });
        return;
      })
      .catch((err) => {
        setMessage("");
        return setError("Unable to save item");
      });
  };

  const editItem = async (timestamp) => {
    // update doc in Firebase
    updateDoc(
      doc(db, `Users/${uid}/Files/${fileId}/FileInformation/${itemData.id}`),
      {
        itemName: name,
        lineNote: note,
        lineNumber: lineNumber,
        linePrice: price ?? "",
      }
    ).then(() => {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        timeStamp: timestamp,
      });
      return;
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
        <h1 className="header-large">{modify} ACV</h1>
        <form
          className="form"
          style={{ padding: "0px", margin: "1rem 0 0 0" }}
          onSubmit={onSubmit}
        >
          <div className="input-group">
            <label>Item</label>
            <input
              type="text"
              placeholder="Enter line item description"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
          </div>
          <div className="input-group">
            <label>Price</label>
            <CurrencyInput
              id="acv-item-price-input"
              allowNegativeValue={false}
              name="acv-item-price"
              placeholder="Enter line item price"
              defaultValue={price !== "" ? price * 1 : price}
              prefix="$"
              decimalsLimit={2}
              onValueChange={(value) => setPrice(value)}
            />
          </div>
          <div className="input-group">
            <label>Line Number</label>
            <input
              type="text"
              placeholder="Enter insurance line item number"
              value={lineNumber}
              onChange={(e) => setLineNumber(e.target.value)}
            ></input>
          </div>
          <div className="input-group" style={{ width: "100%" }}>
            <label>Note</label>
            <textarea
              name="note"
              form="form"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter note"
            ></textarea>
          </div>

          <input
            className="status-btn deactivate show-summary-btn"
            type="submit"
            value="Save ACV Item"
            style={{ marginLeft: "0", marginTop: "0" }}
          />
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
          <p
            className="error-message"
            style={{ color: "#d30b0e", display: "block" }}
          >
            {error}
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default AddACV;
