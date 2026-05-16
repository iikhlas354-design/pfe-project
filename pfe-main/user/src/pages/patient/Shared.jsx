// ─── Shared CSS ───────────────────────────────────────────────────────────────
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

*{box-sizing:border-box;}

@keyframes fadeUp  {from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn  {from{opacity:0}to{opacity:1}}
@keyframes popIn   {from{opacity:0;transform:scale(0.92) translateY(12px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes slideIn {from{opacity:0;transform:translateX(18px)}to{opacity:1;transform:translateX(0)}}
@keyframes slideUp {from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse   {0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.15)}}
@keyframes float   {0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes spinIn  {from{opacity:0;transform:rotate(-8deg) scale(0.85)}to{opacity:1;transform:rotate(0) scale(1)}}
@keyframes shimmer {from{background-position:-400px 0}to{background-position:400px 0}}
@keyframes spin    {from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.pr-fade-up  {animation:fadeUp  0.6s cubic-bezier(0.22,1,0.36,1) both}
.pr-pop-in   {animation:popIn   0.38s cubic-bezier(0.34,1.4,0.64,1) both}
.pr-slide-in {animation:slideIn 0.42s cubic-bezier(0.22,1,0.36,1) both}
.pr-slide-up {animation:slideUp 0.42s cubic-bezier(0.22,1,0.36,1) both}

.pr-card{
  background:#fff;border-radius:20px;padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);
  transition:box-shadow 0.25s ease;
}
.pr-card:hover{box-shadow:0 4px 24px rgba(26,51,41,0.1);}

.pr-input{
  width:100%;border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:10px 13px;font-size:13.5px;font-family:'DM Sans',sans-serif;
  color:#1a3329;background:#f7faf8;outline:none;
  transition:all 0.2s ease;box-sizing:border-box;resize:none;
}
.pr-input:focus{border-color:#4f9e7a;background:#fff;box-shadow:0 0 0 3px rgba(79,158,122,0.1);}
.pr-input::placeholder{color:#9ab8ae;}

.pr-save-btn{
  background:linear-gradient(135deg,#1a3329,#2d6b50);color:#f5e642;
  border:none;border-radius:10px;padding:10px 22px;font-size:13px;
  font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:all 0.22s ease;display:inline-flex;align-items:center;gap:6px;
}
.pr-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(26,51,41,0.28);}
.pr-save-btn:active{transform:translateY(0);}
.pr-save-btn:disabled{opacity:0.7;cursor:not-allowed;transform:none;}

.pr-field{
  background:#f7faf8;border-radius:10px;padding:11px 14px;
  border:1.5px solid rgba(79,158,122,0.08);transition:all 0.2s ease;
  font-size:14px;color:#1a3329;font-weight:500;min-height:40px;
}
.pr-field:hover{border-color:rgba(79,158,122,0.2);}
.pr-field.empty{color:#c0d0c8;font-style:italic;}

.pr-prog-track{height:7px;background:#eef4f1;border-radius:999px;overflow:hidden;margin-top:6px;}
.pr-prog-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#3d9b73,#f5e642);transition:width 0.8s cubic-bezier(0.22,1,0.36,1);}

.pr-bubble-me{
  background:linear-gradient(135deg,#1a3329,#2d6b50);color:#fff;
  border-radius:18px 18px 4px 18px;padding:10px 14px;font-size:13.5px;
  line-height:1.55;max-width:80%;align-self:flex-end;
  animation:popIn 0.22s ease;box-shadow:0 3px 10px rgba(26,51,41,0.18);
}
.pr-bubble-doc{
  background:#f0f7f4;color:#1a3329;
  border-radius:18px 18px 18px 4px;padding:10px 14px;font-size:13.5px;
  line-height:1.55;max-width:80%;align-self:flex-start;
  animation:popIn 0.22s ease;border:1px solid rgba(79,158,122,0.12);
}

.pr-notif{
  display:flex;gap:12px;padding:13px 15px;border-radius:14px;
  transition:all 0.2s ease;cursor:pointer;border:1px solid transparent;
}
.pr-notif:hover{background:#f4faf7;}
`;

// ─── Mock Data ────────────────────────────────────────────────────────────────
export const MOCK_PLAN = {
  name: "Premium Health Plan",
  specialist: "Dr. Sarah Mitchell",
  specialistTitle: "Clinical Nutritionist",
  specialistAvatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&q=80",
  startDate: "Feb 2026",
  endDate: "May 2026",
  goal: "Weight Management",
  status: "Active",
  progress: 65,
};

export const MOCK_NOTIFS = [
  { id: 1, text: "Dr. Sarah sent you a new meal plan for this week.", date: "2h ago", read: false, type: "plan" },
  { id: 2, text: "Your weekly check-in is scheduled for tomorrow at 10:00 AM.", date: "5h ago", read: false, type: "appointment" },
  { id: 3, text: "You've completed 80% of your nutrition goals this week!", date: "1d ago", read: true, type: "achievement" },
  { id: 4, text: "New blog post: '10 Foods That Boost Your Metabolism'.", date: "2d ago", read: true, type: "blog" },
];

export const NOTIF_META = {
  plan:        { icon: "📋", color: "#2d7a4f", bg: "#e8f5e9", label: "Plan Update" },
  appointment: { icon: "📅", color: "#1a6fa0", bg: "#e3f2fd", label: "Appointment" },
  achievement: { icon: "🏆", color: "#b8a200", bg: "#fefde8", label: "Achievement" },
  blog:        { icon: "📝", color: "#7a3fa0", bg: "#f3e8fd", label: "Blog" },
};

export const CHAT_RESPONSES = [
  "Hello! How are you feeling today?",
  "I've reviewed your latest logs — great progress this week!",
  "Remember to stay hydrated — at least 8 glasses a day.",
  "Your next check-in is tomorrow. Looking forward to it!",
  "Small consistent steps lead to lasting results. Keep it up!",
  "How's your sleep been lately? Rest is key to recovery.",
];

// ─── Helper Components ────────────────────────────────────────────────────────
export function Stars({ n }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= n ? "#f5a623" : "#ddd", fontSize: 12 }}>★</span>
      ))}
    </div>
  );
}

export function SectionTitle({ icon, bg, title }) {
  return (
    <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{icon}</div>
      {title}
    </div>
  );
}

export function Field({ label, val, editing, field, setForm, type = "text", options, placeholder = "" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <label style={{ fontSize: 10.5, fontWeight: 700, color: "#4f9e7a", letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</label>
      {editing
        ? options
          ? (
            <select className="pr-input" value={val} onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}>
              <option value="">Select…</option>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
          ) : (
            <input
              className="pr-input"
              type={type}
              value={val}
              placeholder={placeholder || label}
              onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
            />
          )
        : <div className={`pr-field${!val ? " empty" : ""}`}>{val || "Not set"}</div>
      }
    </div>
  );
}