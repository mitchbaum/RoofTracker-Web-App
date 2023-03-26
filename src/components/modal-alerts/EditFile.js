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
import AreYouSure from "../modal-alerts/AreYouSure";

const EditFile = ({
  open,
  onClose,
  data,
  fileId,
  uid,
  permission,
  itemData,
  companyId,
}) => {
  const { user } = UserAuth();

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [imageData, setImageData] = useState("");
  const [name, setName] = useState(data.name ?? "");
  const [deductible, setDeductible] = useState(data.deductible ?? "");
  const [coc, setCoc] = useState(data.coc ?? "");
  const [missingFundsSwitch, setMissingFundsSwitch] = useState(
    data.missingFundsSwitch ?? false
  );
  const [customMissingFunds, setCustomMissingFunds] = useState(0.0);
  const [invoice, setInvoice] = useState(data.invoice ?? "");
  const [note, setNote] = useState(data.note ?? "");
  const [type, setType] = useState(data.type ?? "");
  const [cocSwitch, setCocSwitch] = useState(data.cocSwitch ?? "");
  const [showAlert, setShowAlert] = useState(false);
  const [action, setAction] = useState("");

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

  const onSubmit = async (e) => {
    // preventDefault means the form wont submit to a page
    e.preventDefault();
    setMessage("Saving...");
    if (permission === "view" && user.uid !== uid) {
      setMessage("");
      return setError("Unable to add file. You are a viewer");
    }
    const getFromattedDate = moment().format("LL");

    if (imageData !== data.imageData && imageData !== "") {
      await uploadImage(fileId);
    }
    if (name !== data.name) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        name: name,
      });
    }

    if (deductible !== data.deductible) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        deductible: deductible ?? "",
      });
    }
    if (coc !== data.coc) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        coc: coc ?? "",
      });
    }
    if (invoice !== data.invoice) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        invoice: invoice ?? "",
      });
    }
    if (note !== data.note) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        note: note,
      });
    }
    if (type !== data.type) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        type: type,
      });
    }
    if (cocSwitch !== data.cocSwitch) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        cocSwitch: cocSwitch,
      });
    }

    if (missingFundsSwitch !== data.missingFundsSwitch) {
      await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
        missingFundsSwitch: missingFundsSwitch,
      });
      if (missingFundsSwitch && !data.missingFunds) {
        console.log("saving missingFunds");
        // update sales rep total and file
        if (customMissingFunds > 0) {
          await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
            missingFunds: customMissingFunds,
          }).then(updateUserTotalMissingFunds());
        } else {
          await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
            missingFunds: coc * 1 + data.insCheckACVTotal * 1 - deductible * 1,
          }).then(updateUserTotalMissingFunds());
        }

        if (companyId !== "") {
          // update company total and company log
          const docRef = doc(
            collection(db, `Companies/${companyId}/MissingFundsLog`)
          );
          const id = docRef.id;
          if (customMissingFunds > 0) {
            await setDoc(docRef, {
              missingFunds: customMissingFunds,
              timeStamp: serverTimestamp(),
              id: id,
              fileId: fileId,
              fileName: data.name,
              ownerId: uid,
            }).then(updateCompanyTotalMissingFunds());
          } else {
            await setDoc(docRef, {
              missingFunds:
                coc * 1 + data.insCheckACVTotal * 1 - deductible * 1,
              timeStamp: serverTimestamp(),
              id: id,
              fileId: fileId,
              fileName: data.name,
              ownerId: uid,
            }).then(updateCompanyTotalMissingFunds());
          }
        }
      }
    }

    await updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
      timeStamp: getFromattedDate,
      modified: serverTimestamp(),
    });
    return;
  };

  const updateUserTotalMissingFunds = async () => {
    let currentUserMissingFundsTotal = 0;
    const collectionRef = collection(db, `Users`);
    const q = query(collectionRef, where("uid", "==", uid));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      if (doc.data()?.missingFundsTotal) {
        currentUserMissingFundsTotal = doc.data()?.missingFundsTotal;
      }
    });
    await updateDoc(doc(db, `Users/${uid}`), {
      missingFundsTotal:
        currentUserMissingFundsTotal +
        coc * 1 +
        data.insCheckACVTotal * 1 -
        deductible * 1,
    });
  };

  const updateCompanyTotalMissingFunds = async () => {
    let currentCompanyMissingFundsTotal = 0;
    const collectionRef = collection(db, `Companies`);
    const q = query(collectionRef, where("companyId", "==", companyId));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      if (doc.data()?.missingFundsTotal) {
        currentCompanyMissingFundsTotal = doc.data()?.missingFundsTotal;
      }
    });
    await updateDoc(doc(db, `Companies/${companyId}`), {
      missingFundsTotal:
        currentCompanyMissingFundsTotal +
        coc * 1 +
        data.insCheckACVTotal * 1 -
        deductible * 1,
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
          {showAlert && (
            <AreYouSure
              fileData={data}
              open={showAlert}
              onClose={setShowAlert}
              action={action}
              uid={uid}
              itemData={itemData}
              permission={permission}
              authUserId={user.uid}
              missingFunds={setMissingFundsSwitch}
              missingFundsSwitch={missingFundsSwitch}
              customFunds={setCustomMissingFunds}
            />
          )}
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

            <div
              onClick={(e) => {
                e.preventDefault();
                setShowAlert(!showAlert);
                setAction("Comfirm Missing Funds");
              }}
            >
              <div className="input-group" style={{ display: "flex" }}>
                <input
                  type="checkbox"
                  checked={missingFundsSwitch}
                  onChange={() => {}}
                />
                <span style={{ display: "flex", alignItems: "center" }}>
                  In Pursuit of Missing Funds
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
    </>
  );
};

export default EditFile;
