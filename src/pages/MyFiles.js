import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AddFile from "../components/modal-alerts/AddFile";
import TableTemp from "../components/isPending-templates/TableTemp";
import Placeholder from "../logo/file-icon.png";
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
import moment from "moment"; // reference how to use moment https://momentjs.com/
import PleaseLogin from "../components/error-pages/PleaseLogin";

const MyFiles = () => {
  const { user } = UserAuth();

  const [filesData, setFilesData] = useState([]);
  const [filterBy, setFilterBy] = useState("Open");

  const [searchTerm, setSearchTerm] = useState("");
  const [isPending, setisPending] = useState(true);
  const [error, setError] = useState("");
  const [showAddFile, setShowAddFile] = useState(false);
  const [access, setAccess] = useState("");

  const navigate = useNavigate();

  // const { data, isPending, error } = useFetch(
  //   "http://localhost:8000/team/1234324234"
  // );

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user?.uid}`), (doc) => {
      setAccess(doc.data()?.access);
    });
  }, [user?.uid]);

  useEffect(() => {
    getFiles(filterBy);
  }, [user?.uid, filterBy]);

  const getFiles = async (filter) => {
    const collectionRef = collection(db, `Users/${user?.uid}/Files`);
    const q = query(collectionRef, where("type", "==", filter));
    const snapshot = await getDocs(q);
    console.log(snapshot.docs);
    fetchFiles(
      snapshot.docs.map(
        (doc) => ({
          ...doc.data(),
          id: doc.id,
        }),
        (error) => {
          setisPending(false);
          return setError(
            "Error occured loading your files. Double check your connection and try again. If error persists, contact Roof Tracker support."
          );
        }
      )
    );
    setShowAddFile(false);
  };

  const clicked = (val) => {
    // Here
    console.log(`Take me to ${val.name}`);
    navigate(`/file-information/${user?.uid}/${val.id}`);
  };

  const fetchFiles = (files) => {
    let data = [];
    files.forEach(async (result) => {
      data.push(result);
    });
    setisPending(false);
    if (data.length == 0) {
      // clear the state when no files are found
      setFilesData(data);
      return setError("No files found");
    }
    return setFilesData(data);
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
      {user && access !== "Inactive" ? (
        <>
          {showAddFile && (
            <AddFile
              open={showAddFile}
              onClose={() => setShowAddFile(false)}
              uid={user?.uid}
              permission={user?.permission}
            />
          )}

          <div className="header my-files">
            <p className="header-small">All</p>
            <h1 className="header-large">My Files</h1>
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
              <button
                className="status-btn security-access show-summary-btn"
                onClick={() => setShowAddFile(!showAddFile)}
              >
                Add File
              </button>
            </div>
          </div>
          {filesData.length > 0 && (
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
                      moment(b["timeStamp"], "MMMM Do YYYY, h:mm:ss a").format()
                        ? 1
                        : -1
                    )
                    .filter((val) => {
                      if (searchTerm != "") {
                        if (
                          val.name
                            .toString()
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase())
                        ) {
                          return val;
                        }
                      } else if (searchTerm == "") {
                        if (
                          val.type
                            .toString()
                            .toLowerCase()
                            .includes(filterBy.toLowerCase())
                        ) {
                          return val;
                        }
                      }
                    })
                    .map((val, key) => {
                      return (
                        <tbody
                          onClick={() => clicked(val)}
                          className="table-cells-container"
                          key={key}
                        >
                          <tr>
                            <td style={{ padding: "15px" }}>
                              <img
                                className="file-image"
                                src={
                                  val.imageData == ""
                                    ? Placeholder
                                    : val.imageData
                                }
                              ></img>
                            </td>
                            <td data-label="Name">
                              {val.name !== "" ? val.name : "-"}
                            </td>
                            <td data-label="Insurance Still Owes HO">
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
                            <td data-label="Final COC?">
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
          )}
          <div className="header" style={{ marginTop: "1rem" }}>
            {filesData.length == 0 && (
              <div style={{ color: "#d30b0e" }}>{error}</div>
            )}
            {isPending && <TableTemp />}
          </div>
        </>
      ) : (
        <PleaseLogin />
      )}
      {user && access === "Inactive" && (
        <>
          <div className="header">
            <p className="header-small">
              You're account has been deactivated. Contact your company admin to
              reactivate your account.
            </p>
            <h1 className="header-large">Invalid access</h1>
          </div>
        </>
      )}
    </>
  );
};

export default MyFiles;
