import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../logo/RT-logo-gradient.png";
import ClipArt from "../../logo/login-clip-art.png";
import WhiteApple from "../../logo/app-store-logo.png";
import "./Login-pages.css";
import { MdHelp } from "react-icons/md";
import uuid from "react-native-uuid";
import { setDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";
import { UserAuth } from "../../context/AuthContext";

const RegisterCompany = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [alert, setAlert] = useState("");
  const { user } = UserAuth();
  const [emailError, setEmailError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError(false);
    setAlert("");
    let ticketuid = uuid.v1();
    setDoc(doc(db, "Tickets", ticketuid), {
      email: email,
      message: message,
      uid: ticketuid,
    }).catch((error) => {
      return setAlert(error);
    });
    setMessage("");
    setEmail("");
    setAlert(
      "Submission sent. Roof Tracker will reach out to your email within 24 hours to start the registration process"
    );
  };

  const navigate = useNavigate();

  const clicked = (val) => {
    // Here
    navigate(`/`);
  };

  const handleFocus = (position) => {
    if (position == 1) {
      setEmailError(true);
    }
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
              <p className="proceed-message">Fill in all fields to</p>
              <p className="welcome login-label">Register a Company</p>
              <form className="form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    required={true}
                    value={email}
                    onBlur={() => handleFocus(1)}
                    focused={emailError.toString()}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="error-message">Please enter a valid email</p>
                </div>
                <div className="input-group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    form="form"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter message"
                  ></textarea>
                </div>
                <button className="login-btn">Send</button>
                <p
                  className="error-message"
                  style={{ color: "#676767", display: "block" }}
                >
                  {" "}
                  {alert}{" "}
                </p>
              </form>
              <Link
                to="/login"
                style={{ textDecoration: "none" }}
                className="help-and-support"
              >
                <MdHelp style={{ marginTop: "2px" }} />
                <span style={{ marginLeft: "6px" }}>Help and Support</span>
              </Link>
              <img className="app-store-logo" src={WhiteApple}></img>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default RegisterCompany;
