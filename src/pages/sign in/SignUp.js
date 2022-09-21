import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../logo/RT-logo-gradient.png";
import ClipArt from "../../logo/login-clip-art.png";
import WhiteApple from "../../logo/app-store-logo.png";
import "./Login-pages.css";
import { MdHelp } from "react-icons/md";
import useFetch from "../../useFetch";
import { UserAuth } from "../../context/AuthContext";
import { db } from "../../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const SignUp = () => {
  const { user, signUp } = UserAuth();

  const [emailError, setEmailError] = useState(false);
  const [pwError, setPwError] = useState(false);
  const [confirmPwError, setConfirmPwError] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [organization, setOrganization] = useState("");
  const [FB_companies, setFB_companies] = useState([]);
  const [company, setCompany] = useState("");
  const [code, setCode] = useState("");

  const { data, isPending, error } = useFetch(
    "http://localhost:8000/companies?_sort=name&_order=asc"
  );

  const navigate = useNavigate();

  const clicked = () => {
    // Here
    navigate(`/`);
  };

  const handleSubmit = async (e) => {
    // dont submit page every time I submit form
    setSubmitError("");
    e.preventDefault();
    try {
      if (code.length > 0 && organization == "company") {
        return addUserWithCompany();
      } else if (code.length < 6 < code.length) {
        return setSubmitError("Code must be six digits in length");
      } else if (
        (await signUp(email, password, name, organization, "Superadmin", "")) ==
        "error"
      ) {
        return setSubmitError("Email already in use");
      } else {
        await signUp(email, password, name, organization, "Superadmin", "");
        navigate("/my-files");
      }
    } catch (error) {
      return console.log(error);
    }
  };

  const addUserWithCompany = async () => {
    if (code.length == 6) {
      const collectionRef = collection(db, "Companies");
      // query operators: https://firebase.google.com/docs/firestore/query-data/queries#query_operators
      const q = query(
        collectionRef,
        where("name", "==", company),
        where("code", "==", code)
      );
      const snapshot = await getDocs(q);
      const results = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      if (results.length < 1) {
        return setSubmitError(
          "Unable to find company. Please double check the name (case sensitive) and registration code"
        );
      }
      let getCompanyId = "";
      results.forEach(async (result) => {
        getCompanyId = result.companyId;
      });
      setOrganization("company");
      if (
        (await signUp(
          email,
          password,
          name,
          organization,
          "User",
          getCompanyId
        )) == "error"
      ) {
        return setSubmitError("Email already in use");
      } else {
        return navigate("/my-files");
      }
    } else {
      return setSubmitError("Code must be six digits in length");
    }
  };

  const fetchCompanies = async () => {
    const postData = [];
    const querySnapshot = await getDocs(collection(db, "Companies"));
    querySnapshot.forEach((doc) => {
      // doc.data() is never undefined for query doc snapshots
      postData.push(doc.data().name);
    });
    setFB_companies(postData);
  };

  const handleFocus = (position) => {
    if (position == 1) {
      setEmailError(true);
    } else if (position == 2) {
      setPwError(true);
    } else if (position == 3) {
      setConfirmPwError(true);
    } else if (position == 4) {
      setCodeError(true);
    }
  };

  return (
    <>
      {!user && (
        <div style={{ display: "flex" }}>
          <div className="login-left-column">
            <div className="navbar signup-branding">
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
          <div className="login-right-column">
            <div className="top-buttons-container">
              <p className="already-have-account-label">
                Already have an account?
              </p>
              <button onClick={() => clicked()} className="top-btn">
                Sign In
              </button>
            </div>
            <div className="login-form-container">
              <p className="proceed-message">Fill in all fields to</p>
              <p className="welcome login-label">Create Account</p>
              <form className="form" onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="name">Full name</label>
                  <input
                    type="name"
                    name="name"
                    placeholder="Enter full name"
                    required={true}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
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
                  <p className="error-message">Please enter a valid email</p>
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
                <div className="input-group">
                  <label htmlFor="confirm-password">Confirm password</label>
                  <input
                    type="password"
                    name="confirm-password"
                    placeholder="Enter password"
                    pattern={password}
                    required={true}
                    onBlur={() => handleFocus(3)}
                    focused={confirmPwError.toString()}
                  />
                  <p className="error-message">Password does not match</p>
                </div>
                <div
                  onChange={(e) => {
                    setOrganization(e.target.value);
                    fetchCompanies();
                  }}
                >
                  <div className="input-group" style={{ display: "flex" }}>
                    <input
                      name="organization"
                      value="independent"
                      type="radio"
                    />
                    <span style={{ display: "flex", alignItems: "center" }}>
                      Register as an independent
                    </span>
                  </div>
                  <div className="input-group" style={{ display: "flex" }}>
                    <input name="organization" value="company" type="radio" />
                    <span style={{ display: "flex", alignItems: "center" }}>
                      Register with a company*
                    </span>
                  </div>
                </div>
                {organization == "company" ? (
                  <>
                    <div className="input-group">
                      <label>Company</label>
                      <select
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        style={{ width: "100%" }}
                      >
                        <option disabled={true} value="">
                          Select a company...
                        </option>
                        {FB_companies &&
                          FB_companies.map((val, key) => (
                            <option key={key} value={val}>
                              {val}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div className="input-group">
                      <label htmlFor="reg-code">registration code</label>
                      <input
                        name="reg-code"
                        type="number"
                        placeholder="Enter 6 digit registration code"
                        pattern="^\d{6,6}$"
                        required={true}
                        onBlur={() => handleFocus(4)}
                        focused={codeError.toString()}
                        onChange={(e) => setCode(e.target.value)}
                      />
                      <p className="error-message">
                        Code must be 6 characters long and contain only digits
                      </p>
                    </div>
                  </>
                ) : (
                  <></>
                )}

                <button className="login-btn">Create Account</button>
                <p className="error-message" style={{ display: "block" }}>
                  {" "}
                  {submitError}{" "}
                </p>
                <p
                  style={{
                    color: "#676767",
                    display: "flex",
                    alignItems: "center",
                    marginTop: "2rem",
                  }}
                >
                  *This can be added later
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

export default SignUp;
