import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../logo/RT-logo-gradient.png";
import ClipArt from "../../logo/login-clip-art.png";
import "./Login-pages.css";
import { UserAuth } from "../../context/AuthContext";

const ForgotPassword = () => {
  const [email, setEmail] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const { user, resetPassword } = UserAuth();

  const handleSubmit = async (e) => {
    // dont submit page every time I submit form
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await resetPassword(email);
      setMessage("Check your inbox for password reset instructions");
    } catch (error) {
      console.log(error.message);
      if (error.message == "Firebase: Error (auth/user-not-found).") {
        console.log(true);
        setError("User not found");
      } else {
        setError("Failed to send password reset email");
      }
    }
  };

  const navigate = useNavigate();

  const clicked = () => {
    // Here
    navigate(`/`);
  };

  const handleFocus = (e) => {
    setEmailError(true);
  };

  return (
    <>
      {!user && (
        <div style={{ display: "flex" }}>
          <div className="login-left-column">
            <div className="navbar" style={{ borderBottom: "none" }}>
              <Link to="/" className="menu-branding">
                <img className="menu-logo" src={Logo}></img>
                <span className="title">Roof Tracker</span>
              </Link>
            </div>
            <div className="greeting-container">
              <img className="clip-art-img" src={ClipArt}></img>
              <h1 className="welcome">Welcome</h1>
              <p className="message">
                Easily keep track of payments and project specifications for the
                entire roof build cycle
              </p>
            </div>
          </div>
          <div className="login-right-column" style={{ height: "100vh" }}>
            <div className="top-buttons-container">
              <button onClick={() => clicked()} className="top-btn">
                Sign In
              </button>
            </div>
            <div className="login-form-container">
              <p className="proceed-message">Proceed with your email to</p>
              <p className="welcome login-label">Reset Password</p>
              <form className="form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    required={true}
                    onBlur={handleFocus}
                    focused={emailError.toString()}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="error-message">Please enter a valid email</p>
                </div>
                <button className="login-btn">Send Password Reset</button>
                {error ? (
                  <p className="error-message" style={{ display: "block" }}>
                    {" "}
                    {error}{" "}
                  </p>
                ) : (
                  <p
                    className="error-message"
                    style={{ color: "#676767", display: "block" }}
                  >
                    {" "}
                    {message}{" "}
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ForgotPassword;
