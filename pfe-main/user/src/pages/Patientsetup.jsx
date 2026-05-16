import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── Colors matching site theme ────────────────────────────────────────────────
const C = {
  green:   "#2d6b50",
  greenDk: "#1a3329",
  greenLt: "#e8f5e9",
  yellow:  "#f5e642",
  text:    "#1a3329",
  muted:   "#5a7a6e",
  border:  "rgba(79,158,122,0.2)",
  bg:      "#f2f7f5",
  inputBg: "#f7faf8",
};

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes spin   { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes pop    { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }

.ps-fade { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both }

.ps-input {
  width: 100%;
  border: 1.5px solid rgba(79,158,122,0.2);
  border-radius: 12px;
  padding: 12px 14px;
  font-size: 14px;
  font-family: 'DM Sans', sans-serif;
  color: #1a3329;
  background: #f7faf8;
  outline: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}
.ps-input:focus {
  border-color: #4f9e7a;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(79,158,122,0.1);
}
.ps-input.err { border-color: #e53e3e !important; background: #fff5f5; }

.ps-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 13px;
  background: linear-gradient(135deg, #1a3329, #2d6b50);
  color: #f5e642;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.22s ease;
  box-shadow: 0 4px 16px rgba(26,51,41,0.28);
}
.ps-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(26,51,41,0.36); }
.ps-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.ps-tag {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 11px; border-radius: 999px; font-size: 12px;
  font-weight: 600; font-family: 'DM Sans', sans-serif;
  transition: all 0.15s ease; cursor: pointer;
}

.ps-option-btn {
  flex: 1; padding: 10px 8px; border-radius: 10px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600;
  border: 1.5px solid rgba(79,158,122,0.2); background: #f7faf8;
  color: #5a7a6e; transition: all 0.2s ease; text-align: center;
}
.ps-option-btn:hover  { border-color: #4f9e7a; background: #e8f5e9; color: #2d6b50; }
.ps-option-btn.active { border-color: #1a3329; background: linear-gradient(135deg,#e8f5e9,#e3f2fd); color: #1a3329; font-weight: 700; }

.err-msg { font-size: 11.5px; color: #e53e3e; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
`;

const GOALS          = ["Weight Loss","Weight Gain","Muscle Gain","Maintain Weight","Improve Health","Manage Diabetes","Other"];
const ACTIVITY       = ["Sedentary","Light","Moderate","Active","Very Active"];
const GENDERS        = ["Female","Male"];
const CONDITIONS_SUG = ["Diabetes","Hypertension","Asthma","Heart Disease","Thyroid","PCOS","None"];
const ALLERGIES_SUG  = ["Lactose","Gluten","Nuts","Shellfish","Eggs","Soy","None"];

const Label = ({ children }) => (
  <label style={{ fontSize:11.5, fontWeight:700, color:"#4f9e7a", letterSpacing:0.4, textTransform:"uppercase", display:"block", marginBottom:6 }}>
    {children}
  </label>
);

const ErrMsg = ({ msg }) => msg ? (
  <div className="err-msg">
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    {msg}
  </div>
) : null;

function TagInput({ values, suggestions, onAdd, onRemove, placeholder, accent="#2d7a4f", bg="#e8f5e9" }) {
  const [inp, setInp] = useState("");
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      {/* existing tags */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6, minHeight:28 }}>
        {values.map(v => (
          <span key={v} className="ps-tag" style={{ background:bg, color:accent, border:`1px solid ${accent}25` }}>
            {v}
            <button onClick={() => onRemove(v)} style={{ background:"none", border:"none", cursor:"pointer", color:accent, fontSize:15, lineHeight:1, padding:0 }}>×</button>
          </span>
        ))}
      </div>
      {/* suggestions */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
        {suggestions.filter(s => !values.includes(s)).map(s => (
          <button key={s} onClick={() => onAdd(s)} className="ps-tag"
            style={{ background:"transparent", border:`1px dashed ${accent}50`, color:accent, cursor:"pointer" }}>
            + {s}
          </button>
        ))}
      </div>
      {/* custom input */}
      <input className="ps-input" placeholder={placeholder} value={inp}
        onChange={e => setInp(e.target.value)}
        onKeyDown={e => { if (e.key==="Enter" && inp.trim()) { onAdd(inp.trim()); setInp(""); } }}
        style={{ fontSize:13, padding:"9px 12px" }}/>
    </div>
  );
}

export default function PatientSetup() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // معلومات من SignUp
  const { firstName="", lastName="", email="" } = location.state || {};

  const [form, setForm] = useState({
    dateOfBirth: "", gender: "Female",
    weight: "", height: "",
    goal: "Weight Loss", activityLevel: "Moderate",
    medicalConditions: [], allergies: [],
  });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [step,    setStep]    = useState(1); // 1 or 2

  const set = (field, val) => {
    setForm(p => ({ ...p, [field]: val }));
    setErrors(p => ({ ...p, [field]: "" }));
  };
  const addTag    = (f, v) => !form[f].includes(v) && setForm(p => ({ ...p, [f]: [...p[f], v] }));
  const removeTag = (f, v) => setForm(p => ({ ...p, [f]: p[f].filter(x => x !== v) }));

  const validateStep1 = () => {
    const e = {};
    if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
    if (!form.weight)      e.weight      = "Weight is required";
    if (!form.height)      e.height      = "Height is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateStep1()) return;
    setLoading(true);
    try {
      // 1 — Register user
      const signupRes = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, role: "PATIENT" }),
      });
      const signupData = await signupRes.json();
      const token = signupData.token;
      if (token) localStorage.setItem("token", token);

      // 2 — Create profile
      await fetch("http://localhost:5000/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dateOfBirth:       form.dateOfBirth,
          gender:            form.gender,
          weight:            parseFloat(form.weight),
          height:            parseFloat(form.height),
          goal:              form.goal,
          activityLevel:     form.activityLevel,
          medicalConditions: form.medicalConditions,
          allergies:         form.allergies,
        }),
      });

      navigate("/"); // أو "/dashboard"
    } catch {
      setErrors({ submit: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const age = form.dateOfBirth
    ? Math.floor((new Date() - new Date(form.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const bmi = form.weight && form.height
    ? (parseFloat(form.weight) / Math.pow(parseFloat(form.height) / 100, 2)).toFixed(1)
    : null;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, fontFamily:"'DM Sans',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 16px" }}>
      <style>{CSS}</style>

      <div style={{ width:"100%", maxWidth:520 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:C.text }}>🌿 Chrisalis</div>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>Complete your health profile</div>
        </div>

        {/* Card */}
        <div className="ps-fade" style={{ background:"#fff", borderRadius:24, padding:"32px 28px", boxShadow:"0 8px 32px rgba(26,51,41,0.1)", border:"1px solid rgba(79,158,122,0.1)" }}>

          {/* User info banner — from SignUp */}
          <div style={{ background:C.greenLt, borderRadius:14, padding:"14px 16px", marginBottom:24, display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40, height:40, borderRadius:"50%", background:"linear-gradient(135deg,#1a3329,#2d6b50)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#f5e642" }}>{firstName?.[0] || "P"}</span>
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:700, color:C.text }}>{firstName} {lastName}</div>
              <div style={{ fontSize:12, color:C.muted }}>{email}</div>
            </div>
            <div style={{ marginLeft:"auto", background:"#e8f5e9", color:"#2d7a4f", borderRadius:999, padding:"3px 10px", fontSize:11.5, fontWeight:700 }}>Patient</div>
          </div>

          {/* Step indicator */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
            {[1,2].map((s,i) => (
              <>
                <div key={s} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:step>=s?"linear-gradient(135deg,#1a3329,#2d6b50)":"#e8f5e9", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.3s" }}>
                    {step>s
                      ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f5e642" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:800, color:step>=s?"#f5e642":"#9aac8a" }}>{s}</span>
                    }
                  </div>
                  <span style={{ fontSize:12, fontWeight:600, color:step>=s?C.text:C.muted }}>
                    {s===1 ? "Body Info" : "Health Goals"}
                  </span>
                </div>
                {i===0 && <div style={{ flex:1, height:2, borderRadius:999, background:step>1?"linear-gradient(90deg,#1a3329,#2d6b50)":"#e8f5e9", transition:"all 0.3s" }}/>}
              </>
            ))}
          </div>

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.35s ease" }}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div style={{ gridColumn:"1 / -1" }}>
                  <Label>Date of Birth *</Label>
                  <input className={`ps-input${errors.dateOfBirth?" err":""}`} type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)}/>
                  <ErrMsg msg={errors.dateOfBirth}/>
                  {age && <div style={{ fontSize:12,color:C.muted,marginTop:4 }}>Age: {age} years old</div>}
                </div>
                <div>
                  <Label>Gender</Label>
                  <div style={{ display:"flex", gap:6 }}>
                    {GENDERS.map(g => (
                      <button key={g} className={`ps-option-btn ${form.gender===g?"active":""}`} onClick={()=>set("gender",g)}>{g}</button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                <div>
                  <Label>Weight (kg) *</Label>
                  <input className={`ps-input${errors.weight?" err":""}`} type="number" placeholder="e.g. 65" value={form.weight} onChange={e=>set("weight",e.target.value)}/>
                  <ErrMsg msg={errors.weight}/>
                </div>
                <div>
                  <Label>Height (cm) *</Label>
                  <input className={`ps-input${errors.height?" err":""}`} type="number" placeholder="e.g. 170" value={form.height} onChange={e=>set("height",e.target.value)}/>
                  <ErrMsg msg={errors.height}/>
                </div>
              </div>

              {bmi && (
                <div style={{ background:"linear-gradient(135deg,#e8f5e9,#e3f2fd)", borderRadius:12, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:C.text }}>BMI {bmi}</div>
                  <div style={{ fontSize:12.5, color:C.muted }}>
                    {bmi<18.5?"Underweight":bmi<25?"Normal weight":bmi<30?"Overweight":"Obese"}
                  </div>
                </div>
              )}

              <button className="ps-btn" onClick={()=>{ if(validateStep1()) setStep(2); }}>
                Next: Health Goals
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div style={{ display:"flex", flexDirection:"column", gap:16, animation:"fadeUp 0.35s ease" }}>

              <div>
                <Label>Health Goal</Label>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {GOALS.map(g => (
                    <button key={g} className={`ps-option-btn ${form.goal===g?"active":""}`}
                      style={{ flex:"none", padding:"8px 14px" }} onClick={()=>set("goal",g)}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Activity Level</Label>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {ACTIVITY.map(a => (
                    <button key={a} className={`ps-option-btn ${form.activityLevel===a?"active":""}`}
                      style={{ flex:"none", padding:"8px 14px" }} onClick={()=>set("activityLevel",a)}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Medical Conditions</Label>
                <TagInput values={form.medicalConditions} suggestions={CONDITIONS_SUG}
                  onAdd={v=>addTag("medicalConditions",v)} onRemove={v=>removeTag("medicalConditions",v)}
                  placeholder="Type and press Enter…" accent="#1a6fa0" bg="#e3f2fd"/>
              </div>

              <div>
                <Label>Allergies</Label>
                <TagInput values={form.allergies} suggestions={ALLERGIES_SUG}
                  onAdd={v=>addTag("allergies",v)} onRemove={v=>removeTag("allergies",v)}
                  placeholder="Type and press Enter…" accent="#c0392b" bg="#fde8e8"/>
              </div>

              {errors.submit && (
                <div style={{ background:"#fff5f5", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#e53e3e", fontWeight:500 }}>
                  {errors.submit}
                </div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setStep(1)} style={{ flex:1, padding:"13px", border:"1.5px solid rgba(79,158,122,0.2)", borderRadius:13, background:"transparent", fontSize:14, fontWeight:600, color:C.muted, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
                  ← Back
                </button>
                <button className="ps-btn" style={{ flex:2 }} onClick={handleSave} disabled={loading}>
                  {loading
                    ? <><span style={{ width:16, height:16, border:"2px solid rgba(245,230,66,0.3)", borderTopColor:"#f5e642", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/> Saving…</>
                    : <>Complete Setup ✓</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        <p style={{ textAlign:"center", fontSize:12, color:C.muted, marginTop:16 }}>
          You can update this information anytime from your profile.
        </p>
      </div>
    </div>
  );
}