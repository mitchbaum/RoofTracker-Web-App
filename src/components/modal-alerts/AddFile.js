import React from "react";
import File from "../../logo/file-icon.png";
import { useState } from "react";
import CurrencyInput from "react-currency-input-field"; //DOCS: https://bestofreactjs.com/repo/cchanxzy-react-currency-input-field-react-masked-input
import { motion } from "framer-motion";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import EditProfilePic from "./EditProfilePic";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserAuth } from "../../context/AuthContext";
import {
  collection,
  setDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebase";
import { FaTimes } from "react-icons/fa";
import Compressor from "compressorjs";
import moment from "moment"; // reference how to use moment https://momentjs.com/

const AddFile = ({ onAdd, open, onClose, uid, permission }) => {
  const { user } = UserAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [imageData, setImageData] = useState("");
  const [name, setName] = useState("");
  const [deductible, setDeductible] = useState("");
  const [coc, setCoc] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState("Open");
  const [cocSwitch, setCocSwitch] = useState(false);
  const [pdfData, setPdfData] = useState("");
  const [pdfTitle, setPdfTitle] = useState(null);

  if (!open) return null;

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

  const pdfChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setPdfData(e.target.files[0]);
      setPdfTitle(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    // preventDefault means the form wont submit to a page
    e.preventDefault();
    setMessage("Saving...");
    setError("");
    if (permission === "view" && user.uid !== uid) {
      setMessage("");
      return setError("Unable to add file. You are a viewer");
    }
    const getFromattedDate = moment().format("LL");
    //  submit and add file
    addFile({
      imageData: "",
      name,
      deductible,
      coc,
      note,
      type,
      cocSwitch,
      acvItemTotal: "",
      cashItemTotal: "",
      insCheckACVTotal: "",
      insCheckTotal: "",
      pymtCheckTotal: "",
      rcvItemTotal: "",
      timeStamp: `${getFromattedDate}`,
      modified: serverTimestamp(),
    });
    return;
  };

  const addFile = async (file) => {
    // add new document to collection "Files" with randomly generated id
    const docRef = doc(collection(db, `Users/${uid}/Files`));
    const id = docRef.id;
    const newFile = { id, ...file };

    await setDoc(docRef, newFile)
      .then(async () => {
        await uploadImage(id);
        await uploadPdf(id);
      })
      .catch((err) => {
        setMessage("");
        return setError("Unable to save file");
      });
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
      });
      return;
    });
  };

  const uploadPdf = async (fileId) => {
    if (pdfData !== "") {
      const pdfRef = ref(storage, `${uid}/Invoices/${pdfData.name}`);
      await uploadBytes(pdfRef, pdfData).then((snapshot) => {
        // run this function when upload is complete
        updateDoc(doc(db, `Users/${uid}/Files`, fileId), {
          invoiceUpload: pdfData.name,
        });
        return;
      });
    }
  };

  return (
    <>
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
            onSubmit={handleSubmit}
          >
            <div className="align-center center">
              {imageData == "" ? (
                <img
                  className="team-profile-pic"
                  style={{ borderRadius: "0" }}
                  src={File}
                ></img>
              ) : (
                <img
                  className="file-image"
                  style={{ width: "100px", height: "100px" }}
                  src={URL.createObjectURL(imageData)}
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
                  value={name}
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
                prefix="$"
                decimalsLimit={2}
                decimalSeparator="."
                onValueChange={(value) => setCoc(`${value}`)}
              />
            </div>
            <div className="input-group" style={{ width: "100%" }}>
              <label>Notes</label>
              <textarea
                name="note"
                form="form"
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter note"
              ></textarea>
            </div>
            <div onChange={() => setCocSwitch(!cocSwitch)}>
              <div className="input-group" style={{ display: "flex" }}>
                <input
                  name="organization"
                  defaultChecked={false}
                  type="checkbox"
                />
                <span style={{ display: "flex", alignItems: "center" }}>
                  Final COC
                </span>
              </div>
            </div>

            <div onChange={(event) => setType(event.target.value)}>
              <div className="input-group" style={{ display: "flex" }}>
                <input name="status" value="Open" type="radio" defaultChecked />
                <span style={{ display: "flex", alignItems: "center" }}>
                  Open
                </span>
                <input
                  name="status"
                  value="Closed"
                  type="radio"
                  style={{ marginLeft: "2rem" }}
                />
                <span style={{ display: "flex", alignItems: "center" }}>
                  Closed
                </span>
              </div>
            </div>
            <div className="file-upload-container">
              <div className="button-wrapper">
                <label
                  className="status-btn security-access show-summary-btn"
                  style={{ margin: "0 16px 0 0", textAlign: "center" }}
                  for="pdf-input"
                >
                  Attach Invoice PDF
                </label>
                <input
                  type="file"
                  id="pdf-input"
                  onChange={pdfChange}
                  accept="application/pdf,application/vnd.ms-excel"
                />
                <div className="FI-message">
                  {pdfTitle == null ? (
                    "No invoice uploaded"
                  ) : (
                    <>
                      <div style={{ display: "flex" }}>
                        {pdfTitle}{" "}
                        <FaTimes
                          className="btn-animation center delete"
                          style={{ marginLeft: "10px" }}
                          onClick={() => {
                            setPdfTitle(null);
                            setPdfData("");
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
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
    </>
  );
};

export default AddFile;
