// /src/App.jsx
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminNavbar from "./components/AdminNavbar";
import AuthModal from "./components/AuthModal";
import Home from "./pages/Home";
import AdminCRUD from "./pages/AdminCRUD";

function App() {
  const [authType, setAuthType] = useState(null);

  const handleAuthOpen = (type) => {
    setAuthType(type); // "signup" or "signin"
  };

  const handleAuthClose = () => {
    setAuthType(null);
  };

  return (
    <Router>
      <div className="app-container">
        <AdminNavbar onAuthOpen={handleAuthOpen} />
        {authType && (
          <AuthModal
            type={authType}
            onClose={handleAuthClose}
            onSwitch={handleAuthOpen}
          />
        )}

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/crud" element={<AdminCRUD />} />
        </Routes>

        <ToastContainer
          position="top-center"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
}

export default App;
