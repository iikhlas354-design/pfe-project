import { useEffect, useState } from "react";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp {
  from { opacity:0; transform:translateY(24px) }
  to   { opacity:1; transform:translateY(0) }
}
@keyframes shimmer {
  0%   { background-position: 200% 0 }
  100% { background-position: -200% 0 }
}

.cs-card {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(26,51,41,0.06);
  border: 1px solid rgba(79,158,122,0.1);
  animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  margin-bottom: 12px;
}

.cs-skeleton {
  height: 100px;
  border-radius: 16px;
  background: linear-gradient(90deg,#f0f7f3 25%,#e0ede8 50%,#f0f7f3 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  margin-bottom: 12px;
}

.cs-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
`;

const statusColor = (status) => {
  switch (status) {
    case "COMPLETED":        return { bg: "#e8f5e9", color: "#2d6b50" };
    case "SCHEDULED":        return { bg: "#e3f2fd", color: "#1565c0" };
    case "CANCELLED":        return { bg: "#fdecea", color: "#c62828" };
    case "PENDING_SCHEDULE": return { bg: "#fff8e1", color: "#f57f17" };
    default:                 return { bg: "#f5f5f5", color: "#666"    };
  }
};

const statusLabel = (status) => {
  switch (status) {
    case "PENDING_SCHEDULE": return "⏳ Awaiting Date";
    case "SCHEDULED":        return "📅 Scheduled";
    case "COMPLETED":        return "✅ Completed";
    case "CANCELLED":        return "❌ Cancelled";
    default:                 return status;
  }
};

function groupByPatient(sessions) {
  const map = {};
  for (const s of sessions) {
    const pid = s.patient?.id ?? "unknown";
    if (!map[pid]) map[pid] = { patient: s.patient, offer: s.subscription?.offer, sessions: [] };
    map[pid].sessions.push(s);
  }
  for (const pid of Object.keys(map)) {
    map[pid].sessions.sort((a, b) => (a.sessionNumber ?? 0) - (b.sessionNumber ?? 0));
  }
  return Object.values(map);
}

export default function ConsultationsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("ALL");

  useEffect(() => {
    fetch("http://localhost:5000/sessions/mine", { credentials: "include" })
      .then(res => res.json())
      .then(data => setSessions(data.sessions ?? []))
      .catch(err => { console.error("❌ Consultations error:", err); setSessions([]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL"
    ? sessions
    : sessions.filter(s => s.status === filter);

  const grouped = groupByPatient(filtered);

  const counts = {
    ALL:              sessions.length,
    SCHEDULED:        sessions.filter(s => s.status === "SCHEDULED").length,
    PENDING_SCHEDULE: sessions.filter(s => s.status === "PENDING_SCHEDULE").length,
    COMPLETED:        sessions.filter(s => s.status === "COMPLETED").length,
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>
          Consultations
        </div>
        <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 4 }}>
          Your scheduled and past sessions
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { key: "ALL",              label: "All"           },
          { key: "SCHEDULED",        label: "Scheduled"     },
          { key: "PENDING_SCHEDULE", label: "Awaiting Date" },
          { key: "COMPLETED",        label: "Completed"     },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)} style={{
            padding: "7px 14px", borderRadius: 999, border: "none", cursor: "pointer",
            fontFamily: "'DM Sans',sans-serif", fontSize: 12.5, fontWeight: 700,
            background: filter === tab.key ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "#f0f7f3",
            color: filter === tab.key ? "#f5e642" : "#5a7a6e",
            transition: "all 0.18s",
          }}>
            {tab.label}
            <span style={{
              marginLeft: 6,
              background: filter === tab.key ? "rgba(245,230,66,0.25)" : "#e0ede8",
              color: filter === tab.key ? "#f5e642" : "#5a7a6e",
              borderRadius: 999, padding: "1px 7px", fontSize: 11,
            }}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && [1, 2, 3].map(i => (
        <div key={i} className="cs-skeleton" style={{ animationDelay: `${i * 0.1}s` }} />
      ))}

      {/* Empty */}
      {!loading && grouped.length === 0 && (
        <div className="cs-card">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>
              No consultations yet
            </div>
            <div style={{ fontSize: 13, color: "#9ab8ae" }}>
              Your sessions will appear here once patients book a package.
            </div>
          </div>
        </div>
      )}

      {/* Patient groups */}
      {!loading && grouped.map(({ patient, offer, sessions: patSessions }, gi) => (
        <div key={patient?.id ?? gi} className="cs-card" style={{ animationDelay: `${gi * 0.07}s` }}>

          {/* Patient header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg,#1a3329,#2d6b50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Syne,sans-serif", fontSize: 13, fontWeight: 800,
                color: "rgba(245,230,66,0.8)",
              }}>
                {`${patient?.firstName?.[0] ?? ""}${patient?.lastName?.[0] ?? ""}`.toUpperCase() || "?"}
              </div>
              <div>
                <div style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>
                  {patient?.firstName} {patient?.lastName}
                </div>
                <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 1 }}>
                  {patient?.email}
                </div>
              </div>
            </div>
            {offer && (
              <div style={{ background: "#e8f5ef", borderRadius: 10, padding: "6px 12px", textAlign: "right" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#2d6b50" }}>{offer.name}</div>
                <div style={{ fontSize: 10.5, color: "#5a7a6e", marginTop: 1 }}>
                  {offer.sessionsCount} session{offer.sessionsCount > 1 ? "s" : ""}
                </div>
              </div>
            )}
          </div>

          <div style={{ height: 1, background: "rgba(79,158,122,0.1)", marginBottom: 14 }} />

          {/* Sessions */}
          {patSessions.map(s => {
            const { bg, color } = statusColor(s.status);
            return (
              <div key={s.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                background: s.status === "PENDING_SCHEDULE" ? "#fffbeb" : "#f7fdf9",
                borderRadius: 12, padding: "12px 14px", marginBottom: 8,
                border: `1px solid ${s.status === "PENDING_SCHEDULE" ? "rgba(245,166,35,0.2)" : "rgba(79,158,122,0.1)"}`,
              }}>
                {/* Number bubble */}
                <div style={{
                  width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                  background: s.status === "PENDING_SCHEDULE"
                    ? "linear-gradient(135deg,#f5a623,#e08a00)"
                    : "linear-gradient(135deg,#1a3329,#2d6b50)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "Syne,sans-serif", fontSize: 12, fontWeight: 800, color: "#fff",
                }}>
                  {s.sessionNumber ?? 1}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329", marginBottom: 2 }}>
                    Session {s.sessionNumber ?? 1}
                  </div>
                  <div style={{ fontSize: 12, color: "#5a7a6e" }}>
                    {s.sessionDate
                      ? new Date(s.sessionDate).toLocaleString("en-US", {
                          weekday: "short", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "⏳ Patient hasn't picked a date yet"
                    }
                  </div>
                </div>

                {/* Status + Zoom */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span className="cs-badge" style={{ background: bg, color }}>
                    {statusLabel(s.status)}
                  </span>
                  {s.zoomLink && s.status === "SCHEDULED" && (
                    <a href={s.zoomLink} target="_blank" rel="noopener noreferrer" style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      padding: "6px 12px",
                      background: "linear-gradient(135deg,#2d8cff,#0e71eb)",
                      color: "#fff", borderRadius: 10,
                      fontSize: 12, fontWeight: 700,
                      textDecoration: "none",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>
                      🎥 Join Zoom
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </>
  );
}