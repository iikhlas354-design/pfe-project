import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
@keyframes popIn     { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
@keyframes spin      { to{transform:rotate(360deg)} }
@keyframes slideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn    { from{opacity:0} to{opacity:1} }
@keyframes shake     { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }

.cp-fade { animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) both }
.cp-shake { animation: shake 0.5s ease }

.cp-input {
  width:100%; border:1.5px solid rgba(79,158,122,0.2); border-radius:12px;
  padding:12px 14px; font-size:14px; font-family:'DM Sans',sans-serif;
  color:#1a3329; background:#f7faf8; outline:none;
  transition:all 0.2s ease; box-sizing:border-box;
}
.cp-input:focus { border-color:#4f9e7a; background:#fff; box-shadow:0 0 0 3px rgba(79,158,122,0.1); }
.cp-input.err   { border-color:#e53e3e !important; background:#fff5f5; }

.cp-pay-btn {
  width:100%; padding:15px 0; border-radius:14px; font-size:15px;
  font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif;
  border:none; transition:all 0.25s ease;
  display:flex; align-items:center; justify-content:center; gap:8px;
}
.cp-pay-btn:hover:not(:disabled) { transform:translateY(-2px); filter:brightness(1.06); }
.cp-pay-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none !important; }

.cp-method-btn {
  flex:1; padding:14px 10px; border-radius:14px; cursor:pointer;
  font-family:'DM Sans',sans-serif; font-size:13px; font-weight:600;
  transition:all 0.22s ease; display:flex; flex-direction:column;
  align-items:center; gap:6px; border:2px solid rgba(79,158,122,0.15);
  background:#fff;
}
.cp-method-btn:hover { border-color:#4f9e7a; background:#f0f9f4; }
.cp-method-btn.active { border-color:#1a3329; background:#f0f9f4; box-shadow:0 4px 16px rgba(26,51,41,0.1); }

.cp-label { font-size:11.5px; font-weight:700; color:#4f9e7a; letter-spacing:0.4px; text-transform:uppercase; display:block; margin-bottom:6px; }

.cp-modal-overlay { position:fixed; inset:0; z-index:1000; background:rgba(10,26,20,0.7); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; padding:20px; }
.cp-modal { background:#fff; border-radius:28px; width:100%; max-width:420px; padding:40px 32px; text-align:center; box-shadow:0 40px 80px rgba(0,0,0,0.25); animation:popIn 0.4s cubic-bezier(0.34,1.4,0.64,1); }

.cp-toast { position:fixed; top:24px; left:50%; transform:translateX(-50%); z-index:999; border-radius:14px; padding:14px 24px; display:flex; align-items:center; gap:10px; box-shadow:0 8px 24px rgba(26,51,41,0.3); font-weight:600; font-size:14px; animation:slideDown 0.4s cubic-bezier(0.34,1.4,0.64,1); white-space:nowrap; font-family:'DM Sans',sans-serif; }
.cp-toast.success { background:linear-gradient(135deg,#1a3329,#2d6b50); color:#fff; }
.cp-toast.error { background:linear-gradient(135deg,#c53030,#e53e3e); color:#fff; }

.otp-box { width:48px; height:54px; text-align:center; font-size:20px; font-weight:800; font-family:'DM Sans',sans-serif; border:1.5px solid rgba(79,158,122,0.2); border-radius:12px; background:#f7faf8; color:#1a3329; outline:none; transition:all 0.2s; }
.otp-box:focus { border-color:#4f9e7a; background:#fff; box-shadow:0 0 0 3px rgba(79,158,122,0.1); }

@media(max-width:700px) {
  .cp-grid { grid-template-columns:1fr !important; }
  .cp-methods { grid-template-columns:repeat(2,1fr) !important; }
}
`;

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
}

const ErrMsg = ({ msg }) => msg ? (
  <div style={{ fontSize:12, color:"#e53e3e", marginTop:4, display:"flex", alignItems:"center", gap:4 }}>
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    {msg}
  </div>
) : null;

function SuccessModal({ summary, onClose }) {
  return (
    <div className="cp-modal-overlay" onClick={onClose}>
      <div className="cp-modal" onClick={e => e.stopPropagation()}>
        <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#e8f5e9,#c8edd0)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", boxShadow:"0 8px 24px rgba(45,122,79,0.2)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#1a3329", marginBottom:8 }}>Payment Confirmed!</div>
        <div style={{ fontSize:14, color:"#5a7a6e", lineHeight:1.75, marginBottom:20 }}>{summary.message}</div>
        <div style={{ background:"#f7faf8", borderRadius:14, padding:"14px 16px", marginBottom:20, textAlign:"left" }}>
          {summary.details.map(([icon, val]) => (
            <div key={icon+val} style={{ display:"flex", gap:10, fontSize:13, color:"#2a4a3e", marginBottom:6, fontWeight:500 }}>
              <span>{icon}</span><span>{val}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ width:"100%", background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", border:"none", borderRadius:14, padding:"14px 0", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
          {summary.btnLabel}
        </button>
      </div>
    </div>
  );
}

function ErrorModal({ message, onRetry, onBack }) {
  return (
    <div className="cp-modal-overlay">
      <div className="cp-modal cp-shake" style={{ borderTop: "4px solid #e53e3e" }}>
        <div style={{ width:76, height:76, borderRadius:"50%", background:"linear-gradient(135deg,#fff5f5,#fed7d7)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#e53e3e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        </div>
        <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#1a3329", marginBottom:8 }}>Payment Failed</div>
        <div style={{ fontSize:14, color:"#5a7a6e", lineHeight:1.75, marginBottom:24 }}>{message}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <button onClick={onRetry} style={{ width:"100%", background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", border:"none", borderRadius:14, padding:"14px 0", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Try Again</button>
          <button onClick={onBack} style={{ width:"100%", background:"transparent", color:"#5a7a6e", border:"1.5px solid rgba(79,158,122,0.3)", borderRadius:14, padding:"14px 0", fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>Back to Plans</button>
        </div>
      </div>
    </div>
  );
}

function CIBForm({ onPay, loading, amount }) {
  const [form, setForm] = useState({ number:"", expiry:"", cvv:"", name:"" });
  const [otp, setOtp] = useState(["","","","","",""]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const handle = (f) => (e) => {
    let v = e.target.value;
    if (f==="number") v = v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ").trim();
    if (f==="expiry") v = v.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2");
    if (f==="cvv") v = v.replace(/\D/g,"").slice(0,4);
    setForm(p=>({...p,[f]:v}));
    setErrors(p=>({...p,[f]:""}));
  };

  const validateCard = () => {
    const e={};
    if (!form.name.trim()) e.name = "Cardholder name required";
    if (form.number.replace(/\s/g,"").length < 16) e.number = "Enter a valid 16-digit card number";
    if (form.expiry.length < 5) e.expiry = "Enter expiry date (MM/YY)";
    if (form.cvv.length < 3) e.cvv = "Enter CVV (3-4 digits)";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleOtp = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next=[...otp]; next[i]=val; setOtp(next);
    if (val && i<5) document.getElementById(`otp-cib-${i+1}`)?.focus();
  };

  if (step===2) return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ background:"#e8f5e9", borderRadius:14, padding:"14px 16px", marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2d7a4f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.37 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.34 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <div style={{ fontSize:13, color:"#2d6b50", fontWeight:500 }}>OTP sent to your registered number ending in <strong>****67</strong></div>
      </div>
      <label className="cp-label">Enter OTP Code</label>
      <div style={{ display:"flex", gap:8, marginBottom:20, justifyContent:"center" }}>
        {otp.map((d,i)=>(
          <input key={i} id={`otp-cib-${i}`} className="otp-box" maxLength={1} value={d}
            onChange={e=>handleOtp(i,e.target.value)}
            onKeyDown={e=>{ if(e.key==="Backspace"&&!d&&i>0) document.getElementById(`otp-cib-${i-1}`)?.focus(); }}/>
        ))}
      </div>
      <div style={{ fontSize:12.5, color:"#5a7a6e", textAlign:"center", marginBottom:20 }}>
        Didn't receive it? <button type="button" style={{ background:"none", border:"none", color:"#2d7a4f", fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontSize:12.5 }}>Resend OTP</button>
      </div>
      <button className="cp-pay-btn" onClick={onPay} disabled={otp.join("").length<6||loading}
        style={{ background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", boxShadow:"0 6px 20px rgba(26,51,41,0.28)" }}>
        {loading ? <><span style={{ width:18,height:18,border:"2.5px solid rgba(245,230,66,0.3)",borderTopColor:"#f5e642",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/>Processing…</> : `Confirm Payment — ${amount}`}
      </button>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <label className="cp-label">Cardholder Name</label>
        <input className={`cp-input${errors.name?" err":""}`} placeholder="As shown on card" value={form.name} onChange={handle("name")}/>
        <ErrMsg msg={errors.name}/>
      </div>
      <div>
        <label className="cp-label">CIB Card Number</label>
        <div style={{ position:"relative" }}>
          <input className={`cp-input${errors.number?" err":""}`} placeholder="0000 0000 0000 0000" value={form.number} onChange={handle("number")} style={{ paddingRight:46 }}/>
          <span style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:20 }}>🏦</span>
        </div>
        <ErrMsg msg={errors.number}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <label className="cp-label">Expiry Date</label>
          <input className={`cp-input${errors.expiry?" err":""}`} placeholder="MM/YY" value={form.expiry} onChange={handle("expiry")}/>
          <ErrMsg msg={errors.expiry}/>
        </div>
        <div>
          <label className="cp-label">CVV / CVC</label>
          <input className={`cp-input${errors.cvv?" err":""}`} placeholder="000" value={form.cvv} onChange={handle("cvv")} type="password"/>
          <ErrMsg msg={errors.cvv}/>
        </div>
      </div>
      <div style={{ background:"#f0f9f4", borderRadius:12, padding:"10px 13px", fontSize:12.5, color:"#2d6b50", display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(45,122,79,0.15)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        An OTP will be sent to confirm your payment.
      </div>
      <button className="cp-pay-btn" onClick={()=>{ if(validateCard()) setStep(2); }}
        style={{ background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", boxShadow:"0 6px 20px rgba(26,51,41,0.28)" }}>
        Continue to OTP Verification →
      </button>
    </div>
  );
}

function BaridiMobForm({ onPay, loading, amount }) {
  const [rip, setRip] = useState("");
  const [pin, setPin] = useState(["","","","",""]);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  const handlePin = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next=[...pin]; next[i]=val; setPin(next);
    if (val&&i<4) document.getElementById(`pin-${i+1}`)?.focus();
  };

  const validateRip = () => {
    const e={};
    const clean = rip.replace(/\s/g,"");
    if (clean.length!==20||!/^\d+$/.test(clean)) e.rip="Enter a valid RIP (20 digits)";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const handleRipChange = (e) => {
    let v = e.target.value.replace(/\D/g,"").slice(0,20);
    v = v.replace(/(.{5})/g,"$1 ").trim();
    setRip(v); setErrors({});
  };

  if (step===2) return (
    <div style={{ animation:"fadeIn 0.3s ease" }}>
      <div style={{ background:"#fff8e1", borderRadius:14, padding:"14px 16px", marginBottom:20, border:"1px solid rgba(245,166,35,0.3)" }}>
        <div style={{ fontSize:13.5, fontWeight:700, color:"#1a3329", marginBottom:4 }}>Payment Request Sent</div>
        <div style={{ fontSize:13, color:"#5a7a6e", lineHeight:1.6 }}>Open your <strong>BaridiMob app</strong> and enter your <strong>5-digit PIN</strong> to confirm the payment of <strong>{amount}</strong>.</div>
      </div>
      <label className="cp-label">Enter your BaridiMob PIN</label>
      <div style={{ display:"flex", gap:8, marginBottom:20, justifyContent:"center" }}>
        {pin.map((d,i)=>(
          <input key={i} id={`pin-${i}`} className="otp-box" maxLength={1} value={d} type="password"
            onChange={e=>handlePin(i,e.target.value)}
            onKeyDown={e=>{ if(e.key==="Backspace"&&!d&&i>0) document.getElementById(`pin-${i-1}`)?.focus(); }}/>
        ))}
      </div>
      <button className="cp-pay-btn" onClick={onPay} disabled={pin.join("").length<5||loading}
        style={{ background:"linear-gradient(135deg,#f5a623,#e08a00)", color:"#fff", boxShadow:"0 6px 20px rgba(245,166,35,0.35)" }}>
        {loading ? <><span style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/>Processing…</> : `Confirm with PIN — ${amount}`}
      </button>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"#fff8e1", borderRadius:14, padding:"14px 16px", border:"1px solid rgba(245,166,35,0.3)", display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ fontSize:24, flexShrink:0 }}>📱</span>
        <div style={{ fontSize:13, color:"#5a7a6e", lineHeight:1.65 }}>Enter your <strong style={{ color:"#1a3329" }}>RIP</strong> — the 20-digit account number found in your BaridiMob app.</div>
      </div>
      <div>
        <label className="cp-label">RIP — Compte CCP (20 chiffres)</label>
        <input className={`cp-input${errors.rip?" err":""}`} placeholder="00000 00000 00000 00000" value={rip} onChange={handleRipChange} style={{ letterSpacing:"1px", fontWeight:600 }}/>
        <ErrMsg msg={errors.rip}/>
        <div style={{ fontSize:11.5, color:"#5a7a6e", marginTop:5 }}>Ex: 00799 12345 67890 00015</div>
      </div>
      <button className="cp-pay-btn" onClick={()=>{ if(validateRip()) setStep(2); }}
        style={{ background:"linear-gradient(135deg,#f5a623,#e08a00)", color:"#fff", boxShadow:"0 6px 20px rgba(245,166,35,0.35)" }}>
        Send Payment Request →
      </button>
    </div>
  );
}

function IntlCardForm({ onPay, loading, amount }) {
  const [form, setForm] = useState({ name:"", number:"", expiry:"", cvv:"", billing:"" });
  const [errors, setErrors] = useState({});

  const handle = (f) => (e) => {
    let v = e.target.value;
    if (f==="number") v = v.replace(/\D/g,"").slice(0,16).replace(/(\d{4})(?=\d)/g,"$1 ").trim();
    if (f==="expiry") v = v.replace(/\D/g,"").slice(0,4).replace(/(\d{2})(\d)/,"$1/$2");
    if (f==="cvv") v = v.replace(/\D/g,"").slice(0,4);
    setForm(p=>({...p,[f]:v})); setErrors(p=>({...p,[f]:""}));
  };

  const validate = () => {
    const e={};
    if (!form.name.trim()) e.name = "Cardholder name required";
    if (form.number.replace(/\s/g,"").length < 16) e.number = "Enter a valid 16-digit card number";
    if (form.expiry.length < 5) e.expiry = "Enter expiry date (MM/YY)";
    if (form.cvv.length < 3) e.cvv = "Enter CVV";
    if (!form.billing.trim()) e.billing = "Billing address required";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const cardType = () => {
    const n = form.number.replace(/\s/g,"");
    if (/^4/.test(n)) return { label:"Visa", color:"#1a1f71" };
    if (/^5[1-5]/.test(n)) return { label:"Mastercard", color:"#eb001b" };
    if (/^3[47]/.test(n)) return { label:"Amex", color:"#007bc1" };
    return null;
  };
  const ct = cardType();

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <label className="cp-label">Cardholder Name</label>
        <input className={`cp-input${errors.name?" err":""}`} placeholder="As shown on card" value={form.name} onChange={handle("name")}/>
        <ErrMsg msg={errors.name}/>
      </div>
      <div>
        <label className="cp-label">Card Number</label>
        <div style={{ position:"relative" }}>
          <input className={`cp-input${errors.number?" err":""}`} placeholder="0000 0000 0000 0000" value={form.number} onChange={handle("number")} style={{ paddingRight:ct?100:46 }}/>
          <div style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", display:"flex", alignItems:"center", gap:6 }}>
            {ct && <span style={{ fontSize:11, fontWeight:800, color:ct.color, background:`${ct.color}15`, borderRadius:6, padding:"2px 8px", border:`1px solid ${ct.color}30` }}>{ct.label}</span>}
            <span style={{ fontSize:18 }}>💳</span>
          </div>
        </div>
        <ErrMsg msg={errors.number}/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <label className="cp-label">Expiry Date</label>
          <input className={`cp-input${errors.expiry?" err":""}`} placeholder="MM/YY" value={form.expiry} onChange={handle("expiry")}/>
          <ErrMsg msg={errors.expiry}/>
        </div>
        <div>
          <label className="cp-label">CVV / CVC</label>
          <input className={`cp-input${errors.cvv?" err":""}`} placeholder="000" value={form.cvv} onChange={handle("cvv")} type="password"/>
          <ErrMsg msg={errors.cvv}/>
        </div>
      </div>
      <div>
        <label className="cp-label">Billing Address</label>
        <input className={`cp-input${errors.billing?" err":""}`} placeholder="Street, City, Country" value={form.billing} onChange={handle("billing")}/>
        <ErrMsg msg={errors.billing}/>
      </div>
      <div style={{ background:"#f0f7ff", borderRadius:12, padding:"10px 13px", fontSize:12.5, color:"#1a6fa0", display:"flex", alignItems:"center", gap:8, border:"1px solid rgba(26,111,160,0.15)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Secured by 3D Secure · Equivalent: <strong style={{ marginLeft:4 }}>{amount}</strong>
      </div>
      <button className="cp-pay-btn" onClick={()=>{ if(validate()) onPay(); }} disabled={loading}
        style={{ background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", boxShadow:"0 6px 20px rgba(26,51,41,0.28)" }}>
        {loading ? <><span style={{ width:18,height:18,border:"2.5px solid rgba(245,230,66,0.3)",borderTopColor:"#f5e642",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/>Processing…</> : `Pay — ${amount}`}
      </button>
    </div>
  );
}

function PayPalForm({ onPay, loading, amount }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e={};
    if (!email.trim()||!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid PayPal email";
    if (!password||password.length<6) e.password = "Enter your PayPal password";
    setErrors(e);
    return Object.keys(e).length===0;
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ background:"#003087", borderRadius:14, padding:"16px 18px", display:"flex", alignItems:"center", gap:12 }}>
        <span style={{ fontSize:28 }}>🅿</span>
        <div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:"#fff" }}>PayPal Checkout</div>
          <div style={{ fontSize:12, color:"rgba(255,255,255,0.7)" }}>Log in to your PayPal account</div>
        </div>
      </div>
      <div>
        <label className="cp-label">PayPal Email</label>
        <input className={`cp-input${errors.email?" err":""}`} type="email" placeholder="you@example.com" value={email} onChange={e=>{ setEmail(e.target.value); setErrors(p=>({...p,email:""})); }}/>
        <ErrMsg msg={errors.email}/>
      </div>
      <div>
        <label className="cp-label">PayPal Password</label>
        <div style={{ position:"relative" }}>
          <input className={`cp-input${errors.password?" err":""}`} type={showPw?"text":"password"} placeholder="Your PayPal password" value={password} onChange={e=>{ setPassword(e.target.value); setErrors(p=>({...p,password:""})); }} style={{ paddingRight:46 }}/>
          <button type="button" onClick={()=>setShowPw(!showPw)} style={{ position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#9aac8a", lineHeight:0, padding:4 }}>
            {showPw
              ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
          </button>
        </div>
        <ErrMsg msg={errors.password}/>
      </div>
      <button className="cp-pay-btn" onClick={()=>{ if(validate()) onPay(); }} disabled={loading}
        style={{ background:"#003087", color:"#fff", boxShadow:"0 6px 20px rgba(0,48,135,0.35)" }}>
        {loading ? <><span style={{ width:18,height:18,border:"2.5px solid rgba(255,255,255,0.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .7s linear infinite",display:"inline-block" }}/>Processing…</> : `Pay with PayPal — ${amount}`}
      </button>
    </div>
  );
}

export default function Payment() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { isLoggedIn } = useAuth();

  const state = location.state || {};

  const isPackage = !!state.offerId && !!state.nutritionId && !!state.sessionDate;
  const isAI      = !!state.offerId && !state.planId && !state.nutritionId;
  const isPlan    = !!state.planId;

  const [planData,     setPlanData]     = useState(null);
  const [loadingPlan,  setLoadingPlan]  = useState(isPlan);
  const [method,       setMethod]       = useState("cib");
  const [paying,       setPaying]       = useState(false);
  const [success,      setSuccess]      = useState(false);
  const [error,        setError]        = useState(null);
  const [toast,        setToast]        = useState(null);

  useEffect(() => {
    if (!isPlan) return;
    (async () => {
      try {
        const res  = await fetch(`${API_URL}/plans/${state.planId}`, { credentials: "include" });
        const data = await res.json();
        setPlanData(data.plan);
      } catch {
        setError("Failed to load plan details.");
      } finally {
        setLoadingPlan(false);
      }
    })();
  }, [isPlan, state.planId]);

  useEffect(() => {
    if (!isLoggedIn) navigate("/login", { state: { redirect: "/payment" } });
  }, [isLoggedIn]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getSummary = () => {
    if (isPackage) {
      return {
        title:    "Package Offer",
        subtitle: state.offerName ?? "Bundle",
        avatar:   state.nutritionImage ?? null,
        name:     state.nutritionName  ?? "Your Nutritionist",
        amount:   state.price          ?? "—",
        details: [
          ["📦", state.offerName ?? "Bundle"],
          ["👤", state.nutritionName ?? "Nutritionist"],
          ["📅", `First session: ${formatDate(state.sessionDate)}`],
          ["💬", state.chatDays ? `${state.chatDays} days chat access` : "Chat included"],
          ["🌿", "Personalized plan included"],
        ],
        successMsg:     `Your package "${state.offerName}" has been activated. Session 1 is scheduled!`,
        successDetails: [
          ["📦", state.offerName ?? "Package"],
          ["📅", `Session 1: ${formatDate(state.sessionDate)}`],
          ["💰", state.price ?? "—"],
        ],
        successBtn: "Go to My Profile →",
        backTo:     "/specialist-plans",
        backLabel:  "Back to Packages",
      };
    }

    if (isAI) {
      return {
        title:    "AI Premium Plan",
        subtitle: state.offerLabel ?? "Pro",
        avatar:   null,
        name:     `Chrysalis AI · ${state.offerLabel ?? "Pro"}`,
        amount:   state.price ?? "$9.99",
        details: [
          ["🤖", "AI Calorie Tracker"],
          ["📱", "QR Code Meal Sharing"],
          ["📅", "Starts immediately"],
          ["🔄", "Cancel anytime"],
        ],
        successMsg:     "Your AI subscription has been activated.",
        successDetails: [
          ["📦", `Plan: ${state.offerLabel ?? "Pro"}`],
          ["💰", state.price ?? "$9.99"],
          ["📅", "Access starts now"],
        ],
        successBtn: "Start Using AI →",
        backTo:     "/ai-premium",
        backLabel:  "Back to Plans",
      };
    }

    const plan = planData;
    return {
      title:    "Nutrition Plan",
      subtitle: plan?.title ?? "Loading…",
      avatar:   null,
      name:     plan?.title ?? "",
      amount:   plan?.offer ? `$${Number(plan.offer.price).toFixed(2)}` : "—",
      details: [
        ["🌿", plan?.title ?? ""],
        ["📅", plan?.offer ? `${plan.offer.durationDays} days access` : ""],
        ["👨‍⚕️", plan?.nutrition ? `${plan.nutrition.firstName} ${plan.nutrition.lastName}` : "Specialist"],
        ["🔄", "Cancel anytime"],
      ],
      successMsg:     `Your plan "${plan?.title}" has been activated.`,
      successDetails: [
        ["📦", plan?.title ?? ""],
        ["💰", plan?.offer ? `$${Number(plan.offer.price).toFixed(2)}` : "—"],
        ["📅", "Access starts now"],
      ],
      successBtn: "Go to My Profile →",
      backTo:     "/plans",
      backLabel:  "Back to Plans",
    };
  };

  // ── Safe fetch helper ──────────────────────────────────────────
  const apiFetch = async (path, options) => {
    const res  = await fetch(`${API_URL}${path}`, {
      credentials: "include",
      headers:     { "Content-Type": "application/json" },
      ...options,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
    return data;
  };

  const handlePay = async () => {
    setPaying(true);
    setError(null);

    try {
      // ── PACKAGE ──
      if (isPackage) {
        const subData = await apiFetch("/subscriptions", {
          method: "POST",
          body: JSON.stringify({ offerId: state.offerId, nutritionId: state.nutritionId }),
        });

        await apiFetch("/payments", {
          method: "POST",
          body: JSON.stringify({
            subscriptionId:  subData.subscription.id,
            paymentMethodId: "pm_card_visa",
            sessionDate:     state.sessionDate,
          }),
        });

      // ── AI_CALORIES ──
      } else if (isAI) {
        if (!state.offerId) throw new Error("No offer found. Please go back and select a plan.");

        const subData = await apiFetch("/subscriptions", {
          method: "POST",
          body: JSON.stringify({ offerId: state.offerId }),
        });

        await apiFetch("/payments", {
          method: "POST",
          body: JSON.stringify({
            subscriptionId:  subData.subscription.id,
            paymentMethodId: "pm_card_visa",
          }),
        });

      // ── PLAN ──
      } else if (isPlan && planData) {
        const subData = await apiFetch("/subscriptions", {
          method: "POST",
          body: JSON.stringify({ offerId: planData.offerId }),
        });

        await apiFetch("/payments", {
          method: "POST",
          body: JSON.stringify({
            subscriptionId:  subData.subscription.id,
            paymentMethodId: "pm_card_visa",
          }),
        });

      } else {
        throw new Error("Invalid payment type");
      }

      showToast("Payment successful! 🎉", "success");
      setSuccess(true);

    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setPaying(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccess(false);
    if (isPackage) navigate("/profile");
    else if (isAI) navigate("/calories-ai");
    else           navigate("/profile");
  };

  const handleRetry       = () => setError(null);
  const handleBackToPlans = () => navigate(getSummary().backTo);

  if (!isPackage && !isAI && !isPlan) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
          <div style={{ fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"#1a3329", marginBottom:12 }}>No payment info found</div>
          <button onClick={()=>navigate("/")} style={{ background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", border:"none", borderRadius:12, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>← Go Home</button>
        </div>
      </div>
    );
  }

  if (loadingPlan) {
    return (
      <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#e8f5ee 0%,#eafaf0 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width:40, height:40, border:"3px solid rgba(45,122,79,0.2)", borderTop:"3px solid #2d7a4f", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      </div>
    );
  }

  const summary = getSummary();

  const METHODS = [
    { key:"cib",       label:"CIB",      sub:"Algeria",       emoji:"🏦", color:"#2d7a4f" },
    { key:"baridimob", label:"BaridiMob", sub:"Poste DZ",      emoji:"📱", color:"#f5a623" },
    { key:"card",      label:"Visa / MC", sub:"International", emoji:"💳", color:"#1a3329" },
    { key:"paypal",    label:"PayPal",    sub:"International", emoji:"🅿", color:"#003087" },
  ];

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#e8f5ee 0%,#eafaf0 100%)", fontFamily:"'DM Sans',sans-serif" }}>
      <style>{CSS}</style>
      <Header/>

      {toast && (
        <div className={`cp-toast ${toast.type}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {toast.type === "success"
              ? <polyline points="20 6 9 17 4 12"/>
              : <><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></>}
          </svg>
          {toast.message}
        </div>
      )}

      <div style={{ maxWidth:960, margin:"0 auto", padding:"44px 24px 80px" }}>

        <button onClick={handleBackToPlans} style={{ display:"inline-flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontSize:13.5, fontWeight:600, color:"#5a7a6e", fontFamily:"'DM Sans',sans-serif", marginBottom:28, padding:0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          {summary.backLabel}
        </button>

        <div className="cp-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:26 }}>

          {/* LEFT — Order Summary */}
          <div className="cp-fade" style={{ display:"flex", flexDirection:"column", gap:18 }}>
            <div style={{ background:"linear-gradient(135deg,#1a3329,#2d6b50)", borderRadius:22, padding:24, border:"1px solid rgba(245,230,66,0.12)" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>{summary.title}</div>

              {summary.avatar ? (
                <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:18 }}>
                  <img src={summary.avatar} alt={summary.name} style={{ width:54, height:54, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(255,255,255,0.25)", flexShrink:0 }}/>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#fff" }}>{summary.name}</div>
                    <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{summary.subtitle}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:18 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:"rgba(245,230,66,0.15)", border:"1px solid rgba(245,230,66,0.25)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                    {isPackage ? "📦" : isAI ? "🤖" : "🌿"}
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Syne',sans-serif", fontSize:17, fontWeight:800, color:"#fff" }}>{summary.name}</div>
                    <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.65)", marginTop:2 }}>{summary.subtitle}</div>
                  </div>
                </div>
              )}

              <div style={{ height:1, background:"rgba(255,255,255,0.1)", marginBottom:16 }}/>

              {summary.details.filter(([,v])=>v).map(([k,v]) => (
                <div key={k+v} style={{ display:"flex", justifyContent:"space-between", fontSize:13.5, marginBottom:10, gap:12 }}>
                  <span style={{ color:"rgba(255,255,255,0.55)", flexShrink:0 }}>{k}</span>
                  <span style={{ color:"#fff", fontWeight:600, textAlign:"right" }}>{v}</span>
                </div>
              ))}
            </div>

            <div style={{ background:"linear-gradient(135deg,#fefde8,#fdf6c0)", borderRadius:18, padding:"18px 20px", border:"1.5px solid rgba(245,230,66,0.4)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:"#1a3329" }}>Total Amount</div>
                <div style={{ fontSize:12.5, color:"#5a7a6e", marginTop:2 }}>One-time payment</div>
              </div>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#b8a200" }}>{summary.amount}</div>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[["🔒","256-bit SSL encrypted"],["📋","Instant confirmation"],["🔄","Cancel anytime"],["📞","Support 24/7"]].map(([icon,text])=>(
                <div key={text} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"#5a7a6e", fontWeight:500 }}>
                  <span style={{ fontSize:15, flexShrink:0 }}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Payment Form */}
          <div className="cp-fade" style={{ animationDelay:"0.12s" }}>
            <div style={{ background:"#fff", borderRadius:22, padding:"26px 24px", boxShadow:"0 4px 24px rgba(26,51,41,0.08)", border:"1px solid rgba(79,158,122,0.1)" }}>
              <div style={{ fontFamily:"'Syne',sans-serif", fontSize:18, fontWeight:800, color:"#1a3329", marginBottom:4 }}>Payment Method</div>
              <div style={{ fontSize:13, color:"#5a7a6e", marginBottom:20 }}>Choose how you'd like to pay.</div>

              <div className="cp-methods" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:24 }}>
                {METHODS.map(m => (
                  <button key={m.key} className={`cp-method-btn ${method===m.key?"active":""}`} onClick={()=>setMethod(m.key)}>
                    <span style={{ fontSize:22 }}>{m.emoji}</span>
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:12, fontWeight:800, color:method===m.key?m.color:"#1a3329" }}>{m.label}</span>
                    <span style={{ fontSize:10, color:"#5a7a6e" }}>{m.sub}</span>
                  </button>
                ))}
              </div>

              {method==="cib"       && <CIBForm      onPay={handlePay} loading={paying} amount={summary.amount}/>}
              {method==="baridimob" && <BaridiMobForm onPay={handlePay} loading={paying} amount={summary.amount}/>}
              {method==="card"      && <IntlCardForm  onPay={handlePay} loading={paying} amount={summary.amount}/>}
              {method==="paypal"    && <PayPalForm    onPay={handlePay} loading={paying} amount={summary.amount}/>}

              <p style={{ textAlign:"center", fontSize:11.5, color:"#8a9e98", marginTop:14 }}>
                By paying you agree to our Terms of Service and Cancellation Policy.
              </p>
            </div>
          </div>

        </div>
      </div>

      {success && (
        <SuccessModal
          summary={{
            message:  getSummary().successMsg,
            details:  getSummary().successDetails,
            btnLabel: getSummary().successBtn,
          }}
          onClose={handleSuccessClose}
        />
      )}

      {error && (
        <ErrorModal
          message={error}
          onRetry={handleRetry}
          onBack={handleBackToPlans}
        />
      )}

      <Footer/>
    </div>
  );
}