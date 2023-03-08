import React, { useEffect, useState } from "react";
import { AiFillCheckCircle, AiFillFolderOpen } from "react-icons/ai";

import { BsFillCheckCircleFill } from "react-icons/bs";
import AddTask from "../components/task/AddTask";
import Navbar from "../components/navbar/Navbar";
import TaskButton from "../components/task/TaskButton";
import "../styles/Home.css";
import "../styles/Table.css";
import Tasks from "../components/task/Tasks";
import { Navigate, useNavigate } from "react-router-dom";
import TableTemp from "../components/isPending-templates/TableTemp";
import TaskTemp from "../components/isPending-templates/TaskTemp";
import Placeholder from "../logo/file-icon.png";
import {
  doc,
  onSnapshot,
  collection,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  updateDoc,
  orderBy,
  limit,
} from "firebase/firestore";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import moment from "moment"; // reference how to use moment https://momentjs.com/
import Login from "./sign in/Login";
import PleaseLogin from "../components/error-pages/PleaseLogin";

function Home() {
  const { user } = UserAuth();
  const [didMount, setDidMount] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const [filterBy, setFilterBy] = useState("Open");
  const [filterByModified, setFilterByModified] = useState("720");
  const [showAddTask, setShowAddTask] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [filesData, setFilesData] = useState([]);
  const [tasksData, setTasksData] = useState([]);

  const [name, setName] = useState("");
  const [companyId, setCompanyId] = useState(null);
  const [access, setAccess] = useState(null);
  const [searchInput, setSearchInput] = useState(null);
  const [isPending, setisPending] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // const {
  //   data: user,
  //   isPending,
  //   error,
  // } = useFetch("http://localhost:8000/team/1234324234");
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user?.uid}`), (doc) => {
      setName(doc.data()?.name);
      setCompanyId(doc.data()?.companyId);
      setAccess(doc.data()?.access);
    });
  }, [user?.uid]);

  //get tasks
  useEffect(() => {
    if (companyId !== "") {
      onSnapshot(collection(db, `Companies/${companyId}/Tasks`), (snapshot) => {
        fetchTasks(
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
      });
    }
  }, [companyId]);

  //get members
  useEffect(() => {
    if (didMount === false && access !== "User" && access !== "Inactive") {
      fetchTeam(companyId, filterBy, filterByModified);
    }
  }, [companyId, filterBy, filterByModified]);

  const fetchTasks = async (tasks) => {
    let data = [];
    tasks.forEach(async (result) => {
      data.push(result);
    });
    setTasksData(data);
  };

  const fetchTeam = async (cid, filter, filterModified) => {
    if (cid) {
      setError("");
      setMessage("Loading...");
      setDidMount(true);
      setFilesData([]);
      const collectionRef = collection(db, "Users");
      // query operators: https://firebase.google.com/docs/firestore/query-data/queries#query_operators
      const q = query(collectionRef, where("companyId", "==", cid));
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(
        (doc) => ({
          ...doc.data(),
          owner: doc.name,
          id: doc.id,
        }),
        (error) => {
          setisPending(false);
          return setError(
            "Error occured loading your team. Double check your connection and try again. If error persists, contact Roof Tracker support."
          );
        }
      );
      results.forEach(async (result) => {
        const collectionRef = collection(db, `Users/${result.uid}/Files`);
        const q = query(
          collectionRef,
          where("type", "==", filter),
          where(
            "modified",
            ">",
            new Date(Date.now() - filterModified * 60 * 1000)
          ) // 30 minutes before current time ref: https://medium.com/firebase-developers/the-secrets-of-firestore-fieldvalue-servertimestamp-revealed-29dd7a38a82b
        );
        //const q = query(collectionRef, where("type", "!=", ""));

        const snapshot = await getDocs(q);

        fetchFiles(
          snapshot.docs.map(
            (doc) => ({
              ...doc.data(),
              id: doc.id,
            }),
            (error) => {
              setisPending(false);
              setMessage("");
              return setError(
                "Error occured loading your files. Double check your connection and try again. If error persists, contact Roof Tracker support."
              );
            }
          ),
          result.name,
          result.id
        );
      });
      setisPending(false);
    }
  };

  const fetchFiles = (files, owner, id) => {
    setMessage("");
    files.forEach(async (result) => {
      setFilesData((oldData) => [
        ...oldData,
        { ...result, fileOwner: owner, ownerId: id },
      ]);
    });
    // console.log(id);
    // console.log(files);
    setisPending(false);
    if (filesData.length == 0) {
      return setError("No files found");
    }
    return;
  };

  const addDate = (files, id) => {
    for (let i = 0; i < files.length; i++) {
      // console.log(files[i].timeStamp);
      // var today = moment(
      //   files[i].timeStamp,
      //   "MMMM Do YYYY, h:mm:ss A"
      // ).format();
      // updateDoc(doc(db, `Users/${id}/Files/${files[i].id}`), {
      //   modified: serverTimestamp(),
      // });
      //console.log(today);
    }
  };

  const clicked = (val) => {
    // Here
    console.log(`Take me to ${val.name}`);
    navigate(`/file-information/${val.ownerId}/${val.id}`);
  };

  // Delete task
  const deleteTask = async (id) => {
    await deleteDoc(doc(db, `Companies/${companyId}/Tasks/${id}`))
      .then(() => {
        return;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const getDateLabel = (data, placeholder) => {
    if (data.length == 4 || data.length == 8) {
      return moment(data, "MMDDYYYY").format("ll");
    } else if (8 < data.length < 40) {
      return moment(data, "MMMM Do YYYY, h:mm:ss a").format("ll");
    } else {
      return placeholder;
    }
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

  return (
    <>
      {user && companyId !== "" ? (
        <>
          <div className="header home-header">
            <p className="header-small">Dashboard</p>
            <h1 className="header-large">Home</h1>
          </div>
          {/* <div className="card-container">
        <div
          className="card"
          style={{ borderColor: "#d30b0e", color: "#d30b0e" }}
        >
          <div className="flex-space-between">
            <p style={{ fontSize: "24px" }}>10 </p>
            <div className="card-icon align-center">
              <AiFillFolderOpen />
            </div>
          </div>
          <p>Open Projects</p>
        </div>
        <div
          className="card"
          style={{
            borderColor: "#1d2731",
            color: "#1d2731",
            marginLeft: "2rem",
          }}
        >
          <div className="flex-space-between">
            <p style={{ fontSize: "24px" }}>180 </p>
            <div className="card-icon align-center">
              <BsFillCheckCircleFill />
            </div>
          </div>
          <p>Closed Projects</p>
        </div>
      </div> */}

          <div className="card-container">
            <div className="files-container">
              <div
                className="header"
                style={{ marginTop: "0", marginLeft: "0rem" }}
              >
                <p className="header-small">Recent Activity</p>
              </div>
              <div className="flex-space-between">
                <input
                  type="text"
                  className="search"
                  placeholder="Search..."
                  onChange={(event) => {
                    {
                      setSearchTerm(event.target.value);
                      setSearchInput(event.target.value);
                    }
                  }}
                />
                <div style={{ width: "2rem" }}></div>
                <div className="input-group">
                  <select
                    value={filterBy}
                    onChange={(e) => {
                      setFilterBy(e.target.value);
                      fetchTeam(companyId, e.target.value, filterByModified);
                    }}
                    style={{ width: "100%" }}
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
                <div style={{ width: "2rem" }}></div>
                <div className="input-group">
                  <select
                    value={filterByModified}
                    onChange={(e) => {
                      setFilterByModified(e.target.value);
                      fetchTeam(companyId, filterBy, e.target.value);
                    }}
                    style={{ width: "100%" }}
                  >
                    <option disabled={true} value="">
                      Filter by recently modified...
                    </option>
                    <option key="1" value="720">
                      12 Hours
                    </option>
                    <option key="2" value="1440">
                      24 Hours
                    </option>
                    <option key="3" value="4320">
                      72 Hours
                    </option>
                    <option key="5" value="1051200">
                      All
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex-end"></div>

              {filesData.length > 0 && (
                <div className="dashboard-element">
                  <table
                    style={{
                      tableLayout: "auto",
                      overflowX: "auto",
                      width: "100%",
                    }}
                  >
                    <tbody>
                      <tr>
                        <th style={{ paddingLeft: "10px", width: "10%" }}></th>
                        <th style={{ width: "22%" }}>Name</th>
                        <th style={{ width: "10%" }}>Final COC</th>
                        <th style={{ width: "20%" }}>
                          Insurance Still Owes HO
                        </th>
                        <th style={{ width: "15%" }}>Modified</th>
                        <th style={{ width: "15%" }}>Owner</th>
                        <th>Job Status</th>
                      </tr>
                    </tbody>
                    {/* moment(data, "MMMM Do YYYY, h:mm:ss a").format("ll"); */}
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
                          if (searchTerm == "") {
                            return val;
                          } else if (
                            val.name
                              .toString()
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase())
                          ) {
                            return val;
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
                                <td data-label="Final COC?">
                                  {val.cocSwitch ? (
                                    <div>Yes</div>
                                  ) : (
                                    <div>No</div>
                                  )}
                                </td>
                                <td data-label="Insurance Still Owes HO">
                                  {val.coc !== "" && val.deductible !== ""
                                    ? getCurrencyLabel(
                                        `${
                                          val.coc * 1 +
                                          val.insCheckACVTotal * 1 -
                                          val.deductible * 1
                                        }`,
                                        "N/A"
                                      )
                                    : "N/A"}
                                </td>
                                <td data-label="Modified">
                                  {getDateLabel(val.timeStamp, "-")}
                                </td>
                                <td data-label="Owner">{val.fileOwner}</td>
                                <td data-label="Job Status">
                                  {val.type == "Open" ? (
                                    <div className="circle-div-open">
                                      <div className="circle active"></div>
                                      Open
                                    </div>
                                  ) : (
                                    <div>Closed</div>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          );
                        })}
                  </table>
                </div>
              )}
              <div className="header" style={{ margin: "1rem 0 0 0" }}>
                {filesData.length == 0 && (
                  <div style={{ color: "#d30b0e" }}>{error}</div>
                )}
                <p
                  className="error-message"
                  style={{ color: "#676767", display: "block" }}
                >
                  {message}
                </p>
                {isPending && <TableTemp />}
              </div>
            </div>
            <div className="tasks-container">
              <div
                className="header"
                style={{
                  margin: "0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p className="header-small">Tasks</p>

                <div style={{ marginTop: "-0.8rem" }}>
                  {" "}
                  <TaskButton
                    text={showAddTask ? "Close" : "Add Task"}
                    onClick={() => setShowAddTask(!showAddTask)}
                  />
                </div>
              </div>

              {tasksData && (
                <div style={{ marginTop: "1rem" }}>
                  {showAddTask && (
                    <AddTask
                      open={showAddTask}
                      onClose={setShowAddTask}
                      name={name}
                      companyId={companyId}
                    />
                  )}

                  {tasksData.length > 0 ? (
                    <Tasks tasks={tasksData} onDelete={deleteTask} />
                  ) : (
                    <p style={{ padding: "10px", color: "#777676" }}>
                      No tasks to show
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <PleaseLogin />
      )}
    </>
  );
}

export default Home;
