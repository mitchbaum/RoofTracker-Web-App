import React from "react";
import { useNavigate } from "react-router-dom";

const NoAccess = () => {
  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate("/");
  };
  return (
    <div className="header">
      <p className="header-small">
        You don't have access to this page. Admin status required.
      </p>
      <h1 className="header-large">Invalid access</h1>
      {/* <button
        className="status-btn deactivate"
        style={{ margin: "1rem 0rem 0 0rem", width: "150px" }}
        onClick={navigateToLogin}
      >
        Login
      </button> */}
    </div>
  );
};

export default NoAccess;
