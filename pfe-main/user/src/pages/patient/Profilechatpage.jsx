import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes spin { to { transform: rotate(360deg); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.06s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.12s both; }

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

.notif-row {
  display: flex;
  align-items: flex-start;
  gap: 13px;
  padding: 14px 20px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.18s ease;
  border: 1px solid transparent;
}
.notif-row:hover { background: rgba(255,255,255,0.45); }
.notif-row.unread {
  background: rgba(255,255,255,0.32);
  border-color: rgba(168,224,44,0.3);
}

.notif-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 13px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  border: 1.5px solid rgba(0,168,84,0.2);
  background: rgba(255,255,255,0.4);
  backdrop-filter: blur(8px);
}

.notif-divider {
  height: 1px;
  background: rgba(0,168,84,0.08);
  margin: 0 20px;
}

.pf-btn {
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  transition: all 0.2s ease;
}
.pf-btn-primary {
  background: #0b6630;
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.pf-btn-primary:hover { background: #0d7a38; }
.pf-btn-ghost {
  background: rgba(255,255,255,0.4);
  color: #1a3329;
  border: 1.5px solid rgba(168,224,44,0.4);
  backdrop-filter: blur(8px);
}
.pf-btn-ghost:hover { background: rgba(255,255,255,0.7); }

.load-more-btn {
  width: 100%;
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  border-top: 1.5px solid rgba(168,224,44,0.5);
  border-left: 1.5px solid rgba(168,224,44,0.5);
  border-bottom: 1.5px solid rgba(0,168,84,0.4);
  border-right: 1.5px solid rgba(0,168,84,0.4);
  border-radius: 14px;
  padding: 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: #0b6630;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: all 0.2s;
}
.load-more-btn:hover { background: rgba(255,255,255,0.5); }

.shimmer-row {
  height: 76px;
  border-radius: 16px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.35) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.delete-btn {
  background: rgba(229,62,62,0.08);
  border: 1px solid rgba(229,62,62,0.15);
  cursor: pointer;
  color: #c0392b;
  padding: 6px;
  border-radius: 9px;
  line-height: 0;
  transition: all 0.2s;
  flex-shrink: 0;
}
.delete-btn:hover { background: rgba(229,62,62,0.18); }
`;

const PALETTES = [
  { dot: "#0b6630",  icon: "🌿", tagBg: "rgba(168,224,44,0.15)",  tagColor: "#0b6630"  },
  { dot: "#b8a200",  icon: "⭐", tagBg: "rgba(245,230,66,0.2)",   tagColor: "#8a7200"  },
  { dot: "#1a6fa0",  icon: "📋", tagBg: "rgba(26,111,160,0.12)",  tagColor: "#1a6fa0"  },
  { dot: "#7a3fa0",  icon: "💜", tagBg: "rgba(122,63,160,0.12)",  tagColor: "#7a3fa0"  },
  { dot: "#c2410c",  icon: "🔥", tagBg: "rgba(194,65,12,0.1)",    tagColor: "#c2410c"  },
];

const fmtTime = (iso) => {
  if (!iso) return "";
  const d    = new Date(iso);
  const diff = Date.now() - d;
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const ActionBtn = ({ url }) => {
  if (!url) return null;
  const isZoom = url.includes("zoom.us") || url.includes("zoom.com");
  const isPdf  = url.endsWith(".pdf") || url.includes(".pdf?");
  if (url.includes("/conversations/")) return null;
  const label = isZoom ? "🎥 Join Zoom" : isPdf ? "⬇ Download PDF" : null;
  if (!label) return null;
  return (
    <a
      href={url} target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "5px 12px",
        background: isZoom ? "#2d8cff" : "#0b6630",
        color: isZoom ? "#fff" : "#a8e02c",
        border: "none", borderRadius: 9,
        fontSize: 11, fontWeight: 700,
        cursor: "pointer", textDecoration: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
      }}
    >{label}</a>
  );
};

export default function ProfileNotifsPage() {
  const [notifs,       setNotifs]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/notifications`, { credentials: "include" });
      const data = await res.json();
      setNotifs((data.notifications ?? []).map(n => ({ ...n, url: n.url ?? n.link ?? null })));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH", credentials: "include" });
    setNotifs(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markOneRead = async (id) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotif = async (id) => {
    await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE", credentials: "include" });
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  const unread = notifs.filter(n => !n.isRead).length;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", minHeight: "100vh" }}>
      <style>{CSS}</style>

      {/* ── Page header ── */}
      <div className="anim-up" style={{ marginBottom: 22 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>
          Notifications
        </div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>
          Stay up to date with your plan and appointments.
        </div>
      </div>

      {/* ── Main card ── */}
      <div className="glass-card anim-up-d1">

        {/* Card header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px",
          borderBottom: "1px solid rgba(0,168,84,0.1)",
          background: "rgba(255,255,255,0.2)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: "linear-gradient(135deg,#1a3329,#0b6630)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
            }}>🔔</div>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>
                All Notifications
              </div>
              {unread > 0 && (
                <div style={{ fontSize: 11, color: "#5a7a6e", marginTop: 1 }}>
                  {unread} unread message{unread > 1 ? "s" : ""}
                </div>
              )}
            </div>
            {unread > 0 && (
              <span style={{
                background: "#0b6630", color: "#a8e02c",
                borderRadius: 999, padding: "2px 9px",
                fontSize: 10.5, fontWeight: 800, letterSpacing: 0.3,
              }}>{unread} new</span>
            )}
          </div>
          {unread > 0 && (
            <button className="pf-btn pf-btn-ghost" onClick={markAllRead}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              Mark all read
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "16px 20px" }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="shimmer-row" style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && notifs.length === 0 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "64px 24px", gap: 14 }}>
            <div style={{
              width: 74, height: 74, borderRadius: "50%",
              background: "rgba(255,255,255,0.4)",
              border: "1.5px solid rgba(168,224,44,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 32, backdropFilter: "blur(8px)",
              boxShadow: "0 4px 20px rgba(11,102,48,0.15)",
            }}>🔔</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329" }}>
              All caught up!
            </div>
            <p style={{ fontSize: 13, textAlign: "center", color: "#5a7a6e", margin: 0, lineHeight: 1.6 }}>
              No notifications yet. We'll let you know<br />when something happens.
            </p>
          </div>
        )}

        {/* Notification list */}
        {!loading && notifs.length > 0 && (
          <div style={{ padding: "10px 12px 12px" }}>
            {notifs.slice(0, visibleCount).map((n, idx) => {
              const pal = PALETTES[idx % PALETTES.length];
              return (
                <React.Fragment key={n.id}>
                  <div
                    className={`notif-row${!n.isRead ? " unread" : ""}`}
                    onClick={() => !n.isRead && markOneRead(n.id)}
                  >
                    {/* Icon */}
                    <div className="notif-icon-wrap">{pal.icon}</div>

                    {/* Body */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {n.title && (
                        <span style={{
                          display: "inline-block",
                          fontSize: 10.5, fontWeight: 700,
                          color: pal.tagColor,
                          background: pal.tagBg,
                          borderRadius: 999,
                          padding: "2px 9px",
                          marginBottom: 5,
                          border: `1px solid ${pal.dot}25`,
                        }}>{n.title}</span>
                      )}
                      <div style={{
                        fontSize: 13, color: "#1a3329", lineHeight: 1.55,
                        fontWeight: n.isRead ? 400 : 600,
                        wordBreak: "break-word", marginBottom: 8,
                      }}>{n.message}</div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                        <span style={{
                          fontSize: 11, color: "#5a7a6e",
                          background: "rgba(255,255,255,0.5)",
                          border: "1px solid rgba(0,168,84,0.12)",
                          borderRadius: 999, padding: "2px 9px",
                          fontWeight: 500, backdropFilter: "blur(4px)",
                        }}>🕐 {fmtTime(n.createdAt)}</span>
                        <ActionBtn url={n.url} />
                      </div>
                    </div>

                    {/* Right: unread dot + delete */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flexShrink: 0, paddingTop: 2 }}>
                      {!n.isRead && (
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%",
                          background: pal.dot,
                          boxShadow: `0 0 6px ${pal.dot}80`,
                        }} />
                      )}
                      <button
                        className="delete-btn"
                        onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}
                        title="Dismiss"
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {idx < Math.min(visibleCount, notifs.length) - 1 && (
                    <div className="notif-divider" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {!loading && notifs.length > visibleCount && (
          <div style={{ padding: "0 16px 16px" }}>
            <button className="load-more-btn" onClick={() => setVisibleCount(v => v + 4)}>
              Load more ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}