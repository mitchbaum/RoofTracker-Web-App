import React, { useEffect, useState } from "react";
import "../styles/Team.css";
import { useNavigate } from "react-router-dom";
import { MdAccountCircle } from "react-icons/md";
import Placeholder from "../logo/account-icon.png";
import TableTemp from "../components/isPending-templates/TableTemp";
import { UserAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import PleaseLogin from "../components/error-pages/PleaseLogin";

const Team = () => {
  const { user } = UserAuth();
  // run this command to get data from mock server: npx json-server --watch data/db.json --port 8000
  // only will run once when component first renders
  // this local json server is just for the Tour button
  //const { data, isPending, error } = useFetch("http://localhost:8000/team?_sort=name&_order=asc");
  const [isPending, setisPending] = useState(true);
  const [error, setError] = useState("");
  const [sortedData, setSortedData] = useState([]);
  const [order, setOrder] = useState("ASC");
  const [didMount, setDidMount] = useState(false);

  const [showData, setShowData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [teamData, setTeamData] = useState([]);

  const [searchInput, setSearchInput] = useState(null);
  const [filterBy, setFilterBy] = useState("Active");
  const [companyId, setCompanyId] = useState(null);
  const [access, setAccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user?.uid}`), (doc) => {
      setCompanyId(doc.data()?.companyId);
      setAccess(doc.data()?.access);
      console.log(didMount);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (didMount === false && access !== "User" && access !== "Inactive") {
      console.log(filterBy);
      fetchTeam(companyId, filterBy);

      console.log("useEffect");
    }
  }, [companyId, filterBy]);

  const sorting = (col) => {
    setShowData(false);
    if (order === "ASC") {
      const sorted = [...teamData].sort((a, b) => (a[col] > b[col] ? 1 : -1));
      setSortedData(sorted);
      setOrder("DEC");
    }
    if (order === "DEC") {
      const sorted = [...teamData].sort((a, b) => (a[col] < b[col] ? 1 : -1));
      setSortedData(sorted);
      setOrder("ASC");
    }
  };

  const clicked = (val) => {
    // Here
    console.log(`Take me to ${val.name}`);
    navigate(`${val.uid}`);
  };

  const fetchTeam = async (cid, filter) => {
    if (cid) {
      console.log(filter);
      setError("");
      setTeamData([]);
      setDidMount(true);
      let queryOp = [];
      if (filter == "Active") {
        queryOp = ["User", "Admin", "Superadmin"];
      } else {
        queryOp = ["Inactive"];
      }
      const collectionRef = collection(db, "Users");
      // query operators: https://firebase.google.com/docs/firestore/query-data/queries#query_operators
      const q = query(
        collectionRef,
        where("companyId", "==", cid),
        where("access", "in", queryOp)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map(
        (doc) => ({
          ...doc.data(),
          id: doc.id,
        }),
        (error) => {
          setisPending(false);
          return setError(
            "Error occured loading your team. Double check your connection and try again. If error persists, contact Roof Tracker support."
          );
        }
      );
      let data = [];
      results.forEach(async (result) => {
        let member = {
          uid: result.uid,
          name: result.name,
          pic: result["profile pic url"],
          access: result.access,
          email: result.email,
        };
        data.push(member);
      });

      setisPending(false);
      if (data.length == 0) {
        return setError("No team members found");
      }
      return setTeamData(data);
    }
  };

  return (
    <>
      {user ? (
        <>
          <div className="header">
            <p className="header-small">Members</p>
            <h1 className="header-large">Team</h1>

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
                    fetchTeam(companyId, e.target.value);
                  }}
                  style={{ width: "100%" }}
                >
                  <option disabled={true} value="">
                    Filter by status...
                  </option>
                  <option key="1" value="Active">
                    Active
                  </option>
                  <option key="2" value="Inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          {teamData.length > 0 && (
            <>
              <div className="table-container">
                <table>
                  <tbody>
                    <tr style={{ cursor: "pointer" }}>
                      <th style={{ width: "10%" }}></th>
                      <th
                        style={{ width: "30%" }}
                        onClick={() => sorting("name")}
                      >
                        Name
                      </th>
                      <th
                        style={{ width: "15%" }}
                        onClick={() => sorting("access")}
                      >
                        Role
                      </th>
                      <th onClick={() => sorting("email")}>Email</th>
                      <th
                        style={{ width: "10%" }}
                        onClick={() => sorting("status")}
                      >
                        Status
                      </th>
                    </tr>
                  </tbody>

                  {showData &&
                    teamData &&
                    teamData
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
                            key={key}
                            className="table-cells-container"
                          >
                            <tr>
                              <td style={{ padding: "10px" }}>
                                <img
                                  className={
                                    val.pic !== ""
                                      ? "team-profile-pic"
                                      : "team-profile-pic border"
                                  }
                                  src={val.pic !== "" ? val.pic : Placeholder}
                                ></img>
                              </td>
                              <td data-label="Name">
                                {val.name !== "" ? val.name : "-"}
                              </td>
                              <td data-label="Role">
                                {val.access === "Inactive" ? "" : val.access}
                              </td>

                              <td data-label="Email">{val.email}</td>
                              <td data-label="Status">
                                {val.access === "Inactive" ? (
                                  <div
                                    style={{
                                      color: "#d30b0e",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className="circle inactive"></div>
                                    Inactive
                                  </div>
                                ) : (
                                  <div className="circle-div-open">
                                    <div className="circle active"></div>
                                    Active
                                  </div>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        );
                      })}

                  {sortedData &&
                    sortedData
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
                            key={key}
                            className="table-cells-container"
                          >
                            <tr>
                              <td style={{ padding: "10px" }}>
                                <img
                                  className={
                                    val.pic !== ""
                                      ? "team-profile-pic"
                                      : "team-profile-pic border"
                                  }
                                  src={val.pic !== "" ? val.pic : Placeholder}
                                ></img>
                              </td>
                              <td data-label="Name">{val.name}</td>
                              <td data-label="Role">
                                {val.access === "Inactive" ? "" : val.access}
                              </td>

                              <td data-label="Email">{val.email}</td>
                              <td data-label="Status">
                                {val.access === "Inactive" ? (
                                  <div
                                    style={{
                                      color: "#d30b0e",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    <div className="circle inactive"></div>
                                    Inactive
                                  </div>
                                ) : (
                                  <div className="circle-div-open">
                                    <div className="circle active"></div>
                                    Active
                                  </div>
                                )}
                              </td>
                            </tr>
                          </tbody>
                        );
                      })}
                </table>
              </div>
            </>
          )}
          <div className="header" style={{ marginTop: "1rem" }}>
            {error !== "" && <div style={{ color: "#d30b0e" }}>{error}</div>}
            {isPending && <TableTemp />}
          </div>
        </>
      ) : (
        <PleaseLogin />
      )}
    </>
  );
};

export default Team;
