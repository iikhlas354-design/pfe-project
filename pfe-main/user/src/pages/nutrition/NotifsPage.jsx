import React, { useState, useEffect, useCallback } from "react";

const API_URL = "http://localhost:5000";

const fmtTime = (iso) => {
  if (!iso) return "";
  const d    = new Date(iso);
  const diff = Date.now() - d;
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const getNotifStyle = (idx) => {
  const palettes = [
    { bg: "linear-gradient(135deg,#e8f5e9,#f0fdf4)", dot: "#2d6b50", accent: "#2d6b50", icon: "🌿" },
    { bg: "linear-gradient(135deg,#fefce8,#fdf6c0)", dot: "#b8a200", accent: "#b8a200", icon: "⭐" },
    { bg: "linear-gradient(135deg,#eff6ff,#dbeafe)", dot: "#1a6fa0", accent: "#1a6fa0", icon: "📋" },
    { bg: "linear-gradient(135deg,#fdf4ff,#f3e8ff)", dot: "#7a3fa0", accent: "#7a3fa0", icon: "💜" },
    { bg: "linear-gradient(135deg,#fff7ed,#ffedd5)", dot: "#c2410c", accent: "#c2410c", icon: "🔥" },
  ];
  return palettes[idx % palettes.length];
};

const ActionBtn = ({ url }) => {
  if (!url) return null;
  const isZoom         = url.includes("zoom.us") || url.includes("zoom.com");
  const isConversation = url.includes("/conversations/");
  const isPdf          = url.endsWith(".pdf") || url.includes(".pdf?");
  if (isConversation) return null;
  if (isZoom) return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", background:"linear-gradient(135deg,#2d8cff,#0e71eb)", color:"#fff", border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", textDecoration:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
      🎥 Join Zoom
    </a>
  );
  if (isPdf) return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"5px 12px", background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", border:"none", borderRadius:8, fontSize:11, fontWeight:700, cursor:"pointer", textDecoration:"none", boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
      ⬇ Download PDF
    </a>
  );
  return null;
};

export default function NutritionNotifsPage() {
  const [notifs,       setNotifs]       = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [visibleCount, setVisibleCount] = useState(6);

  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/notifications`, { credentials: "include" });
      const data = await res.json();
      const normalized = (data.notifications ?? []).map((n) => ({
        ...n,
        url: n.url ?? n.link ?? null,
      }));
      setNotifs(normalized);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  // Refetch on tab focus
  useEffect(() => {
    const handleFocus = () => fetchNotifs();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchNotifs]);

  // Poll every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  const markAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method: "PATCH", credentials: "include" });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markOneRead = async (id) => {
    await fetch(`${API_URL}/notifications/${id}/read`, { method: "PATCH", credentials: "include" });
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotif = async (id) => {
    await fetch(`${API_URL}/notifications/${id}`, { method: "DELETE", credentials: "include" });
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>
          Notifications
        </div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4 }}>
          Stay up to date with your patients and sessions.
        </div>
      </div>

      {/* Card */}
      <div style={{ background:"#fff", borderRadius:20, border:"1px solid rgba(79,158,122,0.1)", boxShadow:"0 2px 16px rgba(26,51,41,0.07)", overflow:"hidden", animation:"fadeUp 0.4s ease both" }}>

        {/* Toolbar */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"linear-gradient(135deg,#f7fdf9,#edf7f2)", borderBottom:"1px solid rgba(79,158,122,0.12)" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:16 }}>🔔</span>
            <span style={{ fontFamily:"'Syne',sans-serif", fontSize:14, fontWeight:700, color:"#1a3329" }}>All Notifications</span>
            {unread > 0 && (
              <span style={{ background:"linear-gradient(135deg,#1a3329,#2d6b50)", color:"#f5e642", borderRadius:999, padding:"2px 8px", fontSize:10.5, fontWeight:800 }}>
                {unread} new
              </span>
            )}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={fetchNotifs} style={{ background:"transparent", border:"1px solid rgba(79,158,122,0.25)", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, color:"#2d6b50", fontFamily:"'DM Sans',sans-serif", padding:"6px 12px" }}>
              🔄 Refresh
            </button>
            {unread > 0 && (
              <button onClick={markAllRead} style={{ background:"linear-gradient(135deg,#e8f5e9,#c8edd0)", border:"1px solid rgba(45,107,80,0.2)", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600, color:"#2d6b50", fontFamily:"'DM Sans',sans-serif", padding:"6px 12px" }}>
                ✓ Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display:"flex", flexDirection:"column", gap:2, padding:"8px 0" }}>
            {[1,2,3].map((i) => (
              <div key={i} style={{ height:80, margin:"0 16px", borderRadius:12, background:"linear-gradient(90deg,#f0f7f3 25%,#e0ede8 50%,#f0f7f3 75%)", backgroundSize:"200% 100%", animation:"shimmer 1.4s infinite", animationDelay:`${i * 0.1}s` }} />
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && notifs.length === 0 && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"60px 20px", gap:12 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:"linear-gradient(135deg,#e8f5e9,#c8edd0)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:32 }}>🔔</div>
            <div style={{ fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800, color:"#1a3329" }}>All caught up!</div>
            <p style={{ fontSize:13, textAlign:"center", color:"#5a7a6e", margin:0 }}>No notifications yet.</p>
          </div>
        )}

        {/* List */}
        {!loading && notifs.length > 0 && (
          <div style={{ display:"flex", flexDirection:"column", padding:"8px 16px 16px" }}>
            {notifs.slice(0, visibleCount).map((n, idx) => {
              const palette = getNotifStyle(idx);
              return (
                <div key={n.id}>
                  <div
                    onClick={() => !n.isRead && markOneRead(n.id)}
                    style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 12px", borderRadius:14, cursor:"pointer", transition:"all 0.18s", background: n.isRead ? "transparent" : palette.bg, border:`1px solid ${n.isRead ? "transparent" : `${palette.dot}20`}`, marginBottom:4 }}
                  >
                    {/* Icon */}
                    <div style={{ width:40, height:40, borderRadius:12, flexShrink:0, background: n.isRead ? "#f0f7f3" : palette.bg, border:`1.5px solid ${palette.dot}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>
                      {palette.icon}
                    </div>

                    {/* Body */}
                    <div style={{ flex:1, minWidth:0 }}>
                      {n.title && (
                        <div style={{ fontSize:11, fontWeight:700, color:palette.accent, background:`${palette.dot}15`, borderRadius:999, padding:"2px 8px", display:"inline-block", marginBottom:4 }}>
                          {n.title}
                        </div>
                      )}
                      <div style={{ fontSize:13, color:"#1a3329", lineHeight:1.55, fontWeight: n.isRead ? 400 : 600, wordBreak:"break-word", marginBottom:8 }}>
                        {n.message}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                        <span style={{ fontSize:11, color:"#9ab8ae", background:"#f0f7f3", borderRadius:999, padding:"2px 8px", fontWeight:500 }}>
                          🕐 {fmtTime(n.createdAt)}
                        </span>
                        <ActionBtn url={n.url} />
                      </div>
                    </div>

                    {/* Unread dot + delete */}
                    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, flexShrink:0 }}>
                      {!n.isRead && (
                        <div style={{ width:8, height:8, borderRadius:"50%", background:`linear-gradient(135deg,${palette.dot},${palette.accent})` }} />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteNotif(n.id); }}
                        style={{ background:"rgba(229,62,62,0.07)", border:"none", cursor:"pointer", color:"#e53e3e", padding:5, borderRadius:8, lineHeight:0 }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  </div>

                  {idx < notifs.slice(0, visibleCount).length - 1 && (
                    <div style={{ height:1, background:"rgba(26,51,41,0.05)", margin:"0 0 4px" }} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {!loading && notifs.length > visibleCount && (
          <div style={{ padding:"0 16px 16px" }}>
            <button onClick={() => setVisibleCount((v) => v + 4)} style={{ width:"100%", background:"linear-gradient(135deg,#f0f9f4,#e8f5e9)", border:"1.5px solid rgba(79,158,122,0.25)", borderRadius:12, padding:"11px 0", fontSize:13, fontWeight:600, color:"#2d6b50", cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
              Load more ↓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}