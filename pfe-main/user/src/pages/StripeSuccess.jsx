import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
.ss-page { min-height:100vh; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at top,#e8f5e9,#e3f2fd); font-family:'DM Sans',sans-serif; padding:20px; }
.ss-card { width:100%; max-width:420px; background:rgba(255,255,255,0.95); backdrop-filter:blur(12px); border-radius:24px; padding:40px 34px; box-shadow:0 25px 70px rgba(0,0,0,0.12); border:1px solid rgba(255,255,255,0.6); }
.ss-icon { width:64px; height:64px; background:linear-gradient(135deg,#1a3329,#2d6b50); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:28px; margin:0 auto 20px; animation:popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both; }
@keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.ss-title { font-size:22px; font-weight:700; color:#1a3329; text-align:center; margin-bottom:6px; }
.ss-sub { font-size:13px; color:#5a7a6e; text-align:center; margin-bottom:28px; line-height:1.6; }
.ss-divider { height:1px; background:#e8f0ec; margin-bottom:24px; }
.ss-label { font-size:12px; font-weight:600; color:#1a3329; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:8px; display:block; }
.ss-input { width:100%; padding:12px 14px; border-radius:12px; border:1.5px solid #d7eee5; background:#f7fcf9; outline:none; font-family:'DM Sans',sans-serif; font-size:14px; color:#1a3329; transition:0.2s; margin-bottom:14px; }
.ss-input:focus { border-color:#2d6b50; box-shadow:0 0 0 3px rgba(45,107,80,0.12); background:#fff; }
.ss-btn { width:100%; padding:13px; border-radius:12px; border:none; background:linear-gradient(135deg,#1a3329,#2d6b50); color:#f5e642; font-weight:700; font-size:14px; cursor:pointer; transition:0.2s; font-family:'DM Sans',sans-serif; margin-top:4px; }
.ss-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(45,107,80,0.3); }
.ss-btn:disabled { opacity:0.6; cursor:not-allowed; }
.err-box { background:#fff5f5; border:1px solid rgba(229,62,62,0.25); border-radius:10px; padding:10px 13px; font-size:13px; color:#c53030; margin-bottom:14px; }
`;

export default function StripeSuccess() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) { setError("Please enter your email and password"); return; }

  setLoading(true);
  setError("");

  try {
    const user = await login(email, password);
    // ✅ same check here
    if (!user.hasResume) {
      navigate("/resume/create", { replace: true });
    } else {
      navigate("/resume", { replace: true });
    }
  } catch (err) {
    setError(err.message || "Login failed");
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <style>{CSS}</style>
      <div className="ss-page">
        <div className="ss-card">

          {/* Success badge */}
          <div className="ss-icon">✓</div>
          <div className="ss-title">Stripe setup complete!</div>
          <div className="ss-sub">
            Your payment account is ready.<br />
            Sign in to build your profile.
          </div>

          <div className="ss-divider" />

          {/* Login form */}
          <form onSubmit={handleLogin}>
            {error && <div className="err-box">{error}</div>}

            <label className="ss-label">Email</label>
            <input
              className="ss-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
            />

            <label className="ss-label">Password</label>
            <input
              className="ss-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={loading}
            />

            <button className="ss-btn" type="submit" disabled={loading}>
              {loading ? "Signing in…" : "Sign in & build my profile →"}
            </button>
          </form>

        </div>
      </div>
    </>
  );
}