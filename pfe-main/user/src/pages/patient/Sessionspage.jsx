import { useEffect, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer   { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
@keyframes spin      { to { transform:rotate(360deg); } }
@keyframes dropIn    { from { opacity:0; transform:scale(0.96) translateY(-8px); } to { opacity:1; transform:scale(1) translateY(0); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }

/* ── Glass card ── */
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

/* ── Skeleton ── */
.ss-skeleton {
  height: 110px; border-radius: 20px; margin-bottom: 12px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}

/* ── Filter tabs ── */
.filter-tab {
  padding: 8px 16px; border-radius: 999px; border: 1.5px solid rgba(0,168,84,0.2);
  cursor: pointer; font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 700;
  background: rgba(255,255,255,0.2); backdrop-filter: blur(8px);
  color: #1a3329; transition: all 0.18s;
}
.filter-tab:hover { background: rgba(255,255,255,0.45); border-color: rgba(168,224,44,0.5); }
.filter-tab.active {
  background: #0b6630; color: #a8e02c; border-color: transparent;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}

/* ── Session row ── */
.session-row {
  display: flex; align-items: center; gap: 13px;
  border-radius: 16px; padding: 13px 15px;
  border: 1px solid rgba(0,168,84,0.1);
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
}
.session-row:hover {
  background: rgba(255,255,255,0.45);
  border-color: rgba(168,224,44,0.4);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(15,89,47,0.1);
}

/* ── Buttons ── */
.pf-btn {
  border-radius: 20px; padding: 8px 15px; font-size: 12px; font-weight: 700;
  cursor: pointer; font-family: 'Inter',sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
  border: none; transition: all 0.2s ease;
}
.pf-btn-primary {
  background: #0b6630; color: #a8e02c;
  box-shadow: 0 3px 12px rgba(11,102,48,0.28);
}
.pf-btn-primary:hover { background: #0d7a38; }
.pf-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.pf-btn-zoom {
  background: linear-gradient(135deg,#2d8cff,#0e71eb); color: #fff;
  box-shadow: 0 3px 12px rgba(45,140,255,0.25);
}
.pf-btn-zoom:hover { filter: brightness(1.08); }

/* ── Badge ── */
.ss-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 700;
}

/* ── Date / slot buttons ── */
.ss-date-btn {
  background: rgba(255,255,255,0.3); backdrop-filter: blur(6px);
  border: 1.5px solid rgba(0,168,84,0.2);
  border-radius: 12px; padding: 7px 12px;
  font-size: 12px; font-weight: 600; color: #1a3329;
  cursor: pointer; white-space: nowrap;
  font-family: 'Inter',sans-serif; transition: all 0.18s; flex-shrink: 0;
}
.ss-date-btn:hover { background: rgba(255,255,255,0.55); border-color: rgba(168,224,44,0.5); }
.ss-date-btn.active { background: #0b6630; color: #a8e02c; border-color: transparent; box-shadow: 0 3px 10px rgba(11,102,48,0.25); }

.ss-slot-btn {
  background: rgba(255,255,255,0.3); backdrop-filter: blur(6px);
  border: 1.5px solid rgba(0,168,84,0.18);
  border-radius: 12px; padding: 9px 8px;
  font-size: 12px; font-weight: 600; color: #1a3329;
  cursor: pointer; font-family: 'Inter',sans-serif;
  transition: all 0.18s; text-align: center;
}
.ss-slot-btn:hover:not(.booked):not(.active) { background: rgba(255,255,255,0.55); border-color: rgba(168,224,44,0.5); }
.ss-slot-btn.active { background: #0b6630; color: #a8e02c; border-color: transparent; box-shadow: 0 3px 10px rgba(11,102,48,0.25); }
.ss-slot-btn.booked { background: rgba(0,0,0,0.05); color: rgba(26,51,41,0.3); cursor: not-allowed; text-decoration: line-through; border-color: transparent; }

/* ── Modal overlay ── */
.ss-overlay {
  position: fixed; inset: 0;
  background: rgba(10,26,20,0.55);
  backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000; padding: 20px;
}
.ss-modal {
  width: 100%; max-width: 460px; max-height: 90vh; overflow-y: auto;
  border-radius: 24px; animation: dropIn 0.25s ease;
  background: rgba(240,252,245,0.85);
  backdrop-filter: blur(28px);
  border-top:    2px solid rgba(168,224,44,0.9);
  border-left:   2px solid rgba(168,224,44,0.9);
  border-bottom: 2px solid rgba(0,168,84,0.8);
  border-right:  2px solid rgba(0,168,84,0.8);
  box-shadow: 0 24px 60px rgba(15,89,47,0.25), inset 0 0 20px rgba(255,255,255,0.6);
}
.ss-modal::-webkit-scrollbar { width: 3px; }
.ss-modal::-webkit-scrollbar-thumb { background: rgba(0,168,84,0.25); border-radius: 99px; }
`;

/* ── helpers ── */
function getAvailableDates() {
  const dates = []; let d = new Date(); d.setDate(d.getDate() + 1);
  while (dates.length < 14) {
    if (d.getDay() !== 5) dates.push(new Date(d).toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function generateSlots(dateStr, bookedKeys = []) {
  if (new Date(dateStr).getDay() === 5) return [];
  const slots = [];
  for (let h = 8; h < 18; h++) {
    const label = `${String(h).padStart(2,"0")}:00 – ${String(h+1).padStart(2,"00")}:00`;
    const key   = `${dateStr}_${h}`;
    slots.push({ label, key, booked: bookedKeys.includes(key) });
  }
  return slots;
}

const fmtDate  = (iso) => !iso ? "—" : new Date(iso).toLocaleString("en-US", { weekday:"short", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
const fmtShort = (d)   => new Date(d).toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short" });

function StatusBadge({ status }) {
  const map = {
    SCHEDULED:        { bg: "rgba(26,111,160,0.12)",  color: "#1a6fa0", label: "📅 Scheduled"   },
    PENDING_SCHEDULE: { bg: "rgba(184,162,0,0.12)",   color: "#8a7200", label: "⏳ Book a Date"  },
    COMPLETED:        { bg: "rgba(11,102,48,0.12)",   color: "#0b6630", label: "✅ Completed"    },
    CANCELLED:        { bg: "rgba(192,57,43,0.12)",   color: "#c0392b", label: "❌ Cancelled"    },
  };
  const s = map[status] ?? { bg: "rgba(0,0,0,0.06)", color: "#666", label: status };
  return (
    <span className="ss-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}20` }}>
      {s.label}
    </span>
  );
}

/* ── Booking Modal ── */
function BookModal({ session, onClose, onBooked }) {
  const DATES = getAvailableDates();
  const [selDate,      setSelDate]      = useState(DATES[0]);
  const [selSlot,      setSelSlot]      = useState(null);
  const [bookedKeys,   setBookedKeys]   = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);

  useEffect(() => {
    if (!session?.nutritionId) return;
    setLoadingSlots(true);
    fetch(`http://localhost:5000/sessions/occupied/${session.nutritionId}?date=${selDate}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setBookedKeys(
        (data.occupiedSlots ?? []).map(s => {
          const d = new Date(s);
          return `${selDate}_${d.getHours()}`;
        })
      ))
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [session?.nutritionId, selDate]);

  const slots = generateSlots(selDate, bookedKeys);

  const handleBook = async () => {
    if (!selSlot) return;
    setSubmitting(true);
    const slotHour    = parseInt(selSlot.key.split("_")[1], 10);
    const sessionDate = new Date(`${selDate}T${String(slotHour).padStart(2,"0")}:00:00`).toISOString();
    try {
      const res  = await fetch(`http://localhost:5000/sessions/${session.id}/schedule`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to schedule");
      onBooked(data.session);
    } catch (err) { alert(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="ss-overlay" onClick={onClose}>
      <div className="ss-modal" onClick={e => e.stopPropagation()}>

        {/* Modal header */}
        <div style={{ padding: "22px 22px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329" }}>
                Book Session {session.sessionNumber}
              </div>
              <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 3 }}>
                {session.subscription?.offer?.name ?? "Package"}
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: "50%", border: "none", cursor: "pointer",
              background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(0,168,84,0.2)",
              color: "#1a3329", fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>✕</button>
          </div>

          {/* Nutritionist info */}
          <div style={{
            background: "rgba(255,255,255,0.4)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(0,168,84,0.15)",
            borderRadius: 12, padding: "10px 14px", marginBottom: 18,
            fontSize: 13, color: "#1a3329", fontWeight: 500,
          }}>
            👨‍⚕️ With: <strong>{session.nutrition?.firstName} {session.nutrition?.lastName}</strong>
          </div>
        </div>

        <div style={{ padding: "0 22px 22px" }}>

          {/* Date picker */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329", marginBottom: 10 }}>
              Select Date
            </div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
              {DATES.map(d => (
                <button key={d} className={`ss-date-btn ${selDate === d ? "active" : ""}`}
                  onClick={() => { setSelDate(d); setSelSlot(null); }}>
                  {fmtShort(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 800, color: "#1a3329" }}>Select Time</div>
              <div style={{ fontSize: 11, color: "#5a7a6e" }}>08:00 – 18:00 · No Fridays</div>
            </div>
            {loadingSlots ? (
              <div style={{ textAlign: "center", padding: "16px 0", color: "#5a7a6e", fontSize: 13 }}>
                Loading availability…
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 7 }}>
                {slots.map(slot => (
                  <button key={slot.key}
                    className={`ss-slot-btn ${slot.booked ? "booked" : ""} ${selSlot?.key === slot.key ? "active" : ""}`}
                    onClick={() => !slot.booked && setSelSlot(slot)}>
                    {slot.label}
                    {slot.booked && <span style={{ display: "block", fontSize: 10, marginTop: 2 }}>Booked</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected summary */}
          {selSlot && (
            <div style={{
              background: "rgba(11,102,48,0.1)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(0,168,84,0.25)",
              borderRadius: 12, padding: "11px 14px", marginBottom: 16,
              display: "flex", gap: 10, alignItems: "center",
            }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#1a3329" }}>
                {fmtShort(selDate)} · {selSlot.label}
              </div>
            </div>
          )}

          {/* Modal actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: "11px 0",
              border: "1.5px solid rgba(0,168,84,0.25)", borderRadius: 14,
              background: "rgba(255,255,255,0.35)", backdropFilter: "blur(8px)",
              fontSize: 13, fontWeight: 600, color: "#1a3329",
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
            }}>
              Cancel
            </button>
            <button
              className="pf-btn pf-btn-primary"
              onClick={handleBook}
              disabled={!selSlot || submitting}
              style={{ flex: 2, padding: "11px 0", justifyContent: "center", borderRadius: 14, fontSize: 13.5 }}
            >
              {submitting
                ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(168,224,44,0.3)", borderTopColor: "#a8e02c", borderRadius: "50%", animation: "spin .7s linear infinite", display: "inline-block" }} /> Booking…</>
                : "Confirm Session →"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SessionsPage() {
  const [sessions,       setSessions]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filter,         setFilter]         = useState("ALL");
  const [bookingSession, setBookingSession] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/sessions/mine", { credentials: "include" })
      .then(r => r.json())
      .then(data => setSessions(data.sessions ?? []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const handleBooked = (updated) => {
    setSessions(prev => prev.map(s => s.id === updated.id ? updated : s));
    setBookingSession(null);
  };

  const filtered = filter === "ALL" ? sessions : sessions.filter(s => s.status === filter);

  const counts = {
    ALL:              sessions.length,
    SCHEDULED:        sessions.filter(s => s.status === "SCHEDULED").length,
    PENDING_SCHEDULE: sessions.filter(s => s.status === "PENDING_SCHEDULE").length,
    COMPLETED:        sessions.filter(s => s.status === "COMPLETED").length,
  };

  const grouped = (() => {
    const map = {};
    for (const s of filtered) {
      const key = s.subscriptionId ?? "unknown";
      if (!map[key]) map[key] = { offer: s.subscription?.offer, nutrition: s.nutrition, sessions: [] };
      map[key].sessions.push(s);
    }
    for (const k of Object.keys(map))
      map[k].sessions.sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0));
    return Object.values(map);
  })();

  const SESSION_NUM_BG = {
    SCHEDULED:        "#0b6630",
    PENDING_SCHEDULE: "linear-gradient(135deg,#f5a623,#e08a00)",
    COMPLETED:        "linear-gradient(135deg,#1a6fa0,#2d8cff)",
    CANCELLED:        "linear-gradient(135deg,#c0392b,#e53e3e)",
  };

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* Page heading */}
      <div className="anim-up" style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5 }}>
          Appointments
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: "#1a3329", letterSpacing: -0.5 }}>
          My Sessions
        </div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 5, lineHeight: 1.6 }}>
          View your scheduled sessions and book pending ones.
        </div>
      </div>

      {/* Filter tabs */}
      <div className="anim-up-d1" style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "ALL",              label: "All"       },
          { key: "SCHEDULED",        label: "Scheduled" },
          { key: "PENDING_SCHEDULE", label: "To Book"   },
          { key: "COMPLETED",        label: "Completed" },
        ].map(tab => (
          <button
            key={tab.key}
            className={`filter-tab ${filter === tab.key ? "active" : ""}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            <span style={{
              marginLeft: 6,
              background: filter === tab.key ? "rgba(168,224,44,0.2)" : "rgba(255,255,255,0.4)",
              color: filter === tab.key ? "#a8e02c" : "#5a7a6e",
              borderRadius: 999, padding: "1px 7px", fontSize: 11,
            }}>{counts[tab.key]}</span>
          </button>
        ))}
      </div>

      {/* Pending banner */}
      {counts.PENDING_SCHEDULE > 0 && (
        <div className="anim-up-d1" style={{
          background: "rgba(184,162,0,0.1)", backdropFilter: "blur(10px)",
          border: "1px solid rgba(184,162,0,0.25)",
          borderRadius: 18, padding: "15px 20px",
          display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: "rgba(245,230,66,0.3)", border: "1px solid rgba(184,162,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>⏳</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#8a7200" }}>
              {counts.PENDING_SCHEDULE} session{counts.PENDING_SCHEDULE > 1 ? "s" : ""} waiting to be scheduled
            </div>
            <div style={{ fontSize: 12, color: "#b8a200", marginTop: 2 }}>
              Click "Book Now" on any pending session to pick a date and time.
            </div>
          </div>
        </div>
      )}

      {/* Skeletons */}
      {loading && [1,2,3].map(i => (
        <div key={i} className="ss-skeleton" style={{ animationDelay: `${i*0.1}s` }} />
      ))}

      {/* Empty state */}
      {!loading && grouped.length === 0 && (
        <div className="glass-card" style={{ textAlign: "center", padding: "50px 24px" }}>
          <div style={{ fontSize: 38, marginBottom: 12 }}>📅</div>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>
            No sessions found
          </div>
          <div style={{ fontSize: 13, color: "#5a7a6e" }}>
            {filter === "ALL"
              ? "Your sessions will appear here after you purchase a package."
              : `No ${filter.toLowerCase().replace("_", " ")} sessions.`}
          </div>
        </div>
      )}

      {/* Session groups */}
      {!loading && grouped.map(({ offer, nutrition, sessions: grpSessions }, gi) => (
        <div key={gi} className={`glass-card anim-up-d2`} style={{ animationDelay: `${gi*0.08}s`, marginBottom: 16 }}>

          {/* Package header */}
          <div style={{
            padding: "18px 22px 14px",
            borderBottom: "1px solid rgba(0,168,84,0.1)",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11, flexShrink: 0,
              background: "linear-gradient(135deg,#1a3329,#0b6630)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
            }}>📦</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#1a3329" }}>
                {offer?.name ?? "Package"}
              </div>
              <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 2 }}>
                with {nutrition?.firstName} {nutrition?.lastName}
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 999,
              background: "rgba(11,102,48,0.1)", color: "#0b6630",
              border: "1px solid rgba(0,168,84,0.2)",
            }}>
              {grpSessions.length} session{grpSessions.length > 1 ? "s" : ""}
            </span>
          </div>

          {/* Session rows */}
          <div style={{ padding: "10px 18px 18px", display: "flex", flexDirection: "column", gap: 9 }}>
            {grpSessions.map(s => (
              <div key={s.id} className="session-row">

                {/* Session number bubble */}
                <div style={{
                  width: 34, height: 34, borderRadius: "50%", flexShrink: 0,
                  background: SESSION_NUM_BG[s.status] || "#0b6630",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 800, color: "#fff",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}>
                  {s.sessionNumber ?? 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329", marginBottom: 3 }}>
                    Session {s.sessionNumber ?? 1}
                  </div>
                  <div style={{ fontSize: 12, color: "#5a7a6e", display: "flex", alignItems: "center", gap: 5 }}>
                    {s.sessionDate ? (
                      <>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                        {fmtDate(s.sessionDate)}
                      </>
                    ) : (
                      <span style={{ fontStyle: "italic", color: "#8a9a8e" }}>No date picked yet — click Book Now</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <StatusBadge status={s.status} />
                  {s.status === "SCHEDULED" && s.zoomLink && (
                    <button className="pf-btn pf-btn-zoom" onClick={() => window.open(s.zoomLink, "_blank")}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
                      Join Zoom
                    </button>
                  )}
                  {s.status === "PENDING_SCHEDULE" && (
                    <button className="pf-btn pf-btn-primary" onClick={() => setBookingSession(s)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                      Book Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Booking modal */}
      {bookingSession && (
        <BookModal
          session={bookingSession}
          onClose={() => setBookingSession(null)}
          onBooked={handleBooked}
        />
      )}
    </div>
  );
}