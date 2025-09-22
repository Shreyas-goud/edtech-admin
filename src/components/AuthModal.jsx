// frontend/src/components/AuthModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import "./AuthModal.css";

function AuthModal({ type, onClose, onSwitch }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isSignup = type === "signup";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const BACKEND_URL = process.env.REACT_APP_EDTECH_BACKEND_URL;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/v1/admin/${isSignup ? "signup" : "signin"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();
      setLoading(false);
      console.log("🔁 Server response:", data);

      if (!res.ok) {
        if (data.message === "Incorrect credentials") {
          setError("Wrong password. Try again.");
        } else {
          setError(data.message || "An error occurred.");
        }
        toast.error(data.message || "Something went wrong");
        return;
      }

      if (data.token) {
        localStorage.setItem("adminToken", data.token);
        toast.success(`${isSignup ? "Registered" : "Logged in"} successfully`);
        setTimeout(() => {
          window.location.href = "/admin/crud";
        }, 1000);
      } else {
        toast.error(data.message || "Unexpected error");
      }
    } catch (err) {
      setLoading(false);
      console.error("❌ Network or unexpected error:", err);
      toast.error("Network error. Try again.");
    }
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal">
        <button className="close-button" onClick={onClose}>
          ✕
        </button>
        <h2>{isSignup ? "Admin Sign Up" : "Admin Sign In"}</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        {isSignup && (
          <>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
            />
          </>
        )}

        {error && <p className="auth-error">{error}</p>}

        {!isSignup && (
          <div className="forgot-password">
            <button type="button" className="link-style">
              Forgot Password?
            </button>
          </div>
        )}

        <button
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Loading..." : isSignup ? "Register" : "Login"}
        </button>

        <div className="switch-auth">
          <button
            className="link-style"
            onClick={() => onSwitch(isSignup ? "signin" : "signup")}
          >
            {isSignup ? "Switch to Sign In" : "Switch to Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
