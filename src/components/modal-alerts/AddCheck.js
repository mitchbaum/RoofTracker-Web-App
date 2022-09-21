import React from "react";
import { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field"; //DOCS: https://bestofreactjs.com/repo/cchanxzy-react-currency-input-field-react-masked-input
import { motion } from "framer-motion";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import moment from "moment";
import { collection, setDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const AddCheck = ({ open, onClose, modify, uid, fileId, itemData }) => {
  const [name, setName] = useState(itemData.itemName ?? "");
  const [amount, setAmount] = useState(itemData.checkAmount ?? "");
  const [date, setDate] = useState(itemData.checkDate ?? "");
  const [type, setType] = useState(itemData.itemType ?? "");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!open) return null;

  const onSubmit = (e) => {
    setMessage("Saving...");
    setError("");
    // preventDefault means the form wont submit to a page
    e.preventDefault();

    if (
      name === itemData.itemName &&
      amount === itemData.checkAmount &&
      date === itemData.checkDate &&
      type === itemData.itemType
    ) {
      setMessage("No changes made");
    }

    let verifyDateEntry = moment(date, "MMDDYYYY").format("MM-DD-YYYY");
    if (date.length !== 0) {
      if (
        verifyDateEntry !== "Invalid date" &&
        (date.length === 4 || date.length === 8)
      ) {
        console.log(true);
      } else {
        setMessage("");
        return setError("Invalid date. Format: MMdd or MMddyyyy");
      }
    }

    if (type === "") {
      setMessage("");
      return setError("No check type selected");
    }
    const getFromattedDate = moment().format("LL");

    //  submit and add file
    if (modify === "Edit") {
      editItem(
        {
          checkAmount: amount,
          checkDate: date,
          fileId: fileId,
          itemName: name,
          itemType: type,
        },
        `${getFromattedDate}`
      );
    } else {
      addItem(
        {
          checkAmount: amount,
          checkDate: date,
          fileId: fileId,
          itemName: name,
          itemType: type,
          lineNote: "",
          lineNumber: "",
          linePrice: "",
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

  const editItem = async (item, timestamp) => {
    // update doc in Firebase
    updateDoc(
      doc(db, `Users/${uid}/Files/${fileId}/FileInformation/${itemData.id}`),
      {
        checkAmount: amount ?? "",
        checkDate: date,
        itemName: name,
        itemType: type,
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
        <h1 className="header-large">{modify} Check</h1>
        <form
          className="form"
          style={{ padding: "0px", margin: "1rem 0 0 0" }}
          onSubmit={onSubmit}
        >
          <div className="input-group">
            <label>Check Number</label>
            <input
              type="text"
              placeholder="Enter check number"
              value={name}
              onChange={(e) => setName(e.target.value)}
            ></input>
          </div>
          <div className="input-group">
            <label>Amount</label>
            <CurrencyInput
              id="check-amount-input"
              allowNegativeValue={false}
              name="check-amount"
              placeholder="Enter check amount"
              defaultValue={amount !== "" ? amount * 1 : amount}
              prefix="$"
              decimalsLimit={2}
              onValueChange={(value) => setAmount(value)}
            />
          </div>
          <div className="input-group">
            <label>Date</label>
            <input
              type="number"
              placeholder="MMdd or MMddyyyy"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            ></input>
          </div>

          <div className="input-group">
            <label>Type</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              style={{ width: "100%" }}
            >
              <option disabled={true} value="">
                Select check type...
              </option>
              <option key="1" value="Insurance">
                Insurance
              </option>
              <option key="2" value="Personal">
                Personal
              </option>
              <option key="3" value="Insurance PAID">
                Insurance Paid
              </option>
            </select>
          </div>

          <input
            className="status-btn deactivate show-summary-btn"
            type="submit"
            value="Save Check"
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

export default AddCheck;
