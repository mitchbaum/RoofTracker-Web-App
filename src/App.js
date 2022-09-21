import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import UserDetails from "./pages/UserDetails";
import Login from "./pages/sign in/Login";
import SignUp from "./pages/sign in/SignUp";
import RegisterCompany from "./pages/sign in/RegisterCompany";
import ForgotPassword from "./pages/sign in/ForgotPassword";
import MyFiles from "./pages/MyFiles";
import FileInformation from "./pages/FileInformation";
import PageNotFound from "./components/error-pages/PageNotFound";
import { useEffect } from "react";
import { AuthContextProvider } from "./context/AuthContext";
import Navbar from "./components/navbar/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import NoAccess from "./components/error-pages/NoAccess";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
}

function App() {
  return (
    <>
      <div style={{ backgroundColor: "" }}>
        <AuthContextProvider>
          <Router>
            <Navbar />
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route
                path="/home"
                exact
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/company-registration"
                element={<RegisterCompany />}
              />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/signup" element={<SignUp />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/my-files" element={<MyFiles />} />
              <Route
                path="/team"
                element={
                  <ProtectedRoute>
                    <Team />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/team/:uid"
                element={
                  <ProtectedRoute>
                    <UserDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="file-information/:uid/:fileId"
                element={
                  <ProtectedRoute>
                    <FileInformation />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<PageNotFound />} />
              <Route path="/error" element={<NoAccess />} />
            </Routes>
          </Router>
        </AuthContextProvider>
      </div>
    </>
  );
}

export default App;
