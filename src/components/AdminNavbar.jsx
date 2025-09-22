import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminNavbar.css";

function AdminNavbar({ onAuthOpen }) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
    navigate("/");
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-title" onClick={() => navigate("/")}>
          EdTechBook
        </div>
        <div
          className="navbar-center-1"
          onClick={() => navigate("/admin/crud")}
          style={{ cursor: "pointer" }}
        >
          Admin Page
        </div>
        <div
          className="navbar-menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}
        >
          ☰
        </div>
        {isMenuOpen && (
          <div className="dropdown">
            {!isAuthenticated ? (
              <>
                <div onClick={() => onAuthOpen("signup")}>Sign Up</div>
                <div onClick={() => onAuthOpen("signin")}>Sign In</div>
              </>
            ) : (
              <div onClick={handleLogout}>Logout</div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default AdminNavbar;
