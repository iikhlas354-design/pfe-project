import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // link = /reset-password?token=abc123
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  const handleReset = async () => {
    if (!password || password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirm)
      return setError("Passwords do not match");

    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.message || "Reset failed");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Reuse your existing login-page CSS or paste it here
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#e3f2fd",
      fontFamily: "'Nunito', sans-serif", padding: 20,
    }}>
      <div style={{
        width: "100%", maxWidth: 420, background: "#fff",
        borderRadius: 22, padding: "38px 32px", border: "1px solid #c8e0d8",
      }}>
        <p style={{ fontSize: 22, fontWeight: 800, color: "#123022", marginBottom: 6 }}>
          Choose a new password
        </p>
        <p style={{ fontSize: 13.5, color: "#6b9080", marginBottom: 24 }}>
          Make it at least 6 characters.
        </p>

        {success ? (
          <div style={{ background: "#e8f5e9", borderRadius: 12, padding: "14px 16px",
            fontSize: 13.5, color: "#2d7a4f", fontWeight: 600 }}>
            ✓ Password reset! Redirecting you to login…
          </div>
        ) : (
          <>
            {error && <p style={{ color: "#c0392b", fontSize: 13, marginBottom: 12 }}>{error}</p>}

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1a3d2e",
              display: "block", marginBottom: 6 }}>New password</label>
            <input
              type="password" placeholder="••••••••" value={password}
              onChange={e => setPassword(e.target.value)}
              style={{ width: "100%", height: 48, padding: "0 14px", border: "1.5px solid #c0dfd0",
                borderRadius: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif",
                background: "#f4fbf7", outline: "none", marginBottom: 14, boxSizing: "border-box" }}
            />

            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#1a3d2e",
              display: "block", marginBottom: 6 }}>Confirm password</label>
            <input
              type="password" placeholder="••••••••" value={confirm}
              onChange={e => setConfirm(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleReset()}
              style={{ width: "100%", height: 48, padding: "0 14px", border: "1.5px solid #c0dfd0",
                borderRadius: 12, fontSize: 14, fontFamily: "'Nunito', sans-serif",
                background: "#f4fbf7", outline: "none", marginBottom: 20, boxSizing: "border-box" }}
            />

            <button onClick={handleReset} disabled={loading} style={{
              width: "100%", padding: 14, border: "none", borderRadius: 12,
              background: loading ? "#8abba8" : "#2d6b50", color: "#fff",
              fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Nunito', sans-serif",
            }}>
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}