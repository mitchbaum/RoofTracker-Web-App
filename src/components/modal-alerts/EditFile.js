import React from "react";
import File from "../../logo/file-icon.png";
import { useState, useEffect } from "react";
import CurrencyInput from "react-currency-input-field"; //DOCS: https://bestofreactjs.com/repo/cchanxzy-react-currency-input-field-react-masked-input
import { motion } from "framer-motion";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import { UserAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import Compressor from "compressorjs";
import {
  setDoc,
  updateDoc,
  serverTimestamp,
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteField,
} from "firebase/firestore";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import moment from "moment"; // reference how to use moment https://momentjs.com/

const EditFile = ({ open, onClose, data, fileId, uid, permission }) => {
  const { user } = UserAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [imageData, setImageData] = useState("");
  const [name, setName] = useState(data.name ?? "");
  const [deductible, setDeductible] = useState(data.deductible ?? "");
  const [coc, setCoc] = useState(data.coc ?? "");
  const [invoice, setInvoice] = useState(data.invoice ?? "");
  const [note, setNote] = useState(data.note ?? "");
  const [type, setType] = useState(data.type ?? "");
  const [cocSwitch, setCocSwitch] = useState(data.cocSwitch ?? "");

  // This function will be triggered when the file field change and compress
  const imageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const image = e.target.files[0];
      new Compressor(image, {
        quality: 0.8,
        success: (compressedResult) => {
          setImageData(compressedResult);
          console.log("setting setImageData");
        },
      });
    }
  };

  if (!open) return null;

  const onSubmit = (e) => {
    // preventDefault means the form wont submit to a page
    e.preventDefault();
    setMessage("Saving...");
    if (permission === "view" && user.uid !== uid) {
      setMessage("");
      return setError("Unable to add file. You are a viewer");
    }
    const getFromattedDate = moment().format("LL");

    if (imageData !== data.imageData && imageData !== "") {
      uploadImage(fileId);
    }
    if (name !== data.name) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        name: name,
      });
    }

    if (deductible !== data.deductible) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        deductible: deductible ?? "",
      });
    }
    if (coc !== data.coc) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        coc: coc ?? "",
      });
    }
    if (invoice !== data.invoice) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        invoice: invoice ?? "",
      });
    }
    if (note !== data.note) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        note: note,
      });
    }
    if (type !== data.type) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        type: type,
      });
    }
    if (cocSwitch !== data.cocSwitch) {
      updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        cocSwitch: cocSwitch,
      });
    }

    updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
      timeStamp: getFromattedDate,
      modified: serverTimestamp(),
    });
    return;
  };

  const uploadImage = async (fileId) => {
    if (imageData == "") {
      console.log("saving file with no image selected");
      return;
    }
    const imageRef = ref(storage, `${uid}/${fileId}.png`);
    await uploadBytes(imageRef, imageData).then((snapshot) => {
      // run this function when upload is complete
      getDownloadURL(snapshot.ref).then((url) => {
        updateDoc(doc(db, `Users/${uid}/Files`, fileId), {
          imageData: url,
        });
        console.log(url);
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
        <form
          className="form"
          style={{ padding: "0px", margin: "0" }}
          onSubmit={onSubmit}
        >
          <div className="align-center center">
            {data.imageData === "" && imageData === "" ? (
              <img
                className="team-profile-pic"
                style={{ borderRadius: "0" }}
                src={File}
              ></img>
            ) : (
              <img
                className="file-image"
                style={{ width: "100px", height: "100px" }}
                src={
                  imageData === ""
                    ? data.imageData
                    : URL.createObjectURL(imageData)
                }
              ></img>
            )}
          </div>
          <div className="center">
            <div className="file">
              <label>Click to change picture</label>
              <input type="file" id="file-input" onChange={imageChange} />
            </div>
          </div>

          <div className="center">
            <div className="input-group" style={{ width: "100%" }}>
              <label>Name</label>
              <input
                type="text"
                placeholder="Enter name"
                defaultValue={name}
                onChange={(e) => setName(e.target.value)}
                style={{ maxWidth: "none" }}
              ></input>
            </div>
          </div>
          <div className="input-group">
            <label>Deductible Total</label>
            <CurrencyInput
              id="deductible-input"
              allowNegativeValue={false}
              name="deductible"
              placeholder="Enter deductible"
              defaultValue={deductible !== "" ? deductible * 1 : deductible}
              prefix="$"
              decimalsLimit={2}
              decimalSeparator="."
              onValueChange={(value) => setDeductible(value)}
              style={{ maxWidth: "none" }}
            />
          </div>

          <div className="input-group">
            <label>COC Total</label>
            <CurrencyInput
              id="coc-input"
              allowNegativeValue={false}
              name="coc"
              placeholder="Enter coc"
              defaultValue={coc !== "" ? coc * 1 : coc}
              prefix="$"
              decimalsLimit={2}
              decimalSeparator="."
              onValueChange={(value) => setCoc(value)}
            />
          </div>
          <div className="input-group">
            <label>Invoice Total</label>
            <CurrencyInput
              id="invoice-input"
              allowNegativeValue={false}
              name="invoice"
              placeholder="Enter invoice"
              defaultValue={invoice !== "" ? invoice * 1 : invoice}
              prefix="$"
              decimalsLimit={2}
              decimalSeparator="."
              onValueChange={(value) => setInvoice(value)}
            />
          </div>
          <div className="input-group" style={{ width: "100%" }}>
            <label>Notes</label>
            <textarea
              name="note"
              form="form"
              onChange={(e) => setNote(e.target.value)}
              defaultValue={note}
              placeholder="Enter note"
            ></textarea>
          </div>
          <div onChange={(e) => setCocSwitch(!cocSwitch)}>
            <div className="input-group" style={{ display: "flex" }}>
              <input
                name="organization"
                type="checkbox"
                defaultChecked={cocSwitch}
              />
              <span style={{ display: "flex", alignItems: "center" }}>
                Final COC
              </span>
            </div>
          </div>

          <div onChange={(event) => setType(event.target.value)}>
            <div className="input-group" style={{ display: "flex" }}>
              <input
                name="status"
                value="Open"
                type="radio"
                defaultChecked={type == "Open"}
              />
              <span style={{ display: "flex", alignItems: "center" }}>
                Open
              </span>
              <input
                name="status"
                value="Closed"
                type="radio"
                style={{ marginLeft: "2rem" }}
                defaultChecked={type == "Closed"}
              />
              <span style={{ display: "flex", alignItems: "center" }}>
                Closed
              </span>
            </div>
          </div>

          <input
            className="status-btn deactivate show-summary-btn"
            type="submit"
            value="Save File"
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

export default EditFile;
