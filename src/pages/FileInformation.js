import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import AddACV from "../components/modal-alerts/AddACV";
import AddCash from "../components/modal-alerts/AddCash";
import AddCheck from "../components/modal-alerts/AddCheck";
import AddRCV from "../components/modal-alerts/AddRCV";
import EditFile from "../components/modal-alerts/EditFile";
import "../styles/FileInformation.css";
import Placeholder from "../logo/file-icon.png";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import AreYouSure from "../components/modal-alerts/AreYouSure";
import { useNavigate } from "react-router-dom";
import moment from "moment"; // reference how to use moment https://momentjs.com/
import PleaseLogin from "../components/error-pages/PleaseLogin";

const FileInformation = () => {
  const { uid, fileId } = useParams();
  const { user } = UserAuth();

  const [fileData, setFileData] = useState([]);
  const [salesRep, setSalesRep] = useState("");
  const [allItemsData, setAllItemsData] = useState([]);
  const [itemData, setItemData] = useState([]);

  const [isPending, setisPending] = useState(true);
  const [error, setError] = useState("");

  const [showAlert, setShowAlert] = useState(false);
  const [action, setAction] = useState("");
  const [itemAmount, setItemAmount] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddCheck, setShowAddCheck] = useState(false);
  const [showAddACV, setShowAddACV] = useState(false);
  const [showAddRCV, setShowAddRCV] = useState(false);
  const [showAddCash, setShowAddCash] = useState(false);

  const [text, setText] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    onSnapshot(doc(db, `Users/${uid}/Files/${fileId}`), (doc) => {
      if (doc.data() === undefined) {
        if (uid !== user.uid) {
          return navigate(`/team/${uid}`);
        }
        return navigate("/my-files");
      }
      setFileData(doc.data());
      getSummaryValues(doc.data());
      setShowEdit(false);
    });
    onSnapshot(doc(db, `Users/${uid}`), (doc) => {
      setSalesRep(doc.data()?.name);
    });
    onSnapshot(
      collection(db, `Users/${uid}/Files/${fileId}/FileInformation`),
      (snapshot) => {
        fetchItems(
          snapshot.docs.map(
            (doc) => ({
              ...doc.data(),
              id: doc.id,
            }),
            (error) => {
              setisPending(false);
              return setError(
                "Error occured loading your items. Double check your connection and try again. If error persists, contact Roof Tracker support."
              );
            }
          )
        );
        setShowAddCheck(false);
        setShowAddACV(false);
        setShowAddRCV(false);
        setShowAddCash(false);
        setShowAlert(false);
      }
    );
  }, [user?.uid]);

  const fetchItems = async (items) => {
    let data = [];
    items.forEach(async (result) => {
      data.push(result);
    });
    setAllItemsData(data);
    fetchInsToHOTotal(data);
  };

  const fetchInsToHOTotal = (data) => {
    let insCheckTotal = 0.0;
    let ACVItemTotal = 0.0;
    let cashItemTotal = 0.0;
    let pymtCheckTotal = 0.0;
    let RCVItemTotal = 0.0;
    data.forEach((item) => {
      if (item.itemType === "Insurance" || item.itemType === "Insurance PAID") {
        insCheckTotal += item.checkAmount * 1;
      } else if (item.itemType === "ACV owed to HO") {
        ACVItemTotal += item.linePrice * 1;
      } else if (item.itemType === "RCV work to do") {
        RCVItemTotal += item.linePrice * 1;
      } else if (item.itemType === "Cash work to do") {
        cashItemTotal += item.linePrice * 1;
      }
      if (item.itemType === "Personal" || item.itemType === "Insurance PAID") {
        pymtCheckTotal += item.checkAmount * 1;
      }
    });

    updateDoc(doc(db, `Users/${uid}/Files/${fileId}`), {
      insCheckTotal: `${insCheckTotal}`,
      acvItemTotal: `${ACVItemTotal}`,
      insCheckACVTotal: `${ACVItemTotal - insCheckTotal}`,
      cashItemTotal: `${cashItemTotal}`,
      pymtCheckTotal: `${pymtCheckTotal}`,
      rcvItemTotal: `${RCVItemTotal}`,
    });
  };

  const getSummaryValues = (data) => {
    // remaining invoice, out of pocket, ins still owes HO,
  };

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

  const getDateLabel = (data, placeholder) => {
    if (data.length == 4) {
      return moment(data, "MMDDYYYY").format("ll");
    } else if (data.length == 8) {
      return moment(data, "MMDDYYYY").format("ll");
    } else {
      return placeholder;
    }
  };

  return (
    <>
      {user ? (
        <>
          {showEdit && (
            <EditFile
              open={showEdit}
              onClose={() => setShowEdit(false)}
              data={fileData}
              fileId={fileId}
              uid={uid}
              amount={itemAmount}
            />
          )}
          {showAlert && (
            <AreYouSure
              fileData={fileData}
              open={showAlert}
              onClose={() => setShowAlert(false)}
              action={action}
              uid={uid}
              itemData={itemData}
            />
          )}
          {showAddCheck && (
            <AddCheck
              open={showAddCheck}
              onClose={() => setShowAddCheck(false)}
              modify={text}
              uid={uid}
              fileId={fileId}
              itemData={itemData}
            />
          )}
          {showAddACV && (
            <AddACV
              open={showAddACV}
              onClose={() => setShowAddACV(false)}
              modify={text}
              uid={uid}
              fileId={fileId}
              itemData={itemData}
            />
          )}
          {showAddRCV && (
            <AddRCV
              onClose={() => setShowAddRCV(false)}
              open={showAddRCV}
              modify={text}
              uid={uid}
              fileId={fileId}
              itemData={itemData}
            />
          )}
          {showAddCash && (
            <AddCash
              onClose={() => setShowAddCash(false)}
              open={showAddCash}
              modify={text}
              uid={uid}
              fileId={fileId}
              itemData={itemData}
            />
          )}

          {showSummary ? (
            <>
              <button
                className="status-btn deactivate show-summary-btn close-summary-container"
                onClick={() => setShowSummary(!showSummary)}
              >
                Close Summary
              </button>
              <div
                className="top-two-card-container"
                style={{ marginTop: "1rem" }}
              >
                <div className="box summary-page-right">
                  <h1 className="header-large">
                    {fileData.name !== "" ? fileData.name : "-"}
                  </h1>
                  <div style={{ marginTop: "1rem" }}>
                    <p>Insurance Still Owes Homeowner:</p>
                    <p className="FI-message note">
                      {fileData.coc !== "" && fileData.deductible !== ""
                        ? getCurrencyLabel(
                            `${
                              fileData.coc * 1 +
                              fileData.insCheckACVTotal * 1 -
                              fileData.deductible * 1
                            }`,
                            "Not available"
                          )
                        : "Not available"}
                    </p>
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <p>Insurance Checks Issued SHOULD Equal:</p>
                    <p className="FI-message note">
                      {fileData.coc !== "" && fileData.deductible !== ""
                        ? getCurrencyLabel(
                            fileData.insCheckTotal * 1 +
                              fileData.coc * 1 +
                              fileData.insCheckACVTotal * 1 -
                              fileData.deductible * 1,
                            "Not available"
                          )
                        : "Not available"}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>Because...</p>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">COC</p>
                    <p className="FI-message">
                      {getCurrencyLabel(fileData.coc, "No entry")}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">ACV</p>
                    <p className="FI-message">
                      {fileData.acvItemTotal !== "0" &&
                      fileData.acvItemTotal !== "0.0"
                        ? getCurrencyLabel(fileData.acvItemTotal, "No entry")
                        : "No entry"}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">Deductible</p>
                    <p className="FI-message">
                      {fileData.deductible !== ""
                        ? `-${getCurrencyLabel(
                            fileData.deductible,
                            "No entry"
                          )}`
                        : "No entry"}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <div className="filler"></div>
                    <div className="equation-line"></div>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">Total</p>
                    <p className="FI-message">
                      {" "}
                      {fileData.coc !== "" &&
                      fileData.deductible !== "" &&
                      fileData.acvItemTotal !== ""
                        ? getCurrencyLabel(
                            fileData.coc * 1 +
                              fileData.acvItemTotal * 1 -
                              fileData.deductible * 1,
                            "Not available"
                          )
                        : "Not available"}
                    </p>
                  </div>
                </div>
                <div style={{ width: "1.5rem" }}></div>
                <div className="left">
                  <p className="header-small">
                    Insurance Checks Recieved ={" "}
                    {getCurrencyLabel(fileData.insCheckTotal, "$0.00")}
                  </p>
                  <div
                    className="table-container"
                    style={{ margin: "1rem 0 2rem 0" }}
                  >
                    <table className="table-no-collapse">
                      <tbody>
                        <tr>
                          <th style={{ paddingLeft: "10px" }}>Number</th>
                          <th>Amount</th>
                          <th>Date</th>
                        </tr>
                      </tbody>
                      {allItemsData &&
                        allItemsData
                          .filter((val) => {
                            if (
                              val.itemType === "Insurance" ||
                              val.itemType === "Insurance PAID"
                            ) {
                              return val;
                            }
                          })
                          .map((val, key) => {
                            return (
                              <tbody key={key}>
                                <tr>
                                  <td style={{ paddingLeft: "10px" }}>
                                    {val.number !== ""
                                      ? `#${val.itemName}`
                                      : val.itemName}
                                  </td>
                                  <td>
                                    {getCurrencyLabel(val.checkAmount, "-")}
                                  </td>
                                  <td>{getDateLabel(val.checkDate, "-")}</td>
                                </tr>
                              </tbody>
                            );
                          })}
                    </table>
                  </div>
                  <p className="header-small">
                    ACV Owed to Homeowner ={" "}
                    {getCurrencyLabel(fileData.acvItemTotal, "$0.00")}
                  </p>
                  <div
                    className="table-container"
                    style={{ margin: "1rem 0 2rem 0" }}
                  >
                    <table className="table-no-collapse">
                      <tbody>
                        <tr>
                          <th style={{ paddingLeft: "10px" }}>Line Item</th>
                          <th>Price</th>
                          <th>Insurance Line Number</th>
                        </tr>
                      </tbody>
                      {allItemsData &&
                        allItemsData
                          .filter((val) => {
                            if (val.itemType === "ACV owed to HO") {
                              return val;
                            }
                          })
                          .map((val, key) => {
                            return (
                              <tbody key={key}>
                                <tr>
                                  <td style={{ paddingLeft: "10px" }}>
                                    {val.itemName}
                                  </td>
                                  <td>
                                    {getCurrencyLabel(val.linePrice, "-")}
                                  </td>
                                  <td>
                                    {val.lineNumber !== ""
                                      ? "-"
                                      : val.lineNumber}
                                  </td>
                                </tr>
                              </tbody>
                            );
                          })}
                    </table>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="header">
                <p className="header-small">Files</p>
                <div className="flex-space-evenly">
                  <h1 className="header-large">File Information</h1>
                  <div className="filler"></div>
                  <div className="align-center">
                    <button
                      className="status-btn deactivate delete-file-media"
                      onClick={() => {
                        setShowAlert(!showAlert);
                        setAction("Delete File");
                      }}
                    >
                      Delete File
                    </button>
                  </div>
                </div>
                {fileData.type == "Open" ? (
                  <div
                    style={{
                      color: "#00c500",
                      display: "flex",
                      alignItems: "center",
                      marginTop: "1rem",
                    }}
                  >
                    <div className="circle active"></div>
                    Open
                  </div>
                ) : (
                  <div style={{ marginTop: "1rem" }}>Closed</div>
                )}
              </div>

              <div className="top-two-card-container">
                <div className="box left">
                  <div className="FI-flex">
                    <div className="left-column">
                      <img
                        className={
                          fileData.imageData == ""
                            ? "FI-image-placeholder"
                            : "profile-pic FI-image"
                        }
                        src={
                          fileData.imageData == ""
                            ? Placeholder
                            : fileData.imageData
                        }
                        style={{ borderRadius: "25%", padding: "0" }}
                      ></img>
                    </div>
                    <div className="right-column">
                      <p className="FI-name">
                        {fileData.name !== "" ? fileData.name : "-"}
                      </p>
                      <p className="FI-salesrep">Sales Rep: {salesRep}</p>

                      <button
                        className="status-btn deactivate show-summary-btn"
                        onClick={() => setShowSummary(!showSummary)}
                      >
                        Show Summary
                      </button>
                      <button
                        className="status-btn security-access show-summary-btn"
                        onClick={() => setShowEdit(!showEdit)}
                      >
                        Edit File
                      </button>
                    </div>
                  </div>
                  <div className="label-message-container">
                    {fileData.cocSwitch ? (
                      <p style={{ textDecoration: "underline" }}>
                        Final COC Total
                      </p>
                    ) : (
                      <p>COC Total</p>
                    )}

                    <p className="FI-message">
                      {getCurrencyLabel(fileData.coc, "")}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>Invoice Total</p>
                    <p className="FI-message">
                      {getCurrencyLabel(fileData.invoice, "")}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>Deductible Total</p>
                    <p className="FI-message">
                      {getCurrencyLabel(fileData.deductible, "")}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>Remaining Invoice - What's Due</p>
                    <p className="FI-message">
                      {fileData.coc !== "" &&
                      fileData.deductible !== "" &&
                      fileData.invoice !== ""
                        ? getCurrencyLabel(
                            `${
                              fileData.coc * 1 +
                              fileData.cashItemTotal * 1 -
                              fileData.pymtCheckTotal * 1
                            }`,
                            ""
                          )
                        : ""}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>RCV Total</p>
                    <p className="FI-message">
                      {fileData.rcvItemTotal !== "0" &&
                      fileData.rcvItemTotal !== "0.0"
                        ? getCurrencyLabel(fileData.rcvItemTotal, "")
                        : ""}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>Out of Pocket</p>
                    <p className="FI-message">
                      {fileData.deductible !== ""
                        ? getCurrencyLabel(
                            `${
                              fileData.deductible * 1 -
                              fileData.acvItemTotal * 1
                            }`,
                            ""
                          )
                        : ""}
                    </p>
                  </div>
                  <div className="red-line" style={{ width: "100%" }}></div>
                  <div>
                    <p>Notes</p>
                    <p className="FI-message note">{fileData.note}</p>
                  </div>
                </div>
                <div className="box right">
                  <div>
                    <p>Insurance Still Owes Homeowner:</p>
                    <p className="FI-message note">
                      {fileData.coc !== "" && fileData.deductible !== ""
                        ? getCurrencyLabel(
                            `${
                              fileData.coc * 1 +
                              fileData.insCheckACVTotal * 1 -
                              fileData.deductible * 1
                            }`,
                            "Not available"
                          )
                        : "Not available"}
                    </p>
                  </div>
                  <div style={{ marginTop: "1rem" }}>
                    <p>Insurance Checks Issued SHOULD Equal:</p>
                    <p className="FI-message note">
                      {fileData.coc !== "" && fileData.deductible !== ""
                        ? getCurrencyLabel(
                            fileData.insCheckTotal * 1 +
                              fileData.coc * 1 +
                              fileData.insCheckACVTotal * 1 -
                              fileData.deductible * 1,
                            "Not available"
                          )
                        : "Not available"}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p>Because...</p>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">COC</p>
                    <p className="FI-message">
                      {getCurrencyLabel(fileData.coc, "No entry")}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">ACV</p>
                    <p className="FI-message">
                      {fileData.acvItemTotal !== "0" &&
                      fileData.acvItemTotal !== "0.0"
                        ? getCurrencyLabel(fileData.acvItemTotal, "No entry")
                        : "No entry"}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">Deductible</p>
                    <p className="FI-message">
                      {fileData.deductible !== ""
                        ? `-${getCurrencyLabel(
                            fileData.deductible,
                            "No entry"
                          )}`
                        : "No entry"}
                    </p>
                  </div>
                  <div className="label-message-container">
                    <div className="filler"></div>
                    <div className="equation-line"></div>
                  </div>
                  <div className="label-message-container">
                    <p className="equation-label">Total</p>
                    <p className="FI-message">
                      {fileData.coc !== "" &&
                      fileData.deductible !== "" &&
                      fileData.acvItemTotal !== ""
                        ? getCurrencyLabel(
                            fileData.coc * 1 +
                              fileData.acvItemTotal * 1 -
                              fileData.deductible * 1,
                            "Not available"
                          )
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="header">
                <div className="flex-space-between align-bottom">
                  <p className="header-small">Checks</p>
                  <button
                    className="status-btn security-access show-summary-btn"
                    onClick={() => {
                      setShowAddCheck(!showAddCheck);
                      setText("Add");
                      setItemData("");
                    }}
                    style={{ margin: "0", width: "110px" }}
                  >
                    Add Check
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table style={{ tableLayout: "auto" }}>
                  <tbody>
                    <tr>
                      <th style={{ paddingLeft: "10px", width: "30%" }}>
                        Number
                      </th>
                      <th style={{ width: "20%" }}>Amount</th>
                      <th style={{ width: "20%" }}>Date</th>
                      <th style={{ width: "20%" }}>Type</th>
                      <th style={{ width: "10%" }}>Paid?</th>
                      <th></th>
                    </tr>
                  </tbody>

                  {allItemsData &&
                    allItemsData
                      .filter((val) => {
                        if (
                          val.itemType === "Insurance" ||
                          val.itemType === "Insurance PAID" ||
                          val.itemType === "Personal"
                        ) {
                          return val;
                        }
                      })
                      .map((val, key) => {
                        return (
                          <tbody key={key}>
                            <tr>
                              <td
                                data-label="Check Number"
                                style={{ paddingLeft: "10px" }}
                              >
                                {val.itemName !== "" ? `#${val.itemName}` : "-"}
                              </td>
                              <td data-label="Amount">
                                {getCurrencyLabel(val.checkAmount, "-")}
                              </td>
                              <td data-label="Date">
                                {getDateLabel(val.checkDate, "-")}
                              </td>
                              <td data-label="Type">
                                {val.itemType === "Insurance PAID" ||
                                val.itemType === "Insurance"
                                  ? "Insurance"
                                  : val.itemType}
                              </td>
                              <td data-label="Paid?">
                                {val.itemType === "Insurance PAID" ||
                                val.itemType === "Personal"
                                  ? "Yes"
                                  : "No"}
                              </td>
                              <td>
                                <div className="row-actions">
                                  <p
                                    onClick={() => {
                                      setShowAddCheck(!showAddCheck);
                                      setText("Edit");
                                      setItemData(val);
                                    }}
                                    className="edit"
                                  >
                                    Edit
                                  </p>
                                  <FaTimes
                                    className="btn-animation center delete"
                                    onClick={() => {
                                      setShowAlert(!showAlert);
                                      setAction("Delete Check");
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
              <div className="header">
                <div className="flex-space-between align-bottom">
                  <p className="header-small">ACV Owed to Homeowner</p>
                  <button
                    className="status-btn security-access show-summary-btn"
                    onClick={() => {
                      setShowAddACV(!showAddACV);
                      setText("Add");
                      setItemData("");
                    }}
                    style={{ margin: "0", width: "110px" }}
                  >
                    Add ACV
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table style={{ tableLayout: "auto" }}>
                  <tbody>
                    <tr>
                      <th style={{ paddingLeft: "10px", width: "30%" }}>
                        Line Item
                      </th>
                      <th style={{ width: "20%" }}>Price</th>
                      <th style={{ width: "20%" }}>Insurance Line Number</th>
                      <th style={{ width: "30%" }}>Notes</th>
                      <th></th>
                    </tr>
                  </tbody>
                  {allItemsData &&
                    allItemsData
                      .filter((val) => {
                        if (val.itemType === "ACV owed to HO") {
                          return val;
                        }
                      })
                      .map((val, key) => {
                        return (
                          <tbody key={key}>
                            <tr>
                              <td
                                data-label="Line Item"
                                style={{ paddingLeft: "10px" }}
                              >
                                {val.itemName == "" ? "-" : val.itemName}
                              </td>
                              <td data-label="Price">
                                {getCurrencyLabel(val.linePrice, "-")}
                              </td>
                              <td data-label="Insurance Line Number">
                                {val.lineNumber == "" ? "-" : val.lineNumber}
                              </td>
                              <td data-label="Notes">
                                {val.lineNote == "" ? "-" : val.lineNote}
                              </td>
                              <td>
                                <div className="row-actions">
                                  <p
                                    onClick={() => {
                                      setShowAddACV(!showAddACV);
                                      setText("Edit");
                                      setItemData(val);
                                    }}
                                    className="edit"
                                  >
                                    Edit
                                  </p>
                                  <FaTimes
                                    className="btn-animation center delete"
                                    onClick={() => {
                                      setShowAlert(!showAlert);
                                      setAction("Delete ACV Item");
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
              <div className="header">
                <div className="flex-space-between align-bottom">
                  <p className="header-small">RCV Work to do</p>
                  <button
                    className="status-btn security-access show-summary-btn"
                    onClick={() => {
                      setShowAddRCV(!showAddRCV);
                      setText("Add");
                      setItemData("");
                    }}
                    style={{ margin: "0", width: "110px" }}
                  >
                    Add RCV
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table style={{ tableLayout: "auto" }}>
                  <tbody>
                    <tr>
                      <th style={{ paddingLeft: "10px", width: "30%" }}>
                        Line Item
                      </th>
                      <th style={{ width: "20%" }}>Price</th>
                      <th style={{ width: "20%" }}>Insurance Line Number</th>
                      <th style={{ width: "30%" }}>Notes</th>
                      <th></th>
                    </tr>
                  </tbody>
                  {allItemsData &&
                    allItemsData
                      .filter((val) => {
                        if (val.itemType === "RCV work to do") {
                          return val;
                        }
                      })
                      .map((val, key) => {
                        return (
                          <tbody key={key}>
                            <tr>
                              <td
                                data-label="Line Item"
                                style={{ paddingLeft: "10px" }}
                              >
                                {val.itemName == "" ? "-" : val.itemName}
                              </td>
                              <td data-label="Price">
                                {getCurrencyLabel(val.linePrice, "-")}
                              </td>
                              <td data-label="Insurance Line Number">
                                {val.lineNumber == "" ? "-" : val.lineNumber}
                              </td>
                              <td data-label="Notes">
                                {val.lineNote == "" ? "-" : val.lineNote}
                              </td>
                              <td>
                                <div className="row-actions">
                                  <p
                                    onClick={() => {
                                      setShowAddRCV(!showAddRCV);
                                      setText("Edit");
                                      setItemData(val);
                                    }}
                                    className="edit"
                                  >
                                    Edit
                                  </p>
                                  <FaTimes
                                    className="btn-animation center delete"
                                    onClick={() => {
                                      setShowAlert(!showAlert);
                                      setAction("Delete RCV Item");
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
              <div className="header">
                <div className="flex-space-between align-bottom">
                  <p className="header-small">Cash Work to do</p>
                  <button
                    className="status-btn security-access show-summary-btn"
                    onClick={() => {
                      setShowAddCash(!showAddCash);
                      setText("Add");
                      setItemData("");
                    }}
                    style={{ margin: "0", width: "110px" }}
                  >
                    Add Cash
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table style={{ tableLayout: "auto" }}>
                  <tbody>
                    <tr>
                      <th style={{ paddingLeft: "10px", width: "30%" }}>
                        Job Title
                      </th>
                      <th style={{ width: "20%" }}>Price</th>
                      <th style={{ width: "50%" }}>Notes</th>
                      <th></th>
                    </tr>
                  </tbody>
                  {allItemsData &&
                    allItemsData
                      .filter((val) => {
                        if (val.itemType === "Cash work to do") {
                          return val;
                        }
                      })
                      .map((val, key) => {
                        return (
                          <tbody key={key}>
                            <tr>
                              <td
                                data-label="Job Title"
                                style={{ paddingLeft: "10px" }}
                              >
                                {val.itemName == "" ? "-" : val.itemName}
                              </td>
                              <td data-label="Price">
                                {getCurrencyLabel(val.linePrice, "-")}
                              </td>
                              <td data-label="Notes">
                                {val.lineNote == "" ? "-" : val.lineNote}
                              </td>
                              <td>
                                <div className="row-actions">
                                  <p
                                    onClick={() => {
                                      setShowAddCash(!showAddCash);
                                      setText("Edit");
                                      setItemData(val);
                                    }}
                                    className="edit"
                                  >
                                    Edit
                                  </p>
                                  <FaTimes
                                    className="btn-animation center delete"
                                    onClick={() => {
                                      setShowAlert(!showAlert);
                                      setAction("Delete Cash Item");
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
            </>
          )}
        </>
      ) : (
        <PleaseLogin />
      )}
    </>
  );
};

export default FileInformation;
