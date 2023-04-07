import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import FilePlaceholder from "../logo/file-icon.png";
import "../styles/UserDetails.css";
import AccountPicPlaceholder from "../logo/account-icon.png";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import AreYouSure from "../components/modal-alerts/AreYouSure";
import TableTemp from "../components/isPending-templates/TableTemp";
import AccountDetailsTemp from "../components/isPending-templates/AccountDetailsTemp";
import { useNavigate } from "react-router-dom";
import AddFile from "../components/modal-alerts/AddFile";
import moment from "moment"; // reference how to use moment https://momentjs.com/
import PleaseLogin from "../components/error-pages/PleaseLogin";
import { BottomScrollListener } from "react-bottom-scroll-listener";
import { TailSpin } from "react-loader-spinner";

const UserDetails = () => {
  const { uid } = useParams();
  const { user } = UserAuth();
  const [adminAccess, setAdminAccess] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);
  const [isPending, setIsPending] = useState(true);
  const [message, setMessage] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showAddFile, setShowAddFile] = useState(false);
  const [action, setAction] = useState("");

  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [access, setAccess] = useState("");
  const [permission, setPermission] = useState("");
  const [email, setEmail] = useState("");
  const [missingFundsTotal, setMissingFundsTotal] = useState(0.0);
  const [filterBy, setFilterBy] = useState("Open");
  const [filesData, setFilesData] = useState([]);
  const [latestDoc, setLatestDoc] = useState({});
  const [showSpinner, setShowSpinner] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm == "") {
      setMessage("");
      setIsSearching(false);
      loadFiles();
    } else {
      setMessage("Click 'Search' to search for a file (case sensitive)");
    }
  }, [searchTerm]);

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user.uid}`), (doc) => {
      setPermission(doc.data()?.permission);
      setAdminAccess(doc.data()?.access);
    });
    onSnapshot(doc(db, "Users", `${uid}`), (doc) => {
      setName(doc.data()?.name);
      setPic(doc.data()?.["profile pic url"]);
      setAccess(doc.data()?.access);
      setEmail(doc.data()?.email);
      setMissingFundsTotal(doc.data()?.missingFundsTotal ?? 0.0);
      setIsPending(false);
      setShowAlert(false);
    });
  }, [user?.uid]);

  useEffect(() => {
    loadFiles();
  }, [user?.uid, filterBy]);

  const loadFiles = () => {
    const collectionRef = collection(db, `Users/${uid}/Files`);
    const q = query(
      collectionRef,
      where("type", "==", filterBy),
      orderBy("modified", "desc"),
      limit(12)
    );
    onSnapshot(q, (querySnapshot) => {
      fetchFiles(
        querySnapshot.docs.map(
          (doc) => ({
            ...doc.data(),
            id: doc.id,
          }),
          (error) => {
            setIsPending(false);
            return setError(
              "Error occured loading your files. Double check your connection and try again. If error persists, contact Roof Tracker support."
            );
          }
        ),
        true
      );
      setShowAddFile(false);
    });
  };

  const loadMoreFiles = () => {
    setShowSpinner(true);
    const collectionRef = collection(db, `Users/${uid}/Files`);
    const q = query(
      collectionRef,
      where("type", "==", filterBy),
      orderBy("modified", "desc"),
      startAfter(latestDoc.modified),
      limit(5)
    );
    onSnapshot(q, (querySnapshot) => {
      fetchFiles(
        querySnapshot.docs.map(
          (doc) => ({
            ...doc.data(),
            id: doc.id,
          }),
          (error) => {
            setIsPending(false);
            return setError(
              "Error occured loading your files. Double check your connection and try again. If error persists, contact Roof Tracker support."
            );
          }
        ),
        false
      );
      setShowAddFile(false);
    });
  };

  const searchFiles = () => {
    console.log(searchTerm);
    setMessage("");
    setIsSearching(true);
    const q = query(
      collection(db, `Users/${uid}/Files`),
      where("name", ">=", searchTerm),
      where("name", "<=", searchTerm + "\uf8FF")
    );
    onSnapshot(q, (querySnapshot) => {
      fetchFiles(
        querySnapshot.docs.map(
          (doc) => ({
            ...doc.data(),
            id: doc.id,
          }),
          (error) => {
            setIsPending(false);
            return setError(
              "Error occured loading your files. Double check your connection and try again. If error persists, contact Roof Tracker support."
            );
          }
        ),
        true
      );
      setShowAddFile(false);
    });
  };

  const fetchFiles = (files, resetData) => {
    var data;
    if (resetData) {
      data = [];
    } else {
      data = [...filesData];
    }
    files.forEach(async (result) => {
      data.push(result);
    });
    setIsPending(false);
    if (data.length == 0) {
      // clear the state when no files are found
      setFilesData(data);
      return setError("No files found");
    }
    setLatestDoc(data[data.length - 1]);
    setShowSpinner(false);
    return setFilesData(data);
  };

  const clicked = (val) => {
    // Here
    console.log(`Take me to ${val.name}`);
    navigate(`/file-information/${uid}/${val.id}`);
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
    if (data !== "") {
      return moment(data, "MMMM Do YYYY, h:mm:ss a").format("LL");
    } else {
      return placeholder;
    }
  };

  return (
    <>
      {user ? (
        <>
          <BottomScrollListener onBottom={loadMoreFiles} />
          {showAddFile && (
            <AddFile
              open={showAddFile}
              onClose={() => setShowAddFile(false)}
              uid={uid}
              permission={permission}
            />
          )}
          {showAlert && (
            <AreYouSure
              open={showAlert}
              onClose={() => setShowAlert(false)}
              action={action}
              uid={uid}
            />
          )}
          <div className="header">
            <p className="header-small">Member Details</p>
            <h1 className="header-large">Team</h1>
          </div>

          <div className="profile-container">
            <div className="left-column">
              {pic == "" ? (
                <img
                  className="profile-pic border"
                  src={AccountPicPlaceholder}
                ></img>
              ) : (
                <img className="profile-pic" src={pic}></img>
              )}
            </div>
            <div className="middle-details-column">
              {access !== "Inactive" ? (
                <p className="role"> {access} </p>
              ) : (
                <p className="role inactive"> Inactive </p>
              )}

              <div style={{ marginTop: "0.5rem" }}>
                <p className="name">{name}</p>
                <p className="email">{email}</p>
              </div>

              <div
                className="missing-funds-container"
                style={{ marginTop: "1rem" }}
              >
                <div className="missing-funds-styles">
                  <div
                    style={{
                      fontSize: "20px",
                      marginRight: "8px",
                      color: "#d30b0e",
                    }}
                  >
                    {getCurrencyLabel(`${missingFundsTotal}`, "$0.00")}
                  </div>
                  in Missing Funds Found
                </div>
              </div>
            </div>
            {uid !== user?.uid &&
            adminAccess === "Superadmin" &&
            permission !== "view" ? (
              <>
                <div>
                  <ul className="button-container">
                    {access !== "Inactive" ? (
                      <li>
                        <button
                          className="status-btn deactivate status-btn-media"
                          onClick={() => {
                            setShowAlert(!showAlert);
                            setAction("Deactivate Account");
                          }}
                        >
                          Deactivate Account
                        </button>
                      </li>
                    ) : (
                      <li>
                        <button
                          className="status-btn reactivate status-btn-media"
                          onClick={() => {
                            setShowAlert(!showAlert);
                            setAction("Reactivate Account");
                          }}
                        >
                          Reactivate Account
                        </button>
                      </li>
                    )}
                    {access == "User" ? (
                      <>
                        <li>
                          <button
                            className="security-access"
                            onClick={() => {
                              setShowAlert(!showAlert);
                              setAction("Promote to Superadmin");
                            }}
                          >
                            Promote to Superadmin
                          </button>
                        </li>
                        <li>
                          <button
                            className="security-access"
                            onClick={() => {
                              setShowAlert(!showAlert);
                              setAction("Promote to Admin");
                            }}
                          >
                            Promote to Admin
                          </button>
                        </li>
                      </>
                    ) : (
                      <></>
                    )}
                    {access == "Admin" ? (
                      <>
                        <li>
                          <button
                            className="security-access"
                            onClick={() => {
                              setShowAlert(!showAlert);
                              setAction("Promote to Superadmin");
                            }}
                          >
                            Promote to Superadmin
                          </button>
                        </li>
                        <li>
                          <button
                            className="security-access"
                            onClick={() => {
                              setShowAlert(!showAlert);
                              setAction("Demote to User");
                            }}
                          >
                            Demote to User
                          </button>
                        </li>
                      </>
                    ) : (
                      <></>
                    )}
                    {access == "Superadmin" ? (
                      <>
                        <li>
                          <button
                            className="security-access"
                            onClick={() => {
                              setShowAlert(!showAlert);
                              setAction("Demote to Admin");
                            }}
                          >
                            Demote to Admin
                          </button>
                        </li>
                        <li>
                          <button
                            className="security-access"
                            onClick={() => {
                              setShowAlert(!showAlert);
                              setAction("Demote to User");
                            }}
                          >
                            Demote to User
                          </button>
                        </li>
                      </>
                    ) : (
                      <></>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <></>
            )}
          </div>
          <div className="header">
            <p className="header-small">Files</p>
            <div className="flex-space-between align-center">
              <input
                type="text"
                className="search"
                placeholder="Search..."
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                }}
              />
              <div style={{ width: "2rem" }}></div>
              <div className="input-group" style={{ margin: "0" }}>
                <select
                  value={filterBy}
                  onChange={(e) => {
                    setFilterBy(e.target.value);
                  }}
                >
                  <option disabled={true} value="">
                    Filter by job status...
                  </option>
                  <option key="1" value="Open">
                    Open
                  </option>
                  <option key="2" value="Closed">
                    Closed
                  </option>
                </select>
              </div>
              {adminAccess !== "User" && searchTerm === "" ? (
                <button
                  className="status-btn security-access show-summary-btn"
                  onClick={() => setShowAddFile(!showAddFile)}
                >
                  Add File
                </button>
              ) : (
                <button
                  className="status-btn deactivate show-summary-btn"
                  onClick={() => searchFiles()}
                >
                  Search
                </button>
              )}
            </div>
          </div>

          {filesData.length > 0 ? (
            <>
              <div className="table-container">
                <table style={{ tableLayout: "auto" }}>
                  <tbody>
                    <tr>
                      <th style={{ paddingLeft: "10px", width: "10%" }}></th>
                      <th style={{ width: "20%" }}>Name</th>
                      <th style={{ width: "30%" }}>
                        Insurance Still Owes Homeowner
                      </th>
                      <th style={{ width: "10%" }}>Final COC</th>
                      <th style={{ width: "10%" }}>Job Status</th>
                      <th style={{ width: "30%" }}>Modified</th>
                    </tr>
                  </tbody>
                  {filesData &&
                    filesData
                      .sort((a, b) =>
                        moment(
                          a["timeStamp"],
                          "MMMM Do YYYY, h:mm:ss a"
                        ).format() <
                        moment(
                          b["timeStamp"],
                          "MMMM Do YYYY, h:mm:ss a"
                        ).format()
                          ? 1
                          : -1
                      )
                      .filter((val) => {
                        if (searchTerm === "" && !isSearching) {
                          return val;
                        } else if (searchTerm !== "" && isSearching) {
                          return val;
                        }
                      })
                      .map((val, key) => {
                        return (
                          <tbody
                            className="table-cells-container"
                            key={key}
                            onClick={() => clicked(val)}
                          >
                            <tr
                              className={
                                val.missingFundsSwitch ? "flag-row" : ""
                              }
                            >
                              <td style={{ padding: "15px" }}>
                                <img
                                  className="file-image"
                                  src={
                                    val.imageData == ""
                                      ? FilePlaceholder
                                      : val.imageData
                                  }
                                ></img>
                              </td>
                              <td data-label="Name" className="name-data">
                                {val.name !== "" ? val.name : "-"}
                              </td>
                              <td
                                data-label="Insurance Still Owes HO"
                                className={
                                  val.missingFundsSwitch
                                    ? "flag-row-font-color"
                                    : ""
                                }
                              >
                                {val.coc !== "" && val.deductible !== ""
                                  ? getCurrencyLabel(
                                      `${
                                        val.coc * 1 +
                                        val.insCheckACVTotal * 1 -
                                        val.deductible * 1
                                      }`,
                                      "Not available"
                                    )
                                  : "Not available"}
                              </td>
                              <td data-label="Final COC">
                                {val.cocSwitch ? <div>Yes</div> : <div>No</div>}
                              </td>
                              <td data-label="Job Status">
                                {" "}
                                {val.type == "Open" ? (
                                  <div className="circle-div-open">
                                    <div className="circle active"></div>
                                    Open
                                  </div>
                                ) : (
                                  <div>Closed</div>
                                )}
                              </td>
                              <td data-label="Modified">
                                {getDateLabel(val.timeStamp, "-")}
                              </td>
                            </tr>
                          </tbody>
                        );
                      })}
                </table>
              </div>
              <div className="loading-spinner">
                <TailSpin
                  height="35"
                  width="35"
                  color="#d30b0e"
                  ariaLabel="tail-spin-loading"
                  radius="1"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={showSpinner}
                />
              </div>
            </>
          ) : (
            <></>
          )}

          <div className="header" style={{ marginTop: "1rem" }}>
            {filesData.length == 0 && (
              <div style={{ color: "#d30b0e" }}>{error}</div>
            )}
            <div
              className="error-message"
              style={{ color: "#676767", display: "block" }}
            >
              {message}
            </div>
            {isPending && <TableTemp />}
          </div>
        </>
      ) : (
        <>
          <PleaseLogin />
        </>
      )}
    </>
  );
};

export default UserDetails;
