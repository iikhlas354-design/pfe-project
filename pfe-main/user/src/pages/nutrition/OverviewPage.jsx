import { useAuth } from "../../context/Authcontext";
import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000";

export default function OverviewPage() {
  const { user } = useAuth();

  const [stats,        setStats]        = useState({ patients: 0, plans: 0, sessions: 0, scheduled: 0 });
  const [sessions,     setSessions]     = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const [sessionsRes, plansRes, subsRes] = await Promise.all([
          fetch(`${API_URL}/sessions/mine`,              { credentials: "include" }),
          fetch(`${API_URL}/plans/mine`,                 { credentials: "include" }),
          fetch(`${API_URL}/subscriptions/nutrition`,    { credentials: "include" }),
        ]);

        const sessionsData = await sessionsRes.json();
        const plansData    = await plansRes.json();
        const subsData     = await subsRes.json();

        // ✅ correct field names from backend
        const sessionsArr = sessionsData.sessions       ?? [];
        const plansArr    = plansData.plans             ?? [];
        const subsArr     = subsData.subscriptions      ?? [];

        const today = new Date().toDateString();
        const todaySessions = sessionsArr.filter(s =>
          s.sessionDate && new Date(s.sessionDate).toDateString() === today
        );
        const scheduled = sessionsArr.filter(s => s.status === "SCHEDULED").length;

        setStats({
          patients: subsArr.length,
          plans:    plansArr.length,
          sessions: todaySessions.length,
          scheduled,
        });

        setSessions(sessionsArr
          .filter(s => s.status === "SCHEDULED")
          .sort((a, b) => new Date(a.sessionDate) - new Date(b.sessionDate))
          .slice(0, 5)
        );

      } catch (err) {
        console.error("❌ Overview error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  };

  const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("en-US", {
      weekday: "short", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 36, height: 36, border: "3px solid rgba(45,107,80,0.2)", borderTop: "3px solid #2d6b50", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const STATS = [
    { value: stats.patients, label: "Active Patients",   icon: "🧑‍⚕️", color: "#e8f5e9", accent: "#2d6b50" },
    { value: stats.plans,    label: "Diet Plans",        icon: "🥗",    color: "#e3f2fd", accent: "#1565c0" },
    { value: stats.scheduled,label: "Scheduled Sessions",icon: "📅",    color: "#fff8e1", accent: "#f57f17" },
    { value: stats.sessions, label: "Today's Sessions",  icon: "⚡",    color: "#f3e5f5", accent: "#7b1fa2" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        .ov-card { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* ── Hero Banner ── */}
      <div className="ov-card" style={{
        background: "linear-gradient(135deg,#1a3329 0%,#2d6b50 60%,#1a3329 100%)",
        borderRadius: 24, padding: "28px 32px", marginBottom: 20,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(245,230,66,0.05) 1.5px,transparent 1.5px)", backgroundSize: "24px 24px", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>{greeting()}</div>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 24, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(245,230,66,0.15)", border: "1px solid rgba(245,230,66,0.3)", borderRadius: 999, padding: "5px 14px", fontSize: 12.5, fontWeight: 600, color: "#f5e642" }}>
            📅 {stats.sessions} session{stats.sessions !== 1 ? "s" : ""} today
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,rgba(245,230,66,0.2),rgba(245,230,66,0.1))", border: "2px solid rgba(245,230,66,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#f5e642" }}>
          {`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase()}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {STATS.map((s, i) => (
          <div key={s.label} className="ov-card" style={{
            background: "#fff", borderRadius: 20, padding: "20px 18px",
            border: "1px solid rgba(79,158,122,0.1)",
            boxShadow: "0 2px 12px rgba(26,51,41,0.06)",
            animationDelay: `${i * 0.07}s`,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
              {s.icon}
            </div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#1a3329", lineHeight: 1, marginBottom: 4 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#9ab8ae" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Upcoming Sessions ── */}
      <div className="ov-card" style={{
        background: "#fff", borderRadius: 24, padding: "22px 24px",
        border: "1px solid rgba(79,158,122,0.1)",
        boxShadow: "0 2px 16px rgba(26,51,41,0.06)",
        animationDelay: "0.28s",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329" }}>
            Upcoming Sessions
          </div>
          <span style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700 }}>
            {stats.scheduled} scheduled
          </span>
        </div>

        {sessions.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 15, fontWeight: 700, color: "#1a3329", marginBottom: 4 }}>No upcoming sessions</div>
            <div style={{ fontSize: 13, color: "#9ab8ae" }}>Your scheduled sessions will appear here.</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {sessions.map((s, i) => {
              const name = s.patient
                ? `${s.patient.firstName ?? ""} ${s.patient.lastName ?? ""}`.trim()
                : "Unknown";
              const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
              const offerName = s.subscription?.offer?.name ?? "Session";

              return (
                <div key={s.id ?? i} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: "#f7fdf9", borderRadius: 14, padding: "12px 14px",
                  border: "1px solid rgba(79,158,122,0.1)",
                }}>
                  {/* Avatar */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    background: "linear-gradient(135deg,#1a3329,#2d6b50)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 800,
                    color: "rgba(245,230,66,0.85)",
                  }}>
                    {initials}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329", marginBottom: 2 }}>{name}</div>
                    <div style={{ fontSize: 12, color: "#5a7a6e" }}>{offerName} · Session {s.sessionNumber ?? 1}</div>
                  </div>

                  {/* Date */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#1a3329", marginBottom: 3 }}>
                      {fmtDate(s.sessionDate)}
                    </div>
                    {s.zoomLink && (
                      <a href={s.zoomLink} target="_blank" rel="noopener noreferrer" style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "3px 10px", background: "linear-gradient(135deg,#2d8cff,#0e71eb)",
                        color: "#fff", borderRadius: 8, fontSize: 11, fontWeight: 700,
                        textDecoration: "none",
                      }}>
                        🎥 Join
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}