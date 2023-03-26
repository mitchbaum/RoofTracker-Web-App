import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { dropIn } from "../modal/DropIn";
import "../modal/Modal.css";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { UserAuth } from "../../context/AuthContext";
import {
  updateDoc,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import AreYouSure from "../modal-alerts/AreYouSure";

const MissingFunds = ({
  open,
  onClose,
  filesWithMissingFunds,
  uid,
  accountMissingFundsTotal,
  companyId,
}) => {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [action, setAction] = useState("");
  const [itemData, setItemData] = useState([]);

  if (!open) return null;
  console.log(filesWithMissingFunds);

  const getCurrencyLabel = (data, placeholder) => {
    if (data == "") {
      return placeholder;
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(data * 1);
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
        {showAlert && (
          <AreYouSure
            fileData={itemData}
            open={showAlert}
            onClose={setShowAlert}
            action={action}
            uid={uid}
            itemData={itemData}
            permission={null}
            authUserId={uid}
            accountMissingFundsTotal={accountMissingFundsTotal}
            companyId={companyId}
          />
        )}
        <h1 className="header-large">Missing Funds Found</h1>
        <p
          className="error-message"
          style={{ color: "#676767", display: "block" }}
        >
          The red flag on missing funds mean that the file is currently in
          pursuit of collecting missing funds.
        </p>
        {filesWithMissingFunds.length > 0 && (
          <div className="missing-funds-table-container">
            <table style={{ tableLayout: "auto" }}>
              <tbody>
                <tr>
                  <th style={{ width: "2%" }}></th>
                  <th style={{ width: "48%" }}>Name</th>
                  <th style={{ width: "50%" }}>Missing Funds Found</th>
                  <th></th>
                </tr>
              </tbody>

              {filesWithMissingFunds &&
                filesWithMissingFunds
                  .sort((a, b) => (a["modified"] < b["modified"] ? 1 : -1))
                  .map((val, key) => {
                    return (
                      <tbody
                        className="table-cells-container auto-cursor"
                        key={key}
                      >
                        <tr
                          className={
                            val.missingFundsSwitch ? "flag-row" : undefined
                          }
                        >
                          <td></td>
                          <td data-label="Name">
                            {val.name !== "" ? val.name : "-"}
                          </td>
                          <td
                            data-label="Missing Funds Found"
                            className={
                              val.missingFundsSwitch
                                ? "flag-row-font-color"
                                : undefined
                            }
                          >
                            {val.coc !== "" && val.deductible !== ""
                              ? getCurrencyLabel(
                                  `${val.missingFunds}`,
                                  "Not available"
                                )
                              : "Not available"}
                          </td>
                          <td>
                            <div className="row-actions">
                              <FaTimes
                                className="btn-animation center delete"
                                onClick={() => {
                                  setShowAlert(!showAlert);
                                  setAction("Delete Missing Fund");
                                  setItemData(val);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    );
                  })}
            </table>
          </div>
        )}
        <div className="" style={{ margin: "1rem 0rem" }}>
          {filesWithMissingFunds.length == 0 && (
            <div style={{ color: "#d30b0e", minHeight: "400px" }}>
              No missing funds found. Add some by checking the "In Pursuit of
              Missing Funds" checkbox on the Edit File page.
            </div>
          )}
        </div>
        <button
          className="status-btn security-access show-summary-btn"
          onClick={onClose}
          style={{ margin: "0" }}
        >
          Done
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

export default MissingFunds;
