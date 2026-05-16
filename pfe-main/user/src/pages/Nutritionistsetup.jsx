import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

.ns-fade { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both }

.ns-input {
  width: 100%; border: 1.5px solid rgba(79,158,122,0.2); border-radius: 12px;
  padding: 12px 14px; font-size: 14px; font-family: 'DM Sans', sans-serif;
  color: #1a3329; background: #f7faf8; outline: none;
  transition: all 0.2s ease; box-sizing: border-box; resize: none;
}
.ns-input:focus { border-color: #4f9e7a; background: #fff; box-shadow: 0 0 0 3px rgba(79,158,122,0.1); }
.ns-input.err   { border-color: #e53e3e !important; background: #fff5f5; }

.ns-btn {
  width: 100%; padding: 14px; border: none; border-radius: 13px;
  background: linear-gradient(135deg, #1a3329, #2d6b50); color: #f5e642;
  font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700;
  cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
  transition: all 0.22s ease; box-shadow: 0 4px 16px rgba(26,51,41,0.28);
}
.ns-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,51,41,0.36); }
.ns-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.ns-tag {
  display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px;
  border-radius: 999px; font-size: 12px; font-weight: 600;
  font-family: 'DM Sans', sans-serif; transition: all 0.15s ease;
}
.ns-tag button { background: none; border: none; cursor: pointer; font-size: 15px; line-height: 1; padding: 0; }

.err-msg { font-size: 11.5px; color: #e53e3e; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
`;

const C = {
  text: "#1a3329", muted: "#5a7a6e",
  green: "#2d6b50", greenLt: "#e8f5e9",
  bg: "#f2f7f5", yellow: "#f5e642",
};

const Label = ({ children, required }) => (
  <label style={{ fontSize:11.5, fontWeight:700, color:"#4f9e7a", letterSpacing:0.4, textTransform:"uppercase", display:"block", marginBottom:6 }}>
    {children}{required && <span style={{ color:"#e53e3e", marginLeft:3 }}>*</span>}
  </label>
);

const ErrMsg = ({ msg }) => msg ? (
  <div className="err-msg">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    {msg}
  </div>
) : null;

function TagInput({ values, onAdd, onRemove, placeholder, accent="#1a6fa0", bg="#e3f2fd" }) {
  const [inp, setInp] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:28 }}>
        {values.map(v => (
          <span key={v} className="ns-tag" style={{ background:bg, color:accent, border:`1px solid ${accent}25` }}>
            {v}
            <button onClick={() => onRemove(v)} style={{ color:accent }}>×</button>
          </span>
        ))}
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <input className="ns-input" placeholder={placeholder} value={inp}
          onChange={e => setInp(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter" && inp.trim()) { onAdd(inp.trim()); setInp(""); } }}
          style={{ flex:1, fontSize:13, padding:"9px 12px" }}/>
        <button onClick={() => { if (inp.trim()) { onAdd(inp.trim()); setInp(""); } }}
          style={{ background:`linear-gradient(135deg,${accent},${accent}cc)`, color:"#fff", border:"none", borderRadius:10, padding:"9px 16px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", flexShrink:0 }}>
          Add
        </button>
      </div>
    </div>
  );
}

export default function NutritionistSetup() {
  const navigate = useNavigate();
  const location = useLocation();

  const { firstName="", lastName="", email="" } = location.state || {};

  const [form, setForm] = useState({
    bio: "", experienceYears: "",
    specializations: [], certifications: [],
  });

  // cert form
  const [cert,     setCert]     = useState({ name:"", issuer:"", year:"" });
  const [showCert, setShowCert] = useState(false);
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);

  const set = (f, v) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]:"" })); };
  const addSpec    = (v) => !form.specializations.includes(v) && setForm(p => ({ ...p, specializations: [...p.specializations, v] }));
  const removeSpec = (v) => setForm(p => ({ ...p, specializations: p.specializations.filter(x => x !== v) }));

  const addCert = () => {
    if (!cert.name.trim()) return;
    const label = `${cert.name}${cert.issuer ? ` · ${cert.issuer}` : ""}${cert.year ? ` (${cert.year})` : ""}`;
    setForm(p => ({ ...p, certifications: [...p.certifications, label] }));
    setCert({ name:"", issuer:"", year:"" });
    setShowCert(false);
  };
  const removeCert = (v) => setForm(p => ({ ...p, certifications: p.certifications.filter(x => x !== v) }));

  const validate = () => {
    const e = {};
    if (!form.bio.trim())         e.bio         = "Bio is required";
    if (!form.experienceYears)    e.experienceYears = "Years of experience is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      // 1 — Register
      const signupRes = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, role: "NUTRITIONIST" }),
      });
      const signupData = await signupRes.json();
      const token = signupData.token;
      if (token) localStorage.setItem("token", token);

      // 2 — Create resume
      await fetch("http://localhost:5000/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          bio:             form.bio,
          experienceYears: parseInt(form.experienceYears),
          specializations: form.specializations,
          certifications:  form.certifications,
        }),
      });

      navigate("/");
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
      <style>{CSS}</style>

      <div style={{ width:"100%", maxWidth:540 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:C.text }}>🌿 Chrisalis</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>Set up your professional profile</div>
        </div>

        <div className="ns-fade" style={{ background:"#fff", borderRadius:24, padding:"32px 28px", boxShadow:"0 8px 32px rgba(26,51,41,0.1)", border:"1px solid rgba(79,158,122,0.1)" }}>

          {/* User banner */}
          <div style={{ background:C.greenLt, borderRadius:14, padding:"14px 16px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1a3329,#2d6b50)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:800, color:"#f5e642" }}>Dr</span>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>Dr. {firstName} {lastName}</div>
              <div style={{ fontSize:12, color:C.muted }}>{email}</div>
            </div>
            <div style={{ marginLeft:"auto", background:"#e3f2fd", color:"#1a6fa0", borderRadius:999, padding:"3px 10px", fontSize:11.5, fontWeight:700 }}>Nutritionist</div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

            {/* Bio */}
            <div>
              <Label required>Professional Bio</Label>
              <textarea className={`ns-input${errors.bio?" err":""}`} rows={4}
                placeholder="Describe your expertise, approach, and what patients can expect from working with you…"
                value={form.bio} onChange={e => set("bio", e.target.value)}/>
              <ErrMsg msg={errors.bio}/>
            </div>

            {/* Experience */}
            <div>
              <Label required>Years of Experience</Label>
              <input className={`ns-input${errors.experienceYears?" err":""}`} type="number" min="0" max="50"
                placeholder="e.g. 8" value={form.experienceYears}
                onChange={e => set("experienceYears", e.target.value)}/>
              <ErrMsg msg={errors.experienceYears}/>
            </div>

            {/* Specializations */}
            <div>
              <Label>Specializations</Label>
              <TagInput values={form.specializations} onAdd={addSpec} onRemove={removeSpec}
                placeholder="e.g. Sports Nutrition · press Enter" accent="#2d7a4f" bg="#e8f5e9"/>
            </div>

            {/* Certifications */}
            <div>
              <Label>Certifications</Label>

              {/* existing certs */}
              {form.certifications.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:10 }}>
                  {form.certifications.map((c,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, background:"#f7faf8", borderRadius:12, padding:"11px 14px", border:"1px solid rgba(79,158,122,0.1)" }}>
                      <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#f3e8fd,#e8d5fc)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a3fa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                      </div>
                      <span style={{ flex:1, fontSize:13.5, color:C.text, fontWeight:500 }}>{c}</span>
                      <button onClick={() => removeCert(c)} style={{ background:"none", border:"none", cursor:"pointer", color:"#e53e3e", fontSize:18, lineHeight:1, padding:"2px 6px" }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add cert form */}
              {showCert ? (
                <div style={{ background:"#f7faf8", borderRadius:16, padding:"16px", border:"1px solid rgba(79,158,122,0.12)" }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:13.5, fontWeight:800, color:C.text, marginBottom:12 }}>Add Certification</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    <input className="ns-input" placeholder="Certification name *" value={cert.name} onChange={e => setCert(p => ({ ...p, name:e.target.value }))}/>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                      <input className="ns-input" placeholder="Issuing organisation" value={cert.issuer} onChange={e => setCert(p => ({ ...p, issuer:e.target.value }))}/>
                      <input className="ns-input" type="number" placeholder="Year (e.g. 2021)" value={cert.year} onChange={e => setCert(p => ({ ...p, year:e.target.value }))}/>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => { setShowCert(false); setCert({ name:"",issuer:"",year:"" }); }}
                        style={{ flex:1, padding:"10px", border:"1.5px solid rgba(79,158,122,0.2)", borderRadius:10, background:"transparent", fontSize:13.5, fontWeight:600, color:C.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        Cancel
                      </button>
                      <button onClick={addCert}
                        style={{ flex:2, padding:"10px", border:"none", borderRadius:10, background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", fontSize:13.5, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setShowCert(true)}
                  style={{ width:"100%", background:"transparent", border:"1.5px dashed rgba(79,158,122,0.3)", borderRadius:12, padding:"10px", fontSize:13, fontWeight:600, color:"#4f9e7a", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all 0.2s" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add Certification
                </button>
              )}
            </div>

            {/* Error */}
            {errors.submit && (
              <div style={{ background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#e53e3e" }}>
                {errors.submit}
              </div>
            )}

            {/* Save */}
            <button className="ns-btn" onClick={handleSave} disabled={loading}>
              {loading
                ? <><span style={{ width:16, height:16, border:"2px solid rgba(245,230,66,0.3)", borderTopColor:"#f5e642", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> Saving…</>
                : <>Complete Setup ✓</>
              }
            </button>
          </div>
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:C.muted, marginTop:16 }}>
          You can update this information anytime from your profile.
        </p>
      </div>
    </div>
  );
}