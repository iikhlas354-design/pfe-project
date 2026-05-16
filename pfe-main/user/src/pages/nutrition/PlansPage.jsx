import { useState, useEffect, useRef } from "react";

const API_URL    = "http://localhost:5000";
const PLAN_TYPES = { PDF: "pdf", TRACKER: "tracker" };

const emptyPDF     = { title:"", price:"", duration:"", description:"", pdfFile:null };
const emptyMeal    = { name:"", time:"", description:"", calories:"", protein:"", carbs:"", fat:"" };
const emptyHabit   = { name:"", description:"" };
const emptyTracker = {
  title:"", clientId:"", subscriptionId:"", totalDays:"",
  days:[{ dayNumber:1, meals:[{ ...emptyMeal }], habits:[{ ...emptyHabit }] }],
};

export default function PlanPage() {
  const [type,           setType]           = useState(PLAN_TYPES.PDF);
  const [pdfPlan,        setPdfPlan]        = useState(emptyPDF);
  const [trackerPlan,    setTrackerPlan]    = useState(emptyTracker);
  const [subscriptions,  setSubscriptions]  = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [fileName,       setFileName]       = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch(`${API_URL}/subscriptions/nutrition`, { credentials:"include" })
      .then(r => r.json())
      .then(data => {
        const subs = data.subscriptions ?? [];
        setSubscriptions(subs.filter(s =>
          s.status === "ACTIVE" && s.offer?.type === "PACKAGE"
        ));
      })
      .catch(() => setSubscriptions([]));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setPdfPlan({ ...pdfPlan, pdfFile:file }); setFileName(file.name); }
  };

  const handleClientSelect = (subId) => {
    const sub = subscriptions.find(s => s.id === subId);
    setSelectedClient(subId);
    setTrackerPlan(prev => ({
      ...prev,
      clientId:       sub?.patient?.id || "",
      subscriptionId: sub?.id         || "",
    }));
  };

  const updateDay = (dayIndex, updater) => {
    setTrackerPlan(prev => {
      const newDays = [...prev.days];
      newDays[dayIndex] = updater(newDays[dayIndex]);
      return { ...prev, days: newDays };
    });
  };

  const addDay    = () => setTrackerPlan(prev => ({
    ...prev,
    days: [...prev.days, { dayNumber: prev.days.length + 1, meals:[{ ...emptyMeal }], habits:[{ ...emptyHabit }] }],
  }));
  const removeDay = (i) => setTrackerPlan(prev => ({
    ...prev,
    days: prev.days.filter((_,idx) => idx !== i).map((d,idx) => ({ ...d, dayNumber:idx+1 })),
  }));

  const addMeal    = (di) => updateDay(di, d => ({ ...d, meals:[...d.meals, { ...emptyMeal }] }));
  const removeMeal = (di, mi) => updateDay(di, d => ({ ...d, meals:d.meals.filter((_,i) => i !== mi) }));
  const updateMeal = (di, mi, field, val) => updateDay(di, d => {
    const m=[...d.meals]; m[mi]={...m[mi],[field]:val}; return {...d,meals:m};
  });

  const addHabit    = (di) => updateDay(di, d => ({ ...d, habits:[...d.habits, { ...emptyHabit }] }));
  const removeHabit = (di, hi) => updateDay(di, d => ({ ...d, habits:d.habits.filter((_,i) => i !== hi) }));
  const updateHabit = (di, hi, field, val) => updateDay(di, d => {
    const h=[...d.habits]; h[hi]={...h[hi],[field]:val}; return {...d,habits:h};
  });

  const handleSubmit = async () => {
    let res;
    if (type === PLAN_TYPES.PDF) {
      if (!pdfPlan.title || !pdfPlan.price || !pdfPlan.duration) { alert("Fill in title, price and duration"); return; }
      if (!pdfPlan.pdfFile) { alert("Upload a PDF file"); return; }
      const fd = new FormData();
      fd.append("offerName", pdfPlan.title);
      fd.append("offerPrice", pdfPlan.price);
      fd.append("offerDurationDays", pdfPlan.duration);
      fd.append("offerDescription", pdfPlan.description);
      fd.append("title", pdfPlan.title);
      fd.append("type","PDF");
      fd.append("pdfFile", pdfPlan.pdfFile);
      res = await fetch(`${API_URL}/plans`, { method:"POST", credentials:"include", body:fd });
    } else {
      if (!trackerPlan.title)                                     { alert("Enter a plan title"); return; }
      if (!trackerPlan.clientId || !trackerPlan.subscriptionId)  { alert("Select a subscribed client"); return; }
      if (!trackerPlan.totalDays || Number(trackerPlan.totalDays) < 1) { alert("Enter the total plan duration in days"); return; }

      const totalDays = Number(trackerPlan.totalDays);
      const startDate = new Date();

      const content = {
        totalDays, // ← saved here so client can read it
        days: trackerPlan.days.map((day, index) => {
          const date = new Date(startDate);
          date.setDate(startDate.getDate() + index);
          return {
            dayNumber:   day.dayNumber,
            date:        date.toISOString().split("T")[0],
            meals:  day.meals.filter(m => m.name.trim() !== "").map(m => ({
              name:        m.name,
              time:        m.time        || null,
              description: m.description || null,
              calories:    m.calories    ? Number(m.calories) : null,
              protein:     m.protein     ? Number(m.protein)  : null,
              carbs:       m.carbs       ? Number(m.carbs)    : null,
              fat:         m.fat         ? Number(m.fat)      : null,
            })),
            habits: day.habits.filter(h => h.name.trim() !== "").map(h => ({
              name:        h.name,
              description: h.description || null,
            })),
          };
        }),
      };

      res = await fetch(`${API_URL}/plans/assign`, {
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          patientId:         trackerPlan.clientId,
          subscriptionId:    trackerPlan.subscriptionId,
          title:             trackerPlan.title,
          content,
          offerDurationDays: totalDays,
        }),
      });
    }

    const ct   = res.headers.get("content-type");
    const data = ct?.includes("application/json") ? await res.json() : {};
    if (!res.ok) { alert(data.message || `Error ${res.status}`); }
    else {
      alert("Plan created successfully!");
      setPdfPlan(emptyPDF); setTrackerPlan(emptyTracker);
      setFileName(""); setSelectedClient("");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

        .plan-page { min-height:100vh; background:#e8f5ef; padding:40px 20px 60px; font-family:'DM Sans',sans-serif; position:relative; overflow:hidden; }
        .plan-page::before { content:''; position:fixed; top:-120px; right:-120px; width:400px; height:400px; background:radial-gradient(circle,rgba(11,102,48,0.15) 0%,transparent 70%); border-radius:50%; pointer-events:none; }
        .plan-page::after  { content:''; position:fixed; bottom:-100px; left:-100px; width:350px; height:350px; background:radial-gradient(circle,rgba(26,51,41,0.1) 0%,transparent 70%); border-radius:50%; pointer-events:none; }

        .plan-container { max-width:700px; margin:0 auto; position:relative; z-index:1; }
        .plan-header { margin-bottom:32px; }
        .plan-eyebrow { font-size:11px; font-weight:700; letter-spacing:2.5px; text-transform:uppercase; color:rgba(26,51,41,0.45); margin-bottom:8px; }
        .plan-h1 { font-family:'Syne',sans-serif; font-size:36px; font-weight:800; color:#1a3329; line-height:1.1; }
        .plan-h1 span { color:#0b6630; }

        .switch-box { display:flex; gap:5px; padding:5px; border-radius:16px; margin-bottom:24px;
          background:rgba(255,255,255,0.55); backdrop-filter:blur(16px);
          border-top:1.5px solid rgba(168,224,44,0.7); border-left:1.5px solid rgba(168,224,44,0.7);
          border-bottom:1.5px solid rgba(0,168,84,0.6); border-right:1.5px solid rgba(0,168,84,0.6);
          box-shadow:0 4px 20px rgba(15,89,47,0.1), inset 0 0 8px rgba(255,255,255,0.5);
        }
        .switch-btn { flex:1; padding:11px 16px; border:none; border-radius:12px; background:transparent; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:14px; font-weight:700; color:rgba(26,51,41,0.5); transition:all 0.22s; display:flex; align-items:center; justify-content:center; gap:8px; }
        .switch-btn:hover  { color:#1a3329; background:rgba(255,255,255,0.5); }
        .switch-btn.active { background:#0b6630; color:#a8e02c; box-shadow:0 4px 14px rgba(11,102,48,0.3); }

        .glass-card { background:rgba(255,255,255,0.22); backdrop-filter:blur(22px); -webkit-backdrop-filter:blur(22px);
          border-top:1.5px solid rgba(168,224,44,0.85); border-left:1.5px solid rgba(168,224,44,0.85);
          border-bottom:1.5px solid rgba(0,168,84,0.75); border-right:1.5px solid rgba(0,168,84,0.75);
          border-radius:22px; padding:28px;
          box-shadow:0 8px 32px rgba(15,89,47,0.1), inset 0 0 12px rgba(255,255,255,0.5);
          margin-bottom:20px;
        }
        .card-title { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#1a3329; margin-bottom:22px; display:flex; align-items:center; gap:10px; }
        .card-title::after { content:''; flex:1; height:1px; background:linear-gradient(to right,rgba(0,168,84,0.3),transparent); }

        /* ── Total days highlight box ── */
        .total-days-box {
          background: rgba(11,102,48,0.07);
          border: 1.5px solid rgba(168,224,44,0.4);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .total-days-icon {
          width: 40px; height: 40px; border-radius: 11px;
          background: #0b6630;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; flex-shrink: 0;
        }
        .total-days-label { font-size: 12px; font-weight: 700; color: #5a7a6e; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.8px; }
        .total-days-input {
          width: 100%; padding: 8px 12px;
          border: 1.5px solid rgba(0,168,84,0.25);
          border-radius: 9px;
          background: rgba(255,255,255,0.5);
          font-family: 'DM Sans',sans-serif;
          font-size: 18px; font-weight: 800; color: #0b6630;
          outline: none; transition: all 0.2s;
          max-width: 120px;
        }
        .total-days-input:focus { border-color: rgba(168,224,44,0.7); background: rgba(255,255,255,0.8); }
        .total-days-hint { font-size: 11.5px; color: #5a7a6e; margin-top: 3px; line-height: 1.4; }

        .field-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:12px; }
        .field-grid-4 { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:10px; margin-bottom:10px; }
        .field-wrap { display:flex; flex-direction:column; gap:5px; }
        .field-label { font-size:10.5px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:#5a7a6e; }

        .plan-input, .plan-select, .plan-textarea {
          width:100%; padding:10px 13px;
          border:1.5px solid rgba(0,168,84,0.22);
          border-radius:11px;
          background:rgba(255,255,255,0.4); backdrop-filter:blur(8px);
          font-family:'DM Sans',sans-serif; font-size:13.5px; color:#1a3329;
          outline:none; transition:all 0.2s; appearance:none;
        }
        .plan-input::placeholder, .plan-textarea::placeholder { color:rgba(26,51,41,0.3); }
        .plan-input:focus, .plan-select:focus, .plan-textarea:focus {
          border-color:rgba(168,224,44,0.7); background:rgba(255,255,255,0.65);
        }
        .plan-textarea { min-height:80px; resize:vertical; }
        .plan-select { cursor:pointer; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%230b6630' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 13px center; padding-right:34px; }

        .file-upload-zone { width:100%; padding:18px 16px; border:2px dashed rgba(0,168,84,0.3); border-radius:12px; background:rgba(255,255,255,0.3); cursor:pointer; transition:all 0.2s; display:flex; align-items:center; gap:12px; position:relative; }
        .file-upload-zone:hover, .file-upload-zone.has-file { border-color:rgba(168,224,44,0.7); background:rgba(255,255,255,0.5); }
        .file-input-hidden { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
        .file-upload-title { font-size:13px; font-weight:600; color:#1a3329; margin-bottom:2px; }
        .file-upload-sub   { font-size:11px; color:#5a7a6e; }
        .file-badge { font-size:10.5px; font-weight:700; background:#0b6630; color:#a8e02c; padding:3px 10px; border-radius:20px; max-width:150px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

        .section-divider { display:flex; align-items:center; gap:12px; margin:22px 0 16px; color:#5a7a6e; font-size:10.5px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; }
        .section-divider::before, .section-divider::after { content:''; flex:1; height:1px; background:rgba(0,168,84,0.2); }

        /* Day cards info bar */
        .day-info-bar {
          background: rgba(168,224,44,0.08);
          border: 1px solid rgba(168,224,44,0.25);
          border-radius: 10px;
          padding: 8px 14px;
          font-size: 12px; font-weight: 600; color: #5a7a6e;
          margin-bottom: 14px;
        }
        .day-info-bar strong { color: #0b6630; }

        .day-card { background:rgba(255,255,255,0.28); backdrop-filter:blur(10px); border:1px solid rgba(0,168,84,0.18); border-radius:16px; padding:18px; margin-bottom:12px; transition:border-color 0.2s; }
        .day-card:hover { border-color:rgba(168,224,44,0.5); }
        .day-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
        .day-badge { display:inline-flex; align-items:center; gap:6px; background:#0b6630; color:#a8e02c; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:4px 13px; border-radius:20px; }

        .btn-remove-day { background:rgba(192,57,43,0.1); border:1px solid rgba(192,57,43,0.2); border-radius:9px; padding:5px 12px; font-size:11.5px; font-weight:700; color:#c0392b; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.2s; }
        .btn-remove-day:hover { background:rgba(192,57,43,0.2); }
        .btn-remove-small { width:32px; height:32px; background:rgba(192,57,43,0.1); border:1px solid rgba(192,57,43,0.15); border-radius:8px; cursor:pointer; font-size:13px; color:#c0392b; display:flex; align-items:center; justify-content:center; transition:all 0.18s; flex-shrink:0; }
        .btn-remove-small:hover { background:rgba(192,57,43,0.2); }

        .btn-add-small { padding:6px 14px; background:rgba(255,255,255,0.4); border:1.5px dashed rgba(0,168,84,0.35); border-radius:9px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:700; color:#0b6630; transition:all 0.2s; margin-top:6px; }
        .btn-add-small:hover { background:rgba(255,255,255,0.7); border-color:rgba(168,224,44,0.6); }
        .btn-add-day { width:100%; padding:11px; background:rgba(255,255,255,0.3); border:1.5px dashed rgba(0,168,84,0.3); border-radius:13px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:13px; font-weight:700; color:#0b6630; transition:all 0.2s; }
        .btn-add-day:hover { background:rgba(255,255,255,0.55); border-color:rgba(168,224,44,0.6); }

        .meal-block { background:rgba(255,255,255,0.3); border-radius:12px; padding:12px 14px; margin-bottom:10px; border:1px solid rgba(0,168,84,0.1); }
        .meal-block-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .meal-block-title { font-size:12px; font-weight:700; color:#5a7a6e; text-transform:uppercase; letter-spacing:0.8px; }

        .client-info { background:rgba(11,102,48,0.08); border-radius:11px; padding:11px 15px; margin-top:8px; border:1px solid rgba(0,168,84,0.18); }
        .client-info-label { font-size:10.5px; font-weight:700; color:#5a7a6e; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px; }
        .client-info-value { font-size:13.5px; font-weight:700; color:#1a3329; }

        .btn-submit { width:100%; padding:15px; background:#0b6630; color:#a8e02c; border:none; border-radius:16px; cursor:pointer; font-family:'DM Sans',sans-serif; font-size:16px; font-weight:800; box-shadow:0 6px 24px rgba(11,102,48,0.3); transition:all 0.22s; }
        .btn-submit:hover { background:#0d7a38; transform:translateY(-2px); box-shadow:0 10px 32px rgba(11,102,48,0.4); }
        .btn-submit:active { transform:translateY(0); }

        .warn-box { margin-top:8px; padding:10px 14px; background:rgba(184,162,0,0.1); border-radius:9px; border:1px solid rgba(184,162,0,0.25); font-size:12px; color:#8a7200; font-family:'DM Sans',sans-serif; }
      `}</style>

      <div className="plan-page">
        <div className="plan-container">
          <div className="plan-header">
            <p className="plan-eyebrow">Nutrition Management</p>
            <h1 className="plan-h1">Create a <span>Plan</span></h1>
          </div>

          <div className="switch-box">
            <button className={`switch-btn ${type === PLAN_TYPES.PDF ? "active" : ""}`} onClick={() => setType(PLAN_TYPES.PDF)}>
              📄 PDF Plan
            </button>
            <button className={`switch-btn ${type === PLAN_TYPES.TRACKER ? "active" : ""}`} onClick={() => setType(PLAN_TYPES.TRACKER)}>
              📅 Tracker Plan
            </button>
          </div>

          {/* ── PDF ── */}
          {type === PLAN_TYPES.PDF && (
            <div className="glass-card">
              <h2 className="card-title">📄 PDF Plan</h2>
              <div className="field-grid-2">
                <div className="field-wrap">
                  <label className="field-label">Title</label>
                  <input className="plan-input" placeholder="e.g. 7-Day Clean Eating" value={pdfPlan.title} onChange={e => setPdfPlan({...pdfPlan,title:e.target.value})} />
                </div>
                <div className="field-wrap">
                  <label className="field-label">Price ($)</label>
                  <input className="plan-input" type="number" placeholder="29.99" value={pdfPlan.price} onChange={e => setPdfPlan({...pdfPlan,price:e.target.value})} />
                </div>
              </div>
              <div className="field-wrap" style={{ marginBottom:12 }}>
                <label className="field-label">Duration (days)</label>
                <input className="plan-input" type="number" placeholder="28" value={pdfPlan.duration} onChange={e => setPdfPlan({...pdfPlan,duration:e.target.value})} />
              </div>
              <div className="field-wrap" style={{ marginBottom:12 }}>
                <label className="field-label">Upload PDF File</label>
                <div className={`file-upload-zone ${fileName ? "has-file" : ""}`}>
                  <input ref={fileInputRef} type="file" accept="application/pdf" className="file-input-hidden" onChange={handleFileChange} />
                  <span style={{ fontSize:24 }}>{fileName ? "✅" : "📂"}</span>
                  <div style={{ flex:1 }}>
                    <div className="file-upload-title">{fileName ? "File selected" : "Choose PDF from your computer"}</div>
                    <div className="file-upload-sub">{fileName ? "" : "Click to browse · PDF only"}</div>
                  </div>
                  {fileName && <span className="file-badge" title={fileName}>{fileName}</span>}
                </div>
              </div>
              <div className="field-wrap">
                <label className="field-label">Description</label>
                <textarea className="plan-textarea" placeholder="Describe the plan goals, contents, and who it's designed for…" value={pdfPlan.description} onChange={e => setPdfPlan({...pdfPlan,description:e.target.value})} />
              </div>
            </div>
          )}

          {/* ── TRACKER ── */}
          {type === PLAN_TYPES.TRACKER && (
            <div className="glass-card">
              <h2 className="card-title">📅 Tracker Plan</h2>

              {/* Client select */}
              <div className="field-wrap" style={{ marginBottom:16 }}>
                <label className="field-label">👤 Select Package Client</label>
                <select className="plan-select" value={selectedClient} onChange={e => handleClientSelect(e.target.value)}>
                  <option value="">-- Choose a client --</option>
                  {subscriptions.map(sub => (
                    <option key={sub.id} value={sub.id}>
                      {sub.patient?.firstName} {sub.patient?.lastName} — {sub.offer?.name}
                    </option>
                  ))}
                </select>
                {subscriptions.length === 0 && (
                  <div className="warn-box">⚠️ No active PACKAGE subscriptions found.</div>
                )}
                {selectedClient && (
                  <div className="client-info">
                    <div className="client-info-label">Selected Client</div>
                    <div className="client-info-value">
                      {subscriptions.find(s => s.id === selectedClient)?.patient?.firstName}{" "}
                      {subscriptions.find(s => s.id === selectedClient)?.patient?.lastName}
                    </div>
                  </div>
                )}
              </div>

              {/* Plan title */}
              <div className="field-wrap" style={{ marginBottom:16 }}>
                <label className="field-label">Plan Title</label>
                <input className="plan-input" placeholder="e.g. 20-Day Weight Loss Tracker" value={trackerPlan.title} onChange={e => setTrackerPlan({...trackerPlan,title:e.target.value})} />
              </div>

              {/* ── Total duration — the key new field ── */}
              <div className="total-days-box">
                <div className="total-days-icon">📆</div>
                <div style={{ flex:1 }}>
                  <div className="total-days-label">Total Plan Duration</div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
                    <input
                      className="total-days-input"
                      type="number"
                      min="1"
                      max="365"
                      placeholder="20"
                      value={trackerPlan.totalDays}
                      onChange={e => setTrackerPlan({...trackerPlan, totalDays: e.target.value})}
                    />
                    <span style={{ fontSize:13, fontWeight:600, color:"#5a7a6e" }}>days total</span>
                  </div>
                  <div className="total-days-hint">
                    The client will see <strong>"Day X of {trackerPlan.totalDays || "?"}"</strong> each day.
                    You only need to fill in the unique day patterns below — they will cycle automatically.
                  </div>
                </div>
              </div>

              <div className="section-divider">Daily Schedule</div>

              {/* Info bar showing cycle info */}
              {trackerPlan.totalDays && trackerPlan.days.length > 0 && (
                <div className="day-info-bar">
                  You've added <strong>{trackerPlan.days.length}</strong> day pattern{trackerPlan.days.length > 1 ? "s" : ""} for a <strong>{trackerPlan.totalDays}-day</strong> plan.
                  {Number(trackerPlan.totalDays) > trackerPlan.days.length
                    ? ` Days will cycle every ${trackerPlan.days.length} day${trackerPlan.days.length > 1 ? "s" : ""}.`
                    : " Each day has a unique meal plan."}
                </div>
              )}

              {/* Days */}
              {trackerPlan.days.map((day, di) => (
                <div key={di} className="day-card">
                  <div className="day-header">
                    <div className="day-badge">📅 Day {day.dayNumber}</div>
                    {trackerPlan.days.length > 1 && (
                      <button className="btn-remove-day" onClick={() => removeDay(di)}>🗑 Remove</button>
                    )}
                  </div>

                  {/* Meals */}
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>🍽 Meals</div>
                    {day.meals.map((meal, mi) => (
                      <div key={mi} className="meal-block">
                        <div className="meal-block-header">
                          <span className="meal-block-title">Meal {mi + 1}</span>
                          {day.meals.length > 1 && (
                            <button className="btn-remove-small" onClick={() => removeMeal(di, mi)}>✕</button>
                          )}
                        </div>
                        <div className="field-grid-2" style={{ marginBottom:8 }}>
                          <div className="field-wrap">
                            <label className="field-label">Name</label>
                            <input className="plan-input" placeholder="e.g. Breakfast" value={meal.name} onChange={e => updateMeal(di,mi,"name",e.target.value)} />
                          </div>
                          <div className="field-wrap">
                            <label className="field-label">Time</label>
                            <input className="plan-input" placeholder="e.g. 7:30 AM" value={meal.time} onChange={e => updateMeal(di,mi,"time",e.target.value)} />
                          </div>
                        </div>
                        <div className="field-wrap" style={{ marginBottom:8 }}>
                          <label className="field-label">Description / Ingredients</label>
                          <input className="plan-input" placeholder="e.g. Oats, Blueberries and Almonds" value={meal.description} onChange={e => updateMeal(di,mi,"description",e.target.value)} />
                        </div>
                        <div className="field-grid-4">
                          <div className="field-wrap">
                            <label className="field-label" style={{ color:"#0b6630" }}>Protein (g)</label>
                            <input className="plan-input" type="number" placeholder="42" value={meal.protein} onChange={e => updateMeal(di,mi,"protein",e.target.value)} />
                          </div>
                          <div className="field-wrap">
                            <label className="field-label" style={{ color:"#1a6fa0" }}>Carbs (g)</label>
                            <input className="plan-input" type="number" placeholder="48" value={meal.carbs} onChange={e => updateMeal(di,mi,"carbs",e.target.value)} />
                          </div>
                          <div className="field-wrap">
                            <label className="field-label" style={{ color:"#c2620a" }}>Fat (g)</label>
                            <input className="plan-input" type="number" placeholder="18" value={meal.fat} onChange={e => updateMeal(di,mi,"fat",e.target.value)} />
                          </div>
                          <div className="field-wrap">
                            <label className="field-label" style={{ color:"#6d28d9" }}>Calories</label>
                            <input className="plan-input" type="number" placeholder="520" value={meal.calories} onChange={e => updateMeal(di,mi,"calories",e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-add-small" onClick={() => addMeal(di)}>+ Add Meal</button>
                  </div>

                  {/* Habits */}
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:"1px", marginBottom:10 }}>✅ Habits</div>
                    {day.habits.map((habit, hi) => (
                      <div key={hi} className="meal-block" style={{ marginBottom:8 }}>
                        <div className="meal-block-header">
                          <span className="meal-block-title">Habit {hi + 1}</span>
                          {day.habits.length > 1 && (
                            <button className="btn-remove-small" onClick={() => removeHabit(di, hi)}>✕</button>
                          )}
                        </div>
                        <div className="field-grid-2">
                          <div className="field-wrap">
                            <label className="field-label">Name</label>
                            <input className="plan-input" placeholder="e.g. Hydration" value={habit.name} onChange={e => updateHabit(di,hi,"name",e.target.value)} />
                          </div>
                          <div className="field-wrap">
                            <label className="field-label">Description</label>
                            <input className="plan-input" placeholder="e.g. 3L Water Goal" value={habit.description} onChange={e => updateHabit(di,hi,"description",e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button className="btn-add-small" onClick={() => addHabit(di)}>+ Add Habit</button>
                  </div>
                </div>
              ))}
              <button className="btn-add-day" onClick={addDay}>+ Add Day Pattern</button>
            </div>
          )}

          <button className="btn-submit" onClick={handleSubmit}>Create Plan →</button>
        </div>
      </div>
    </>
  );
}