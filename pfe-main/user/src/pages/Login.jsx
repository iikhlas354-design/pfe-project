import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

export default function Login() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
 
  const navigate = useNavigate();
  const { login } = useAuth();
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Please enter email and password"); return; }
 
    setLoading(true);
    setError("");
 
    try {
      const user = await login(email, password);
      const role = user?.role;
 
      if (role === "ADMIN") {
        navigate("/admin");
      } else if (role === "NUTRITION") {
        if (!user.stripeAccountId) {
          navigate("/nutritionist-setup");
        } else if (!user.hasResume) {
          navigate("/resume/create");
        } else {
          navigate("/resume");
        }
      } else {
        navigate("/profile");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
 
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <div className="pf-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');
        
        .pf-root { 
          font-family: 'DM Sans', sans-serif; 
background: radial-gradient(ellipse at 50% 0%, #e8f5e9 0%, #f2f7f5 50%, #eef4f1 100%);          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        /* GLASS CARD */
        .glass-card {
          background: rgba(255,255,255,0.18);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border-top: 1.5px solid rgba(168,224,44,0.85);
          border-left: 1.5px solid rgba(168,224,44,0.85);
          border-bottom: 1.5px solid rgba(0,168,84,0.75);
          border-right: 1.5px solid rgba(0,168,84,0.75);
          border-radius: 22px;
          box-shadow: 0 8px 32px rgba(15,89,47,0.14), inset 0 0 12px rgba(255,255,255,0.55);
          overflow: hidden;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 430px;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.28);
          box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
        }
        .glass-card-pad { padding: 40px 34px; }
        
        /* HEADER STRIP */
        .id-strip {
          height: 76px;
          background: linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%);
          position: relative; 
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .id-strip-dots {
          position: absolute; 
          inset: 0;
          background-image: radial-gradient(circle,rgba(168,224,44,0.12) 1.5px,transparent 1.5px);
          background-size: 18px 18px;
        }
        .strip-logo {
          position: relative;
          z-index: 1;
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(255,255,255,0.15);
          border: 2px solid rgba(168,224,44,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(8px);
        }
        .strip-logo span {
          color: #a8e02c;
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
        }
        
        /* FORM STYLES */
        .login-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #1a3329;
          text-align: center;
          margin-top: 24px;
        }
        .login-sub {
          font-size: 13.5px;
          color: #5a7a6e;
          text-align: center;
          margin-top: 6px;
          margin-bottom: 28px;
        }
        
        .pf-field { 
          display: flex; 
          flex-direction: column; 
          gap: 5px; 
          margin-bottom: 14px;
        }
        .pf-field label { 
          font-size: 11.5px; 
          font-weight: 700; 
          color: #5a7a6e; 
          text-transform: uppercase; 
          letter-spacing: 0.6px; 
        }
        .pf-field input {
          padding: 12px 14px; 
          border-radius: 12px;
          border: 1.5px solid rgba(0,168,84,0.25); 
          background: rgba(255,255,255,0.4);
          font-size: 14px; 
          font-family: 'DM Sans',sans-serif;
          color: #1a3329; 
          outline: none; 
          backdrop-filter: blur(8px);
          transition: all 0.2s;
          width: 100%;
        }
        .pf-field input:focus { 
          border-color: rgba(168,224,44,0.7); 
          background: rgba(255,255,255,0.6);
          box-shadow: 0 0 0 3px rgba(168,224,44,0.15);
        }
        .pf-field input::placeholder {
          color: #8a9a8e;
        }
        
        /* BUTTONS */
        .pf-btn { 
          border-radius: 12px; 
          padding: 12px 18px; 
          font-size: 14px; 
          font-weight: 700; 
          cursor: pointer; 
          font-family: 'DM Sans',sans-serif; 
          display: inline-flex; 
          align-items: center; 
          justify-content: center;
          gap: 8px; 
          border: none; 
          transition: all 0.2s; 
          width: 100%;
        }
        .pf-btn-primary { 
          background: #0b6630; 
          color: #fff; 
          box-shadow: 0 4px 14px rgba(11,102,48,0.3); 
          margin-top: 8px;
        }
        .pf-btn-primary:hover:not(:disabled) { 
          background: #0d7a38; 
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(11,102,48,0.4);
        }
        .pf-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        /* GOOGLE BUTTON */
        .google-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 12px;
          border: 1.5px solid rgba(0,168,84,0.25);
          background: rgba(255,255,255,0.4);
          font-weight: 700;
          font-size: 14px;
          color: #1a3329;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(8px);
        }
        .google-btn:hover {
          background: rgba(255,255,255,0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(15,89,47,0.1);
        }
        .google-icon {
          width: 18px;
          height: 18px;
        }
        
        /* DIVIDER */
        .login-divider {
          text-align: center;
          margin: 20px 0;
          font-size: 12px;
          color: #5a7a6e;
          font-weight: 600;
          position: relative;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .login-divider::before,
        .login-divider::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 35%;
          height: 1px;
          background: rgba(0,168,84,0.2);
        }
        .login-divider::before { left: 0; }
        .login-divider::after { right: 0; }
        
        /* ERROR */
        .login-error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.2);
          color: #c0392b;
          padding: 10px 14px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        /* FOOTER */
        .login-footer {
          text-align: center;
          margin-top: 22px;
          font-size: 13.5px;
          color: #5a7a6e;
          font-weight: 500;
        }
        .login-footer a {
          color: #0b6630;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.2s;
        }
        .login-footer a:hover {
          color: #0d7a38;
          text-decoration: underline;
        }
        
        /* ANIMATIONS */
        @keyframes slideUp { 
          from { opacity: 0; transform: translateY(20px); } 
          to { opacity: 1; transform: translateY(0); } 
        }
        .anim { 
          animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both; 
        }
        
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        .spinner { 
          width: 16px; 
          height: 16px; 
          border: 2px solid rgba(255,255,255,0.3); 
          border-top-color: #fff; 
          border-radius: 50%; 
          display: inline-block; 
          animation: spin 0.6s linear infinite; 
        }
      `}</style>

      <div className="glass-card anim">
        {/* Header Strip with Logo */}
        <div className="id-strip">
          <div className="id-strip-dots" />
          <div className="strip-logo">
            <span>C</span>
          </div>
        </div>

        <div className="glass-card-pad">
          <div className="login-title">Welcome back</div>
          <div className="login-sub">Sign in to continue</div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="login-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            <div className="pf-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="pf-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button className="pf-btn pf-btn-primary" disabled={loading}>
              {loading ? (
                <><span className="spinner" /> Logging in...</>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="login-divider">or</div>

          <button className="google-btn" onClick={handleGoogleLogin}>
            <svg className="google-icon" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l5.7 4.2C13.1 15.2 18.3 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.5 4 10.1 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.9 0 11-2.3 14.8-6l-6.8-5.6C30.2 34.2 27.2 35.5 24 35.5c-5.3 0-9.7-3.3-11.4-7.9l-7 5.4C9.1 40.1 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.4-3.4 6.2-6.3 8.1l6.8 5.6c4-3.7 6.3-9.2 6.3-15.6 0-1.3-.1-2.5-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>

          <div className="login-footer">
            Don't have an account? <Link to="/Signup">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}