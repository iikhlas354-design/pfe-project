import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const DAYS       = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const BAR_COLORS = ["#a8e02c","#0b6630","#fb923c","#1a6fa0","#a78bfa","#f59e0b","#34d399","#60a5fa"];
const API_URL    = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin    { to { transform:rotate(360deg); } }
@keyframes toastIn { from { opacity:0; transform:translateX(-50%) translateY(12px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }
.anim-up-d3 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.21s both; }

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

.pp-toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
  background: rgba(26,51,41,0.92); color: #a8e02c;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(168,224,44,0.35);
  padding: 11px 26px; border-radius: 999px;
  font-family: 'Inter',sans-serif; font-size: 13px; font-weight: 700;
  z-index: 9999; animation: toastIn 0.25s ease;
  box-shadow: 0 8px 28px rgba(15,89,47,0.3);
  display: flex; align-items: center; gap: 8px;
}

.plan-select-wrap { position: relative; }
.plan-select-trigger {
  width: 100%;
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; border-radius: 16px; cursor: pointer;
  background: rgba(255,255,255,0.22); backdrop-filter: blur(8px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  box-shadow: 0 4px 16px rgba(15,89,47,0.08), inset 0 0 8px rgba(255,255,255,0.4);
  transition: all 0.2s ease;
  font-family: 'Inter',sans-serif;
}
.plan-select-trigger:hover { background: rgba(255,255,255,0.35); }
.plan-select-dropdown {
  position: absolute; top: calc(100% + 8px); left: 0; right: 0; z-index: 50;
  background: rgba(240,252,245,0.95); backdrop-filter: blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.8);
  border-left:   1.5px solid rgba(168,224,44,0.8);
  border-bottom: 1.5px solid rgba(0,168,84,0.7);
  border-right:  1.5px solid rgba(0,168,84,0.7);
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(15,89,47,0.18);
  overflow: hidden;
  animation: slideUp 0.2s ease;
}
.plan-dropdown-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 16px; cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid rgba(0,168,84,0.08);
  font-family: 'Inter',sans-serif;
}
.plan-dropdown-item:last-child { border-bottom: none; }
.plan-dropdown-item:hover { background: rgba(168,224,44,0.1); }
.plan-dropdown-item.active { background: rgba(11,102,48,0.08); }

.pp-streak-box { display:flex; justify-content:space-between; align-items:center; padding:18px 22px; }
.pp-day-col { text-align:center; }
.pp-day-name { font-size:9.5px; font-weight:700; color:#5a7a6e; margin-bottom:8px; text-transform:uppercase; letter-spacing:0.6px; font-family:'Inter',sans-serif; }
.pp-day-circle {
  width:33px; height:33px; border-radius:50%;
  border:1.5px solid rgba(0,168,84,0.2);
  background:rgba(255,255,255,0.2); backdrop-filter:blur(6px);
  display:flex; align-items:center; justify-content:center;
  font-size:11.5px; font-weight:700; color:#5a7a6e; transition:all 0.3s;
  font-family:'Inter',sans-serif;
}
.pp-day-circle.done  { background:#0b6630; color:#a8e02c; border-color:transparent; box-shadow:0 3px 10px rgba(11,102,48,0.3); }
.pp-day-circle.today { border-color:rgba(168,224,44,0.8); color:#0b6630; font-weight:800; background:rgba(168,224,44,0.12); }

.pp-hero {
  padding:24px 26px;
  display:flex; align-items:center; justify-content:space-between;
  background:linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%);
  position:relative; overflow:hidden;
}
.pp-hero::before { content:""; position:absolute; right:-30px; top:-30px; width:180px; height:180px; border-radius:50%; background:rgba(168,224,44,0.08); }
.pp-hero::after  { content:""; position:absolute; right:50px; bottom:-50px; width:120px; height:120px; border-radius:50%; background:rgba(168,224,44,0.05); }
.pp-hero-perc { font-size:52px; font-weight:800; color:#a8e02c; letter-spacing:-2px; line-height:1; font-family:'Space Grotesk',sans-serif; }
.pp-hero-bar { width:100%; height:5px; background:rgba(255,255,255,0.1); border-radius:999px; margin-top:14px; overflow:hidden; }
.pp-hero-bar-fill { height:100%; background:linear-gradient(90deg,#a8e02c,#f5e642); border-radius:999px; transition:width 0.8s cubic-bezier(0.17,0.67,0.83,0.67); }
.pp-macro-pill { display:inline-block; background:rgba(255,255,255,0.1); backdrop-filter:blur(6px); border:1px solid rgba(168,224,44,0.2); border-radius:20px; padding:5px 13px; font-size:12px; margin-bottom:6px; color:rgba(255,255,255,0.8); font-family:'Inter',sans-serif; }
.pp-macro-pill strong { color:#a8e02c; }
.pp-pdf-pill { display:inline-block; background:rgba(168,224,44,0.15); border:1px solid rgba(168,224,44,0.3); border-radius:20px; padding:5px 13px; font-size:12px; color:#a8e02c; text-decoration:none; font-weight:700; margin-bottom:6px; font-family:'Inter',sans-serif; transition:background 0.2s; }
.pp-pdf-pill:hover { background:rgba(168,224,44,0.28); }

.pp-section-label { font-size:10px; font-weight:700; color:#5a7a6e; text-transform:uppercase; letter-spacing:1px; margin:20px 0 10px 4px; font-family:'Inter',sans-serif; }

.pp-diet-card { display:flex; align-items:stretch; border-radius:16px; margin-bottom:9px; background:rgba(255,255,255,0.28); backdrop-filter:blur(8px); border:1px solid rgba(0,168,84,0.12); overflow:hidden; transition:all 0.2s ease; }
.pp-diet-card:hover { background:rgba(255,255,255,0.42); border-color:rgba(168,224,44,0.35); }
.pp-diet-card.done   { background:rgba(11,102,48,0.1);  border-color:rgba(168,224,44,0.4); }
.pp-diet-card.missed { background:rgba(192,57,43,0.07); border-color:rgba(192,57,43,0.2); opacity:0.72; }
.pp-diet-bar-side { width:4px; flex-shrink:0; }
.pp-diet-body { flex:1; padding:14px 16px; min-width:0; }
.pp-diet-top  { display:flex; align-items:baseline; gap:8px; margin-bottom:3px; }
.pp-diet-name { font-size:14px; font-weight:700; color:#1a3329; font-family:'Inter',sans-serif; }
.pp-diet-time { font-size:11.5px; color:#5a7a6e; font-family:'Inter',sans-serif; }
.pp-diet-sub  { font-size:12px; color:#5a7a6e; font-family:'Inter',sans-serif; margin-bottom:8px; }
.pp-macro-tags { display:flex; gap:5px; flex-wrap:wrap; }
.pp-macro-tag  { font-size:10.5px; font-weight:700; padding:2px 8px; border-radius:999px; font-family:'Inter',sans-serif; }
.pp-macro-tag.p    { background:rgba(11,102,48,0.12);  color:#0b6630; }
.pp-macro-tag.c    { background:rgba(26,111,160,0.12); color:#1a6fa0; }
.pp-macro-tag.f    { background:rgba(251,146,60,0.15); color:#c2620a; }
.pp-macro-tag.kcal { background:rgba(167,139,250,0.15); color:#6d28d9; }
.pp-diet-btns { display:flex; flex-direction:column; flex-shrink:0; border-left:1px solid rgba(0,168,84,0.1); }
.pp-diet-btn { flex:1; width:48px; border:none; background:transparent; font-size:14px; font-weight:700; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.18s ease; color:#9ab8ae; }
.pp-diet-btn:first-child { border-bottom:1px solid rgba(0,168,84,0.08); }
.pp-diet-btn:hover { background:rgba(255,255,255,0.6); }
.pp-diet-btn.check-active { background:#0b6630; color:#a8e02c; }
.pp-diet-btn.x-active     { background:rgba(192,57,43,0.1); color:#c0392b; }

.pp-btn-primary { background:#0b6630; color:#a8e02c; border:none; padding:12px 20px; border-radius:20px; font-size:13.5px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; box-shadow:0 4px 14px rgba(11,102,48,0.3); display:inline-flex; align-items:center; gap:7px; }
.pp-btn-primary:hover    { background:#0d7a38; }
.pp-btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.pp-btn-glass { background:rgba(255,255,255,0.25); backdrop-filter:blur(8px); color:#1a3329; border:1.5px solid rgba(168,224,44,0.4); padding:12px 20px; border-radius:20px; font-size:13.5px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; transition:all 0.2s; white-space:nowrap; display:inline-flex; align-items:center; gap:7px; }
.pp-btn-glass:hover { background:rgba(255,255,255,0.5); border-color:rgba(168,224,44,0.7); }

.nutri-avatar-initials { border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,#1a3329,#0b6630); border:2px solid rgba(168,224,44,0.5); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:800; color:#a8e02c; }
`;

function NutriAvatar({ user, size = 36 }) {
  const [err, setErr] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  if (!user?.image || err) return (
    <div className="nutri-avatar-initials" style={{ width:size, height:size, fontSize:size*0.33 }}>{initials}</div>
  );
  return (
    <img src={user.image} alt={initials} onError={() => setErr(true)}
      style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(168,224,44,0.5)", flexShrink:0 }} />
  );
}

function resolvePlanDay(userPlan) {
  const content   = userPlan?.plan?.content;
  const days      = content?.days;
  if (!days || !Array.isArray(days) || days.length === 0)
    return { dayNum:1, totalDays:0, todayPlan:null };
  const totalDays   = content?.totalDays ?? days.length;
  const entryCount  = days.length;
  let currentDayNum = 1;
  if (userPlan.startDate) {
    const diffMs  = Date.now() - new Date(userPlan.startDate).getTime();
    const diffDay = Math.floor(diffMs / 86400000) + 1;
    currentDayNum = Math.min(Math.max(diffDay, 1), totalDays);
  }
  const entryIdx = (currentDayNum - 1) % entryCount;
  const todayPlan = days[entryIdx];
  return { dayNum: currentDayNum, totalDays, todayPlan };
}

function getNutritionist(up) {
  return up?.plan?.nutrition ?? up?.plan?.nutritionist ??
         up?.subscription?.nutrition ?? up?.subscription?.nutritionist ?? null;
}

export default function ProfilePlanPage() {
  const navigate = useNavigate();

  const [allPlans,     setAllPlans]     = useState([]);
  const [activeKey,    setActiveKey]    = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [marks,        setMarks]        = useState({});
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [toast,        setToast]        = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2200); };

  const loadTracking = async (userPlan) => {
    const today = new Date().toISOString().split("T")[0];
    try {
      const r = await fetch(`${API_URL}/user-plans/${userPlan.id}/tracking/${today}`, { credentials:"include" });
      if (!r.ok) { setMarks({}); return; }
      const d = await r.json();
      const init = {};
      (d.dailyTracking?.mealsDoneIds   ?? []).forEach(id => { init[`meal-${id}`]  = "done"; });
      (d.dailyTracking?.mealsMissedIds  ?? []).forEach(id => { init[`meal-${id}`]  = "miss"; });
      (d.dailyTracking?.habitsDoneIds  ?? []).forEach(id => { init[`habit-${id}`] = "done"; });
      (d.dailyTracking?.habitsMissedIds ?? []).forEach(id => { init[`habit-${id}`] = "miss"; });
      setMarks(init);
    } catch { setMarks({}); }
  };

  useEffect(() => {
    (async () => {
      try {
        const r     = await fetch(`${API_URL}/user-plans/mine`, { credentials:"include" });
        const data  = await r.json();
        const plans = data.userPlans ?? [];
        setAllPlans(plans);
        if (plans.length > 0) {
          setActiveKey(plans[0].id);
          await loadTracking(plans[0]);
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const switchPlan = async (up) => {
    if (up.id === activeKey) { setDropdownOpen(false); return; }
    setActiveKey(up.id);
    setDropdownOpen(false);
    setMarks({});
    await loadTracking(up);
  };

  const mark = useCallback((key, status) => {
    setMarks(prev => ({ ...prev, [key]: prev[key] === status ? undefined : status }));
    if (status === "done") showToast("Logged!");
  }, []);

  const saveTracking = async () => {
    const userPlan = allPlans.find(p => p.id === activeKey);
    if (!userPlan) return;
    const { todayPlan } = resolvePlanDay(userPlan);
    const meals  = todayPlan?.meals  ?? [];
    const habits = todayPlan?.habits ?? [];
    setSaving(true);
    try {
      await fetch(`${API_URL}/user-plans/${userPlan.id}/tracking`, {
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          date:            new Date().toISOString().split("T")[0],
          mealsDoneIds:    meals.filter((_,i)  => marks[`meal-${i}`]  === "done").map((_,i) => String(i)),
          mealsMissedIds:  meals.filter((_,i)  => marks[`meal-${i}`]  === "miss").map((_,i) => String(i)),
          habitsDoneIds:   habits.filter((_,i) => marks[`habit-${i}`] === "done").map((_,i) => String(i)),
          habitsMissedIds: habits.filter((_,i) => marks[`habit-${i}`] === "miss").map((_,i) => String(i)),
        }),
      });
      showToast("Progress saved!");
    } catch { showToast("Save failed, try again"); }
    finally { setSaving(false); }
  };

  const userPlan = allPlans.find(p => p.id === activeKey) ?? null;
  const { dayNum, totalDays, todayPlan } = userPlan
    ? resolvePlanDay(userPlan)
    : { dayNum:1, totalDays:0, todayPlan:null };

  const pdfUrl  = userPlan?.plan?.pdfUrl ?? null;
  const meals   = todayPlan?.meals  ?? [];
  const habits  = todayPlan?.habits ?? [];
  const total   = meals.length + habits.length;
  const done    = Object.values(marks).filter(v => v === "done").length;
  const pct     = total > 0 ? Math.round((done / total) * 100) : 0;
  const msgs    = ["Start logging your meals and habits.", "Good start, keep it up!", "Over halfway — great momentum!", "Almost there, keep going!", "Perfect day — all tasks complete!"];
  const msgIdx  = pct === 100 ? 4 : pct >= 75 ? 3 : pct >= 50 ? 2 : pct > 0 ? 1 : 0;

  const now       = new Date();
  const todayIdx  = now.getDay();
  const startDate = userPlan?.startDate ? new Date(userPlan.startDate) : null;
  const weekDays  = Array.from({ length:7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - todayIdx + i);
    return {
      name:    DAYS[i],
      date:    d.getDate(),
      isPast:  startDate && d < now && d.toDateString() !== now.toDateString(),
      isToday: d.toDateString() === now.toDateString(),
    };
  });

  const getMealName  = m => typeof m === "string" ? m : m?.name  ?? m?.title ?? "";
  const getMealTime  = m => typeof m === "string" ? null : m?.time ?? null;
  const getMealSub   = m => typeof m === "string" ? null : m?.description ?? m?.subtitle ?? m?.ingredients ?? null;
  const getMealKcal  = m => typeof m === "string" ? null : m?.calories ?? m?.kcal ?? null;
  const getMealMacro = (m, k) => typeof m === "string" ? null : m?.[k] ?? null;
  const getHabitName = h => typeof h === "string" ? h : h?.name ?? h?.title ?? String(h);
  const getHabitSub  = h => typeof h === "string" ? null : h?.description ?? h?.subtitle ?? null;

  const activeNutri = getNutritionist(userPlan);

  if (loading) return <div style={{ fontFamily:"'Inter',sans-serif", padding:40, color:"#5a7a6e" }}>Loading your plan…</div>;

  if (allPlans.length === 0) return (
    <div style={{ fontFamily:"'Inter',sans-serif", paddingBottom:40 }}>
      <style>{CSS}</style>
      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:22, fontWeight:800, color:"#1a3329", marginBottom:6 }}>My Diet Plan</div>
      <div style={{ fontSize:13, color:"#5a7a6e", marginBottom:18 }}>You don't have an active plan yet.</div>
      <button className="pp-btn-primary" onClick={() => navigate("/plans")}>Browse Plans</button>
    </div>
  );

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", paddingBottom:40 }}>
      <style>{CSS}</style>

      {toast && (
        <div className="pp-toast">
          <div style={{ width:18, height:18, borderRadius:"50%", background:"#0b6630", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {toast}
        </div>
      )}

      {/* Page heading */}
      <div className="anim-up" style={{ marginBottom:20 }}>
        <div style={{ fontSize:10.5, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:1.2, marginBottom:5, fontFamily:"'Inter',sans-serif" }}>Nutrition</div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:"#1a3329", letterSpacing:-0.5 }}>My Diet Plan</div>
        <div style={{ fontSize:13, color:"#5a7a6e", marginTop:5, lineHeight:1.6, fontFamily:"'Inter',sans-serif" }}>
          {now.toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
          {totalDays > 0 ? ` — Day ${dayNum} of ${totalDays}` : ""}
        </div>
      </div>

      {/* Plan selector */}
      {allPlans.length > 1 && (
        <div className="anim-up" style={{ marginBottom:16, position:"relative" }}>
          <div style={{ fontSize:10.5, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:1, marginBottom:8, fontFamily:"'Inter',sans-serif" }}>
            Active Plan
          </div>
          <div className="plan-select-wrap">
            <div className="plan-select-trigger" onClick={() => setDropdownOpen(v => !v)}>
              <NutriAvatar user={activeNutri} size={36} />
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:700, color:"#1a3329", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {userPlan?.plan?.title ?? "Select a plan"}
                </div>
                <div style={{ fontSize:11.5, color:"#5a7a6e", marginTop:2, fontFamily:"'Inter',sans-serif" }}>
                  {activeNutri ? `${activeNutri.firstName} ${activeNutri.lastName}` : ""}
                  {totalDays > 0 ? ` · Day ${dayNum} of ${totalDays}` : ""}
                </div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5a7a6e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition:"transform 0.2s", flexShrink:0 }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
            {dropdownOpen && (
              <div className="plan-select-dropdown">
                {allPlans.map(up => {
                  const nutri    = getNutritionist(up);
                  const { dayNum: pDay, totalDays: pTotal } = resolvePlanDay(up);
                  const isActive = up.id === activeKey;
                  return (
                    <div key={up.id} className={`plan-dropdown-item ${isActive ? "active" : ""}`} onClick={() => switchPlan(up)}>
                      <NutriAvatar user={nutri} size={36} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13.5, fontWeight:700, color:"#1a3329" }}>
                          {up?.plan?.title ?? "Plan"}
                        </div>
                        <div style={{ fontSize:11.5, color:"#5a7a6e", marginTop:2, fontFamily:"'Inter',sans-serif" }}>
                          {nutri ? `${nutri.firstName} ${nutri.lastName}` : ""}
                          {pTotal > 0 ? ` · Day ${pDay} of ${pTotal}` : ""}
                        </div>
                      </div>
                      {isActive && <div style={{ width:8, height:8, borderRadius:"50%", background:"#0b6630", flexShrink:0 }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weekly streak */}
      <div className="glass-card anim-up-d1" style={{ marginBottom:14 }}>
        <div className="pp-streak-box">
          {weekDays.map((d, i) => (
            <div key={i} className="pp-day-col">
              <div className="pp-day-name">{d.name}</div>
              <div className={`pp-day-circle ${d.isToday ? "today" : d.isPast ? "done" : ""}`}>
                {d.isPast ? "✓" : d.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div className="glass-card anim-up-d1" style={{ marginBottom:14 }}>
        <div className="pp-hero">
          <div style={{ flex:1, position:"relative", zIndex:1 }}>
            <p style={{ fontSize:12.5, color:"rgba(255,255,255,0.6)", marginBottom:4, fontFamily:"'Inter',sans-serif" }}>Today's Completion</p>
            <div className="pp-hero-perc">{pct}<span style={{ fontSize:20, opacity:0.6 }}>%</span></div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,0.65)", marginTop:6, fontFamily:"'Inter',sans-serif" }}>{msgs[msgIdx]}</div>
            <div className="pp-hero-bar"><div className="pp-hero-bar-fill" style={{ width:`${pct}%` }} /></div>
          </div>
          <div style={{ marginLeft:22, textAlign:"right", flexShrink:0, position:"relative", zIndex:1 }}>
            {activeNutri && (
              <div style={{ display:"flex", alignItems:"center", gap:7, justifyContent:"flex-end", marginBottom:8 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.5)", fontFamily:"'Inter',sans-serif" }}>by</span>
                <NutriAvatar user={activeNutri} size={26} />
                <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:12, fontWeight:700, color:"rgba(255,255,255,0.85)" }}>
                  {activeNutri.firstName}
                </span>
              </div>
            )}
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", marginBottom:6, fontFamily:"'Inter',sans-serif" }}>
              {userPlan?.plan?.title ?? ""}
            </div>
            {pdfUrl && <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="pp-pdf-pill">↓ PDF Plan</a>}
            <div className="pp-macro-pill" style={{ display:"block", marginTop: pdfUrl ? 6 : 0 }}>
              <strong>{done}</strong> / {total} tasks
            </div>
            <div className="pp-macro-pill" style={{ display:"block" }}>
              Day <strong>{dayNum}</strong> of {totalDays}
            </div>
          </div>
        </div>
      </div>

      {/* Meals */}
      {meals.length > 0 && (
        <div className="anim-up-d2">
          <div className="pp-section-label">Nutrition Protocol</div>
          {meals.map((meal, i) => {
            const key     = `meal-${i}`;
            const status  = marks[key];
            const color   = BAR_COLORS[i % BAR_COLORS.length];
            const protein = getMealMacro(meal,"protein") ?? getMealMacro(meal,"p");
            const carbs   = getMealMacro(meal,"carbs")   ?? getMealMacro(meal,"c");
            const fat     = getMealMacro(meal,"fat")     ?? getMealMacro(meal,"f");
            const kcal    = getMealKcal(meal);
            return (
              <div key={i} className={`pp-diet-card ${status === "done" ? "done" : status === "miss" ? "missed" : ""}`}>
                <div className="pp-diet-bar-side" style={{ background:color }} />
                <div className="pp-diet-body">
                  <div className="pp-diet-top">
                    <span className="pp-diet-name">{getMealName(meal)}</span>
                    {getMealTime(meal) && <span className="pp-diet-time">· {getMealTime(meal)}</span>}
                  </div>
                  {getMealSub(meal) && <div className="pp-diet-sub">{getMealSub(meal)}</div>}
                  <div className="pp-macro-tags">
                    {protein && <span className="pp-macro-tag p">P {protein}g</span>}
                    {carbs   && <span className="pp-macro-tag c">C {carbs}g</span>}
                    {fat     && <span className="pp-macro-tag f">F {fat}g</span>}
                    {kcal    && <span className="pp-macro-tag kcal">{kcal} kcal</span>}
                  </div>
                </div>
                <div className="pp-diet-btns">
                  <button className={`pp-diet-btn ${status === "done" ? "check-active" : ""}`} onClick={() => mark(key,"done")}>✓</button>
                  <button className={`pp-diet-btn ${status === "miss" ? "x-active"    : ""}`} onClick={() => mark(key,"miss")}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Habits */}
      {habits.length > 0 && (
        <div className="anim-up-d3">
          <div className="pp-section-label">Lifestyle &amp; Habits</div>
          {habits.map((habit, i) => {
            const key    = `habit-${i}`;
            const status = marks[key];
            const color  = BAR_COLORS[(meals.length + i) % BAR_COLORS.length];
            return (
              <div key={i} className={`pp-diet-card ${status === "done" ? "done" : status === "miss" ? "missed" : ""}`}>
                <div className="pp-diet-bar-side" style={{ background:color }} />
                <div className="pp-diet-body">
                  <div className="pp-diet-top">
                    <span className="pp-diet-name">{getHabitName(habit)}</span>
                  </div>
                  {getHabitSub(habit) && <div className="pp-diet-sub">{getHabitSub(habit)}</div>}
                </div>
                <div className="pp-diet-btns">
                  <button className={`pp-diet-btn ${status === "done" ? "check-active" : ""}`} onClick={() => mark(key,"done")}>✓</button>
                  <button className={`pp-diet-btn ${status === "miss" ? "x-active"    : ""}`} onClick={() => mark(key,"miss")}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!loading && meals.length === 0 && habits.length === 0 && (
        <div className="glass-card anim-up-d2" style={{ textAlign:"center", padding:"48px 24px" }}>
          <div style={{ fontSize:36, marginBottom:12 }}>📋</div>
          <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:15, fontWeight:800, color:"#1a3329", marginBottom:6 }}>No tasks for today</div>
          <div style={{ fontSize:13, color:"#5a7a6e", fontFamily:"'Inter',sans-serif" }}>Your nutritionist hasn't added meals or habits for today yet.</div>
        </div>
      )}

      {/* Actions */}
      <div className="anim-up-d3" style={{ display:"flex", gap:10, marginTop:22 }}>
        <button className="pp-btn-primary" style={{ flex:1, justifyContent:"center" }} onClick={saveTracking} disabled={saving}>
          {saving
            ? <><span style={{ width:13, height:13, border:"2px solid rgba(168,224,44,0.3)", borderTopColor:"#a8e02c", borderRadius:"50%", animation:"spin .7s linear infinite", display:"inline-block" }} /> Saving…</>
            : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save Today's Progress</>
          }
        </button>
        <button className="pp-btn-glass" onClick={() => navigate("/profile/chat")}>💬 Message Specialist</button>
      </div>
    </div>
  );
}