import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import logo from "../assets/logo.jpg";
import p1 from "../assets/p1.jpg";
import p2 from "../assets/p2.jpg";
import p3 from "../assets/p3.jpg";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

@keyframes dropIn    { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
@keyframes mobDrop   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
@keyframes shimmer   { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
@keyframes notifDrop { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }

/* ── Root ── */
.hdr-root {
  font-family: 'DM Sans', sans-serif;
  position: sticky; top: 14px; z-index: 100;
  max-width: 1200px; margin: 14px auto; padding: 0 16px;
}

/* ── Shell — glass card ── */
.hdr-shell {
  background: rgba(255,255,255,0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15,89,47,0.14), inset 0 0 12px rgba(255,255,255,0.55);
  transition: all 0.3s ease;
  overflow: visible;
  position: relative;
}
.hdr-shell:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.2), inset 0 0 16px rgba(255,255,255,0.75);
}

/* ── Bar ── */
.hdr-bar {
  display: flex; align-items: center; gap: 10px;
  padding: 0 20px; height: 66px;
}

/* ── Nav ── */
.hdr-nav { display:flex; align-items:center; gap:2px; flex:1; }
@media(max-width:768px){ .hdr-nav { display:none; } }

.nav-link {
  position: relative; padding: 7px 14px; border-radius: 999px;
  color: #1a3329; text-decoration: none; font-size: 14px; font-weight: 600;
  transition: all 0.22s ease; cursor: pointer; white-space: nowrap;
  background: transparent; border: none; font-family: 'DM Sans',sans-serif;
  display: inline-flex; align-items: center; gap: 6px;
}
.nav-link:hover, .nav-link.is-open {
  background: rgba(255,255,255,0.45);
  color: #0b6630;
  border: 1px solid rgba(168,224,44,0.4);
}

.prem-badge {
  font-size: 9px; font-weight: 800; color: #a8e02c;
  background: #0b6630;
  padding: 2px 7px; border-radius: 999px; letter-spacing: 0.5px; text-transform: uppercase;
}
.prem-chevron {
  font-size: 10px; color: #5a7a6e; display: inline-block;
  transition: transform 0.22s ease;
}
.nav-link.is-open .prem-chevron { transform: rotate(180deg); }

/* ── Actions ── */
.hdr-actions { display:flex; align-items:center; gap:8px; flex-shrink:0; margin-left:auto; }

/* ── Buttons ── */
.btn { border:none; border-radius:999px; font-family:'DM Sans',sans-serif; font-size:13.5px; font-weight:700; cursor:pointer; transition:all 0.22s; white-space:nowrap; }
.btn-ghost {
  border: 1.5px solid rgba(0,168,84,0.3);
  background: rgba(255,255,255,0.3); backdrop-filter:blur(8px);
  color: #0b6630; padding: 8px 18px;
}
.btn-ghost:hover { background: rgba(255,255,255,0.6); border-color: rgba(168,224,44,0.6); }
.btn-primary {
  background: #0b6630; color: #a8e02c;
  padding: 9px 20px; box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.btn-primary:hover { background: #0d7a38; transform:translateY(-1px); box-shadow: 0 6px 18px rgba(11,102,48,0.38); }
@media(max-width:480px){ .btn-ghost { display:none; } .btn-primary { padding:8px 14px; font-size:12.5px; } }

/* ── Avatar ── */
.hdr-avatar-btn {
  width: 38px; height: 38px; border-radius: 50%;
  background: linear-gradient(135deg,#1a3329,#0b6630);
  border: 2px solid rgba(168,224,44,0.6);
  cursor: pointer; display:flex; align-items:center; justify-content:center;
  font-size: 15px; font-weight: 800; color: #a8e02c;
  transition: all 0.22s; box-shadow: 0 3px 12px rgba(11,102,48,0.25);
  overflow: hidden; flex-shrink: 0;
}
.hdr-avatar-btn:hover { transform:scale(1.08); box-shadow:0 5px 18px rgba(11,102,48,0.35); border-color:rgba(168,224,44,0.9); }

/* ── Bell ── */
.hdr-notif-btn {
  position: relative; width: 36px; height: 36px; border-radius: 50%;
  background: rgba(255,255,255,0.3); backdrop-filter:blur(8px);
  border: 1.5px solid rgba(0,168,84,0.2);
  cursor: pointer; display:flex; align-items:center; justify-content:center;
  transition: all 0.22s; flex-shrink:0;
}
.hdr-notif-btn:hover, .hdr-notif-btn.active {
  background: rgba(255,255,255,0.55);
  border-color: rgba(168,224,44,0.6);
  box-shadow: 0 3px 12px rgba(11,102,48,0.15);
}
.hdr-notif-badge {
  position: absolute; top:-3px; right:-3px;
  width: 16px; height: 16px; border-radius: 50%;
  background: #a8e02c; border: 2px solid rgba(255,255,255,0.8);
  display:flex; align-items:center; justify-content:center;
  font-size: 9px; font-weight: 800; color: #1a3329;
}

/* ── User dropdown ── */
.hdr-user-dropdown {
  position: absolute; top: calc(100% + 10px); right: 0; width: 224px;
  background: rgba(240,252,245,0.9); backdrop-filter:blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.8);
  border-left:   1.5px solid rgba(168,224,44,0.8);
  border-bottom: 1.5px solid rgba(0,168,84,0.7);
  border-right:  1.5px solid rgba(0,168,84,0.7);
  border-radius: 18px;
  box-shadow: 0 12px 40px rgba(15,89,47,0.18), inset 0 0 10px rgba(255,255,255,0.5);
  padding: 10px; z-index:300; animation:dropIn 0.2s ease;
}
.hdr-user-item {
  display:flex; align-items:center; gap:10px;
  padding:10px 12px; border-radius:12px;
  font-size:13.5px; font-weight:600; color:#1a3329;
  cursor:pointer; transition:background 0.18s;
  border:none; background:none; width:100%;
  font-family:'DM Sans',sans-serif; text-decoration:none;
}
.hdr-user-item:hover { background:rgba(255,255,255,0.5); color:#0b6630; }
.hdr-user-item.danger { color:#c0392b; }
.hdr-user-item.danger:hover { background:rgba(192,57,43,0.08); color:#c0392b; }

.role-pill {
  border-radius:999px; padding:2px 9px; font-size:10px; font-weight:700; letter-spacing:0.4px;
  background: rgba(168,224,44,0.2); color: #0b6630;
  border: 1px solid rgba(168,224,44,0.4);
}

/* ── Premium dropdown ── */
.prem-dropdown {
  position:absolute; top:calc(100% + 12px); left:50%; transform:translateX(-50%);
  width:min(740px,calc(100vw - 32px));
  background: rgba(240,252,245,0.88); backdrop-filter:blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.8);
  border-left:   1.5px solid rgba(168,224,44,0.8);
  border-bottom: 1.5px solid rgba(0,168,84,0.7);
  border-right:  1.5px solid rgba(0,168,84,0.7);
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(15,89,47,0.18), inset 0 0 12px rgba(255,255,255,0.5);
  padding: 18px; display:grid; grid-template-columns:repeat(3,1fr); gap:12px;
  animation:dropIn 0.22s cubic-bezier(0.4,0,0.2,1); z-index:300;
}
@keyframes dropIn { from{opacity:0;transform:translateX(-50%) translateY(-10px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
@media(max-width:620px){ .prem-dropdown { grid-template-columns:1fr; left:0; right:0; width:calc(100vw - 32px); transform:none; } }

.prem-card {
  border-radius: 16px; overflow:hidden; display:block; position:relative;
  aspect-ratio:4/3; background:#ddd;
  box-shadow: 0 4px 16px rgba(15,89,47,0.12);
  transition: all 0.22s ease; cursor:pointer;
  border: 1px solid rgba(168,224,44,0.3);
}
.prem-card:hover { transform:translateY(-4px) scale(1.015); box-shadow:0 14px 32px rgba(15,89,47,0.2); border-color:rgba(168,224,44,0.6); }
.prem-card-img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.4s ease; }
.prem-card:hover .prem-card-img { transform:scale(1.07); }
.prem-card-overlay { position:absolute; inset:0; background:linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.82) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:14px 14px 12px; }
.prem-card-title { font-weight:700; font-size:12.5px; color:#fff; line-height:1.35; margin-bottom:4px; }
.prem-card-desc  { font-size:11px; color:rgba(255,255,255,0.82); line-height:1.4; margin-bottom:10px; }
.prem-card-arrow { align-self:flex-end; width:28px; height:28px; border-radius:50%; background:rgba(168,224,44,0.9); display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.18); transition:transform 0.22s; flex-shrink:0; }
.prem-card:hover .prem-card-arrow { transform:translateX(3px); }
.prem-card-arrow svg { width:12px; height:12px; stroke:#1a3329; fill:none; stroke-width:2.5; stroke-linecap:round; stroke-linejoin:round; }

/* ── Burger ── */
.hdr-burger {
  display:none; flex-direction:column; gap:5px; padding:8px; cursor:pointer;
  background:rgba(255,255,255,0.3); backdrop-filter:blur(8px);
  border: 1.5px solid rgba(0,168,84,0.2); border-radius:12px; transition:all 0.22s;
}
.hdr-burger:hover { background:rgba(255,255,255,0.55); border-color:rgba(168,224,44,0.5); }
.hdr-burger span { display:block; width:20px; height:2px; background:#1a3329; border-radius:2px; transition:all 0.22s; }
.hdr-burger.open span:nth-child(1) { transform:translateY(7px) rotate(45deg); }
.hdr-burger.open span:nth-child(2) { opacity:0; transform:scaleX(0); }
.hdr-burger.open span:nth-child(3) { transform:translateY(-7px) rotate(-45deg); }
@media(max-width:768px){ .hdr-burger { display:flex; } }

/* ── Mobile menu ── */
.mobile-menu {
  border-top: 1px solid rgba(0,168,84,0.12);
  padding: 14px 16px 20px;
  display:flex; flex-direction:column; gap:3px;
  animation: mobDrop 0.2s ease;
  background: rgba(255,255,255,0.08);
  border-radius: 0 0 22px 22px;
}
@media(min-width:769px){ .mobile-menu { display:none !important; } }

.mob-link {
  padding:10px 13px; border-radius:12px; color:#1a3329; text-decoration:none;
  font-size:14.5px; font-weight:600; transition:all 0.18s;
  display:flex; align-items:center; justify-content:space-between;
  cursor:pointer; background:none; border:none; width:100%;
  font-family:'DM Sans',sans-serif;
}
.mob-link:hover { background:rgba(255,255,255,0.45); color:#0b6630; border-radius:12px; }
.mob-divider  { height:1px; background:rgba(0,168,84,0.12); margin:8px 0; }
.mob-label    { font-size:10.5px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#5a7a6e; padding:4px 13px 6px; }

.mob-prem-card { display:flex; align-items:center; gap:12px; padding:8px 12px; border-radius:12px; transition:background 0.18s; cursor:pointer; }
.mob-prem-card:hover { background:rgba(255,255,255,0.45); }
.mob-prem-thumb { width:44px; height:44px; border-radius:10px; object-fit:cover; flex-shrink:0; border:1px solid rgba(168,224,44,0.3); }
.mob-prem-title { font-size:13.5px; font-weight:700; color:#1a3329; }
.mob-prem-desc  { font-size:11.5px; color:#5a7a6e; }
.mob-actions    { display:flex; gap:8px; margin-top:12px; }
.mob-actions .btn { flex:1; text-align:center; padding:10px; }

/* ── Notif dropdown ── */
.notif-dropdown-wrap { position:relative; }
.notif-dropdown {
  position:absolute; top:calc(100% + 12px); right:0; width:360px;
  background: rgba(240,252,245,0.9); backdrop-filter:blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.8);
  border-left:   1.5px solid rgba(168,224,44,0.8);
  border-bottom: 1.5px solid rgba(0,168,84,0.7);
  border-right:  1.5px solid rgba(0,168,84,0.7);
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(15,89,47,0.18), inset 0 0 12px rgba(255,255,255,0.5);
  z-index:400; overflow:hidden; animation:notifDrop 0.22s cubic-bezier(0.4,0,0.2,1);
}
@media(max-width:420px){ .notif-dropdown { width:calc(100vw - 32px); right:-60px; } }

.notif-header {
  display:flex; align-items:center; justify-content:space-between;
  padding:15px 18px 12px; border-bottom:1px solid rgba(0,168,84,0.1);
  background: rgba(255,255,255,0.2);
}
.notif-header-title { font-family:'DM Sans',sans-serif; font-size:14.5px; font-weight:700; color:#1a3329; display:flex; align-items:center; gap:8px; }
.notif-count-pill { background:#0b6630; color:#a8e02c; font-size:10px; font-weight:800; padding:2px 8px; border-radius:999px; }
.notif-mark-all { font-size:12px; font-weight:700; color:#0b6630; background:rgba(168,224,44,0.15); border:1px solid rgba(168,224,44,0.3); border-radius:8px; padding:4px 10px; cursor:pointer; font-family:'DM Sans',sans-serif; transition:all 0.18s; }
.notif-mark-all:hover { background:rgba(168,224,44,0.3); }
.notif-mark-all:disabled { opacity:0.4; cursor:default; }

.notif-list { max-height:380px; overflow-y:auto; padding:8px 0; }
.notif-list::-webkit-scrollbar { width:3px; }
.notif-list::-webkit-scrollbar-thumb { background:rgba(0,168,84,0.2); border-radius:10px; }

.notif-item { display:flex; align-items:flex-start; gap:12px; padding:12px 18px; transition:background 0.18s; }
.notif-item:hover { background:rgba(255,255,255,0.35); }
.notif-item.unread { background:rgba(168,224,44,0.07); }
.notif-item.unread:hover { background:rgba(168,224,44,0.14); }

.notif-unread-dot { width:8px; height:8px; border-radius:50%; background:#0b6630; flex-shrink:0; margin-top:5px; box-shadow:0 0 6px rgba(11,102,48,0.4); }
.notif-unread-dot.hidden { background:transparent; box-shadow:none; }

.notif-item-body { flex:1; min-width:0; }
.notif-item-title { font-size:10.5px; font-weight:700; color:#0b6630; margin-bottom:3px; background:rgba(168,224,44,0.15); display:inline-block; padding:1px 8px; border-radius:999px; }
.notif-item-msg   { font-size:13px; color:#1a3329; line-height:1.45; margin-bottom:5px; word-break:break-word; }
.notif-item-meta  { display:flex; align-items:center; justify-content:space-between; gap:8px; }
.notif-item-time  { font-size:11px; color:#5a7a6e; background:rgba(255,255,255,0.5); padding:2px 8px; border-radius:999px; border:1px solid rgba(0,168,84,0.1); }

.notif-pdf-btn {
  display:inline-flex; align-items:center; gap:5px;
  padding:4px 11px; background:#0b6630; color:#a8e02c;
  border:none; border-radius:9px; font-size:11px; font-weight:700;
  font-family:'DM Sans',sans-serif; cursor:pointer; text-decoration:none;
  transition:all 0.18s; flex-shrink:0;
}
.notif-pdf-btn:hover { background:#0d7a38; transform:translateY(-1px); }

.notif-divider { height:1px; background:rgba(0,168,84,0.07); margin:2px 0; }

.notif-empty { display:flex; flex-direction:column; align-items:center; padding:40px 20px; gap:10px; }
.notif-empty-icon { font-size:32px; }
.notif-empty p { font-size:13px; text-align:center; color:#5a7a6e; }

.notif-loading { padding:20px 18px; display:flex; flex-direction:column; gap:10px; }
.notif-skeleton {
  height:52px; border-radius:12px;
  background:linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.15) 75%);
  background-size:200% 100%; animation:shimmer 1.4s infinite;
}

.notif-footer { padding:10px 18px 14px; border-top:1px solid rgba(0,168,84,0.1); display:flex; justify-content:center; background:rgba(255,255,255,0.15); }
.notif-see-all { font-size:13px; font-weight:700; color:#0b6630; text-decoration:none; padding:6px 16px; border-radius:10px; transition:background 0.18s; }
.notif-see-all:hover { background:rgba(168,224,44,0.15); }
`;

if (typeof document !== "undefined" && !document.getElementById("hdr-glass-css")) {
  const s = document.createElement("style");
  s.id = "hdr-glass-css";
  s.textContent = CSS;
  document.head.appendChild(s);
}

const IconProfile = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconResume  = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconLogout  = <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;

const PREMIUM_ITEMS = [
  { label:"AI Calories Calculator",             desc:"Track your daily intake with smart AI-powered insights.",   image:p1, href:"/ai-premium"       },
  { label:"Health Plans by Specialists",        desc:"Personalised programs crafted by certified nutritionists.", image:p2, href:"/plans"            },
  { label:"Follow-up Care with a Nutritionist", desc:"Ongoing support and check-ins with your dedicated coach.", image:p3, href:"/specialist-plans" },
];

const fmtTime = (iso) => {
  if (!iso) return "";
  const d = new Date(iso), diff = Date.now() - d;
  if (diff < 60000)    return "just now";
  if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return d.toLocaleDateString("en-US", { month:"short", day:"numeric" });
};

function NotifDropdown({ onClose }) {
  const { user } = useAuth();
  const [notifs,  setNotifs]  = useState([]);
  const [loading, setLoading] = useState(true);
  const notifsHref = user?.role === "NUTRITION" ? "/resume/notifs" : "/profile/notifs";

  const fetchNotifs = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/notifications`, { credentials:"include" });
      const data = await res.json();
      setNotifs((data.notifications ?? []).map(n => ({ ...n, url: n.url ?? n.link ?? null })));
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchNotifs(); }, [fetchNotifs]);

  const markAllRead = async () => {
    await fetch(`${API_URL}/notifications/read-all`, { method:"PATCH", credentials:"include" });
    setNotifs(prev => prev.map(n => ({ ...n, isRead:true })));
  };

  const unreadCount = notifs.filter(n => !n.isRead).length;

  const getActionButton = (n) => {
    if (!n.url) return null;
    const isZoom = n.url.includes("zoom.us") || n.url.includes("zoom.com");
    const isPdf  = n.url.endsWith(".pdf") || n.url.includes(".pdf?");
    if (n.url.includes("/conversations/")) return null;
    if (isZoom) return (
      <a href={n.url} target="_blank" rel="noopener noreferrer" className="notif-pdf-btn"
        onClick={onClose} style={{ background:"linear-gradient(135deg,#2d8cff,#0e71eb)", color:"#fff" }}>
        🎥 Join Zoom
      </a>
    );
    if (isPdf) return (
      <a href={n.url} target="_blank" rel="noopener noreferrer" className="notif-pdf-btn" onClick={onClose}>
        ⬇ Download PDF
      </a>
    );
    return null;
  };

  return (
    <div className="notif-dropdown">
      <div className="notif-header">
        <span className="notif-header-title">
          Notifications
          {unreadCount > 0 && <span className="notif-count-pill">{unreadCount} new</span>}
        </span>
        <button className="notif-mark-all" onClick={markAllRead} disabled={unreadCount === 0}>
          Mark all read
        </button>
      </div>

      <div className="notif-list">
        {loading && (
          <div className="notif-loading">
            {[1,2,3].map(i => <div key={i} className="notif-skeleton" style={{ animationDelay:`${i*0.1}s` }} />)}
          </div>
        )}
        {!loading && notifs.length === 0 && (
          <div className="notif-empty">
            <span className="notif-empty-icon">🔔</span>
            <p>You're all caught up!<br/>No notifications yet.</p>
          </div>
        )}
        {!loading && notifs.map((n, idx) => (
          <div key={n.id}>
            <div className={`notif-item ${!n.isRead ? "unread" : ""}`}>
              <span className={`notif-unread-dot ${n.isRead ? "hidden" : ""}`} />
              <div className="notif-item-body">
                {n.title && <p className="notif-item-title">{n.title}</p>}
                <p className="notif-item-msg">{n.message}</p>
                <div className="notif-item-meta">
                  <span className="notif-item-time">{fmtTime(n.createdAt)}</span>
                  {getActionButton(n)}
                </div>
              </div>
            </div>
            {idx < notifs.length - 1 && <div className="notif-divider" />}
          </div>
        ))}
      </div>

      {notifs.length > 0 && (
        <div className="notif-footer">
          <Link to={notifsHref} className="notif-see-all" onClick={onClose}>
            See all notifications →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function Header() {
  const [premOpen,       setPremOpen]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [mobilePremOpen, setMobilePremOpen] = useState(false);
  const [userMenuOpen,   setUserMenuOpen]   = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [unreadCount,    setUnreadCount]    = useState(0);
  const [isDesktop,      setIsDesktop]      = useState(
    typeof window !== "undefined" ? window.innerWidth >= 769 : true
  );

  const premRef  = useRef(null);
  const userRef  = useRef(null);
  const notifRef = useRef(null);

  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();

  const isNutrition  = user?.role === "NUTRITION";
  const firstName    = user?.firstName || "U";
  const profileHref  = isNutrition ? "/resume/profile" : "/profile";
  const profileLabel = isNutrition ? "My Resume" : "My Profile";
  const notifsHref   = isNutrition ? "/resume/notifs" : "/profile/notifs";

  const fetchUnreadCount = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const res  = await fetch(`${API_URL}/notifications/unread-count`, { credentials:"include" });
      const data = await res.json();
      setUnreadCount(data.count ?? 0);
    } catch { }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => { if (!notifOpen) fetchUnreadCount(); }, [notifOpen, fetchUnreadCount]);

  useEffect(() => {
    const h = (e) => {
      if (premRef.current  && !premRef.current.contains(e.target))  setPremOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = () => setIsDesktop(window.innerWidth >= 769);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  useEffect(() => {
    setMobileOpen(false); setPremOpen(false); setUserMenuOpen(false); setNotifOpen(false);
  }, [user?.role]);

  const handlePremiumClick = (href) => {
    navigate(isLoggedIn ? href : `/login?redirect=${href}`);
    setPremOpen(false);
  };

  const handleLogout = () => {
    logout(); setUserMenuOpen(false); setMobileOpen(false); navigate("/");
  };

  return (
    <div className="hdr-root">
      <div className="hdr-shell">
        <div className="hdr-bar">

          {/* Logo */}
          <Link to="/"><img src={logo} alt="logo" style={{ height:140, marginRight:16, borderRadius:10 }} /></Link>

          {/* Desktop nav */}
          <nav className="hdr-nav">
            <Link to="/"      className="nav-link">Home</Link>
            <Link to="/blogs" className="nav-link">Blogs</Link>

            {!isNutrition && (
              <div ref={premRef} style={{ position:"relative" }}>
                <button
                  className={`nav-link${premOpen ? " is-open" : ""}`}
                  onClick={() => setPremOpen(v => !v)}
                  onMouseEnter={() => setPremOpen(true)}
                >
                  Offers <span className="prem-badge">Pro</span>
                  <span className="prem-chevron">▾</span>
                </button>
                {premOpen && (
                  <div className="prem-dropdown" onMouseLeave={() => setPremOpen(false)}>
                    {PREMIUM_ITEMS.map(item => (
                      <div key={item.label} className="prem-card" onClick={() => handlePremiumClick(item.href)}>
                        <img src={item.image} alt={item.label} className="prem-card-img" />
                        <div className="prem-card-overlay">
                          <div className="prem-card-title">{item.label}</div>
                          <div className="prem-card-desc">{item.desc}</div>
                          <div className="prem-card-arrow">
                            <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Desktop actions */}
          <div className="hdr-actions">
            {isDesktop && (
              isLoggedIn ? (
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  {/* Bell */}
                  <div className="notif-dropdown-wrap" ref={notifRef}>
                    <button
                      className={`hdr-notif-btn${notifOpen ? " active" : ""}`}
                      onClick={() => { setNotifOpen(v => !v); setUserMenuOpen(false); setPremOpen(false); }}
                      aria-label="Notifications"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                      </svg>
                      {unreadCount > 0 && (
                        <span className="hdr-notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                      )}
                    </button>
                    {notifOpen && <NotifDropdown onClose={() => setNotifOpen(false)} />}
                  </div>

                  {/* Avatar */}
                  <div ref={userRef} style={{ position:"relative" }}>
                    <button className="hdr-avatar-btn" onClick={() => setUserMenuOpen(v => !v)}>
                      {user?.image
                        ? <img src={user.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                        : <span>{firstName[0]}</span>
                      }
                    </button>

                    {userMenuOpen && (
                      <div className="hdr-user-dropdown">
                        {/* User info */}
                        <div style={{ padding:"10px 12px", borderBottom:"1px solid rgba(0,168,84,0.12)", marginBottom:6 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:3 }}>
                            <div style={{ fontSize:13.5, fontWeight:700, color:"#1a3329" }}>
                              {user?.firstName} {user?.lastName}
                            </div>
                            <span className="role-pill">{isNutrition ? "Nutritionist" : "Client"}</span>
                          </div>
                          <div style={{ fontSize:12, color:"#5a7a6e" }}>{user?.email}</div>
                        </div>

                        <Link to={profileHref} className="hdr-user-item" onClick={() => setUserMenuOpen(false)}>
                          {isNutrition ? IconResume : IconProfile}
                          {profileLabel}
                        </Link>

                        <div style={{ height:1, background:"rgba(0,168,84,0.1)", margin:"6px 0" }} />

                        <button className="hdr-user-item danger" onClick={handleLogout}>
                          {IconLogout} Log out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <button className="btn btn-ghost"   onClick={() => navigate("/login")}>Login</button>
                  <button className="btn btn-primary" onClick={() => navigate("/Signup")}>Sign up</button>
                </>
              )
            )}

            {/* Burger */}
            <button
              className={`hdr-burger${mobileOpen ? " open" : ""}`}
              onClick={() => setMobileOpen(v => !v)}
              aria-label="Toggle menu"
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <Link to="/"      className="mob-link" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/blogs" className="mob-link" onClick={() => setMobileOpen(false)}>Blogs</Link>

            {!isNutrition && (
              <>
                <div className="mob-divider" />
                <div className="mob-label">Premium</div>
                <button className="mob-link" onClick={() => setMobilePremOpen(v => !v)}>
                  <span>All Premium Features</span>
                  <span style={{ fontSize:12, transition:"transform 0.2s", display:"inline-block", transform: mobilePremOpen ? "rotate(180deg)" : "none" }}>▾</span>
                </button>
                {mobilePremOpen && PREMIUM_ITEMS.map(item => (
                  <div key={item.label} className="mob-prem-card"
                    onClick={() => { handlePremiumClick(item.href); setMobileOpen(false); }}>
                    <img src={item.image} alt={item.label} className="mob-prem-thumb" />
                    <div>
                      <div className="mob-prem-title">{item.label}</div>
                      <div className="mob-prem-desc">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="mob-divider" />

            {isLoggedIn ? (
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ padding:"8px 13px", display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:13.5, fontWeight:700, color:"#1a3329" }}>{firstName}</span>
                  <span className="role-pill">{isNutrition ? "Nutritionist" : "Client"}</span>
                </div>
                <Link to={profileHref} className="mob-link" onClick={() => setMobileOpen(false)}>
                  {profileLabel}
                </Link>
                <Link to={notifsHref} className="mob-link" onClick={() => setMobileOpen(false)}>
                  Notifications
                  {unreadCount > 0 && (
                    <span style={{ background:"#0b6630", color:"#a8e02c", borderRadius:999, padding:"1px 8px", fontSize:11, fontWeight:800 }}>
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <button className="mob-link" style={{ color:"#c0392b" }} onClick={handleLogout}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="mob-actions">
                <button className="btn btn-ghost"   onClick={() => navigate("/login")}>Login</button>
                <button className="btn btn-primary" onClick={() => navigate("/Signup")}>Sign up</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}