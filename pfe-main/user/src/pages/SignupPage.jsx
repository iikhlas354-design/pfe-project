import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
@keyframes spin    { to{transform:rotate(360deg)} }

.anim-up { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }

/* ── Page ── */
.su-page {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  background: #f2f7f5;
  font-family: 'DM Sans', sans-serif;
  padding: 40px 20px;
  position: relative; overflow: hidden;
}
.su-page::before {
  content: ''; position: fixed; top: -120px; right: -120px;
  width: 400px; height: 400px; border-radius: 50%;
  background: radial-gradient(circle, rgba(11,102,48,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.su-page::after {
  content: ''; position: fixed; bottom: -100px; left: -100px;
  width: 350px; height: 350px; border-radius: 50%;
  background: radial-gradient(circle, rgba(168,224,44,0.08) 0%, transparent 70%);
  pointer-events: none;
}

/* ── Glass card ── */
.su-card {
  width: 100%; max-width: 460px;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 26px; padding: 38px 36px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.14), inset 0 0 12px rgba(255,255,255,0.55);
  position: relative; z-index: 1;
}

/* ── Logo mark ── */
.su-logo {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg,#1a3329,#0b6630);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 18px;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}

/* ── Title ── */
.su-title {
  font-family: 'Syne', sans-serif;
  font-size: 26px; font-weight: 800; color: #1a3329;
  text-align: center; margin-bottom: 5px; letter-spacing: -0.8px;
}
.su-subtitle {
  font-size: 13px; color: #5a7a6e;
  text-align: center; margin-bottom: 24px; line-height: 1.5;
}

/* ── Progress bar ── */
.su-progress-wrap {
  height: 5px; background: rgba(0,168,84,0.12);
  border-radius: 999px; margin-bottom: 28px; overflow: hidden;
}
.su-progress-fill {
  height: 100%; border-radius: 999px;
  background: linear-gradient(90deg, #0b6630, #a8e02c);
  transition: width 0.4s cubic-bezier(0.22,1,0.36,1);
  box-shadow: 0 0 8px rgba(168,224,44,0.5);
}

/* ── Step indicator ── */
.su-steps {
  display: flex; align-items: center; justify-content: center;
  gap: 6px; margin-bottom: 24px;
}
.su-step-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: rgba(0,168,84,0.2); transition: all 0.3s;
}
.su-step-dot.active {
  background: #0b6630; width: 22px; border-radius: 999px;
}
.su-step-dot.done { background: #a8e02c; }

/* ── Step label ── */
.su-step-label {
  font-size: 10.5px; font-weight: 700; color: #5a7a6e;
  text-transform: uppercase; letter-spacing: 1px;
  text-align: center; margin-bottom: 20px;
}
.su-step-label strong { color: #0b6630; font-family: 'Syne',sans-serif; }

/* ── Fields ── */
.su-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
.su-field label {
  font-size: 10.5px; font-weight: 700; color: #5a7a6e;
  text-transform: uppercase; letter-spacing: 1px;
  font-family: 'DM Sans',sans-serif;
}

.su-input, .su-select {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid rgba(0,168,84,0.22);
  border-radius: 12px;
  background: rgba(255,255,255,0.4); backdrop-filter: blur(8px);
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1a3329;
  outline: none; transition: all 0.2s; appearance: none;
}
.su-input::placeholder { color: rgba(26,51,41,0.3); }
.su-input:focus, .su-select:focus {
  border-color: rgba(168,224,44,0.7);
  background: rgba(255,255,255,0.65);
}
.su-select {
  cursor: pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%230b6630' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 13px center;
  padding-right: 34px;
}

.su-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 420px) { .su-row { grid-template-columns: 1fr; } }

/* ── Optional badge ── */
.su-optional {
  font-size: 10px; font-weight: 600; color: #9ab8ae;
  text-transform: none; letter-spacing: 0; margin-left: 5px;
}

/* ── Error ── */
.su-error {
  background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.2);
  border-radius: 10px; padding: 9px 13px;
  font-size: 12.5px; color: #c0392b; font-weight: 600;
  margin-bottom: 14px; display: flex; align-items: center; gap: 7px;
}

/* ── Buttons ── */
.su-btn-primary {
  width: 100%; padding: 13px;
  background: #0b6630; color: #a8e02c;
  border: none; border-radius: 20px;
  font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.su-btn-primary:hover:not(:disabled) { background: #0d7a38; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(11,102,48,0.35); }
.su-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

.su-btn-back {
  padding: 13px 20px; border-radius: 20px;
  border: 1.5px solid rgba(168,224,44,0.4);
  background: rgba(255,255,255,0.3); backdrop-filter: blur(8px);
  color: #1a3329; font-family: 'DM Sans',sans-serif;
  font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.su-btn-back:hover { background: rgba(255,255,255,0.55); }

.su-btn-row { display: flex; gap: 10px; }

/* ── Divider ── */
.su-divider {
  height: 1px; background: rgba(0,168,84,0.1);
  margin: 18px 0; position: relative;
}
.su-divider-label {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  background: rgba(242,247,245,0.8); backdrop-filter: blur(8px);
  padding: 0 10px; font-size: 11px; color: #9ab8ae; font-weight: 600;
  white-space: nowrap;
}

/* ── Login link ── */
.su-login-link {
  text-align: center; margin-top: 20px;
  font-size: 13px; color: #5a7a6e;
}
.su-login-link a {
  color: #0b6630; font-weight: 700; text-decoration: none;
  cursor: pointer;
}
.su-login-link a:hover { text-decoration: underline; }

/* ── Google btn ── */
.su-btn-google {
  width: 100%; padding: 12px;
  background: rgba(255,255,255,0.45); backdrop-filter: blur(8px);
  border: 1.5px solid rgba(0,168,84,0.2); border-radius: 20px;
  font-family: 'DM Sans',sans-serif; font-size: 13.5px; font-weight: 700;
  color: #1a3329; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center; gap: 10px;
}
.su-btn-google:hover { background: rgba(255,255,255,0.7); border-color: rgba(168,224,44,0.5); }
`;

const ACTIVITY_LEVELS = ["Sedentary", "Light", "Moderate", "Active", "Very Active"];
const GOALS           = ["Weight Loss", "Weight Gain", "Muscle Gain", "Maintain Weight", "Improve Health", "Manage Diabetes", "Other"];
const GENDERS         = ["Male", "Female"];

export default function SignupPage() {
  const navigate     = useNavigate();
  const { signup }   = useAuth();
  const [step,    setStep]    = useState(1);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email:"", password:"", firstName:"", lastName:"",
    dateOfBirth:"", gender:"", weight:"", height:"",
    goal:"", activityLevel:"", medicalConditions:"", allergies:"",
  });

  const set = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const nextStep = () => {
    const emailRegex = /\S+@\S+\.\S+/;
    if (!form.email || !form.password || !form.firstName || !form.lastName) {
      setError("Please fill all required fields"); return;
    }
    if (!emailRegex.test(form.email)) { setError("Invalid email format"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setError(""); setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await signup({ ...form, weight: Number(form.weight), height: Number(form.height) });
      navigate("/profile");
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="su-page">
        <div className="su-card anim-up">

          {/* Logo */}
          <div className="su-logo">
            <span style={{ color:"#a8e02c", fontSize:18, fontWeight:800, fontFamily:"'Syne',sans-serif" }}>C</span>
          </div>

          {/* Title */}
          <div className="su-title">Create Account</div>
          <div className="su-subtitle">Start your wellness journey with Chrysalis</div>

          {/* Progress */}
          <div className="su-progress-wrap">
            <div className="su-progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} />
          </div>

          {/* Step dots */}
          <div className="su-steps">
            <div className={`su-step-dot ${step === 1 ? "active" : "done"}`} />
            <div className={`su-step-dot ${step === 2 ? "active" : step > 2 ? "done" : ""}`} />
          </div>

          {/* Step label */}
          <div className="su-step-label">
            Step <strong>{step}</strong> of 2 — {step === 1 ? "Account Details" : "Health Profile"}
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── STEP 1 ── */}
            {step === 1 && (
              <div>
                {/* Google */}
                <button type="button" className="su-btn-google" onClick={googleLogin}>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="su-divider"><span className="su-divider-label">or sign up with email</span></div>

                {error && <div className="su-error">⚠️ {error}</div>}

                <div className="su-row">
                  <div className="su-field">
                    <label>First Name</label>
                    <input className="su-input" name="firstName" placeholder="Rania" value={form.firstName} onChange={set} disabled={loading} />
                  </div>
                  <div className="su-field">
                    <label>Last Name</label>
                    <input className="su-input" name="lastName" placeholder="Cherif" value={form.lastName} onChange={set} disabled={loading} />
                  </div>
                </div>

                <div className="su-field">
                  <label>Email</label>
                  <input className="su-input" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={set} disabled={loading} />
                </div>

                <div className="su-field">
                  <label>Password</label>
                  <input className="su-input" name="password" type="password" placeholder="At least 6 characters" value={form.password} onChange={set} disabled={loading} />
                </div>

                <button type="button" className="su-btn-primary" onClick={nextStep} disabled={loading} style={{ marginTop:6 }}>
                  Continue →
                </button>

                <div className="su-login-link">
                  Already have an account? <a onClick={() => navigate("/login")}>Log in</a>
                </div>
              </div>
            )}

            {/* ── STEP 2 ── */}
            {step === 2 && (
              <div>
                {error && <div className="su-error">⚠️ {error}</div>}

                <div className="su-row">
                  <div className="su-field">
                    <label>Date of Birth <span className="su-optional">(optional)</span></label>
                    <input className="su-input" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={set} disabled={loading} />
                  </div>
                  <div className="su-field">
                    <label>Gender <span className="su-optional">(optional)</span></label>
                    <select className="su-select" name="gender" value={form.gender} onChange={set} disabled={loading}>
                      <option value="">Select…</option>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                <div className="su-row">
                  <div className="su-field">
                    <label>Weight (kg) <span className="su-optional">(optional)</span></label>
                    <input className="su-input" name="weight" type="number" placeholder="62" value={form.weight} onChange={set} disabled={loading} />
                  </div>
                  <div className="su-field">
                    <label>Height (cm) <span className="su-optional">(optional)</span></label>
                    <input className="su-input" name="height" type="number" placeholder="165" value={form.height} onChange={set} disabled={loading} />
                  </div>
                </div>

                <div className="su-field">
                  <label>Goal <span className="su-optional">(optional)</span></label>
                  <select className="su-select" name="goal" value={form.goal} onChange={set} disabled={loading}>
                    <option value="">Select your goal…</option>
                    {GOALS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* ── Activity level matching the profile page ── */}
                <div className="su-field">
                  <label>Activity Level <span className="su-optional">(optional)</span></label>
                  <select className="su-select" name="activityLevel" value={form.activityLevel} onChange={set} disabled={loading}>
                    <option value="">Select activity level…</option>
                    {ACTIVITY_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="su-field">
                  <label>Medical Conditions <span className="su-optional">(optional)</span></label>
                  <input className="su-input" name="medicalConditions" placeholder="e.g. Diabetes, Hypertension" value={form.medicalConditions} onChange={set} disabled={loading} />
                </div>

                <div className="su-field">
                  <label>Allergies <span className="su-optional">(optional)</span></label>
                  <input className="su-input" name="allergies" placeholder="e.g. Lactose intolerance" value={form.allergies} onChange={set} disabled={loading} />
                </div>

                <div className="su-btn-row" style={{ marginTop:6 }}>
                  <button type="button" className="su-btn-back" onClick={() => { setStep(1); setError(""); }} disabled={loading}>
                    ← Back
                  </button>
                  <button type="submit" className="su-btn-primary" disabled={loading} style={{ flex:1 }}>
                    {loading
                      ? <><span style={{ width:13, height:13, border:"2px solid rgba(168,224,44,0.3)", borderTopColor:"#a8e02c", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} /> Creating…</>
                      : "Finish Setup ✓"
                    }
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}