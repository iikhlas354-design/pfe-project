import { useState, useEffect } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "http://localhost:5000";

const OFFER_ICONS = {
  PLAN:        { icon: "📋", label: "Meal Plan"   },
  PACKAGE:     { icon: "📦", label: "Package"     },
  AI_CALORIES: { icon: "🤖", label: "AI Calories" },
};

function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  const remove = (tag) => onChange(value.filter(t => t !== tag));
  return (
    <>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: 8,
        padding: "10px 12px",
        border: "1.5px solid rgba(168,224,44,0.4)",
        borderRadius: 12, background: "rgba(255,255,255,0.5)",
        backdropFilter: "blur(8px)", minHeight: 44, cursor: "text",
      }}>
        {value.map(tag => (
          <span key={tag} style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            background: "rgba(11,102,48,0.12)", color: "#0b6630",
            fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 100,
            fontFamily: "'Inter',sans-serif",
          }}>
            {tag}
            <button type="button" onClick={() => remove(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: "#0b6630", fontSize: 14, lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
        <input
          value={input} placeholder={placeholder}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
            if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          style={{ border: "none", outline: "none", fontFamily: "'Inter',sans-serif", fontSize: 13, color: "#1a3329", background: "transparent", minWidth: 120, flex: 1 }}
        />
      </div>
      <div style={{ fontSize: 11, color: "#8a9a8e", marginTop: 4, fontFamily: "'Inter',sans-serif" }}>Press Enter or comma to add</div>
    </>
  );
}

const GlassCard = ({ children, style = {}, hover = true }) => (
  <div style={{
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(22px)",
    WebkitBackdropFilter: "blur(22px)",
    borderTop:    "1.5px solid rgba(168,224,44,0.85)",
    borderLeft:   "1.5px solid rgba(168,224,44,0.85)",
    borderBottom: "1.5px solid rgba(0,168,84,0.75)",
    borderRight:  "1.5px solid rgba(0,168,84,0.75)",
    borderRadius: 20,
    boxShadow: "0 8px 32px rgba(15,89,47,0.10), inset 0 0 12px rgba(255,255,255,0.5)",
    overflow: "hidden",
    transition: "all 0.3s ease",
    ...style,
  }}>
    {children}
  </div>
);

const Section = ({ title, subtitle, children, accent }) => (
  <GlassCard>
    <div style={{ padding: "18px 22px 14px", borderBottom: "1px solid rgba(168,224,44,0.2)", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: accent || "#0b6630", flexShrink: 0 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1a3329", fontFamily: "'Inter',sans-serif" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11.5, color: "#8a9a8e", marginTop: 2, fontFamily: "'Inter',sans-serif" }}>{subtitle}</div>}
      </div>
    </div>
    <div style={{ padding: "10px 22px 20px" }}>{children}</div>
  </GlassCard>
);

const InfoRow = ({ label, value, icon }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid rgba(26,51,41,0.05)" }}>
    <span style={{ fontSize: 16, opacity: 0.6 }}>{icon}</span>
    <span style={{ fontSize: 12, color: "#8a9a8e", fontWeight: 600, minWidth: 120, fontFamily: "'Inter',sans-serif" }}>{label}</span>
    <span style={{ fontSize: 13.5, fontWeight: 700, color: "#1a3329", flex: 1, textAlign: "right", fontFamily: "'Inter',sans-serif" }}>{value || "—"}</span>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", textarea = false }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 700, color: "#8a9a8e", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>{label}</div>
    {textarea
      ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{ width: "100%", border: "1.5px solid rgba(168,224,44,0.3)", borderRadius: 10, padding: "10px 13px", fontSize: 13.5, fontFamily: "'Inter',sans-serif", color: "#1a3329", background: "rgba(255,255,255,0.6)", outline: "none", resize: "vertical", boxSizing: "border-box", backdropFilter: "blur(6px)" }} />
      : <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{ width: "100%", border: "1.5px solid rgba(168,224,44,0.3)", borderRadius: 10, padding: "10px 13px", fontSize: 13.5, fontFamily: "'Inter',sans-serif", color: "#1a3329", background: "rgba(255,255,255,0.6)", outline: "none", boxSizing: "border-box", backdropFilter: "blur(6px)" }} />
    }
  </div>
);

export default function NutritionProfilePage() {
  const { user } = useAuth();

  const [resume,  setResume]  = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");

  const [form, setForm] = useState({
    bio: "", education: "", workplace: "", experienceYears: "",
    specializations: [], certifications: [], offersTypes: [],
  });

  useEffect(() => {
    fetch(`${API_URL}/resume`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setResume(data);
        setForm({
          bio:             data.bio             ?? "",
          education:       data.education       ?? "",
          workplace:       data.workplace       ?? "",
          experienceYears: data.experienceYears ?? "",
          specializations: data.specializations ?? [],
          certifications:  data.certifications  ?? [],
          offersTypes:     data.offersTypes     ?? [],
        });
      })
      .catch(() => setError("Could not load resume."))
      .finally(() => setLoading(false));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const save = async () => {
    setSaving(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/resume`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, experienceYears: form.experienceYears ? parseInt(form.experienceYears, 10) : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      setResume(data); setEditing(false); setSaved(true);
      setTimeout(() => setSaved(false), 3500);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300 }}>
      <div style={{ width: 32, height: 32, border: "3px solid rgba(168,224,44,0.3)", borderTop: "3px solid #0b6630", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        .anim-up    { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) both }
        .anim-up-d1 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.08s both }
        .anim-up-d2 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.16s both }
        .anim-up-d3 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.24s both }
        .anim-up-d4 { animation: slideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.32s both }
        input:focus, textarea:focus {
          border-color: rgba(168,224,44,0.8) !important;
          background: #fff !important;
          box-shadow: 0 0 0 3px rgba(11,102,48,0.1) !important;
        }
        .offer-card { transition: all 0.2s ease; }
        .offer-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* ══════════════════════════════════════════
           HERO HEADER — Stylish with glassmorphism
          ══════════════════════════════════════════ */}
      <div className="anim-up" style={{ marginBottom: 28 }}>
        <GlassCard style={{ overflow: "visible" }}>
          {/* Green gradient strip */}
          <div style={{
            height: 90,
            background: "linear-gradient(135deg,#0b6630 0%,#2d6b50 50%,#1a5e3a 100%)",
            position: "relative", overflow: "hidden", borderRadius: "18px 18px 0 0",
          }}>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(168,224,44,0.1) 1.5px,transparent 1.5px)", backgroundSize: "22px 22px" }} />
            <div style={{ position: "absolute", right: -40, top: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(168,224,44,0.08)" }} />
            <div style={{ position: "absolute", right: 80, bottom: -60, width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          </div>

          <div style={{ padding: "0 28px 24px", position: "relative" }}>
            {/* Avatar row */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -44 }}>
              {/* Avatar */}
              <div style={{
                width: 88, height: 88, borderRadius: "50%",
                background: "linear-gradient(135deg,#0b6630,#2d6b50)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "4px solid rgba(255,255,255,0.9)",
                boxShadow: "0 8px 24px rgba(11,102,48,0.3)",
                flexShrink: 0,
              }}>
                {user?.image
                  ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                  : <span style={{ fontSize: 30, fontWeight: 800, color: "#a8e02c", fontFamily: "'Inter',sans-serif" }}>{initials}</span>
                }
              </div>

              {/* Edit / Save buttons — right side of the header */}
              <div style={{ display: "flex", gap: 10, paddingBottom: 4 }}>
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); setError(""); }} style={{
                      padding: "9px 18px", borderRadius: 20, border: "1.5px solid rgba(168,224,44,0.4)",
                      background: "rgba(255,255,255,0.5)", backdropFilter: "blur(8px)",
                      fontSize: 13, fontWeight: 600, color: "#1a3329", cursor: "pointer",
                      fontFamily: "'Inter',sans-serif", display: "inline-flex", alignItems: "center", gap: 6,
                    }}>
                      Cancel
                    </button>
                    <button onClick={save} disabled={saving} style={{
                      padding: "9px 20px", borderRadius: 20, border: "none",
                      background: saving ? "rgba(11,102,48,0.7)" : "#0b6630",
                      fontSize: 13, fontWeight: 700, color: "#fff", cursor: saving ? "not-allowed" : "pointer",
                      fontFamily: "'Inter',sans-serif", display: "inline-flex", alignItems: "center", gap: 7,
                      boxShadow: "0 4px 14px rgba(11,102,48,0.35)", transition: "all 0.2s",
                    }}>
                      {saving
                        ? <><span style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Saving…</>
                        : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Save Changes</>
                      }
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} style={{
                    padding: "9px 20px", borderRadius: 20, border: "none",
                    background: "#0b6630",
                    fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer",
                    fontFamily: "'Inter',sans-serif", display: "inline-flex", alignItems: "center", gap: 7,
                    boxShadow: "0 4px 14px rgba(11,102,48,0.35)", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = "#2d6b50"}
                    onMouseLeave={e => e.currentTarget.style.background = "#0b6630"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            {/* Name + info */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 20, fontWeight: 800, color: "#1a3329" }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 13, color: "#8a9a8e", marginTop: 3, fontFamily: "'Inter',sans-serif" }}>{user?.email}</div>

              {/* Tags row */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(11,102,48,0.1)", color: "#0b6630", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, border: "1px solid rgba(11,102,48,0.15)", fontFamily: "'Inter',sans-serif" }}>
                  ✓ Verified Nutritionist
                </span>
                {resume?.experienceYears && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(26,111,160,0.1)", color: "#1a6fa0", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, border: "1px solid rgba(26,111,160,0.15)", fontFamily: "'Inter',sans-serif" }}>
                    📅 {resume.experienceYears} yrs experience
                  </span>
                )}
                {resume?.ratingAverage > 0 && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(184,162,0,0.1)", color: "#b8a200", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, border: "1px solid rgba(184,162,0,0.15)", fontFamily: "'Inter',sans-serif" }}>
                    ⭐ {resume.ratingAverage.toFixed(1)} rating
                  </span>
                )}
                {resume?.workplace && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(122,63,160,0.1)", color: "#7a3fa0", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, border: "1px solid rgba(122,63,160,0.15)", fontFamily: "'Inter',sans-serif" }}>
                    🏥 {resume.workplace}
                  </span>
                )}
              </div>

              {/* Divider */}
              <div style={{ height: 1, background: "rgba(168,224,44,0.2)", margin: "18px 0 16px" }} />

              {/* Quick stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
                {[
                  { label: "Specializations", value: resume?.specializations?.length || 0, icon: "🎯" },
                  { label: "Certifications",  value: resume?.certifications?.length  || 0, icon: "🎓" },
                  { label: "Services",         value: resume?.offersTypes?.length     || 0, icon: "📦" },
                ].map(s => (
                  <div key={s.label} style={{ textAlign: "center", padding: "10px 0", background: "rgba(255,255,255,0.3)", backdropFilter: "blur(6px)", borderRadius: 12, border: "1px solid rgba(168,224,44,0.2)" }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#0b6630", fontFamily: "'Inter',sans-serif" }}>{s.value}</div>
                    <div style={{ fontSize: 10.5, color: "#8a9a8e", fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.7, fontFamily: "'Inter',sans-serif" }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* ── Banners ── */}
      {saved && (
        <div className="anim-up" style={{ background: "rgba(11,102,48,0.1)", backdropFilter: "blur(8px)", borderRadius: 14, padding: "13px 18px", fontSize: 13.5, fontWeight: 600, color: "#0b6630", display: "flex", alignItems: "center", gap: 10, marginBottom: 20, border: "1px solid rgba(168,224,44,0.3)", fontFamily: "'Inter',sans-serif" }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#0b6630", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          Profile saved successfully
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(229,62,62,0.08)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#c53030", border: "1px solid rgba(229,62,62,0.2)", fontFamily: "'Inter',sans-serif" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Two Column Layout ── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 20 }}>

        {/* ── LEFT: Sidebar Cards ── */}
        <div className="anim-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Services Card */}
          <GlassCard style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0b6630", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14, fontFamily: "'Inter',sans-serif" }}>Services</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {resume?.offersTypes?.length ? resume.offersTypes.map(o => {
                const meta = OFFER_ICONS[o];
                return meta ? (
                  <div key={o} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "rgba(255,255,255,0.4)", backdropFilter: "blur(6px)", borderRadius: 10, border: "1px solid rgba(168,224,44,0.2)" }}>
                    <span style={{ fontSize: 17 }}>{meta.icon}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#1a3329", fontFamily: "'Inter',sans-serif" }}>{meta.label}</span>
                  </div>
                ) : null;
              }) : <div style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>No services added yet</div>}
            </div>
          </GlassCard>

          {/* Stats Card */}
          <GlassCard style={{ padding: "18px 20px" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0b6630", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14, fontFamily: "'Inter',sans-serif" }}>Stats</div>
            {[
              { label: "Rating",       value: resume?.ratingAverage ? `⭐ ${resume.ratingAverage.toFixed(1)}` : "No ratings yet", icon: "📊" },
              { label: "Member since", value: resume?.createdAt ? new Date(resume.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" }) : "—", icon: "📅" },
              { label: "Last updated", value: resume?.updatedAt  ? new Date(resume.updatedAt).toLocaleDateString("en-GB",  { month: "short", year: "numeric" }) : "—", icon: "🔄" },
            ].map(({ label, value, icon }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid rgba(168,224,44,0.15)" }}>
                <span style={{ fontSize: 14, opacity: 0.7 }}>{icon}</span>
                <span style={{ fontSize: 12, color: "#8a9a8e", fontWeight: 600, flex: 1, fontFamily: "'Inter',sans-serif" }}>{label}</span>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: "#1a3329", fontFamily: "'Inter',sans-serif" }}>{value}</span>
              </div>
            ))}
          </GlassCard>
        </div>

        {/* ── RIGHT: Detail Sections ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* About */}
          <div className="anim-up-d1">
            <Section title="About" subtitle="Your bio and background" accent="#0b6630">
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <InputField label="Bio" value={form.bio} onChange={v => set("bio", v)} placeholder="Describe your approach and philosophy…" textarea />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <InputField label="Education" value={form.education} onChange={v => set("education", v)} placeholder="e.g. MSc Nutritional Science" />
                    <InputField label="Workplace"  value={form.workplace}  onChange={v => set("workplace", v)}  placeholder="e.g. Wellness Clinic" />
                  </div>
                  <div style={{ maxWidth: 200 }}>
                    <InputField label="Years of Experience" value={form.experienceYears} onChange={v => set("experienceYears", v)} placeholder="e.g. 8" type="number" />
                  </div>
                </div>
              ) : (
                <div>
                  {resume?.bio && <div style={{ fontSize: 13.5, color: "#3a4a40", lineHeight: 1.7, marginBottom: 14, padding: "10px 0", fontFamily: "'Inter',sans-serif" }}>{resume.bio}</div>}
                  <InfoRow label="Education"  value={resume?.education}  icon="🎓" />
                  <InfoRow label="Workplace"  value={resume?.workplace}  icon="🏥" />
                  <InfoRow label="Experience" value={resume?.experienceYears ? `${resume.experienceYears} years` : null} icon="📅" />
                </div>
              )}
            </Section>
          </div>

          {/* Specializations */}
          <div className="anim-up-d2">
            <Section title="Specializations" subtitle="Your areas of expertise" accent="#1a6fa0">
              {editing ? (
                <TagInput value={form.specializations} onChange={v => set("specializations", v)} placeholder="e.g. Weight Loss, Diabetes…" />
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 0" }}>
                  {resume?.specializations?.length
                    ? resume.specializations.map(s => (
                        <span key={s} style={{ background: "rgba(26,111,160,0.1)", color: "#1a6fa0", fontSize: 12.5, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(26,111,160,0.2)", fontFamily: "'Inter',sans-serif" }}>✦ {s}</span>
                      ))
                    : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>No specializations added yet</span>
                  }
                </div>
              )}
            </Section>
          </div>

          {/* Certifications */}
          <div className="anim-up-d3">
            <Section title="Certifications" subtitle="Your qualifications and credentials" accent="#b8a200">
              {editing ? (
                <TagInput value={form.certifications} onChange={v => set("certifications", v)} placeholder="e.g. Registered Dietitian…" />
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "6px 0" }}>
                  {resume?.certifications?.length
                    ? resume.certifications.map(c => (
                        <span key={c} style={{ background: "rgba(184,162,0,0.1)", color: "#b8a200", fontSize: 12.5, fontWeight: 600, padding: "5px 14px", borderRadius: 20, border: "1px solid rgba(184,162,0,0.2)", fontFamily: "'Inter',sans-serif" }}>🎓 {c}</span>
                      ))
                    : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>No certifications added yet</span>
                  }
                </div>
              )}
            </Section>
          </div>

          {/* Services */}
          <div className="anim-up-d4">
            <Section title="Services Offered" subtitle="What you offer to patients" accent="#7a3fa0">
              {editing ? (
                <div style={{ display: "flex", gap: 12 }}>
                  {Object.entries(OFFER_ICONS).map(([val, { icon, label }]) => (
                    <div key={val} className="offer-card"
                      onClick={() => set("offersTypes", form.offersTypes.includes(val) ? form.offersTypes.filter(v => v !== val) : [...form.offersTypes, val])}
                      style={{
                        flex: 1,
                        border: `2px solid ${form.offersTypes.includes(val) ? "rgba(168,224,44,0.7)" : "rgba(26,51,41,0.1)"}`,
                        borderRadius: 14, padding: "16px 12px", cursor: "pointer",
                        background: form.offersTypes.includes(val) ? "rgba(11,102,48,0.1)" : "rgba(255,255,255,0.3)",
                        backdropFilter: "blur(8px)", textAlign: "center",
                        boxShadow: form.offersTypes.includes(val) ? "0 4px 14px rgba(11,102,48,0.15)" : "none",
                      }}
                    >
                      <div style={{ fontSize: 26, marginBottom: 6 }}>{icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#1a3329", fontFamily: "'Inter',sans-serif" }}>{label}</div>
                      {form.offersTypes.includes(val) && (
                        <div style={{ fontSize: 10.5, color: "#0b6630", fontWeight: 700, marginTop: 5, fontFamily: "'Inter',sans-serif" }}>✓ Active</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "6px 0" }}>
                  {resume?.offersTypes?.length
                    ? resume.offersTypes.map(o => {
                        const meta = OFFER_ICONS[o];
                        return meta ? (
                          <span key={o} style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(122,63,160,0.1)", color: "#7a3fa0", fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 20, border: "1px solid rgba(122,63,160,0.2)", fontFamily: "'Inter',sans-serif" }}>
                            {meta.icon} {meta.label}
                          </span>
                        ) : null;
                      })
                    : <span style={{ color: "#c0d0c8", fontStyle: "italic", fontSize: 13, fontFamily: "'Inter',sans-serif" }}>No services added yet</span>
                  }
                </div>
              )}
            </Section>
          </div>

        </div>
      </div>
    </div>
  );
}