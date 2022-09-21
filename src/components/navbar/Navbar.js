import React, { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import { AiOutlineClose } from "react-icons/ai";
import { MdAccountCircle } from "react-icons/md";

import { Link, useNavigate } from "react-router-dom";
import { SuperAdminSidebarPages, UserSidebarPages } from "./SidebarPages";
import "./Navbar.css";
import { IconContext } from "react-icons/lib";
import Logo from "../../logo/RT-logo-gradient.png";
import { db } from "../../firebase";
import { UserAuth } from "../../context/AuthContext";
import { BiLogOut } from "react-icons/bi";
import { onSnapshot, doc } from "firebase/firestore";

// to get list of available react icons: https://react-icons.github.io/react-icons

const Navbar = () => {
  const { user, logOut } = UserAuth();
  const [sidebar, setSidebar] = useState(false); // false means its not showing at first
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [access, setAccess] = useState("");
  const [company, setCompany] = useState(false);
  const [companyId, setCompanyId] = useState("");

  // reverses the value of sidebar
  const showSidebar = () => setSidebar(!sidebar);
  const navigate = useNavigate();

  useEffect(() => {
    onSnapshot(doc(db, "Users", `${user?.uid}`), (doc) => {
      setName(doc.data()?.name);
      setAccess(doc.data()?.access);
      setCompanyId(doc.data()?.companyId);
      setPic(doc.data()?.["profile pic url"]);
    });
  }, [user?.uid]);

  useEffect(() => {
    if (companyId) {
      onSnapshot(doc(db, "Companies", `${companyId}`), (doc) => {
        setCompany(doc.data()?.name);
      });
    }
  }, [companyId]);

  const handleLogout = async () => {
    try {
      await logOut();
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      {user ? (
        <>
          {" "}
          {/* IconContext.Provider value={{color: '#fff'}} changes color of icons only */}
          <IconContext.Provider value={{ color: "#1d2731" }}>
            <div className="navbar">
              <button to="#" className="menu-bars">
                <FaBars onClick={showSidebar} />
              </button>
              {access === "User" || access === "Inactive" || companyId == "" ? (
                <Link to="/my-files" className="menu-branding">
                  <img className="menu-logo" src={Logo}></img>
                  <span className="title">Roof Tracker</span>
                </Link>
              ) : (
                <Link to="/home" className="menu-branding">
                  <img className="menu-logo" src={Logo}></img>
                  <span className="title">Roof Tracker</span>
                </Link>
              )}

              <span className="menu-company-name">{company}</span>
            </div>
          </IconContext.Provider>
          <IconContext.Provider value={{ color: "#FFFF" }}>
            <nav
              className={sidebar ? "nav-menu active" : "nav-menu"}
              style={{ backgroundColor: "" }}
            >
              <ul className="nav-menu-items" onClick={showSidebar}>
                <li className="navbar-toggle">
                  <button to="#" className="menu-bars btn-animation">
                    <AiOutlineClose />
                  </button>
                </li>
                {(access === "Superadmin" || access == "Admin") &&
                companyId !== "" ? (
                  <>
                    {SuperAdminSidebarPages.map((item, index) => {
                      return (
                        <li key={index} className={item.className}>
                          <Link to={item.path}>
                            {item.icon}
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </>
                ) : (
                  <>
                    {UserSidebarPages.map((item, index) => {
                      return (
                        <li key={index} className={item.className}>
                          <Link to={item.path}>
                            {item.icon}
                            <span>{item.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </>
                )}

                <li className="nav-text">
                  <button className="logout-btn" onClick={handleLogout}>
                    <BiLogOut />
                    <span>Log Out</span>
                  </button>
                </li>
                <li className="nav-profile">
                  {pic == "" ? (
                    <MdAccountCircle style={{ fontSize: "2rem" }} />
                  ) : (
                    <img className="navbar-profile-pic " src={pic}></img>
                  )}
                  <span>
                    {name}
                    <p className="nav-profile-title">
                      {companyId === "" ? "Independent" : access}
                    </p>
                  </span>
                </li>
              </ul>
            </nav>
          </IconContext.Provider>{" "}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Navbar;
