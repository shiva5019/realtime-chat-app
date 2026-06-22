
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("/auth/signup", { name, email, password });
      login(response.data);
      navigate("/chat");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.iconCircle}>
          <span style={styles.iconText}>💬</span>
        </div>

        <h2 style={styles.title}>Sign Up</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>👤</span>
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>✉</span>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputWrap}>
            <span style={styles.inputIcon}>🔒</span>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>
            Create account
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "linear-gradient(160deg, #36a9e1 0%, #1d8fd1 100%)",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "70px 40px 40px 40px",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
    width: "100%",
    maxWidth: "360px",
    position: "relative",
    textAlign: "center",
  },
  iconCircle: {
    position: "absolute",
    top: "-40px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(160deg, #36a9e1 0%, #1d8fd1 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 8px 20px rgba(29,143,209,0.4)",
  },
  iconText: {
    fontSize: "32px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "600",
    color: "#9aa5b1",
    marginBottom: "26px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputWrap: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#f1f3f6",
    borderRadius: "26px",
    padding: "13px 18px",
    gap: "10px",
  },
  inputIcon: {
    color: "#9aa5b1",
    fontSize: "14px",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
    fontSize: "14px",
    color: "#374151",
  },
  button: {
    padding: "14px",
    borderRadius: "26px",
    border: "none",
    background: "linear-gradient(160deg, #36a9e1 0%, #1d8fd1 100%)",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    marginTop: "8px",
    boxShadow: "0 8px 18px rgba(29,143,209,0.35)",
  },
  error: {
    backgroundColor: "#fee2e2",
    color: "#dc2626",
    padding: "10px 14px",
    borderRadius: "12px",
    fontSize: "13px",
    marginBottom: "16px",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#9aa5b1",
    marginTop: "22px",
  },
  link: {
    color: "#1d8fd1",
    fontWeight: "600",
    textDecoration: "none",
  },
};

export default Signup;