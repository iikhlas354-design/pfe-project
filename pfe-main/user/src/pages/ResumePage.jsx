import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.rp-page { min-height:100vh; background:#f5f3ef; font-family:'DM Sans',sans-serif; padding:40px 20px 80px; }
.rp-header { text-align:center; margin-bottom:48px; }
.rp-badge { display:inline-flex; align-items:center; gap:8px; background:#1a3329; color:#c8e6c9; font-size:11px; font-weight:600; letter-spacing:0.12em; text-transform:uppercase; padding:6px 16px; border-radius:100px; margin-bottom:20px; }
.rp-badge::before { content:''; width:6px; height:6px; background:#69f0ae; border-radius:50%; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }
.rp-title { font-family:'Playfair Display',serif; font-size:clamp(28px,5vw,42px); font-weight:700; color:#1a3329; line-height:1.2; margin-bottom:12px; }
.rp-subtitle { font-size:15px; color:#6b8c7a; max-width:480px; margin:0 auto; line-height:1.6; }
.rp-progress-wrap { max-width:680px; margin:0 auto 40px; }
.rp-steps { display:flex; align-items:center; gap:0; margin-bottom:12px; }
.rp-step { flex:1; display:flex; flex-direction:column; align-items:center; gap:6px; position:relative; }
.rp-step:not(:last-child)::after { content:''; position:absolute; top:16px; left:50%; width:100%; height:2px; background:#ddd; z-index:0; transition:background 0.4s; }
.rp-step.done:not(:last-child)::after { background:#2d6b50; }
.rp-step-dot { width:32px; height:32px; border-radius:50%; border:2px solid #ddd; background:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#aaa; z-index:1; transition:all 0.3s; }
.rp-step.active .rp-step-dot { border-color:#2d6b50; background:#2d6b50; color:#fff; box-shadow:0 0 0 4px rgba(45,107,80,0.15); }
.rp-step.done  .rp-step-dot { border-color:#2d6b50; background:#2d6b50; color:#fff; }
.rp-step-label { font-size:11px; font-weight:500; color:#aaa; text-align:center; }
.rp-step.active .rp-step-label, .rp-step.done .rp-step-label { color:#2d6b50; }
.rp-card { max-width:680px; margin:0 auto; background:#fff; border-radius:24px; padding:40px; box-shadow:0 4px 40px rgba(0,0,0,0.07); border:1px solid rgba(0,0,0,0.05); animation:fadeUp 0.4s ease both; }
@keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
.rp-section-title { font-family:'Playfair Display',serif; font-size:20px; font-weight:600; color:#1a3329; margin-bottom:6px; }
.rp-section-sub { font-size:13px; color:#8aa39b; margin-bottom:28px; }
.rp-field { margin-bottom:20px; }
.rp-field label { display:block; font-size:12px; font-weight:600; color:#1a3329; letter-spacing:0.06em; text-transform:uppercase; margin-bottom:8px; }
.rp-input, .rp-textarea, .rp-select { width:100%; padding:12px 16px; border:1.5px solid #e0ebe5; border-radius:12px; font-family:'DM Sans',sans-serif; font-size:14px; color:#1a3329; background:#fafcfb; outline:none; transition:all 0.2s; }
.rp-input:focus, .rp-textarea:focus, .rp-select:focus { border-color:#2d6b50; background:#fff; box-shadow:0 0 0 3px rgba(45,107,80,0.1); }
.rp-textarea { resize:vertical; min-height:110px; line-height:1.6; }
.rp-row { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media (max-width:540px) { .rp-row { grid-template-columns:1fr; } }
.rp-tags-wrap { display:flex; flex-wrap:wrap; gap:8px; padding:10px 12px; border:1.5px solid #e0ebe5; border-radius:12px; background:#fafcfb; min-height:48px; cursor:text; transition:border-color 0.2s; }
.rp-tags-wrap:focus-within { border-color:#2d6b50; background:#fff; box-shadow:0 0 0 3px rgba(45,107,80,0.1); }
.rp-tag { display:inline-flex; align-items:center; gap:6px; background:#e8f5e9; color:#1a3329; font-size:12px; font-weight:500; padding:4px 10px; border-radius:100px; }
.rp-tag button { background:none; border:none; cursor:pointer; color:#2d6b50; font-size:14px; line-height:1; padding:0; display:flex; align-items:center; }
.rp-tag-input { border:none; outline:none; font-family:'DM Sans',sans-serif; font-size:13px; color:#1a3329; background:transparent; min-width:140px; flex:1; }
.rp-tag-hint { font-size:11px; color:#aaa; margin-top:5px; }
.rp-offer-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
@media (max-width:480px) { .rp-offer-grid { grid-template-columns:1fr; } }
.rp-offer-card { border:2px solid #e0ebe5; border-radius:14px; padding:16px; cursor:pointer; transition:all 0.2s; text-align:center; background:#fafcfb; }
.rp-offer-card:hover { border-color:#2d6b50; background:#f0f9f4; }
.rp-offer-card.selected { border-color:#2d6b50; background:#e8f5e9; }
.rp-offer-icon { font-size:26px; margin-bottom:8px; }
.rp-offer-label { font-size:12px; font-weight:600; color:#1a3329; }
.rp-offer-desc  { font-size:11px; color:#8aa39b; margin-top:3px; }
.rp-nav { display:flex; justify-content:space-between; align-items:center; margin-top:32px; gap:12px; }
.rp-btn-back { padding:11px 24px; border-radius:12px; border:1.5px solid #d0e4da; background:#fff; color:#2d6b50; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; }
.rp-btn-back:hover { background:#f0f9f4; }
.rp-btn-next { flex:1; padding:13px 24px; border-radius:12px; border:none; background:linear-gradient(135deg,#1a3329,#2d6b50); color:#f5e642; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:700; cursor:pointer; transition:all 0.2s; }
.rp-btn-next:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(45,107,80,0.3); }
.rp-btn-next:disabled { opacity:0.5; cursor:not-allowed; }
.rp-success { text-align:center; padding:20px 0; }
.rp-success-icon { width:80px; height:80px; background:linear-gradient(135deg,#1a3329,#2d6b50); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:36px; margin:0 auto 24px; animation:popIn 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both; }
@keyframes popIn { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }
.rp-success h2 { font-family:'Playfair Display',serif; font-size:26px; font-weight:700; color:#1a3329; margin-bottom:10px; }
.rp-success p { font-size:14px; color:#6b8c7a; line-height:1.6; }
.err-box { background:#fff5f5; border:1px solid rgba(229,62,62,0.25); border-radius:10px; padding:10px 13px; font-size:13px; color:#c53030; margin-bottom:16px; }
`;

const STEPS = ["Identity", "Experience", "Offers"];

const OFFER_OPTIONS = [
  { value: "PLAN",    icon: "📋", label: "Meal Plan", desc: "Custom PDF nutrition plans" },
  { value: "PACKAGE", icon: "📦", label: "Package",   desc: "Sessions + plan + chat" },
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
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
        />
      </div>
      <div className="rp-tag-hint">Press Enter or comma to add</div>
    </>
  );
}

export default function CreateResumePage() {
  const { fetchUser } = useAuth();
  const navigate = useNavigate();

  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [done,    setDone]    = useState(false);

  const [form, setForm] = useState({
    bio:             "",
    education:       "",
    workplace:       "",
    experienceYears: "",
    specializations: [],
    certifications:  [],
    offersTypes:     [],
  });

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const toggleOffer = (val) => {
    set(
      "offersTypes",
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
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/resume`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          experienceYears: parseInt(form.experienceYears, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save resume");
      await fetchUser(); // ← refresh user so hasResume becomes true
      setDone(true);
      setTimeout(() => navigate("/resume"), 2500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stepClass = (i) =>
    i < step ? "rp-step done" : i === step ? "rp-step active" : "rp-step";

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-page">
        <div className="rp-header">
          <div className="rp-badge">Profile Setup</div>
          <h1 className="rp-title">Build your professional resume</h1>
          <p className="rp-subtitle">This is what clients will see when browsing nutritionists.</p>
        </div>

        {!done && (
          <div className="rp-progress-wrap">
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

        <div className="rp-card" key={done ? "done" : step}>
          {done ? (
            <div className="rp-success">
              <div className="rp-success-icon">✓</div>
              <h2>Resume created!</h2>
              <p>Your professional profile is live.<br />Redirecting you to your dashboard…</p>
            </div>

          ) : step === 0 ? (
            <>
              <div className="rp-section-title">About you</div>
              <div className="rp-section-sub">Write a compelling bio and add your workplace details.</div>
              {error && <div className="err-box">{error}</div>}
              <div className="rp-field">
                <label>Bio *</label>
                <textarea className="rp-textarea"
                  placeholder="Describe your approach to nutrition, your philosophy…"
                  value={form.bio} onChange={e => set("bio", e.target.value)} />
                <div className="rp-tag-hint">{form.bio.length} chars — minimum 20</div>
              </div>
              <div className="rp-row">
                <div className="rp-field">
                  <label>Education</label>
                  <input className="rp-input" placeholder="e.g. MSc Nutritional Science"
                    value={form.education} onChange={e => set("education", e.target.value)} />
                </div>
                <div className="rp-field">
                  <label>Workplace</label>
                  <input className="rp-input" placeholder="e.g. Wellness Clinic"
                    value={form.workplace} onChange={e => set("workplace", e.target.value)} />
                </div>
              </div>
              <div className="rp-nav">
                <button className="rp-btn-next" disabled={!stepValid()} onClick={() => setStep(1)}>
                  Continue →
                </button>
              </div>
            </>

          ) : step === 1 ? (
            <>
              <div className="rp-section-title">Experience & skills</div>
              <div className="rp-section-sub">Add your years of experience, specializations and certifications.</div>
              {error && <div className="err-box">{error}</div>}
              <div className="rp-field">
                <label>Years of experience *</label>
                <input className="rp-input" type="number" min="0" max="50" placeholder="e.g. 5"
                  value={form.experienceYears} onChange={e => set("experienceYears", e.target.value)} />
              </div>
              <div className="rp-field">
                <label>Specializations *</label>
                <TagInput value={form.specializations} onChange={v => set("specializations", v)}
                  placeholder="e.g. Weight Loss, Diabetes…" />
              </div>
              <div className="rp-field">
                <label>Certifications</label>
                <TagInput value={form.certifications} onChange={v => set("certifications", v)}
                  placeholder="e.g. Registered Dietitian…" />
              </div>
              <div className="rp-nav">
                <button className="rp-btn-back" onClick={() => setStep(0)}>← Back</button>
                <button className="rp-btn-next" disabled={!stepValid()} onClick={() => setStep(2)}>
                  Continue →
                </button>
              </div>
            </>

          ) : (
            <>
              <div className="rp-section-title">What will you offer?</div>
              <div className="rp-section-sub">Select the services you want to provide to clients.</div>
              {error && <div className="err-box">{error}</div>}
              <div className="rp-offer-grid">
                {OFFER_OPTIONS.map(o => (
                  <div key={o.value}
                    className={`rp-offer-card ${form.offersTypes.includes(o.value) ? "selected" : ""}`}
                    onClick={() => toggleOffer(o.value)}>
                    <div className="rp-offer-icon">{o.icon}</div>
                    <div className="rp-offer-label">{o.label}</div>
                    <div className="rp-offer-desc">{o.desc}</div>
                  </div>
                ))}
              </div>
              <div className="rp-nav">
                <button className="rp-btn-back" onClick={() => setStep(1)}>← Back</button>
                <button className="rp-btn-next" disabled={!stepValid() || loading} onClick={submit}>
                  {loading ? "Saving…" : "Launch my profile ✦"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}