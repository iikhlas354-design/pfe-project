import { useState } from "react";

const MOODS = [
  { label: "Low",       sub: "Not great",    emoji: "😔" },
  { label: "Okay",      sub: "Manageable",   emoji: "😐" },
  { label: "Good",      sub: "Feeling fine", emoji: "🙂" },
  { label: "Great",     sub: "Doing well",   emoji: "😊" },
  { label: "Excellent", sub: "Best day",     emoji: "🌟" },
];

const SYMPTOMS_LIST = [
  "Fatigue", "Bloating", "Headache", "Brain Fog",
  "Poor Sleep", "Cravings", "Low Energy", "No Symptoms",
];

const MOOD_META = {
  Low:       { dot: "#c53030", tagBg: "rgba(197,48,48,0.1)",  tagColor: "#c53030" },
  Okay:      { dot: "#b8a200", tagBg: "rgba(184,162,0,0.12)", tagColor: "#8a7200" },
  Good:      { dot: "#0b6630", tagBg: "rgba(11,102,48,0.1)",  tagColor: "#0b6630" },
  Great:     { dot: "#0b6630", tagBg: "rgba(168,224,44,0.2)", tagColor: "#0b6630" },
  Excellent: { dot: "#1a6fa0", tagBg: "rgba(26,111,160,0.1)", tagColor: "#1a6fa0" },
};

const STORAGE_KEY = "chrysalis_mood_logs";
const loadLogs = () => { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; } };
const saveLogs = (l) => localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
const formatDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes toastIn  { from { opacity:0; transform:translate(-50%,20px); } to { opacity:1; transform:translate(-50%,0); } }
@keyframes toastOut { from { opacity:1; transform:translate(-50%,0); }   to { opacity:0; transform:translate(-50%,20px); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
.anim-up-d3 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.21s both; }
.toast-in   { animation: toastIn  0.3s ease both; }
.toast-out  { animation: toastOut 0.3s ease both; }

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

.sec-header {
  padding: 16px 22px 13px; border-bottom: 1px solid rgba(0,168,84,0.1);
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.15);
}

.mood-card {
  flex: 1; min-width: 90px; padding: 16px 10px; border-radius: 16px;
  border: 1.5px solid rgba(168,224,44,0.3); background: rgba(255,255,255,0.2);
  backdrop-filter: blur(8px); cursor: pointer; text-align: center;
  transition: all 0.22s cubic-bezier(0.4,0,0.2,1);
  font-family: 'Inter', sans-serif; position: relative; overflow: hidden;
}
.mood-card:hover { background: rgba(255,255,255,0.4); border-color: rgba(168,224,44,0.6); transform: translateY(-2px); box-shadow: 0 6px 20px rgba(15,89,47,0.12); }
.mood-card.selected { background: rgba(255,255,255,0.45); box-shadow: 0 4px 18px rgba(15,89,47,0.16); }
.mood-card.selected::before {
  content: ""; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, rgba(168,224,44,0.9), rgba(0,168,84,0.9));
  border-radius: 3px 3px 0 0;
}

.symptom-pill {
  padding: 8px 16px; border-radius: 999px; border: 1.5px solid rgba(0,168,84,0.25);
  font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;
  background: rgba(255,255,255,0.25); backdrop-filter: blur(6px);
  font-family: 'Inter', sans-serif; color: #1a3329;
}
.symptom-pill:hover { background: rgba(255,255,255,0.5); border-color: rgba(168,224,44,0.6); }
.symptom-pill.active { background: #0b6630; color: #a8e02c; border-color: transparent; box-shadow: 0 3px 12px rgba(11,102,48,0.25); }

.energy-slider {
  -webkit-appearance: none; appearance: none;
  width: 100%; height: 7px; border-radius: 999px;
  background: linear-gradient(90deg, rgba(26,111,160,0.3) 0%, rgba(168,224,44,0.5) 50%, rgba(0,168,84,0.7) 100%);
  outline: none; cursor: pointer;
}
.energy-slider::-webkit-slider-thumb {
  -webkit-appearance: none; width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,0.9); border: 2.5px solid #0b6630;
  box-shadow: 0 2px 10px rgba(11,102,48,0.25); cursor: pointer; transition: transform 0.2s;
}
.energy-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
.energy-slider::-moz-range-thumb {
  width: 22px; height: 22px; border-radius: 50%;
  background: rgba(255,255,255,0.9); border: 2.5px solid #0b6630;
  box-shadow: 0 2px 10px rgba(11,102,48,0.25); cursor: pointer;
}

.log-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 13px 22px; border-bottom: 1px solid rgba(0,168,84,0.07);
  transition: background 0.18s ease;
}
.log-row:hover { background: rgba(255,255,255,0.25); }
.log-row:last-child { border-bottom: none; }

.pf-btn-primary {
  background: #0b6630; color: #fff; border: none; border-radius: 20px;
  padding: 11px 22px; font-size: 13.5px; font-weight: 700; cursor: pointer;
  font-family: 'Inter', sans-serif; display: inline-flex; align-items: center; gap: 8px;
  transition: all 0.2s ease; box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.pf-btn-primary:hover { background: #0d7a38; }

.delete-btn {
  background: transparent; border: 1px solid transparent; border-radius: 9px;
  cursor: pointer; padding: 6px; color: #5a7a6e; line-height: 0; transition: all 0.2s ease; flex-shrink: 0;
}
.delete-btn:hover { background: rgba(229,62,62,0.1); border-color: rgba(229,62,62,0.2); color: #c0392b; }
`;

export default function MoodPage() {
  const [mood,     setMood]     = useState("Good");
  const [symptoms, setSymptoms] = useState([]);
  const [energy,   setEnergy]   = useState(7);
  const [logs,     setLogs]     = useState(loadLogs);
  const [toast,    setToast]    = useState(false);

  const toggleSymptom = (s) =>
    setSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    const entry = { id: Date.now(), date: new Date().toISOString(), mood, symptoms: [...symptoms], energy };
    const updated = [entry, ...logs].slice(0, 30);
    setLogs(updated); saveLogs(updated);
    setSymptoms([]); setEnergy(7); setMood("Good");
    setToast(true); setTimeout(() => setToast(false), 2500);
  };

  const SecHeader = ({ title, subtitle, accent }) => (
    <div className="sec-header">
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: accent || "#0b6630", flexShrink: 0 }} />
      <div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13.5, fontWeight: 800, color: "#1a3329" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "#5a7a6e", marginTop: 2, fontFamily: "'Inter',sans-serif" }}>{subtitle}</div>}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* Page heading */}
      <div className="anim-up" style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5, fontFamily: "'Inter',sans-serif" }}>
          Daily Check-in
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: "#1a3329", letterSpacing: -0.5 }}>
          Mood & Symptoms
        </div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 5, lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
          Log how you feel each day to help your nutritionist adjust your plan.
        </div>
      </div>

      {/* Mood selector */}
      <div className="glass-card anim-up-d1" style={{ marginBottom: 14 }}>
        <SecHeader title="How are you feeling today?" subtitle="Select your current mood" accent={MOOD_META[mood].dot} />
        <div style={{ padding: "18px 20px 22px" }}>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            {MOODS.map(m => {
              const meta = MOOD_META[m.label];
              const sel  = mood === m.label;
              return (
                <button key={m.label} className={`mood-card ${sel ? "selected" : ""}`}
                  style={{ borderColor: sel ? meta.dot : undefined, color: sel ? meta.dot : "#1a3329" }}
                  onClick={() => setMood(m.label)}>
                  <div style={{ fontSize: 26, marginBottom: 5 }}>{m.emoji}</div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontSize: 10.5, color: sel ? meta.dot : "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>{m.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Symptoms */}
      <div className="glass-card anim-up-d2" style={{ marginBottom: 14 }}>
        <SecHeader title="Any symptoms today?" subtitle="Select all that apply" accent="#b8a200" />
        <div style={{ padding: "18px 20px 22px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SYMPTOMS_LIST.map(s => (
              <button key={s} className={`symptom-pill ${symptoms.includes(s) ? "active" : ""}`}
                onClick={() => toggleSymptom(s)}>{s}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Energy + Save */}
      <div className="glass-card anim-up-d2" style={{ marginBottom: 14 }}>
        <SecHeader title="Energy Level" subtitle="How energetic do you feel?" accent="#1a6fa0" />
        <div style={{ padding: "18px 20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>Low</span>
            <div style={{
              fontFamily: "'Space Grotesk',sans-serif", fontSize: 30, fontWeight: 800, lineHeight: 1,
              color: energy >= 8 ? "#0b6630" : energy >= 5 ? "#b8a200" : "#c53030",
            }}>
              {energy}<span style={{ fontSize: 13, color: "#5a7a6e", marginLeft: 2, fontFamily: "'Inter',sans-serif" }}>/10</span>
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>High</span>
          </div>
          <input type="range" min="1" max="10" value={energy} className="energy-slider"
            onChange={e => setEnergy(Number(e.target.value))} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <span key={n} style={{
                fontSize: 10, fontWeight: 700, fontFamily: "'Inter',sans-serif",
                color: energy === n ? "#0b6630" : "rgba(0,168,84,0.25)", transition: "color 0.2s",
              }}>{n}</span>
            ))}
          </div>
          <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
            <button className="pf-btn-primary" onClick={handleSave}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Save Today's Log
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="glass-card anim-up-d3">
        <SecHeader title="Recent History" subtitle="Your last 7 entries" accent="#7a3fa0" />
        {logs.length === 0 ? (
          <div style={{ padding: "50px 24px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📝</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329", marginBottom: 5 }}>No logs yet</div>
            <div style={{ fontSize: 12.5, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>Start tracking your mood to see patterns over time.</div>
          </div>
        ) : (
          <div>
            {logs.slice(0, 7).map(log => {
              const meta = MOOD_META[log.mood] || MOOD_META.Good;
              return (
                <div key={log.id} className="log-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: 13, flexShrink: 0,
                      background: "rgba(255,255,255,0.4)", border: `1.5px solid ${meta.dot}30`,
                      backdropFilter: "blur(8px)",
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    }}>
                      <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, fontWeight: 800, color: meta.dot, textAlign: "center", lineHeight: 1.2 }}>
                        {formatDate(log.date)}
                      </span>
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                        <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13.5, fontWeight: 700, color: "#1a3329" }}>{log.mood}</span>
                        <span style={{
                          fontSize: 10.5, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
                          background: meta.tagBg, color: meta.tagColor, border: `1px solid ${meta.dot}20`,
                          fontFamily: "'Inter',sans-serif",
                        }}>Energy {log.energy}/10</span>
                      </div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {log.symptoms.length > 0
                          ? log.symptoms.map(s => (
                              <span key={s} style={{
                                fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
                                background: "rgba(255,255,255,0.5)", border: "1px solid rgba(0,168,84,0.15)",
                                color: "#5a7a6e", fontFamily: "'Inter',sans-serif",
                              }}>{s}</span>
                            ))
                          : <span style={{ fontSize: 11.5, color: "#5a7a6e", fontStyle: "italic", fontFamily: "'Inter',sans-serif" }}>No symptoms</span>
                        }
                      </div>
                    </div>
                  </div>
                  <button className="delete-btn" title="Delete entry"
                    onClick={() => { const u = logs.filter(l => l.id !== log.id); setLogs(u); saveLogs(u); }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4h6v2"/>
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-in" style={{
          position: "fixed", bottom: 28, left: "50%",
          background: "rgba(26,51,41,0.95)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(168,224,44,0.4)", color: "#a8e02c",
          padding: "13px 26px", borderRadius: 16,
          fontSize: 13.5, fontWeight: 700, fontFamily: "'Inter',sans-serif",
          zIndex: 999, boxShadow: "0 8px 32px rgba(26,51,41,0.35)",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#0b6630", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          Mood logged successfully!
        </div>
      )}
    </div>
  );
}