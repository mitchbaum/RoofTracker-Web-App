import React from "react";
import "./Templates.css";

const AccountDetailsTemp = () => {
  return (
    <>
      <div
        className="profile-container"
        style={{ marginLeft: "0", marginRight: "0" }}
      >
        <div className="left-column">
          <img
            className="profile-pic"
            style={{ backgroundColor: "#e0e0e0" }}
          ></img>
        </div>
        <div className="middle-column">
          <p className="role text-filler"> </p>

          <p className="name text-filler" style={{ width: "150px" }}></p>
          <p className="email text-filler"></p>
        </div>

        <ul className="button-container">
          <li>
            <div
              className="status-btn security-access text-filler"
              style={{ height: "25px", marginTop: "0" }}
            ></div>
          </li>
          <li>
            <div
              className="status-btn security-access text-filler"
              style={{ height: "25px" }}
            ></div>
          </li>
          <li>
            <div
              className="status-btn security-access text-filler"
              style={{ height: "25px" }}
            ></div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default AccountDetailsTemp;
