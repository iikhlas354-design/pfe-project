import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes slideIn { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:translateX(0)} }

.pp-card {
  background:#fff; border-radius:20px; padding:20px;
  border:1px solid rgba(79,158,122,0.1);
  box-shadow:0 2px 12px rgba(26,51,41,0.06);
  animation:fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both;
  transition:box-shadow 0.2s,transform 0.2s;
  cursor:pointer;
}
.pp-card:hover { box-shadow:0 8px 28px rgba(26,51,41,0.12); transform:translateY(-3px); }

.pp-skeleton {
  height:140px; border-radius:16px;
  background:linear-gradient(90deg,#f0f7f3 25%,#e0ede8 50%,#f0f7f3 75%);
  background-size:200% 100%; animation:shimmer 1.4s infinite;
}

.pp-btn {
  flex:1; padding:9px 0; border-radius:10px; font-size:12.5px;
  font-weight:700; cursor:pointer; font-family:'DM Sans',sans-serif;
  border:none; transition:all 0.18s;
}
.pp-btn:hover { filter:brightness(0.95); transform:translateY(-1px); }

.pp-overlay {
  position:fixed; inset:0; background:rgba(10,26,20,0.6);
  backdrop-filter:blur(6px); z-index:1000;
  display:flex; align-items:center; justify-content:center;
  padding:20px; animation:fadeIn 0.2s ease;
}

.pp-modal {
  background:#fff; border-radius:28px; width:100%;
  max-width:620px; max-height:90vh; overflow-y:auto;
  box-shadow:0 24px 60px rgba(0,0,0,0.22);
  animation:slideIn 0.3s cubic-bezier(0.22,1,0.36,1);
}
.pp-modal::-webkit-scrollbar { width:4px; }
.pp-modal::-webkit-scrollbar-thumb { background:#daeee5; border-radius:10px; }

.pp-note-input {
  width:100%; border:1.5px solid rgba(79,158,122,0.2);
  border-radius:12px; padding:12px 14px;
  font-size:13px; font-family:'DM Sans',sans-serif;
  color:#1a3329; background:#f7fdf9; outline:none;
  resize:vertical; min-height:90px; transition:all 0.2s;
  box-sizing:border-box;
}
.pp-note-input:focus {
  border-color:#2d6b50;
  box-shadow:0 0 0 3px rgba(45,107,80,0.1);
  background:#fff;
}
`;

function Avatar({ user, size = 44, radius = 12 }) {
  const [err, setErr] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  if (!user?.image || err) {
    return (
      <div style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: "linear-gradient(135deg,#1a3329,#2d6b50)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Syne',sans-serif", fontSize: size * 0.32, fontWeight: 800,
        color: "rgba(245,230,66,0.85)",
      }}>
        {initials}
      </div>
    );
  }
  return <img src={user.image} alt={initials} onError={() => setErr(true)}
    style={{ width: size, height: size, borderRadius: radius, objectFit: "cover", flexShrink: 0 }} />;
}

function StatusBadge({ status }) {
  const map = {
    ACTIVE:    { bg: "#e8f5e9", color: "#2d6b50", label: "Active"    },
    PENDING:   { bg: "#fff8e1", color: "#b8a200", label: "Pending"   },
    CANCELLED: { bg: "#fff5f5", color: "#c53030", label: "Cancelled" },
  };
  const s = map[status] ?? { bg: "#f0f7f3", color: "#5a7a6e", label: status };
  return (
    <span style={{ fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Patient Profile Modal ──────────────────────────────────────────────────
function PatientModal({ sub, onClose, navigate }) {
  const patient     = sub.patient;
  const offer       = sub.offer;
  const sessions    = sub.sessions ?? [];
  const fullName    = `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`.trim();

  const [userPlan,  setUserPlan]  = useState(null);
  const [notes,     setNotes]     = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [saving,    setSaving]    = useState(false);
  const [noteMsg,   setNoteMsg]   = useState("");

  // Load patient's plan
  useEffect(() => {
    if (!patient?.id) return;
    // We can't directly fetch another user's plan from nutrition side
    // So we use session data to show plan progress
  }, [patient?.id]);

  // Load saved note from localStorage (simple persistence)
  useEffect(() => {
    const key = `note_${patient?.id}`;
    const saved = localStorage.getItem(key) ?? "";
    setNotes(saved);
    setSavedNote(saved);
  }, [patient?.id]);

  const saveNote = () => {
    setSaving(true);
    const key = `note_${patient?.id}`;
    localStorage.setItem(key, notes);
    setSavedNote(notes);
    setTimeout(() => {
      setSaving(false);
      setNoteMsg("Note saved!");
      setTimeout(() => setNoteMsg(""), 2000);
    }, 400);
  };

  const profile = patient?.profile;

  // Calculate plan day
  const planStartDate = sub.startDate ? new Date(sub.startDate) : null;
  const today         = new Date();
  const planDay       = planStartDate
    ? Math.max(1, Math.floor((today - planStartDate) / (1000 * 60 * 60 * 24)) + 1)
    : null;
  const totalDays     = offer?.durationDays ?? null;
  const planPct       = planDay && totalDays
    ? Math.min(100, Math.round((planDay / totalDays) * 100))
    : null;

  const scheduledSessions = sessions.filter(s => s.status === "SCHEDULED").length;
  const completedSessions = sessions.filter(s => s.status === "COMPLETED").length;

  return (
    <div className="pp-overlay" onClick={onClose}>
      <div className="pp-modal" onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", borderRadius: "28px 28px 0 0", padding: "28px 28px 24px", position: "relative" }}>
          <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", cursor: "pointer", color: "#fff", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Avatar user={patient} size={64} radius={18} />
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{fullName}</div>
              <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>{patient?.email}</div>
              <StatusBadge status={sub.status} />
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>

          {/* ── Plan Progress ── */}
          {offer && (
            <div style={{ background: "#f7fdf9", borderRadius: 16, padding: "16px 18px", border: "1px solid rgba(79,158,122,0.12)" }}>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12 }}>
                📋 Plan Progress
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{offer.name}</div>
                  <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 2 }}>
                    Started {fmtDate(sub.startDate)} · Ends {fmtDate(sub.endDate)}
                  </div>
                </div>
                {planDay && totalDays && (
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#2d6b50" }}>Day {planDay}</div>
                    <div style={{ fontSize: 11, color: "#9ab8ae" }}>of {totalDays} days</div>
                  </div>
                )}
              </div>
              {planPct !== null && (
                <>
                  <div style={{ height: 8, background: "#e0ede8", borderRadius: 999, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", width: `${planPct}%`, background: "linear-gradient(90deg,#3d9b73,#f5e642)", borderRadius: 999, transition: "width 0.8s ease" }} />
                  </div>
                  <div style={{ fontSize: 11.5, color: "#5a7a6e", fontWeight: 600 }}>{planPct}% complete</div>
                </>
              )}
            </div>
          )}

          {/* ── Health Profile ── */}
          {profile && (
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12 }}>
                🏥 Health Profile
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { label: "Weight", val: profile.weight ? `${profile.weight} kg` : "—", icon: "⚖️" },
                  { label: "Height", val: profile.height ? `${profile.height} cm` : "—", icon: "📏" },
                  { label: "Goal",   val: profile.goal   || "—",                          icon: "🎯" },
                  { label: "Activity", val: profile.activityLevel || "—",                 icon: "🏃" },
                  { label: "Gender",   val: profile.gender        || "—",                 icon: "👤" },
                  { label: "Allergies", val: (profile.allergies ?? []).join(", ") || "None", icon: "⚠️" },
                ].map(item => (
                  <div key={item.label} style={{ background: "#f7fdf9", borderRadius: 12, padding: "10px 12px", border: "1px solid rgba(79,158,122,0.08)" }}>
                    <div style={{ fontSize: 10, color: "#9ab8ae", fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>{item.icon} {item.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sessions Summary ── */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12 }}>
              📅 Sessions
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {[
                { label: "Total",     val: sessions.length,     color: "#1a3329", bg: "#f7fdf9" },
                { label: "Scheduled", val: scheduledSessions,   color: "#1565c0", bg: "#e3f2fd" },
                { label: "Completed", val: completedSessions,   color: "#2d6b50", bg: "#e8f5e9" },
              ].map(item => (
                <div key={item.label} style={{ background: item.bg, borderRadius: 12, padding: "12px", textAlign: "center", border: "1px solid rgba(79,158,122,0.08)" }}>
                  <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: item.color, lineHeight: 1, marginBottom: 4 }}>{item.val}</div>
                  <div style={{ fontSize: 11, color: "#5a7a6e", fontWeight: 600 }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Nutritionist Notes ── */}
          <div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 12 }}>
              📝 My Notes
            </div>
            <textarea
              className="pp-note-input"
              placeholder={`Add private notes about ${patient?.firstName}…`}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
              <button
                onClick={saveNote}
                disabled={saving || notes === savedNote}
                style={{
                  background: notes === savedNote ? "#f0f7f3" : "linear-gradient(135deg,#1a3329,#2d6b50)",
                  color: notes === savedNote ? "#9ab8ae" : "#f5e642",
                  border: "none", borderRadius: 10, padding: "9px 20px",
                  fontSize: 13, fontWeight: 700, cursor: notes === savedNote ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                }}
              >
                {saving ? "Saving…" : "Save Note"}
              </button>
              {noteMsg && (
                <span style={{ fontSize: 12.5, color: "#2d6b50", fontWeight: 600 }}>✓ {noteMsg}</span>
              )}
            </div>
          </div>

          {/* ── Action Buttons ── */}
          <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
            <button
              onClick={() => { onClose(); navigate("/resume/consultations"); }}
              style={{ flex: 1, padding: "11px 0", background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              📅 View Sessions
            </button>
            <button
              onClick={() => { onClose(); navigate("/resume/chat"); }}
              style={{ flex: 1, padding: "11px 0", background: "#f0f7f4", color: "#2d6b50", border: "1px solid rgba(79,158,122,0.2)", borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
            >
              💬 Message
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PatientsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/subscriptions/nutrition`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setSubscriptions(data.subscriptions ?? []))
      .catch(() => setSubscriptions([]))
      .finally(() => setLoading(false));
  }, []);

  // Keep ALL subscriptions per patient (for sessions count)
  // but show each patient only once
  const patientMap = {};
  for (const sub of subscriptions) {
    const pid = sub.patient?.id;
    if (!pid) continue;
    if (!patientMap[pid]) {
      patientMap[pid] = { ...sub, sessions: sub.sessions ?? [] };
    } else {
      // Merge sessions from multiple subs
      patientMap[pid].sessions = [
        ...patientMap[pid].sessions,
        ...(sub.sessions ?? []),
      ];
    }
  }
  const patients = Object.values(patientMap);

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>
          Patients
        </div>
        <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 4 }}>
          {patients.length > 0 ? `${patients.length} patient${patients.length > 1 ? "s" : ""} — click to view profile` : "All your active and past patients"}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[1,2,3,4].map(i => <div key={i} className="pp-skeleton" style={{ animationDelay: `${i*0.1}s` }} />)}
        </div>
      )}

      {/* Empty */}
      {!loading && patients.length === 0 && (
        <div style={{ background: "#fff", borderRadius: 20, padding: "50px 20px", textAlign: "center", border: "1px solid rgba(79,158,122,0.1)" }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🧑‍⚕️</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>No patients yet</div>
          <div style={{ fontSize: 13, color: "#9ab8ae" }}>Your patients will appear here once they subscribe.</div>
        </div>
      )}

      {/* Grid */}
      {!loading && patients.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {patients.map((sub, i) => {
            const patient  = sub.patient;
            const offer    = sub.offer;
            const fullName = `${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`.trim() || "Unknown";

            // Calculate plan day
            const planStartDate = sub.startDate ? new Date(sub.startDate) : null;
            const today         = new Date();
            const planDay       = planStartDate
              ? Math.max(1, Math.floor((today - planStartDate) / (1000*60*60*24)) + 1)
              : null;
            const totalDays = offer?.durationDays ?? null;
            const planPct   = planDay && totalDays
              ? Math.min(100, Math.round((planDay / totalDays) * 100))
              : null;

            const hasNote = !!localStorage.getItem(`note_${patient?.id}`);

            return (
              <div
                key={patient?.id ?? i}
                className="pp-card"
                style={{ animationDelay: `${i * 0.07}s` }}
                onClick={() => setSelected(sub)}
              >
                {/* Top row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <Avatar user={patient} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {fullName}
                    </div>
                    <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {patient?.email}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                    <StatusBadge status={sub.status} />
                    {hasNote && <span style={{ fontSize: 9.5, color: "#2d6b50", fontWeight: 700, background: "#e8f5e9", borderRadius: 999, padding: "1px 7px" }}>📝 Note</span>}
                  </div>
                </div>

                {/* Offer info */}
                {offer && (
                  <div style={{ background: "#f7fdf9", borderRadius: 10, padding: "8px 12px", marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#2d6b50" }}>{offer.name}</div>
                      <div style={{ fontSize: 10.5, color: "#9ab8ae", marginTop: 1 }}>{offer.type} · {offer.durationDays}d</div>
                    </div>
                    {planDay && totalDays && (
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>Day {planDay}</div>
                        <div style={{ fontSize: 10, color: "#9ab8ae" }}>of {totalDays}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Plan progress bar */}
                {planPct !== null && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10.5, color: "#9ab8ae", fontWeight: 600 }}>Plan progress</span>
                      <span style={{ fontSize: 10.5, color: "#2d6b50", fontWeight: 700 }}>{planPct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#e0ede8", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${planPct}%`, background: "linear-gradient(90deg,#3d9b73,#f5e642)", borderRadius: 999, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                )}

                {/* Sessions count */}
                {sub.sessions?.length > 0 && (
                  <div style={{ fontSize: 11.5, color: "#5a7a6e", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
                    📅 <strong>{sub.sessions.length}</strong> session{sub.sessions.length > 1 ? "s" : ""}
                    {sub.sessions.filter(s => s.status === "COMPLETED").length > 0 && (
                      <span style={{ color: "#2d6b50", marginLeft: 4 }}>
                        · ✅ {sub.sessions.filter(s => s.status === "COMPLETED").length} completed
                      </span>
                    )}
                  </div>
                )}

                {/* Click hint */}
                <div style={{ fontSize: 11, color: "#9ab8ae", textAlign: "center", marginTop: 4, paddingTop: 10, borderTop: "1px solid rgba(79,158,122,0.08)" }}>
                  Click to view full profile →
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Patient Modal */}
      {selected && (
        <PatientModal
          sub={selected}
          onClose={() => setSelected(null)}
          navigate={navigate}
        />
      )}
    </>
  );
}