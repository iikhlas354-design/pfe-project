import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import { useEffect, useState } from "react";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

/* ═══════════════════════════════════════════
   RESET & GLOBAL BASE
   ═══════════════════════════════════════════ */
*, *::before, *::after { 
  box-sizing: border-box; 
  margin: 0; 
  padding: 0; 
}

body, html {
  font-family: 'DM Sans', sans-serif;
  background-color: #f2f7f5;
  color: #1a3329;
  min-height: 100vh;
  overflow-x: hidden;
}

/* ═══════════════════════════════════════════
   PRO-TIP: FIXED NOISE TEXTURE LAYER
   ═══════════════════════════════════════════ */
.bg-texture {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("https://www.transparenttextures.com/patterns/asfalt-dark.png");
  opacity: 0.06;
  pointer-events: none;
  z-index: -1;
}

/* ═══════════════════════════════════════════
   LAYOUT STRUCTURE
   ═══════════════════════════════════════════ */
.layout-body {
  display: flex;
  min-height: calc(100vh - 90px);
  padding: 16px 2% 30px;
  gap: 14px;
  max-width: 1400px;
  margin: 0 auto;
}

.main {
  flex-grow: 1;
  min-width: 0;
  margin-left: 234px;
  background: transparent;
  position: relative;
  z-index: 1;
  transition: margin-left 0.3s ease;
}

/* ═══════════════════════════════════════════
   SIDEBAR — High Gloss Glassmorphism
   ═══════════════════════════════════════════ */
.sidebar {
  width: 220px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);

  border-top: 1.5px solid rgba(168, 224, 44, 0.9);
  border-left: 1.5px solid rgba(168, 224, 44, 0.9);
  border-bottom: 1.5px solid rgba(0, 168, 84, 0.8);
  border-right: 1.5px solid rgba(0, 168, 84, 0.8);
  border-radius: 22px;
  padding: 18px 12px;

  box-shadow: 
    0 8px 32px 0 rgba(15, 89, 47, 0.15),
    inset 0 0 12px rgba(255, 255, 255, 0.6);

  position: fixed;
  left: max(2%, calc((100vw - 1400px) / 2 + 2%));
  top: 50%;
  transform: translateY(-50%);
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  scrollbar-width: none;
  transition: all 0.3s ease;
  z-index: 10;
}

.sidebar::-webkit-scrollbar { display: none; }

.sidebar:hover {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 
    0 10px 34px rgba(15, 89, 47, 0.20),
    inset 0 0 16px rgba(255, 255, 255, 0.8);
}

/* ═══════════════════════════════════════════
   MOBILE SIDEBAR (Slide-out drawer)
   ═══════════════════════════════════════════ */
.mobile-sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
  z-index: 40;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.mobile-sidebar-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.mobile-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border-right: 1.5px solid rgba(168, 224, 44, 0.9);
  padding: 24px 16px;
  z-index: 50;
  transform: translateX(-100%);
  transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto;
  scrollbar-width: none;
}

.mobile-sidebar.open {
  transform: translateX(0);
}

.mobile-sidebar::-webkit-scrollbar { display: none; }

.mobile-sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 168, 84, 0.15);
}

.mobile-sidebar-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #0b6630;
}

.mobile-sidebar-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #1a3329;
  padding: 4px;
  line-height: 1;
}

/* ═══════════════════════════════════════════
   MOBILE HAMBURGER BUTTON
   ═══════════════════════════════════════════ */
.mobile-menu-btn {
  display: none;
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #0b6630;
  color: #fff;
  border: none;
  box-shadow: 0 6px 20px rgba(11, 102, 48, 0.4);
  cursor: pointer;
  z-index: 30;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.mobile-menu-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(11, 102, 48, 0.5);
}

.mobile-menu-btn:active {
  transform: scale(0.95);
}

/* ═══════════════════════════════════════════
   NAVIGATION & LABELS
   ═══════════════════════════════════════════ */
.section-label {
  font-size: 9px;
  font-weight: 700;
  color: #0b6630;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 6px 10px;
  margin-top: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  color: #1a2e26;
  transition: 0.23s cubic-bezier(0.4,0,0.2,1);
  font-family: 'DM Sans', sans-serif;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.6);
  color: #0b6630;
}

.nav-item.active {
  background: #0b6630;
  color: #fff;
  box-shadow: 0 4px 15px rgba(11, 102, 48, 0.4);
}

/* Mobile nav items */
.mobile-sidebar .nav-item {
  padding: 12px 14px;
  font-size: 14px;
}

.mobile-sidebar .nav-item:hover {
  background: rgba(11, 102, 48, 0.08);
}

/* ═══════════════════════════════════════════
   GLASS CARDS (Profile Page)
   ═══════════════════════════════════════════ */
.glass-card, .sec-card {
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-top: 1.5px solid rgba(168, 224, 44, 0.85);
  border-left: 1.5px solid rgba(168, 224, 44, 0.85);
  border-bottom: 1.5px solid rgba(0, 168, 84, 0.75);
  border-right: 1.5px solid rgba(0, 168, 84, 0.75);
  border-radius: 22px;
  box-shadow: 0 8px 32px rgba(15, 89, 47, 0.1), inset 0 0 10px rgba(255, 255, 255, 0.5);
  overflow: hidden;
  transition: all 0.3s;
}

.glass-card:hover, .sec-card:hover {
  background: rgba(255, 255, 255, 0.28);
}

/* ═══════════════════════════════════════════
   BUTTONS & ACTIONS
   ═══════════════════════════════════════════ */
.pf-btn {
  border-radius: 20px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  border: none;
  transition: all 0.2s;
}

.pf-btn-primary { 
  background: #0b6630; 
  color: #fff; 
  box-shadow: 0 4px 14px rgba(11, 102, 48, 0.3); 
}

.pf-btn-secondary { 
  background: rgba(255, 255, 255, 0.5); 
  color: #1a3329; 
  border: 1px solid rgba(168, 224, 44, 0.4); 
}

/* ═══════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .sidebar { display: none; }
  .main { margin-left: 0; }
  .layout-body { padding: 14px 10px; }
  .mobile-menu-btn { display: flex; }
}
`;

const BASE_MENU = [
  { section: "ACCOUNT", key: "info",      path: "/profile",          icon: "👤", label: "My Profile"      },
  { section: "MY PLAN", key: "plan",      path: "/profile/plan",     icon: "📋", label: "My Diet Plan"    },
  { section: "MY PLAN", key: "progress",  path: "/profile/progress", icon: "📈", label: "Progress"        },
  { section: "MY PLAN", key: "mood",      path: "/profile/mood",     icon: "😊", label: "Mood & Symptoms" },
  { section: "MY PLAN", key: "sessions",  path: "/profile/sessions", icon: "📅", label: "My Sessions"     },
  { section: "OTHER",   key: "notifs",    path: "/profile/notifs",   icon: "🔔", label: "Notifications"   },
  { section: "OTHER",   key: "chat",      path: "/profile/chat",     icon: "💬", label: "Chat"            },
  { section: "OTHER", key: "review", path: "/profile/review", icon: "⭐", label: "Rate Sessions" },
];

export default function PatientLayout() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user }  = useAuth();
  const [hasAI, setHasAI] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/subscriptions/mine`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const subs = data.subscriptions ?? [];
        const now  = new Date();
        const active = subs.find(s =>
          s.status === "ACTIVE" &&
          new Date(s.endDate) > now &&
          s.offer?.type === "AI_CALORIES"
        );
        setHasAI(!!active);
      })
      .catch(() => setHasAI(false));
  }, [user?.id]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const MENU = hasAI
    ? [...BASE_MENU.slice(0, 6), { section: "OTHER", key: "calories", path: "/calories-ai", icon: "🤖", label: "AI Calories" }, ...BASE_MENU.slice(6)]
    : BASE_MENU;

  const handleNav = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const renderMenu = (isMobile = false) => (
    <>
      {["ACCOUNT", "MY PLAN", "OTHER"].map(section => (
        <div key={section}>
          <div className="section-label">{section}</div>
          {MENU.filter(m => m.section === section).map(m => (
            <button
              key={m.key}
              className={`nav-item ${location.pathname === m.path ? "active" : ""}`}
              onClick={() => handleNav(m.path)}
            >
              <span style={{ fontSize: 15 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </div>
      ))}
    </>
  );

  return (
    <>
      <style>{CSS}</style>
      <div className="bg-texture" /> 
      <Header />
      <div className="layout-body">
        {/* Desktop Sidebar */}
        <aside className="sidebar">
          {renderMenu()}
        </aside>

        {/* Mobile Sidebar Overlay */}
        <div 
          className={`mobile-sidebar-overlay ${mobileOpen ? "open" : ""}`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Mobile Sidebar Drawer */}
        <aside className={`mobile-sidebar ${mobileOpen ? "open" : ""}`}>
          <div className="mobile-sidebar-header">
            <span className="mobile-sidebar-title">Menu</span>
            <button 
              className="mobile-sidebar-close" 
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
          {renderMenu(true)}
        </aside>

        <main className="main">
          <Outlet />
        </main>
      </div>

      {/* Mobile Floating Menu Button */}
      <button 
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        ☰
      </button>
    </>
  );
}