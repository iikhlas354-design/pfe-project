import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, remove } from "firebase/database";

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCE9as0vDARJwy_tAcQQHA2jsR5C6cHPpg",
  authDomain: "chrysalise-a4400.firebaseapp.com",
  databaseURL: "https://chrysalise-a4400-default-rtdb.firebaseio.com",
  projectId: "chrysalise-a4400",
  storageBucket: "chrysalise-a4400.firebasestorage.app",
  messagingSenderId: "524439373771",
  appId: "1:524439373771:web:eb8f202acfcbf33488d84e"
};

function initFirebase() {
  if (getApps().length === 0) initializeApp(FIREBASE_CONFIG);
  return getDatabase();
}

function getOrCreateSessionId() {
  let id = sessionStorage.getItem("qr_session_id");
  if (!id) { id = Math.random().toString(36).slice(2, 10); sessionStorage.setItem("qr_session_id", id); }
  return id;
}

// Fix 1: convert base64 data URL to Blob without fetch()
function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

// Grade helpers
function gradeFromCalories(cal) {
  if (cal <= 300) return "A";
  if (cal <= 500) return "B";
  if (cal <= 700) return "C";
  if (cal <= 900) return "D";
  return "F";
}

function gradeColor(grade) {
  return { A: "#0b6630", B: "#2d7a4f", C: "#b8a200", D: "#c2620a", F: "#c0392b" }[grade] ?? "#0b6630";
}

function gradeMessage(grade) {
  return {
    A: "Excellent choice — well within a healthy daily budget.",
    B: "Good choice — fits comfortably in a balanced diet.",
    C: "Moderate — consider balancing with lighter meals today.",
    D: "High calorie — balance with lighter options for the rest of the day.",
    F: "Very high calorie — consider a smaller portion next time.",
  }[grade] ?? "";
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn   { from{opacity:0} to{opacity:1} }
@keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes scanLine { 0%{top:0%} 50%{top:90%} 100%{top:0%} }
@keyframes popIn    { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
@keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.15)} }
@keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
.anim-pop   { animation: popIn  0.4s cubic-bezier(0.22,1,0.36,1) both; }
.anim-fade  { animation: fadeIn 0.4s ease both; }

.glass-card {
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
.glass-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
}

.upload-zone {
  cursor: pointer;
  border-radius: 24px;
  padding: 64px 40px;
  text-align: center;
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  box-shadow: 0 8px 32px rgba(15,89,47,0.1), inset 0 0 12px rgba(255,255,255,0.5);
  transition: all 0.28s ease;
}
.upload-zone:hover, .upload-zone.drag {
  background: rgba(255,255,255,0.32);
  border-color: rgba(168,224,44,0.7);
  box-shadow: 0 12px 40px rgba(15,89,47,0.16), inset 0 0 16px rgba(255,255,255,0.7);
}

.scan-beam {
  position: absolute; left:0; right:0; height:3px;
  background: linear-gradient(90deg,transparent 0%,rgba(168,224,44,0.9) 20%,#fff 50%,rgba(168,224,44,0.9) 80%,transparent 100%);
  animation: scanLine 1.8s ease-in-out infinite;
  box-shadow: 0 0 18px rgba(168,224,44,0.9), 0 0 40px rgba(168,224,44,0.4);
  z-index: 10;
}

.result-table { width:100%; border-collapse:collapse; font-family:'Inter',sans-serif; }
.result-table tr { border-bottom:1px solid rgba(0,168,84,0.08); transition:background 0.15s; }
.result-table tr:last-child { border-bottom:none; }
.result-table tr:hover { background:rgba(255,255,255,0.3); }
.result-table td { padding:13px 18px; font-size:13.5px; color:#000; }
.result-table td:first-child { font-weight:600; font-size:12px; text-transform:uppercase; letter-spacing:0.6px; width:45%; }
.result-table td:last-child { font-weight:700; text-align:right; }

.macro-badge { display:inline-flex; align-items:center; padding:3px 10px; border-radius:999px; font-size:12px; font-weight:700; }

.step-card {
  border-radius:22px; overflow:hidden;
  background:rgba(255,255,255,0.18); backdrop-filter:blur(22px);
  border-top:1.5px solid rgba(168,224,44,0.85); border-left:1.5px solid rgba(168,224,44,0.85);
  border-bottom:1.5px solid rgba(0,168,84,0.75); border-right:1.5px solid rgba(0,168,84,0.75);
  box-shadow:0 4px 20px rgba(15,89,47,0.08), inset 0 0 10px rgba(255,255,255,0.4);
  transition:all 0.26s ease;
}
.step-card:hover { transform:translateY(-4px); background:rgba(255,255,255,0.28); box-shadow:0 14px 40px rgba(15,89,47,0.14), inset 0 0 14px rgba(255,255,255,0.65); }

.btn-primary {
  background:#0b6630; color:#a8e02c; border:none; border-radius:20px; padding:13px 28px;
  font-size:14px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif;
  display:inline-flex; align-items:center; gap:8px;
  transition:all 0.2s; box-shadow:0 4px 14px rgba(11,102,48,0.3);
}
.btn-primary:hover { background:#0d7a38; }

.btn-glass {
  background:rgba(255,255,255,0.25); backdrop-filter:blur(8px);
  color:#000; border:1.5px solid rgba(168,224,44,0.4); border-radius:20px; padding:13px 28px;
  font-size:14px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif;
  display:inline-flex; align-items:center; gap:8px; transition:all 0.2s;
}
.btn-glass:hover { background:rgba(255,255,255,0.5); border-color:rgba(168,224,44,0.7); }

.btn-icon {
  width:36px; height:36px; border-radius:50%;
  background:rgba(255,255,255,0.5); backdrop-filter:blur(8px);
  border:1px solid rgba(168,224,44,0.3);
  cursor:pointer; display:flex; align-items:center; justify-content:center;
  color:#000; font-size:15px; font-weight:700; transition:all 0.2s;
}
.btn-icon:hover { background:rgba(255,255,255,0.8); }

.food-pill {
  display:flex; align-items:center; gap:8px;
  background:rgba(255,255,255,0.3); backdrop-filter:blur(6px);
  border:1px solid rgba(0,168,84,0.15); border-radius:999px; padding:5px 14px 5px 6px;
  font-size:12.5px; font-weight:600; color:#000; transition:all 0.2s;
}
.food-pill:hover { background:rgba(255,255,255,0.55); border-color:rgba(168,224,44,0.4); }

.waiting-dot {
  width:8px; height:8px; border-radius:50%; background:#0b6630;
  display:inline-block; animation:pulse 2s ease infinite;
}
`;

const STEP_IMGS = [
  "https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=600&q=80",
  "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=600&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
];

const SAMPLE_FOODS = [
  { label:"Salad", img:"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&q=80" },
  { label:"Pizza", img:"https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=120&q=80" },
  { label:"Sushi", img:"https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=120&q=80" },
  { label:"Pasta", img:"https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=120&q=80" },
];

const STEPS = [
  { num:"01", title:"Photograph your meal", desc:"Take a clear photo of any dish, snack or drink from directly above for best results.", img:STEP_IMGS[0] },
  { num:"02", title:"AI scans the image",   desc:"Our computer vision model detects every ingredient and estimates portion weight automatically.", img:STEP_IMGS[1] },
  { num:"03", title:"Receive your report",  desc:"Get an instant calorie count with your daily intake percentage and a personalised health grade.", img:STEP_IMGS[2] },
];

export default function CaloriesAI() {
  const fileRef  = useRef(null);
  const dbRef    = useRef(null);
  const [stage,     setStage]    = useState("idle");
  const [imgSrc,    setImgSrc]   = useState(null);
  const [drag,      setDrag]     = useState(false);
  const [progress,  setProgress] = useState(0);
  const [result,    setResult]   = useState(null);
  const [w,         setW]        = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  const [sessionId]              = useState(getOrCreateSessionId);
  const [qrMode,    setQrMode]   = useState(false);
  const mob = w < 768;

  const scanURL = `http://192.168.1.5:5173/scan?session=${sessionId}`;

  // Inject CSS once
  useEffect(() => {
    if (!document.getElementById("cal-ai-css")) {
      const s = document.createElement("style");
      s.id = "cal-ai-css"; s.textContent = CSS;
      document.head.appendChild(s);
    }
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Firebase listener for QR phone upload
  useEffect(() => {
    const db = initFirebase();
    dbRef.current = ref(db, `sessions/${sessionId}`);
    const unsub = onValue(dbRef.current, (snap) => {
      const data = snap.val();
      if (data?.photo) {
        setImgSrc(data.photo);
        setStage("preview");
        setQrMode(false);
        remove(dbRef.current);
      }
    });
    return () => unsub();
  }, [sessionId]);

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => { setImgSrc(e.target.result); setStage("preview"); };
    reader.readAsDataURL(file);
  };

const startScan = async () => {
  setStage("scanning");
  setProgress(0);

  let p = 0;
  const iv = setInterval(() => {
    p += Math.random() * 8 + 3;
    if (p >= 90) { p = 90; clearInterval(iv); }
    setProgress(Math.min(p, 90));
  }, 160);

  try {
    const blob = dataURLtoBlob(imgSrc);
    const formData = new FormData();
    formData.append("image", blob, "meal.jpg");

    const response = await fetch("http://localhost:5001/analyze", {
      method: "POST",
      body: formData,
    });

    clearInterval(iv);

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Analysis failed");
    }

    const data = await response.json();
    console.log("Server response:", data);

    const { detections = [], total = {} } = data;

    // ── Filter: remove zero-calorie, low-confidence, deduplicate ──
    const valid = detections
      .filter(d => (d.calories ?? 0) > 1 && (d.confidence ?? 0) >= 0.30)
      .sort((a, b) => (b.calories ?? 0) - (a.calories ?? 0));

    // ── Merge same food label ──
    const grouped = [];
    valid.forEach(d => {
      const key = d.food.toLowerCase().trim();
      const existing = grouped.find(g => g.food.toLowerCase().trim() === key);
      if (existing) {
        existing.calories  = (existing.calories  ?? 0) + (d.calories  ?? 0);
        existing.weight_g  = (existing.weight_g  ?? 0) + (d.weight_g  ?? 0);
        existing.protein   = (existing.protein   ?? 0) + (d.protein   ?? 0);
        existing.carbs     = (existing.carbs     ?? 0) + (d.carbs     ?? 0);
        existing.fat       = (existing.fat       ?? 0) + (d.fat       ?? 0);
        existing.count     = (existing.count     ?? 1) + 1;
        existing.confidence = Math.max(existing.confidence, d.confidence ?? 0);
      } else {
        grouped.push({ ...d, count: 1 });
      }
    });

    const best = grouped[0] ?? null;

    const foodLabel = grouped.length === 0
      ? "No food detected"
      : grouped.length === 1
        ? (best.count > 1 ? `${best.food} ×${best.count}` : best.food)
        : grouped.slice(0, 2).map(d =>
            d.count > 1 ? `${d.food} ×${d.count}` : d.food
          ).join(" + ") + (grouped.length > 2 ? ` +${grouped.length - 2} more` : "");

    const totalCalories = Math.round(
      grouped.length > 0
        ? grouped.reduce((s, d) => s + (d.calories ?? 0), 0)
        : (total.calories ?? 0)
    );

    const grade = gradeFromCalories(totalCalories);

    const mapped = {
      food:       foodLabel,
      confidence: best ? Math.round((best.confidence ?? 0) * 100) : 0,
      calories:   totalCalories,
      // ── Fix: read fat/carbs/protein (matching predict.py output) ──
      protein:    Math.round(total.protein ?? grouped.reduce((s,d) => s+(d.protein??0), 0)),
      carbs:      Math.round(total.carbs   ?? grouped.reduce((s,d) => s+(d.carbs??0),   0)),
      fat:        Math.round(total.fat     ?? grouped.reduce((s,d) => s+(d.fat??0),     0)),
      fiber:      null,
      sodium:     null,
      weight:     grouped.length > 0
        ? `~${Math.round(grouped.reduce((s,d) => s+(d.weight_g??0), 0))}g`
        : "—",
      grade,
      gradeColor:     gradeColor(grade),
      daily:          { cal: totalCalories, total: 2000 },
      annotatedImage: null,
      detections:     grouped,
    };

    setProgress(100);
    setTimeout(() => { setResult(mapped); setStage("result"); }, 400);

  } catch (err) {
    clearInterval(iv);
    setProgress(0);
    setStage("preview");
    alert(`Analysis failed: ${err.message}`);
  }
};

  const reset = () => {
    setStage("idle"); setImgSrc(null);
    setResult(null); setProgress(0); setQrMode(false);
  };

  const dailyPct   = result ? Math.round((result.daily.cal / result.daily.total) * 100) : 0;
const displayImg = imgSrc;

  return (
    <div style={{ minHeight:"100vh", background:"#f2f7f5", fontFamily:"'Inter',sans-serif" }}>

      {/* ── Hero ── */}
      <section style={{
        background:"linear-gradient(135deg,#1a3329 0%,#0b6630 60%,#1a3329 100%)",
        padding: mob ? "24px 20px" : "32px 40px",
        position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(circle,rgba(168,224,44,0.07) 1.5px,transparent 1.5px)", backgroundSize:"32px 32px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:-120, right:-120, width:420, height:420, borderRadius:"50%", background:"radial-gradient(circle,rgba(168,224,44,0.08) 0%,transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", maxWidth:760, margin:"0 auto", textAlign:"center" }}>
          <div className="anim-up" style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(168,224,44,0.12)", border:"1px solid rgba(168,224,44,0.3)", borderRadius:999, padding:"6px 18px", fontSize:12.5, fontWeight:700, color:"#a8e02c", marginBottom:16, letterSpacing:0.5 }}>
            <span style={{ width:7, height:7, borderRadius:"50%", background:"#a8e02c", animation:"pulse 2s ease infinite", display:"inline-block" }} />
            Instant Calorie Detection · AI Powered
          </div>
          <h1 className="anim-up" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize: mob ? "clamp(28px,8vw,40px)" : "clamp(32px,5vw,48px)", fontWeight:700, color:"#fff", letterSpacing:-2, lineHeight:1.1, marginBottom:14, animationDelay:"0.1s" }}>
            Know exactly what<br /><span style={{ color:"#a8e02c" }}>you're eating.</span>
          </h1>
          <p className="anim-up" style={{ fontSize: mob ? 13.5 : 15, color:"rgba(255,255,255,0.6)", maxWidth:460, margin:"0 auto", lineHeight:1.6, animationDelay:"0.2s" }}>
            Upload a photo of any meal. Our AI analyses the image and returns the calorie count with your personalised daily intake progress — in under 3 seconds.
          </p>
        </div>
      </section>

      {/* ── Main ── */}
      <div style={{ maxWidth:1100, margin:"0 auto", padding: mob ? "36px 20px 80px" : "52px 40px 100px" }}>

        {/* ── IDLE ── */}
        {stage === "idle" && !qrMode && (
          <div
            className={`upload-zone anim-up ${drag ? "drag" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); loadFile(e.dataTransfer.files[0]); }}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e => loadFile(e.target.files[0])} />
            <div style={{ width:90, height:90, borderRadius:"50%", background:"linear-gradient(135deg,#1a3329,#0b6630)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", boxShadow:"0 12px 32px rgba(11,102,48,0.25)", animation:"float 4s ease-in-out infinite" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:700, color:"#000", marginBottom:10 }}>Drop your meal photo here</div>
            <div style={{ fontSize:14, color:"#000", marginBottom:32, lineHeight:1.7 }}>Drag & drop or click to select · JPG, PNG, WEBP</div>
            <div style={{ display:"flex", justifyContent:"center", gap:12, flexWrap:"wrap", marginBottom:16 }}>
              <button className="btn-primary" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Photo
              </button>
              {!mob && (
                <button className="btn-glass" onClick={e => { e.stopPropagation(); setQrMode(true); }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  Use Phone Camera
                </button>
              )}
            </div>
            <div style={{ marginTop:24, display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
              {SAMPLE_FOODS.map(f => (
                <div key={f.label} className="food-pill">
                  <img src={f.img} alt={f.label} style={{ width:26, height:26, borderRadius:"50%", objectFit:"cover" }} />
                  {f.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── QR MODE ── */}
        {stage === "idle" && qrMode && (
          <div className="upload-zone anim-up" style={{ cursor:"default" }}>
            <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:700, color:"#000", marginBottom:10 }}>Scan with your phone</div>
            <div style={{ fontSize:14, color:"#000", marginBottom:28, lineHeight:1.7 }}>
              Open the camera on your phone and scan this code.<br />The photo will appear here automatically.
            </div>
            <div style={{ display:"inline-block", padding:18, background:"rgba(255,255,255,0.7)", backdropFilter:"blur(12px)", borderRadius:20, border:"1.5px solid rgba(168,224,44,0.5)", boxShadow:"0 8px 32px rgba(11,102,48,0.12)", marginBottom:24 }}>
              <QRCodeSVG value={scanURL} size={200} />
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10, justifyContent:"center", fontSize:13, color:"#000", marginBottom:28 }}>
              <span className="waiting-dot" />
              Waiting for photo from your phone…
            </div>
            <button className="btn-glass" onClick={reset}>← Back</button>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {stage === "preview" && (
          <div className="glass-card anim-pop" style={{ maxWidth:600, margin:"0 auto" }}>
            <div style={{ position:"relative" }}>
              <img src={imgSrc} alt="meal" style={{ width:"100%", maxHeight:400, objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 55%,rgba(26,51,41,0.55))" }} />
              <button className="btn-icon" onClick={reset} style={{ position:"absolute", top:14, right:14 }}>✕</button>
              <div style={{ position:"absolute", bottom:18, left:22, fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:"#fff" }}>Ready to analyse</div>
            </div>
            <div style={{ padding:"24px 26px 26px" }}>
              <p style={{ fontSize:13.5, color:"#000", lineHeight:1.7, marginBottom:22 }}>
                Our AI will scan the image, identify the food, and calculate the exact calorie count with your daily intake percentage.
              </p>
              <button className="btn-primary" onClick={startScan} style={{ width:"100%", justifyContent:"center", borderRadius:14, padding:"15px 0", fontSize:15 }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Analyse with AI
              </button>
            </div>
          </div>
        )}

        {/* ── SCANNING ── */}
        {stage === "scanning" && (
          <div className="glass-card anim-fade" style={{ maxWidth:600, margin:"0 auto" }}>
            <div style={{ position:"relative" }}>
              <img src={imgSrc} alt="meal" style={{ width:"100%", maxHeight:400, objectFit:"cover", display:"block", filter:"brightness(0.5)" }} />
              <div className="scan-beam" />
              <div style={{ position:"absolute", inset:0, backgroundImage:"linear-gradient(rgba(168,224,44,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(168,224,44,0.05) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
              <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16 }}>
                <div style={{ width:68, height:68, borderRadius:"50%", border:"3px solid rgba(168,224,44,0.25)", borderTopColor:"#a8e02c", animation:"spin 0.75s linear infinite" }} />
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:20, fontWeight:700, color:"#fff" }}>Scanning…</div>
                <div style={{ fontSize:13, color:"rgba(255,255,255,0.5)" }}>Detecting food & calculating calories</div>
              </div>
            </div>
            <div style={{ padding:"24px 26px 26px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#000" }}>AI Processing</span>
                <span style={{ fontSize:13, fontWeight:800, color:"#000" }}>{Math.round(progress)}%</span>
              </div>
              <div style={{ height:8, background:"rgba(0,168,84,0.1)", borderRadius:999, overflow:"hidden", marginBottom:16 }}>
                <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#0b6630,#a8e02c)", borderRadius:999, transition:"width 0.16s ease", boxShadow:"0 0 10px rgba(168,224,44,0.5)" }} />
              </div>
              <div style={{ display:"flex", gap:7, flexWrap:"wrap" }}>
                {["Uploading image","Detecting food","Counting calories","Generating report"].map((t, i) => (
                  <span key={t} style={{
                    fontSize:11.5, fontWeight:600,
                    color:      progress > i * 22 ? "#0b6630" : "#9ab8ae",
                    background: progress > i * 22 ? "rgba(168,224,44,0.15)" : "rgba(255,255,255,0.3)",
                    borderRadius:999, padding:"3px 11px", transition:"all 0.3s ease",
                    border: progress > i * 22 ? "1px solid rgba(168,224,44,0.4)" : "1px solid rgba(0,0,0,0.05)",
                    display:"flex", alignItems:"center", gap:5,
                  }}>
                    {progress > i * 22 && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {stage === "result" && result && (
          <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "1fr 1fr", gap:20 }}>

            {/* Left — image + nutrition table + per-item breakdown */}
            <div className="glass-card anim-pop">
              <div style={{ position:"relative" }}>
                {/* Fix 7: annotated image with YOLO bounding boxes */}
                <img src={displayImg} alt="meal" style={{ width:"100%", maxHeight:320, objectFit:"cover", display:"block" }} />
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,transparent 45%,rgba(26,51,41,0.72))" }} />
                <div style={{ position:"absolute", top:14, left:14, background:"rgba(255,255,255,0.9)", backdropFilter:"blur(8px)", borderRadius:999, padding:"4px 12px", fontSize:12, fontWeight:700, color:"#000", display:"flex", alignItems:"center", gap:6, border:"1px solid rgba(168,224,44,0.4)" }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {result.confidence}% confidence
                </div>
                <button className="btn-icon" onClick={reset} style={{ position:"absolute", top:14, right:14 }}>✕</button>
                <div style={{ position:"absolute", bottom:16, left:20, right:20 }}>
                  <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:21, fontWeight:700, color:"#fff", marginBottom:3, textTransform:"capitalize" }}>{result.food}</div>
                  <div style={{ fontSize:12.5, color:"rgba(255,255,255,0.7)" }}>Estimated portion: {result.weight}</div>
                </div>
              </div>

              {/* Nutrition facts */}
              <div style={{ padding:"6px 0" }}>
                <div style={{ padding:"12px 18px 8px", fontSize:10.5, fontWeight:700, color:"#000", textTransform:"uppercase", letterSpacing:1 }}>Nutrition Facts</div>
                <table className="result-table">
                  <tbody>
                    <tr>
                      <td>Total Calories</td>
                      <td>
                        <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"#0b6630" }}>{result.calories}</span>
                        <span style={{ fontSize:12, color:"#5a7a6e", marginLeft:4 }}>kcal</span>
                      </td>
                    </tr>
                    {result.protein != null && <tr><td>Protein</td><td><span className="macro-badge" style={{ background:"rgba(11,102,48,0.1)", color:"#0b6630" }}>{result.protein}g</span></td></tr>}
                    {result.carbs   != null && <tr><td>Carbohydrates</td><td><span className="macro-badge" style={{ background:"rgba(26,111,160,0.1)", color:"#1a6fa0" }}>{result.carbs}g</span></td></tr>}
                    {result.fat     != null && <tr><td>Fat</td><td><span className="macro-badge" style={{ background:"rgba(251,146,60,0.12)", color:"#c2620a" }}>{result.fat}g</span></td></tr>}
                    {result.fiber   != null && <tr><td>Fiber</td><td><span className="macro-badge" style={{ background:"rgba(167,139,250,0.12)", color:"#6d28d9" }}>{result.fiber}g</span></td></tr>}
                    {result.sodium  != null && <tr><td>Sodium</td><td><span className="macro-badge" style={{ background:"rgba(184,162,0,0.1)", color:"#8a7200" }}>{result.sodium}mg</span></td></tr>}
                    <tr><td>Portion weight</td><td style={{ color:"#5a7a6e" }}>{result.weight}</td></tr>
                  </tbody>
                </table>
              </div>

            {/* Per-item breakdown — only when multiple VALID foods detected */}
{result.detections && result.detections.length > 1 && (
  <div style={{ padding:"12px 18px 14px", borderTop:"1px solid rgba(0,168,84,0.08)" }}>
    <div style={{
      fontSize:10.5, fontWeight:700, color:"#5a7a6e",
      textTransform:"uppercase", letterSpacing:1, marginBottom:10,
      display:"flex", alignItems:"center", gap:8,
    }}>
      <span>Detected Items</span>
      <span style={{ background:"rgba(11,102,48,0.1)", color:"#0b6630", borderRadius:999, padding:"1px 8px", fontSize:10, fontWeight:800 }}>
        {result.detections.length}
      </span>
    </div>
    {result.detections.map((d, i) => (
      <div key={i} style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:"9px 0", fontSize:13,
        borderBottom: i < result.detections.length - 1
          ? "1px solid rgba(0,168,84,0.06)" : "none",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{
            width:6, height:6, borderRadius:"50%", flexShrink:0,
            background: i === 0 ? "#0b6630" : i === 1 ? "#1a6fa0" : "#fb923c",
          }} />
          <span style={{ fontWeight:600, textTransform:"capitalize", color:"#1a3329" }}>
            {d.food}
            {d.count > 1 && (
              <span style={{ fontSize:11, color:"#5a7a6e", fontWeight:500, marginLeft:5 }}>
                ×{d.count}
              </span>
            )}
          </span>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          {(d.weight_g ?? 0) > 0 && (
            <span style={{ fontSize:11.5, color:"#5a7a6e" }}>
              ~{Math.round(d.weight_g)}g
            </span>
          )}
          <span style={{
            background:"rgba(11,102,48,0.1)", color:"#0b6630",
            borderRadius:999, padding:"2px 9px",
            fontSize:12, fontWeight:700,
          }}>
            {Math.round(d.calories ?? 0)} kcal
          </span>
        </div>
      </div>
    ))}
  </div>
)}

              <div style={{ padding:"14px 18px 18px" }}>
                <button className="btn-glass" onClick={reset} style={{ width:"100%", justifyContent:"center", borderRadius:14 }}>
                  Scan another meal
                </button>
              </div>
            </div>

            {/* Right — calorie hero + daily summary + grade */}
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

              {/* Calorie hero */}
              <div className="glass-card anim-pop" style={{ animationDelay:"0.06s" }}>
                <div style={{ background:"linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%)", padding:"26px 28px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", right:-25, top:-25, width:140, height:140, borderRadius:"50%", background:"rgba(168,224,44,0.08)" }} />
                  <div style={{ position:"absolute", right:40, bottom:-40, width:100, height:100, borderRadius:"50%", background:"rgba(168,224,44,0.05)" }} />
                  <div style={{ position:"relative", zIndex:1 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:"rgba(255,255,255,0.5)", letterSpacing:1, textTransform:"uppercase", marginBottom:8 }}>Daily Intake</div>
                    <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:20 }}>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize: mob ? 60 : 72, fontWeight:700, color:"#a8e02c", lineHeight:1 }}>{result.calories}</span>
                      <span style={{ fontSize:18, fontWeight:600, color:"rgba(255,255,255,0.5)" }}>kcal</span>
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>
                      <span>Daily intake used</span>
                      <span style={{ color:"#a8e02c" }}>{dailyPct}% of {result.daily.total} kcal</span>
                    </div>
                    <div style={{ height:8, background:"rgba(255,255,255,0.1)", borderRadius:999, overflow:"hidden" }}>
                      <div style={{ height:"100%", width:`${Math.min(dailyPct, 100)}%`, background:"linear-gradient(90deg,#a8e02c,#f5e642)", borderRadius:999, boxShadow:"0 0 10px rgba(168,224,44,0.5)", transition:"width 1s ease" }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:6 }}>
                      <span>0 kcal</span><span>{result.daily.total} kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Daily summary */}
              <div className="glass-card anim-pop" style={{ animationDelay:"0.1s" }}>
                <div style={{ padding:"12px 18px 8px", fontSize:10.5, fontWeight:700, color:"#000", textTransform:"uppercase", letterSpacing:1 }}>Daily Summary</div>
                <table className="result-table">
                  <tbody>
                    <tr><td>This meal</td>  <td style={{ color:"#000" }}>{result.daily.cal} kcal</td></tr>
                    <tr><td>Daily goal</td> <td>{result.daily.total} kcal</td></tr>
                    <tr><td>Remaining</td>  <td style={{ color:"#000" }}>{Math.max(0, result.daily.total - result.daily.cal)} kcal</td></tr>
                    <tr><td>% Consumed</td> <td><span className="macro-badge" style={{ background:"rgba(184,162,0,0.1)", color:"#000" }}>{dailyPct}%</span></td></tr>
                  </tbody>
                </table>
              </div>

              {/* Health grade */}
              <div className="glass-card anim-pop" style={{ animationDelay:"0.14s" }}>
                <div style={{ padding:"18px 20px", display:"flex", alignItems:"center", gap:18 }}>
                  <div style={{ width:64, height:64, borderRadius:18, background:"rgba(11,102,48,0.1)", border:"1.5px solid rgba(168,224,44,0.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:36, fontWeight:700, color:result.gradeColor, lineHeight:1 }}>{result.grade}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#000", marginBottom:4 }}>Health Grade</div>
                    <div style={{ fontSize:13, color:"#000", lineHeight:1.6 }}>{gradeMessage(result.grade)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── How it works (idle only) ── */}
        {stage === "idle" && (
          <div className="anim-up-d1" style={{ marginTop:64 }}>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <span style={{ display:"inline-flex", alignItems:"center", gap:7, background:"rgba(168,224,44,0.1)", border:"1px solid rgba(168,224,44,0.3)", borderRadius:999, padding:"5px 16px 5px 10px", fontSize:12.5, fontWeight:700, color:"#000", marginBottom:16 }}>
                <span style={{ width:22, height:22, borderRadius:"50%", background:"#a8e02c", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#000" }}>✦</span>
                Simple 3-step process
              </span>
              <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize: mob ? "clamp(26px,7vw,40px)" : "clamp(30px,4vw,46px)", fontWeight:700, color:"#000", letterSpacing:-1.5, lineHeight:1.08 }}>
                How it <span style={{ color:"#0b6630" }}>works</span>
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 16 : 22 }}>
              {STEPS.map((s, i) => (
                <div key={s.num} className="step-card" style={{ animationDelay:`${i*0.08}s` }}>
                  <div style={{ position:"relative", height:200, overflow:"hidden" }}>
                    <img src={s.img} alt={s.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
                    <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom,rgba(26,51,41,0.2),rgba(26,51,41,0.55))" }} />
                    <div style={{ position:"absolute", top:14, left:14, background:"#0b6630", borderRadius:999, width:34, height:34, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, color:"#a8e02c" }}>{s.num}</div>
                  </div>
                  <div style={{ padding:"20px 22px 24px" }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:700, color:"#000", marginBottom:7 }}>{s.title}</div>
                    <div style={{ fontSize:13.5, color:"#000", lineHeight:1.7 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
