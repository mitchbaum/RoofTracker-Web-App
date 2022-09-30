import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../logo/RT-logo-gradient.png";
import ClipArt from "../../logo/login-clip-art.png";
import WhiteApple from "../../logo/app-store-logo.png";
import "./Login-pages.css";
import { MdHelp } from "react-icons/md";
import { UserAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { doc, onSnapshot } from "firebase/firestore";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [error, setError] = useState("");
  const { user, logIn } = UserAuth();

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    // dont submit page every time I submit form
    e.preventDefault();
    setError("");
    try {
      await logIn(email, password);

      navigate("/my-files", { replace: true });
    } catch (error) {
      setError("Incorrect email or password");
    }
  };

  const clicked = () => {
    // Here
    navigate(`/signup`);
  };

  const handleFocus = (position) => {
    if (position == 1) {
      setEmailError(true);
    } else if (position == 2) {
      setPwError(true);
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
            <Link to="/company-registration" style={{ textDecoration: "none" }}>
              <p className="register-company">Register my company →</p>
            </Link>
          </div>
          <div className="login-right-column" style={{ height: "100vh" }}>
            <div className="top-buttons-container">
              <button onClick={() => clicked()} className="top-btn">
                Sign Up
              </button>

              {/* <button className="top-btn">Tour</button> */}
            </div>
            <div className="login-form-container">
              <img className="media-logo media-hide" src={Logo}></img>
              <p className="proceed-message">Proceed with your</p>
              <p className="welcome login-label">Login</p>
              <form className="form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    required={true}
                    onBlur={() => handleFocus(1)}
                    focused={emailError.toString()}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <p className="error-message">
                    Please enter a valid email address
                  </p>
                </div>
                <div className="input-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    pattern="(?=.*[0-9a-zA-Z]).{6,}"
                    required={true}
                    onBlur={() => handleFocus(2)}
                    focused={pwError.toString()}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="error-message">
                    Password must be at least 6 characters long
                  </p>
                </div>
                {error ? (
                  <p className="error-message" style={{ display: "block" }}>
                    {error}
                  </p>
                ) : null}
                <button className="login-btn">Login</button>
                <Link to="/forgot-password" style={{ textDecoration: "none" }}>
                  <p className="forgot-pw">Forgot Password?</p>
                </Link>
                <Link
                  to="/company-registration"
                  style={{ textDecoration: "none" }}
                >
                  <p className="register-company media-hide">
                    Register my company →
                  </p>
                </Link>
              </form>
              <a
                href="https://mitchbaum.github.io/Roof-Tracker-Support-Website/"
                style={{ textDecoration: "none" }}
                className="help-and-support"
                target="_blank"
              >
                <MdHelp style={{ marginTop: "2px" }} />
                <span style={{ marginLeft: "6px" }}>Help and Support</span>
              </a>
              <img className="app-store-logo" src={WhiteApple}></img>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Login;
