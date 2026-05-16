import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
@keyframes popIn   { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes spin    { to{transform:rotate(360deg)} }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }

/* ── Page ── */
.rp-page {
  min-height: 100vh;
  background: #f2f7f5;
  font-family: 'DM Sans', sans-serif;
  padding: 40px 20px 80px;
}

/* ── Header ── */
.rp-header { text-align: center; margin-bottom: 44px; }

.rp-badge {
  display: inline-flex; align-items: center; gap: 8px;
  background: #0b6630; color: #a8e02c;
  font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; padding: 6px 16px; border-radius: 999px;
  margin-bottom: 18px;
}
.rp-badge::before {
  content: ''; width: 6px; height: 6px;
  background: #a8e02c; border-radius: 50%;
  animation: pulse 2s infinite;
}

.rp-title {
  font-family: 'Syne', sans-serif;
  font-size: clamp(26px, 5vw, 40px);
  font-weight: 800; color: #1a3329;
  line-height: 1.1; margin-bottom: 12px;
  letter-spacing: -1px;
}

.rp-subtitle {
  font-size: 14.5px; color: #5a7a6e;
  max-width: 460px; margin: 0 auto; line-height: 1.6;
}

/* ── Progress steps ── */
.rp-progress-wrap { max-width: 640px; margin: 0 auto 36px; }
.rp-steps { display: flex; align-items: center; }

.rp-step {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 7px; position: relative;
}
.rp-step:not(:last-child)::after {
  content: ''; position: absolute; top: 16px; left: 50%;
  width: 100%; height: 2px;
  background: rgba(0,168,84,0.15); z-index: 0; transition: background 0.4s;
}
.rp-step.done:not(:last-child)::after { background: #0b6630; }

.rp-step-dot {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid rgba(0,168,84,0.2);
  background: rgba(255,255,255,0.3); backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 700; color: #5a7a6e;
  z-index: 1; transition: all 0.3s; font-family: 'DM Sans',sans-serif;
}
.rp-step.active .rp-step-dot {
  border-color: rgba(168,224,44,0.8); background: #0b6630;
  color: #a8e02c; box-shadow: 0 0 0 4px rgba(11,102,48,0.15);
}
.rp-step.done .rp-step-dot { border-color: #0b6630; background: #0b6630; color: #a8e02c; }

.rp-step-label { font-size: 11px; font-weight: 700; color: #9ab8ae; text-align: center; font-family: 'DM Sans',sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }
.rp-step.active .rp-step-label, .rp-step.done .rp-step-label { color: #0b6630; }

/* ── Glass card ── */
.rp-card {
  max-width: 640px; margin: 0 auto;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 24px; padding: 38px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.12), inset 0 0 12px rgba(255,255,255,0.55);
  animation: slideUp 0.4s cubic-bezier(0.22,1,0.36,1) both;
}

.rp-section-title {
  font-family: 'Syne', sans-serif;
  font-size: 20px; font-weight: 800; color: #1a3329; margin-bottom: 5px;
}
.rp-section-sub {
  font-size: 13px; color: #5a7a6e; margin-bottom: 26px; line-height: 1.6;
}

/* ── Fields ── */
.rp-field { margin-bottom: 18px; }
.rp-field label {
  display: block; font-size: 10.5px; font-weight: 700; color: #5a7a6e;
  letter-spacing: 1px; text-transform: uppercase; margin-bottom: 7px;
  font-family: 'DM Sans',sans-serif;
}

.rp-input, .rp-textarea, .rp-select {
  width: 100%; padding: 11px 14px;
  border: 1.5px solid rgba(0,168,84,0.22);
  border-radius: 12px;
  font-family: 'DM Sans', sans-serif; font-size: 13.5px; color: #1a3329;
  background: rgba(255,255,255,0.4); backdrop-filter: blur(8px);
  outline: none; transition: all 0.2s; appearance: none;
}
.rp-input::placeholder, .rp-textarea::placeholder { color: rgba(26,51,41,0.3); }
.rp-input:focus, .rp-textarea:focus, .rp-select:focus {
  border-color: rgba(168,224,44,0.7);
  background: rgba(255,255,255,0.65);
}
.rp-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }

.rp-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
@media (max-width: 540px) { .rp-row { grid-template-columns: 1fr; } }

/* ── Tag input ── */
.rp-tags-wrap {
  display: flex; flex-wrap: wrap; gap: 7px;
  padding: 9px 12px;
  border: 1.5px solid rgba(0,168,84,0.22);
  border-radius: 12px;
  background: rgba(255,255,255,0.4); backdrop-filter: blur(8px);
  min-height: 46px; cursor: text; transition: all 0.2s;
}
.rp-tags-wrap:focus-within {
  border-color: rgba(168,224,44,0.7);
  background: rgba(255,255,255,0.65);
}
.rp-tag {
  display: inline-flex; align-items: center; gap: 5px;
  background: rgba(11,102,48,0.1); color: #0b6630;
  border: 1px solid rgba(168,224,44,0.35);
  font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 999px;
}
.rp-tag button {
  background: none; border: none; cursor: pointer;
  color: #0b6630; font-size: 14px; line-height: 1; padding: 0;
  display: flex; align-items: center;
}
.rp-tag-input {
  border: none; outline: none; font-family: 'DM Sans',sans-serif;
  font-size: 13px; color: #1a3329; background: transparent;
  min-width: 130px; flex: 1;
}
.rp-tag-input::placeholder { color: rgba(26,51,41,0.3); }
.rp-tag-hint { font-size: 11px; color: #9ab8ae; margin-top: 5px; }

/* ── Offer cards ── */
.rp-offer-grid {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;
}
@media (max-width: 420px) { .rp-offer-grid { grid-template-columns: 1fr; } }

.rp-offer-card {
  border: 1.5px solid rgba(0,168,84,0.18);
  border-radius: 16px; padding: 20px 16px;
  cursor: pointer; transition: all 0.2s; text-align: center;
  background: rgba(255,255,255,0.25); backdrop-filter: blur(8px);
  font-family: 'DM Sans',sans-serif;
}
.rp-offer-card:hover {
  background: rgba(255,255,255,0.45);
  border-color: rgba(168,224,44,0.5);
  transform: translateY(-2px);
}
.rp-offer-card.selected {
  background: rgba(11,102,48,0.1);
  border-color: rgba(168,224,44,0.7);
  box-shadow: 0 4px 14px rgba(11,102,48,0.12);
}
.rp-offer-icon  { font-size: 28px; margin-bottom: 9px; }
.rp-offer-label { font-size: 13px; font-weight: 700; color: #1a3329; }
.rp-offer-desc  { font-size: 11.5px; color: #5a7a6e; margin-top: 4px; }

/* ── Nav buttons ── */
.rp-nav {
  display: flex; justify-content: space-between;
  align-items: center; margin-top: 28px; gap: 10px;
}

.rp-btn-back {
  padding: 11px 22px; border-radius: 20px;
  border: 1.5px solid rgba(168,224,44,0.4);
  background: rgba(255,255,255,0.3); backdrop-filter: blur(8px);
  color: #1a3329; font-family: 'DM Sans',sans-serif;
  font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.rp-btn-back:hover { background: rgba(255,255,255,0.55); border-color: rgba(168,224,44,0.6); }

.rp-btn-next {
  flex: 1; padding: 13px 24px; border-radius: 20px; border: none;
  background: #0b6630; color: #a8e02c;
  font-family: 'DM Sans',sans-serif; font-size: 14px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.rp-btn-next:hover:not(:disabled) { background: #0d7a38; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(11,102,48,0.35); }
.rp-btn-next:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* ── Error ── */
.err-box {
  background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.2);
  border-radius: 11px; padding: 10px 14px;
  font-size: 13px; color: #c0392b; margin-bottom: 16px;
  font-family: 'DM Sans',sans-serif;
}

/* ── Success ── */
.rp-success { text-align: center; padding: 16px 0; }
.rp-success-icon {
  width: 80px; height: 80px;
  background: linear-gradient(135deg,#1a3329,#0b6630);
  border: 2px solid rgba(168,224,44,0.5);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 34px; margin: 0 auto 22px;
  animation: popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both;
  box-shadow: 0 8px 28px rgba(11,102,48,0.25);
}
.rp-success h2 {
  font-family: 'Syne',sans-serif; font-size: 26px; font-weight: 800;
  color: #1a3329; margin-bottom: 10px;
}
.rp-success p { font-size: 13.5px; color: #5a7a6e; line-height: 1.7; }
`;

const STEPS = ["Identity", "Experience", "Offers"];

const OFFER_OPTIONS = [
  { value:"PLAN",         icon:"📋", label:"Meal Plan",    desc:"Custom nutrition plans" },
  { value:"CONSULTATION", icon:"💬", label:"Consultation", desc:"1-on-1 sessions" },
];

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState("");

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setInput("");
  };

  const remove = (tag) => onChange(value.filter(t => t !== tag));

  return (
    <>
      <div className="rp-tags-wrap">
        {value.map(tag => (
          <span key={tag} className="rp-tag">
            {tag}
            <button type="button" onClick={() => remove(tag)}>×</button>
          </span>
        ))}
        <input
          className="rp-tag-input"
          value={input}
          placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0,-1));
          }}
          onBlur={add}
        />
      </div>
      <div className="rp-tag-hint">Press Enter or comma to add</div>
    </>
  );
}

export default function CreateResumePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const [form, setForm] = useState({
    bio:"", education:"", workplace:"", experienceYears:"",
    specializations:[], certifications:[], offersTypes:[],
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleOffer = (val) => {
    set("offersTypes",
      form.offersTypes.includes(val)
        ? form.offersTypes.filter(v => v !== val)
        : [...form.offersTypes, val]
    );
  };

  const stepValid = () => {
    if (step === 0) return form.bio.trim().length >= 20;
    if (step === 1) return form.experienceYears !== "" && form.specializations.length > 0;
    if (step === 2) return form.offersTypes.length > 0;
    return true;
  };

  const submit = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/resume`, {
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, experienceYears: parseInt(form.experienceYears, 10) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resume");
      setDone(true);
      setTimeout(() => navigate("/resume"), 2500);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const stepClass = (i) => i < step ? "rp-step done" : i === step ? "rp-step active" : "rp-step";

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-page">

        {/* Header */}
        <div className="rp-header anim-up">
          <div className="rp-badge">Profile Setup</div>
          <h1 className="rp-title">Build your professional resume</h1>
          <p className="rp-subtitle">This is what clients will see when browsing nutritionists. Make it count.</p>
        </div>

        {/* Progress */}
        {!done && (
          <div className="rp-progress-wrap anim-up-d1">
            <div className="rp-steps">
              {STEPS.map((label, i) => (
                <div key={label} className={stepClass(i)}>
                  <div className="rp-step-dot">{i < step ? "✓" : i + 1}</div>
                  <div className="rp-step-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Card */}
        <div className="rp-card" key={done ? "done" : step}>

          {/* ── Success ── */}
          {done ? (
            <div className="rp-success">
              <div className="rp-success-icon">✓</div>
              <h2>Resume created!</h2>
              <p>Your professional profile is live.<br />Redirecting you to your dashboard…</p>
            </div>

          /* ── Step 0: Identity ── */
          ) : step === 0 ? (
            <>
              <div className="rp-section-title">About you</div>
              <div className="rp-section-sub">Write a compelling bio and add your workplace details.</div>
              {error && <div className="err-box">⚠️ {error}</div>}

              <div className="rp-field">
                <label>Bio *</label>
                <textarea
                  className="rp-textarea"
                  placeholder="Describe your approach to nutrition, your philosophy, and what makes you unique as a practitioner…"
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                />
                <div className="rp-tag-hint">{form.bio.length} chars — minimum 20</div>
              </div>

              <div className="rp-row">
                <div className="rp-field">
                  <label>Education</label>
                  <input className="rp-input" placeholder="e.g. MSc Nutritional Science" value={form.education} onChange={e => set("education", e.target.value)} />
                </div>
                <div className="rp-field">
                  <label>Workplace</label>
                  <input className="rp-input" placeholder="e.g. Wellness Clinic" value={form.workplace} onChange={e => set("workplace", e.target.value)} />
                </div>
              </div>

              <div className="rp-nav">
                <button className="rp-btn-next" disabled={!stepValid()} onClick={() => setStep(1)}>
                  Continue →
                </button>
              </div>
            </>

          /* ── Step 1: Experience ── */
          ) : step === 1 ? (
            <>
              <div className="rp-section-title">Experience &amp; skills</div>
              <div className="rp-section-sub">Add your years of experience, specializations and certifications.</div>
              {error && <div className="err-box">⚠️ {error}</div>}

              <div className="rp-field">
                <label>Years of experience *</label>
                <input className="rp-input" type="number" min="0" max="50" placeholder="e.g. 5" value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)} />
              </div>

              <div className="rp-field">
                <label>Specializations *</label>
                <TagInput value={form.specializations} onChange={v => set("specializations", v)} placeholder="e.g. Weight Loss, Diabetes…" />
              </div>

              <div className="rp-field">
                <label>Certifications</label>
                <TagInput value={form.certifications} onChange={v => set("certifications", v)} placeholder="e.g. Registered Dietitian…" />
              </div>

              <div className="rp-nav">
                <button className="rp-btn-back" onClick={() => setStep(0)}>← Back</button>
                <button className="rp-btn-next" disabled={!stepValid()} onClick={() => setStep(2)}>Continue →</button>
              </div>
            </>

          /* ── Step 2: Offers ── */
          ) : (
            <>
              <div className="rp-section-title">What will you offer?</div>
              <div className="rp-section-sub">Select the services you want to provide to clients.</div>
              {error && <div className="err-box">⚠️ {error}</div>}

              <div className="rp-offer-grid">
                {OFFER_OPTIONS.map(o => (
                  <div
                    key={o.value}
                    className={`rp-offer-card ${form.offersTypes.includes(o.value) ? "selected" : ""}`}
                    onClick={() => toggleOffer(o.value)}
                  >
                    <div className="rp-offer-icon">{o.icon}</div>
                    <div className="rp-offer-label">{o.label}</div>
                    <div className="rp-offer-desc">{o.desc}</div>
                  </div>
                ))}
              </div>

              <div className="rp-nav">
                <button className="rp-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="rp-btn-next" disabled={!stepValid() || loading} onClick={submit}>
                  {loading
                    ? <><span style={{ width:13, height:13, border:"2px solid rgba(168,224,44,0.3)", borderTopColor:"#a8e02c", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} /> Saving…</>
                    : "Launch my profile ✦"
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}