import { useAuth } from "../../context/Authcontext";
import { CSS, SectionTitle } from "./Shared";

export default function ProfileProgressPage() {
  const { user } = useAuth();

  const weight = user?.profile?.weight || "";
  const height = user?.profile?.height || "";
  const goal   = user?.profile?.goal   || "";

  const bmi = weight && height
    ? (parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)
    : null;

  const getBMIStatus = (bmi) => {
    if (!bmi) return null;
    const b = parseFloat(bmi);
    if (b < 18.5) return { label: "Underweight", color: "#1a6fa0", bg: "#e3f2fd" };
    if (b < 25)   return { label: "Normal",      color: "#2d7a4f", bg: "#e8f5e9" };
    if (b < 30)   return { label: "Overweight",  color: "#b8a200", bg: "#fefde8" };
    return              { label: "Obese",         color: "#c0392b", bg: "#fdecea" };
  };

  const bmiStatus = getBMIStatus(bmi);

  const stats = [
    { label: "Weight", val: weight ? `${weight}` : "—", unit: "kg",              icon: "⚖️", color: "#1a6fa0", bg: "#e3f2fd" },
    { label: "Height", val: height ? `${height}` : "—", unit: "cm",              icon: "📏", color: "#2d7a4f", bg: "#e8f5e9" },
    { label: "BMI",    val: bmi    || "—",              unit: bmiStatus?.label ?? "", icon: "🔬", color: bmiStatus?.color ?? "#7a3fa0", bg: bmiStatus?.bg ?? "#f3e8fd" },
    { label: "Goal",   val: goal   || "—",              unit: "",                 icon: "🎯", color: "#b8a200", bg: "#fefde8" },
  ];

  const weekData = [
    { day: "Mon", cal: 1820 },
    { day: "Tue", cal: 1650 },
    { day: "Wed", cal: 1900 },
    { day: "Thu", cal: 1740 },
    { day: "Fri", cal: 1680 },
    { day: "Sat", cal: 2100 },
    { day: "Sun", cal: 1580 },
  ];
  const target = 1800;
  const maxCal = Math.max(...weekData.map(d => d.cal));
  const avgCal = Math.round(weekData.reduce((a, b) => a + b.cal, 0) / weekData.length);

  return (
    <div style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes barGrow { from { height: 0 } to { height: var(--h) } }
        .bar-animated { animation: barGrow 0.8s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 5, fontFamily: "'Inter',sans-serif" }}>
          Health
        </div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", letterSpacing: -0.5 }}>
          Progress
        </div>
        <div style={{ fontSize: 13, color: "#5a7a6e", marginTop: 4, fontFamily: "'Inter',sans-serif" }}>
          Track your health metrics and weekly calorie intake.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* ── Stat Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 }}>
          {stats.map((s, i) => (
            <div key={s.label} className="pr-card pr-slide-in" style={{ padding: "18px 16px", animationDelay: `${i * 0.07}s` }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, marginBottom: 12 }}>
                {s.icon}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#9ab8ae", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4, fontFamily: "'Inter',sans-serif" }}>
                {s.label}
              </div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: s.color, lineHeight: 1, marginBottom: 2 }}>
                {s.val}
              </div>
              {s.unit && (
                <div style={{ fontSize: 11, fontWeight: 600, color: s.color, opacity: 0.7, fontFamily: "'Inter',sans-serif" }}>{s.unit}</div>
              )}
            </div>
          ))}
        </div>

        {/* ── Weekly Calories ── */}
        <div className="pr-card pr-slide-in" style={{ animationDelay: "0.28s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <SectionTitle bg="#fefde8" title="Weekly Calories" icon="🔥" />
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 11, color: "#9ab8ae", fontWeight: 600, marginBottom: 2, fontFamily: "'Inter',sans-serif" }}>Weekly avg</div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: avgCal > target ? "#c0392b" : "#2d7a4f" }}>
                {avgCal} <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, fontFamily: "'Inter',sans-serif" }}>kcal</span>
              </div>
            </div>
          </div>

          {/* Target line indicator */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, padding: "8px 12px", background: "#f7fdf9", borderRadius: 10, border: "1px solid rgba(79,158,122,0.1)" }}>
            <div style={{ width: 24, height: 2, background: "#2d7a4f", borderRadius: 999, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: "#5a7a6e", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>Target: {target} kcal/day</span>
          </div>

          {/* Bar chart */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130, marginBottom: 12 }}>
            {weekData.map((d, i) => {
              const over   = d.cal > target;
              const pct    = (d.cal / maxCal) * 100;
              const isToday = i === new Date().getDay() - 1;
              return (
                <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, height: "100%" }}>
                  <div style={{ fontSize: 9.5, color: over ? "#c0392b" : "#2d7a4f", fontWeight: 700, textAlign: "center", lineHeight: 1, fontFamily: "'Inter',sans-serif" }}>
                    {d.cal}
                  </div>
                  <div style={{ width: "100%", flex: 1, display: "flex", alignItems: "flex-end" }}>
                    <div style={{
                      width: "100%",
                      height: `${pct}%`,
                      borderRadius: "6px 6px 4px 4px",
                      background: over
                        ? "linear-gradient(180deg,#f5b8b8,#e88)"
                        : isToday
                        ? "linear-gradient(180deg,#f5e642,#d4c200)"
                        : "linear-gradient(180deg,#3d9b73,#2d6b50)",
                      transition: "height 0.8s cubic-bezier(0.22,1,0.36,1)",
                      boxShadow: isToday ? "0 2px 8px rgba(245,230,66,0.4)" : "none",
                    }} />
                  </div>
                  <div style={{ fontSize: 10.5, color: isToday ? "#1a3329" : "#9ab8ae", fontWeight: isToday ? 800 : 600, fontFamily: isToday ? "'Space Grotesk',sans-serif" : "'Inter',sans-serif" }}>
                    {d.day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: "flex", gap: 16, padding: "10px 14px", background: "#f7faf8", borderRadius: 10, flexWrap: "wrap" }}>
            {[
              { color: "linear-gradient(180deg,#3d9b73,#2d6b50)", label: "Under target" },
              { color: "linear-gradient(180deg,#f5e642,#d4c200)",  label: "Today"        },
              { color: "linear-gradient(180deg,#f5b8b8,#e88)",     label: "Over target"  },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "#5a7a6e", fontWeight: 600, fontFamily: "'Inter',sans-serif" }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Health Summary ── */}
        <div className="pr-card pr-slide-in" style={{ animationDelay: "0.35s" }}>
          <SectionTitle bg="#e8f5e9" title="Health Summary" icon="📊" />
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "Calorie Goal",   val: `${target} kcal/day`,  pct: 100, color: "#2d7a4f" },
              { label: "Weekly Average", val: `${avgCal} kcal/day`,  pct: Math.round((avgCal / target) * 100), color: avgCal > target ? "#c0392b" : "#2d7a4f" },
              { label: "Best Day",       val: `${Math.min(...weekData.map(d => d.cal))} kcal`, pct: Math.round((Math.min(...weekData.map(d => d.cal)) / target) * 100), color: "#1a6fa0" },
            ].map(row => (
              <div key={row.label}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>{row.label}</span>
                  <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 800, color: row.color }}>{row.val}</span>
                </div>
                <div style={{ height: 6, background: "#eef4f1", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(row.pct, 100)}%`, background: row.color, borderRadius: 999, transition: "width 0.8s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}