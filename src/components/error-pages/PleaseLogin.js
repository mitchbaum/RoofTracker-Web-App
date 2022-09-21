import React from "react";
import { useNavigate } from "react-router-dom";

const PleaseLogin = () => {
  const navigate = useNavigate();
  const navigateToLogin = () => {
    navigate("/");
  };
  return (
    <div className="header">
      <p className="header-small">
        Unable to authenticate user. If you normally have access to this page
        please login again.
      </p>
      <h1 className="header-large">Invalid access</h1>
      <button
        className="status-btn deactivate"
        style={{ margin: "1rem 0rem 0 0rem", width: "150px" }}
        onClick={navigateToLogin}
      >
        Login
      </button>
    </div>
  );
};

export default PleaseLogin;
