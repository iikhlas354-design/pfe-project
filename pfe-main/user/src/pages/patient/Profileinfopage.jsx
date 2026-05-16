import { useState, useRef } from "react";
import { useAuth } from "../../context/Authcontext";
import { CSS as LAYOUT_CSS, MOCK_PLAN, Field, SectionTitle } from "./Shared";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

.anim-up   { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
.anim-up-d3 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.21s both; }

.glass-card, .sec-card {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.12), inset 0 0 12px rgba(255,255,255,0.55);
  overflow: hidden;
  transition: all 0.3s ease;
}
.glass-card:hover, .sec-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
}

.pf-btn {
  border-radius: 20px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  transition: all 0.2s ease;
}
.pf-btn-primary {
  background: #0b6630;
  color: #fff;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.pf-btn-primary:hover { background: #0d7a38; }
.pf-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

.pf-btn-secondary {
  background: rgba(255,255,255,0.45);
  color: #1a3329;
  border: 1.5px solid rgba(168,224,44,0.45);
  backdrop-filter: blur(8px);
}
.pf-btn-secondary:hover { background: rgba(255,255,255,0.75); }

.pf-btn-danger {
  background: transparent;
  color: #8a3a2f;
  border: 1.5px solid rgba(192,57,43,0.2);
}
.pf-btn-danger:hover { background: #fde8e8; }

.pf-input, .pf-select {
  padding: 10px 13px;
  border-radius: 12px;
  border: 1.5px solid rgba(0,168,84,0.25);
  background: rgba(255,255,255,0.4);
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  color: #1a3329;
  outline: none;
  width: 100%;
  backdrop-filter: blur(8px);
  transition: border 0.2s, background 0.2s;
}
.pf-input:focus, .pf-select:focus {
  border-color: rgba(168,224,44,0.7);
  background: rgba(255,255,255,0.65);
}

.info-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(0,168,84,0.07);
}
.info-row:last-child { border-bottom: none; }
`;

export default function ProfileInfoPage() {
  const { user } = useAuth();
  const isFirstTime = !user?.profile;

  const [form, setForm] = useState({
    firstName:         user?.firstName                    || "",
    lastName:          user?.lastName                     || "",
    dateOfBirth:       user?.profile?.dateOfBirth
      ? new Date(user.profile.dateOfBirth).toISOString().split("T")[0]
      : "",
    gender:            user?.profile?.gender              || "",
    weight:            user?.profile?.weight              || "",
    height:            user?.profile?.height              || "",
    goal:              user?.profile?.goal                || "",
    activityLevel:     user?.profile?.activityLevel       || "",
    medicalConditions: user?.profile?.medicalConditions?.join(", ") || "",
    allergies:         user?.profile?.allergies?.join(", ")         || "",
  });

  const [avatar,  setAvatar]  = useState(user?.avatar || null);
  const [editing, setEditing] = useState(isFirstTime);
  const [saved,   setSaved]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const avatarRef             = useRef(null);

  const [showPwd, setShowPwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({ newPassword: "", confirmPassword: "" });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved,  setPwdSaved]  = useState(false);
  const [pwdError,  setPwdError]  = useState("");

  /* ── helpers ── */
  const calculateAge = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? age : null;
  };

  const age = calculateAge(form.dateOfBirth);

  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  const bmiCat = !bmi ? null
    : bmi < 18.5 ? { label: "Underweight", color: "#1a6fa0", pct: 12 }
    : bmi < 25   ? { label: "Normal",      color: "#2d7a4f", pct: 38 }
    : bmi < 30   ? { label: "Overweight",  color: "#c07a00", pct: 63 }
    :              { label: "Obese",        color: "#c0392b", pct: 86 };

  const fullName       = `${form.firstName} ${form.lastName}`.trim();
  const profileComplete = form.firstName && form.lastName && form.weight && form.height && form.goal;
  const plan           = user?.plan || MOCK_PLAN;

  const handleAvatar = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = e => setAvatar(e.target.result);
    r.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`http://localhost:5000/users/${user.id}`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: form.firstName, lastName: form.lastName }),
      });

      const res = await fetch("http://localhost:5000/profile", {
        method:      !user?.profile ? "POST" : "PATCH",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({
          dateOfBirth:       form.dateOfBirth || null,
          gender:            form.gender      || null,
          weight:            form.weight      ? Number(form.weight) : null,
          height:            form.height      ? Number(form.height) : null,
          goal:              form.goal        || null,
          activityLevel:     form.activityLevel || null,
          medicalConditions: form.medicalConditions
            ? form.medicalConditions.split(",").map(s => s.trim()).filter(Boolean) : [],
          allergies: form.allergies
            ? form.allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
        }),
      });

      if (!res.ok) { const d = await res.json(); throw new Error(d.message || "Save failed"); }
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setPwdError("");
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { setPwdError("Passwords do not match."); return; }
    if (pwdForm.newPassword.length < 6) { setPwdError("Password must be at least 6 characters."); return; }
    setPwdSaving(true);
    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: pwdForm.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to change password.");
      setPwdSaved(true);
      setPwdForm({ newPassword: "", confirmPassword: "" });
      setTimeout(() => setPwdSaved(false), 3500);
    } catch (err) { setPwdError(err.message); }
    finally { setPwdSaving(false); }
  };

  /* ── sub-components ── */
  const Badge = ({ children, bg, color, border }) => (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: bg, color, borderRadius: 999,
      padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
      border: border || "none",
    }}>{children}</span>
  );

  const InfoRow = ({ label, value, icon }) => (
    <div className="info-row">
      <span style={{ fontSize: 15, opacity: 0.55 }}>{icon}</span>
      <span style={{ fontSize: 11.5, color: "#5a7a6e", fontWeight: 600, minWidth: 90 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", flex: 1, textAlign: "right" }}>{value || "—"}</span>
    </div>
  );

  const FieldGroup = ({ label, children }) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 0.7 }}>{label}</label>
      {children}
    </div>
  );

  const Input = ({ field, type = "text", placeholder }) => (
    <input
      className="pf-input"
      type={type}
      value={form[field]}
      placeholder={placeholder}
      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
    />
  );

  const Select = ({ field, options }) => (
    <select
      className="pf-select"
      value={form[field]}
      onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
    >
      <option value="">Select…</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  const SecCard = ({ title, subtitle, accent, children }) => (
    <div className="sec-card">
      <div style={{
        padding: "16px 22px 13px", borderBottom: "1px solid rgba(0,168,84,0.12)",
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329" }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: "#5a7a6e", marginTop: 2 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: "10px 22px 20px" }}>{children}</div>
    </div>
  );

  /* ═══════════════ RENDER ═══════════════ */
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", minHeight: "100vh", position: "relative" }}>
      <style>{CSS}</style>

      <div style={{ padding: "28px 28px 40px" }}>

        {/* ── Success banner ── */}
        {saved && (
          <div className="anim-up" style={{
            background: "rgba(45,122,79,0.12)",
            border: "1px solid rgba(0,168,84,0.25)",
            backdropFilter: "blur(10px)",
            borderRadius: 14, padding: "13px 18px",
            fontSize: 13.5, fontWeight: 600, color: "#2d7a4f",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 22,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%", background: "#0b6630",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            Profile saved successfully
          </div>
        )}

        {/* ── First-time welcome banner ── */}
        {isFirstTime && editing && (
          <div className="anim-up" style={{
            background: "linear-gradient(135deg,#1a3329 0%,#0b6630 60%,#1a5e3a 100%)",
            borderRadius: 20, padding: "26px 30px", marginBottom: 22,
            display: "flex", alignItems: "center", gap: 18,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: -25, top: -25, width: 160, height: 160, borderRadius: "50%", background: "rgba(168,224,44,0.09)" }} />
            <div style={{ position: "absolute", right: 45, bottom: -45, width: 110, height: 110, borderRadius: "50%", background: "rgba(168,224,44,0.06)" }} />
            <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
              <div style={{ fontSize: 19, fontWeight: 800, color: "#fff", marginBottom: 5 }}>
                Welcome aboard, {form.firstName || "there"} 🌱
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 440 }}>
                Complete your profile to unlock personalised nutrition plans, meal tracking, and health insights tailored just for you.
              </div>
            </div>
            <div style={{
              position: "relative", zIndex: 1,
              width: 52, height: 52, borderRadius: 14,
              background: "rgba(168,224,44,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
            }}>🌟</div>
          </div>
        )}

        {/* ── Main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20 }}>

          {/* ════════════ LEFT SIDEBAR ════════════ */}
          <div className="anim-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Identity Card */}
            <div className="glass-card">
              {/* Strip header */}
              <div style={{
                height: 76,
                background: "linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  backgroundImage: "radial-gradient(circle,rgba(168,224,44,0.12) 1.5px,transparent 1.5px)",
                  backgroundSize: "18px 18px",
                }} />
              </div>

              <div style={{ padding: "0 22px 22px" }}>
                {/* Avatar */}
                <div style={{ marginTop: -38, display: "flex", justifyContent: "center", position: "relative" }}>
                  <div style={{
                    width: 76, height: 76, borderRadius: "50%",
                    border: "3px solid rgba(168,224,44,0.7)",
                    background: avatar ? "transparent" : "rgba(255,255,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    overflow: "hidden",
                    boxShadow: "0 4px 20px rgba(11,102,48,0.25), inset 0 0 8px rgba(255,255,255,0.4)",
                  }}>
                    {avatar
                      ? <img src={avatar} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 800, color: "#1a3329" }}>
                          {form.firstName?.[0] || "?"}
                        </span>
                    }
                  </div>
                  <button
                    onClick={() => avatarRef.current?.click()}
                    style={{
                      position: "absolute", bottom: -2, right: "calc(50% - 40px)",
                      width: 24, height: 24, borderRadius: "50%",
                      background: "#a8e02c", border: "2.5px solid rgba(255,255,255,0.8)",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a3329" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
                    </svg>
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleAvatar(e.target.files[0])} />
                </div>

                {/* Name + email */}
                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 800, color: "#1a3329" }}>
                    {fullName || <span style={{ color: "#9ab5a5", fontStyle: "italic" }}>Your Name</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 3 }}>
                    {user?.email || "member@chrysalis.app"}
                  </div>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginTop: 12 }}>
                  {form.gender       && <Badge bg="rgba(168,224,44,0.18)" color="#0b6630"  border="1px solid rgba(168,224,44,0.4)">{form.gender}</Badge>}
                  {age !== null      && <Badge bg="rgba(26,111,160,0.1)"  color="#1a6fa0"  border="1px solid rgba(26,111,160,0.2)">Age {age}</Badge>}
                  {form.goal         && <Badge bg="rgba(245,230,66,0.18)" color="#8a7200"  border="1px solid rgba(245,230,66,0.4)">{form.goal}</Badge>}
                  {form.activityLevel && <Badge bg="rgba(122,63,160,0.1)"  color="#7a3fa0"  border="1px solid rgba(122,63,160,0.2)">{form.activityLevel}</Badge>}
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(0,168,84,0.15)", margin: "14px -22px 12px" }} />

                {/* Weight / Height */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{ textAlign: "center", padding: "8px 0" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1a3329" }}>{form.weight || "—"}</div>
                    <div style={{ fontSize: 10, color: "#5a7a6e", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>kg</div>
                  </div>
                  <div style={{ textAlign: "center", padding: "8px 0", borderLeft: "1px solid rgba(0,168,84,0.15)" }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#1a3329" }}>{form.height || "—"}</div>
                    <div style={{ fontSize: 10, color: "#5a7a6e", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>cm</div>
                  </div>
                </div>

                {/* BMI bar */}
                {bmi && bmiCat && (
                  <div style={{
                    marginTop: 12, padding: "11px 14px",
                    background: "rgba(255,255,255,0.35)", borderRadius: 14,
                    border: "1px solid rgba(0,168,84,0.2)",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 0.8 }}>BMI</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: bmiCat.color }}>{bmiCat.label} · {bmi}</span>
                    </div>
                    <div style={{ height: 5, background: "linear-gradient(90deg,#1a6fa0,#2d7a4f,#c07a00,#c0392b)", borderRadius: 999, position: "relative" }}>
                      <div style={{
                        position: "absolute", top: "50%", left: `${bmiCat.pct}%`,
                        transform: "translate(-50%,-50%)",
                        width: 13, height: 13, borderRadius: "50%",
                        background: "rgba(255,255,255,0.9)", border: `2.5px solid ${bmiCat.color}`,
                      }} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Membership Card */}
            <div className="glass-card" style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 11 }}>Membership</div>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "linear-gradient(135deg,#1a3329,#0b6630)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>⭐</div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329" }}>{plan?.name || plan?.goal || "Basic Plan"}</div>
                  <div style={{ fontSize: 11, color: "#5a7a6e", marginTop: 2 }}>Active since {user?.joinDate || "2026"}</div>
                </div>
              </div>
            </div>

            {/* Edit Profile Card */}
            <div className="glass-card" style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 11 }}>Edit Profile</div>
              {editing ? (
                <div style={{ display: "flex", gap: 7 }}>
                  {!isFirstTime && (
                    <button className="pf-btn pf-btn-secondary" onClick={() => setEditing(false)} style={{ flex: 1, justifyContent: "center" }}>
                      Cancel
                    </button>
                  )}
                  <button
                    className="pf-btn pf-btn-primary"
                    onClick={handleSave}
                    disabled={saving}
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    {saving ? (
                      <>
                        <span style={{
                          width: 13, height: 13,
                          border: "2px solid rgba(255,255,255,0.3)",
                          borderTopColor: "#fff",
                          borderRadius: "50%",
                          display: "inline-block",
                          animation: "spin 0.6s linear infinite",
                        }} />
                        Saving…
                      </>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        Save
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <button className="pf-btn pf-btn-primary" onClick={() => setEditing(true)} style={{ width: "100%", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            {/* Change Password Card */}
            <div className="glass-card" style={{ padding: "18px 22px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 11 }}>Security</div>
              {!showPwd ? (
                <button className="pf-btn pf-btn-danger" onClick={() => setShowPwd(true)} style={{ width: "100%", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  Change Password
                </button>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  <input
                    type="password" className="pf-input"
                    value={pwdForm.newPassword}
                    onChange={e => setPwdForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="New password (min 6)"
                  />
                  <input
                    type="password" className="pf-input"
                    value={pwdForm.confirmPassword}
                    onChange={e => setPwdForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                  {pwdError && <div style={{ color: "#c0392b", fontSize: 12, fontWeight: 600 }}>⚠️ {pwdError}</div>}
                  {pwdSaved && (
                    <div style={{ color: "#2d7a4f", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      Password updated!
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 7 }}>
                    <button className="pf-btn pf-btn-primary" onClick={handleChangePassword} disabled={pwdSaving} style={{ flex: 1, justifyContent: "center" }}>
                      {pwdSaving ? "Updating…" : "Update"}
                    </button>
                    <button className="pf-btn pf-btn-secondary" onClick={() => { setShowPwd(false); setPwdError(""); setPwdForm({ newPassword: "", confirmPassword: "" }); }} style={{ flex: 1, justifyContent: "center" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ════════════ RIGHT CONTENT ════════════ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Personal Information */}
            <div className="anim-up-d1">
              <SecCard title="Personal Information" subtitle="Your basic identity details" accent="#0b6630">
                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                      <FieldGroup label="First Name"><Input field="firstName" placeholder="First name" /></FieldGroup>
                      <FieldGroup label="Last Name"><Input field="lastName" placeholder="Last name" /></FieldGroup>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                      <FieldGroup label="Date of Birth"><Input field="dateOfBirth" type="date" /></FieldGroup>
                      <FieldGroup label="Gender"><Select field="gender" options={["Female", "Male"]} /></FieldGroup>
                    </div>
                  </div>
                ) : (
                  <>
                    <InfoRow label="Full Name"    value={fullName}                             icon="👤" />
                    <InfoRow label="Date of Birth" value={form.dateOfBirth}                   icon="📅" />
                    <InfoRow label="Gender"        value={form.gender}                         icon="⚧"  />
                    <InfoRow label="Age"           value={age !== null ? `${age} years` : null} icon="🎂" />
                  </>
                )}
              </SecCard>
            </div>

            {/* Health Details */}
            <div className="anim-up-d2">
              <SecCard title="Health Details" subtitle="Medical background & body metrics" accent="#1a6fa0">
                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
                      <FieldGroup label="Weight (kg)"><Input field="weight" type="number" placeholder="62" /></FieldGroup>
                      <FieldGroup label="Height (cm)"><Input field="height" type="number" placeholder="165" /></FieldGroup>
                    </div>
                    <FieldGroup label="Medical Conditions"><Input field="medicalConditions" placeholder="None" /></FieldGroup>
                    <FieldGroup label="Allergies"><Input field="allergies" placeholder="e.g. Lactose intolerance" /></FieldGroup>
                  </div>
                ) : (
                  <>
                    <InfoRow label="Weight"   value={form.weight ? `${form.weight} kg` : null} icon="⚖️" />
                    <InfoRow label="Height"   value={form.height ? `${form.height} cm` : null} icon="📏" />
                    <InfoRow label="Medical"  value={form.medicalConditions || "None"}           icon="🩺" />
                    <InfoRow label="Allergies" value={form.allergies || "None"}                  icon="🌾" />
                  </>
                )}
              </SecCard>
            </div>

            {/* Goals & Lifestyle */}
            <div className="anim-up-d3">
              <SecCard title="Goals & Lifestyle" subtitle="What you want to achieve" accent="#b8a200">
                {editing ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
                    <FieldGroup label="My Goal">
                      <Select field="goal" options={["Weight Loss","Weight Gain","Muscle Gain","Maintain Weight","Improve Health","Manage Diabetes","Other"]} />
                    </FieldGroup>
                    <FieldGroup label="Activity Level">
                      <Select field="activityLevel" options={["Sedentary","Light","Moderate","Active","Very Active"]} />
                    </FieldGroup>
                  </div>
                ) : (
                  <>
                    <InfoRow label="Primary Goal" value={form.goal}          icon="🎯" />
                    <InfoRow label="Activity"      value={form.activityLevel} icon="🏃" />
                    <InfoRow label="BMI"           value={bmi ? `${bmi} (${bmiCat?.label})` : null} icon="📊" />
                  </>
                )}
              </SecCard>
            </div>

            {/* Incomplete warning */}
            {!profileComplete && !editing && (
              <div className="anim-up" style={{
                background: "rgba(254,253,232,0.7)", backdropFilter: "blur(12px)",
                borderRadius: 16, padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 14,
                border: "1px solid rgba(184,162,0,0.2)",
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                }}>⚠️</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#8a7200" }}>Profile incomplete</div>
                  <div style={{ fontSize: 12, color: "#b8a200", marginTop: 2 }}>Add weight, height and goal for personalised recommendations.</div>
                </div>
                <button className="pf-btn pf-btn-primary" onClick={() => setEditing(true)}>Complete →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}