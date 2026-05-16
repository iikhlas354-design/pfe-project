import { Outlet, NavLink, Navigate, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useAuth } from "../context/Authcontext";
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

body, html {
  font-family: 'DM Sans', sans-serif;
  background: #f2f7f5;
  color: #1a3329;
}

/* ═══════════════════════════════════════════
   LAYOUT BODY — transparent, centered, fixed
  ═══════════════════════════════════════════ */
.layout-body {
  display: flex;
  min-height: calc(100vh - 90px);
  padding: 16px 2% 30px;
  gap: 14px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ═══════════════════════════════════════════
   SIDEBAR — matches Header aesthetic
   Transparent glass feel, fixed, centered
  ═══════════════════════════════════════════ */
.sidebar {
  width: 220px;
  flex-shrink: 0;

  /* Header-matching gradient background */
  background: linear-gradient(135deg, #e3f2fd 0%, #e8f5e9 100%);
  border: 1px solid rgba(200, 232, 223, 0.9);
  border-radius: 22px;

  padding: 18px 12px;
  box-shadow: 0 2px 10px rgba(26,51,41,0.07);

  /* Fixed positioning — centered vertically */
  position: fixed;
  left: max(2%, calc((100vw - 1400px) / 2 + 2%));
  top: 50%;
  transform: translateY(-50%);

  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;

  /* Smooth scroll hide */
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }

/* Hover effect matching Header */
.sidebar:hover {
  background: #ffffff;
  box-shadow: 0 10px 34px rgba(26,51,41,0.14);
}

/* ═══════════════════════════════════════════
   SECTION LABEL
  ═══════════════════════════════════════════ */
.section-label {
  font-size: 9px;
  font-weight: 700;
  color: #5a7a6e;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding: 6px 10px;
  margin-top: 8px;
}

/* ═══════════════════════════════════════════
   NAV ITEMS — matching Header nav-link style
  ═══════════════════════════════════════════ */
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
  background: rgba(255,255,255,0.75);
  color: #2d6b50;
}

/* ACTIVE — matches Header primary button gradient */
.nav-item.active {
  background: linear-gradient(135deg, #3d9b73, #2a6b4f);
  color: #fff;
  box-shadow: 0 3px 10px rgba(45,107,80,0.30);
}

/* ═══════════════════════════════════════════
   MAIN — offset for fixed sidebar
  ═══════════════════════════════════════════ */
.main {
  flex-grow: 1;
  min-width: 0;
  margin-left: 234px; /* sidebar width + gap */
  background: transparent;
}

/* ═══════════════════════════════════════════
   MOBILE
  ═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .main {
    margin-left: 0;
  }
  .layout-body {
    padding: 14px 10px;
  }
}
`;

const MENU = [
  { section: "MAIN",     to: ".",             icon: "📊", label: "Overview"       },
  { section: "MAIN",     to: "patients",      icon: "🧑‍⚕️", label: "Patients"       },
  { section: "MAIN",     to: "plans",         icon: "🥗", label: "Diet Plans"     },
  { section: "MAIN",     to: "consultations", icon: "📅", label: "Consultations"  },
  { section: "MAIN",     to: "chat",          icon: "💬", label: "Messages"       },
  { section: "MAIN",     to: "posts",         icon: "✍️", label: "Blog Posts"     },
  { section: "SETTINGS", to: "notifs",        icon: "🔔", label: "Notifications"  },
  { section: "SETTINGS", to: "profile",       icon: "👤", label: "My Profile"     },
];
 
export default function NutritionistLayout() {
  const { user } = useAuth();
 
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "NUTRITION") return <Navigate to="/" replace />;
 
  // Step 1 — must connect Stripe first
  if (!user.stripeAccountId) return <Navigate to="/nutritionist-setup" replace />;
 
  // Step 2 — must create resume
  if (!user.hasResume) return <Navigate to="/resume/create" replace />;
 
  return (
    <>
      <style>{CSS}</style>
      <Header />
      <div className="layout-body">
        <aside className="sidebar">
          {["MAIN", "SETTINGS"].map(section => (
            <div key={section}>
              <div className="section-label">{section}</div>
              {MENU.filter(m => m.section === section).map(m => (
                <NavLink
                  key={m.to}
                  to={m.to}
                  end={m.to === "."}
                  className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
                >
                  <span>{m.icon}</span>
                  {m.label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>
        <main className="main">
          <Outlet />
        </main>
      </div>
    </>
  );
}
 