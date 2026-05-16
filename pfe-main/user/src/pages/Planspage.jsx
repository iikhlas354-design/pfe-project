import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes spin { to { transform: rotate(360deg); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }

/* ── Page ── */
.pl-page {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
  background: #f7faf8;
}

/* ── Hero ── */
.pl-hero {
  padding: 52px 40px 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.pl-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #0b6630;
  text-transform: uppercase;
  letter-spacing: 1.8px;
  background: rgba(168,224,44,0.15);
  border: 1px solid rgba(168,224,44,0.45);
  border-radius: 999px;
  padding: 5px 14px;
}
.pl-hero-badge::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #0b6630;
  display: inline-block;
  flex-shrink: 0;
}
.pl-hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: #1a3329;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.pl-hero-title span { color: #0b6630; }

/* ── Category filters ── */
.pl-cats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 0 40px 20px;
}
.pl-cat-btn {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 700;
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 0.3px;
}
.pl-cat-btn:hover { transform: translateY(-1px); }

.pl-count {
  padding: 0 40px 16px;
  font-size: 12.5px;
  font-weight: 600;
  color: #5a7a6e;
}

/* ── Grid ── */
.pl-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 0 40px 60px;
}

/* ── Glass card ── */
.pl-card {
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
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.3s ease;
}
.pl-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
  transform: translateY(-3px);
}
.pl-card.popular {
  border-top:    1.5px solid rgba(245,230,66,0.9);
  border-left:   1.5px solid rgba(245,230,66,0.9);
  border-bottom: 1.5px solid rgba(168,224,44,0.8);
  border-right:  1.5px solid rgba(168,224,44,0.8);
}

/* ── Card image ── */
.pl-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.pl-card:hover .pl-cover-img { transform: scale(1.05); }

/* ── Card body ── */
.pl-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px 18px 20px;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(10px);
}

.pl-card-desc {
  font-size: 12.5px;
  color: #5a7a6e;
  line-height: 1.65;
  margin: 0;
}

.pl-specialist-row {
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255,255,255,0.5);
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(0,168,84,0.12);
  backdrop-filter: blur(8px);
}
.pl-specialist-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  margin-bottom: 2px;
}
.pl-specialist-name {
  font-size: 13px;
  font-weight: 600;
  color: #1a3329;
}

.pl-features { display: flex; flex-direction: column; gap: 7px; }
.pl-feature-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: #2a4a3e;
  line-height: 1.5;
}
.pl-feature-dot {
  width: 17px; height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.pl-divider {
  height: 1px;
  background: rgba(0,168,84,0.1);
}

/* ── Buy button ── */
.pl-buy-btn {
  font-family: 'Inter', sans-serif;
  font-size: 13.5px;
  font-weight: 700;
  padding: 12px 0;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.22s ease;
  width: 100%;
}
.pl-buy-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.05); }
.pl-buy-btn:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Spinner ── */
.pl-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

/* ── Shimmer skeleton ── */
.pl-shimmer {
  height: 380px;
  border-radius: 22px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.35) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
  border: 1.5px solid rgba(168,224,44,0.3);
}

/* ── Error ── */
.pl-error {
  margin: 0 40px 24px;
  padding: 16px 20px;
  background: rgba(254,232,232,0.7);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(192,57,43,0.2);
  font-size: 13.5px;
  font-weight: 600;
  color: #8a3a2f;
  display: flex;
  align-items: center;
  gap: 10px;
}
.pl-error-retry {
  background: none;
  border: none;
  color: #8a3a2f;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
  font-size: 13px;
}

/* ── Empty ── */
.pl-empty {
  grid-column: 1/-1;
  text-align: center;
  padding: 60px 24px;
  color: #9ab5a5;
}
`;

const CATEGORY_ACCENT = {
  "Weight Loss":     "#2d7a4f",
  "Muscle Gain":     "#1a6fa0",
  "Diabetes":        "#c07a00",
  "Heart Health":    "#c0392b",
  "Gut Health":      "#2d7a4f",
  "Mental Wellness": "#7a3fa0",
  "Sports":          "#1a6fa0",
};

const CATEGORY_COVERS = {
  "Weight Loss":     "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600&q=80",
  "Muscle Gain":     "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
  "Diabetes":        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=600&q=80",
  "Heart Health":    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
  "Gut Health":      "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80",
  "Mental Wellness": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80",
  "Sports":          "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80",
};

function mapPlan(p) {
  const category = p.goals?.[0] ?? "General";
  const accent   = CATEGORY_ACCENT[category] ?? "#2d7a4f";
  const coverImg = p.images?.[0] ?? CATEGORY_COVERS[category] ?? CATEGORY_COVERS["Weight Loss"];
  return {
    id:               p.id,
    category,
    accent,
    coverImg,
    name:             p.title,
    price:            p.offer ? `$${Number(p.offer.price).toFixed(2)}` : "—",
    period:           "/mo",
    duration:         p.offer ? `${p.offer.durationDays} days` : "",
    desc:             p.offer?.description ?? "",
    popular:          p.offer?.includesSessions ?? false,
    specialist:       p.nutrition ? `${p.nutrition.firstName} ${p.nutrition.lastName}` : "Specialist",
    specialistAvatar: p.nutrition?.image ?? "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=80&q=80",
    features:         p.goals ?? [],
    content:          p.content,
  };
}

function PlanCard({ plan, index, onBuy, buying }) {
  return (
    <div
      className={`pl-card anim-up ${plan.popular ? "popular" : ""}`}
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 180, overflow: "hidden", flexShrink: 0 }}>
        <img src={plan.coverImg} alt={plan.category} className="pl-cover-img" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom,rgba(0,0,0,0.05) 0%,rgba(26,51,41,0.7) 100%)" }} />

        {plan.popular && (
          <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(168,224,44,0.9)", backdropFilter: "blur(8px)", color: "#1a3329", fontSize: 10.5, fontWeight: 800, padding: "4px 11px", borderRadius: 999, letterSpacing: 0.4 }}>
            ⭐ Popular
          </div>
        )}

        <div style={{ position: "absolute", top: 12, left: 12 }}>
          <span style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, border: "1px solid rgba(168,224,44,0.4)" }}>
            {plan.category}
          </span>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "12px 16px" }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 17, fontWeight: 800, color: "#fff", marginBottom: 4, textShadow: "0 1px 4px rgba(0,0,0,0.4)" }}>{plan.name}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: "rgba(168,224,44,0.95)", textShadow: "0 1px 6px rgba(0,0,0,0.3)" }}>{plan.price}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>{plan.period}</span>
            {plan.duration && (
              <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(6px)", borderRadius: 999, padding: "3px 9px", border: "1px solid rgba(168,224,44,0.3)" }}>{plan.duration}</span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="pl-card-body">
        {plan.desc && <p className="pl-card-desc">{plan.desc}</p>}

        {/* Specialist */}
        <div className="pl-specialist-row">
          <img
            src={plan.specialistAvatar}
            alt={plan.specialist}
            style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "2px solid rgba(168,224,44,0.5)" }}
          />
          <div>
            <div className="pl-specialist-label" style={{ color: "#0b6630" }}>Specialist</div>
            <div className="pl-specialist-name">{plan.specialist}</div>
          </div>
        </div>

        {/* Features */}
        {plan.features.length > 0 && (
          <div className="pl-features">
            {plan.features.map(f => (
              <div key={f} className="pl-feature-row">
                <div className="pl-feature-dot" style={{ background: "rgba(168,224,44,0.15)", border: "1.5px solid rgba(0,168,84,0.35)" }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                {f}
              </div>
            ))}
          </div>
        )}

        <div className="pl-divider" />

        {/* Button */}
        <button
          className="pl-buy-btn"
          onClick={() => onBuy(plan)}
          disabled={buying === plan.id}
          style={{
            background: plan.popular
              ? "linear-gradient(135deg,#0b6630,#2d7a4f)"
              : "rgba(168,224,44,0.15)",
            color: plan.popular ? "#fff" : "#0b6630",
            border: plan.popular ? "none" : "1.5px solid rgba(0,168,84,0.35)",
            boxShadow: plan.popular ? "0 6px 18px rgba(11,102,48,0.25)" : "none",
          }}
        >
          {buying === plan.id
            ? <span className="pl-spinner" />
            : <>
                Buy Now
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
              </>
          }
        </button>
      </div>
    </div>
  );
}

export default function PlansPage() {
  const navigate       = useNavigate();
  const { isLoggedIn } = useAuth();

  const [plans,          setPlans]          = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [buying,         setBuying]         = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true); setError(null);
        const res = await fetch("/api/plans", { signal: controller.signal });
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        setPlans((data.plans ?? []).map(mapPlan));
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const categories = ["All", ...new Set(plans.map(p => p.category))];
  const filtered   = activeCategory === "All" ? plans : plans.filter(p => p.category === activeCategory);

  const handleBuy = (plan) => {
    setBuying(plan.id);
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/payment", planId: plan.id } });
    } else {
      navigate("/payment", { state: { planId: plan.id } });
    }
    setTimeout(() => setBuying(null), 3000);
  };

  return (
    <div className="pl-page">
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <div className="pl-hero anim-up">
        <p className="pl-hero-badge">
          {loading ? "Loading plans…" : `${plans.length} specialist-designed plans`}
        </p>
        <h1 className="pl-hero-title">Find the plan built<br />for <span>your goals.</span></h1>
      </div>

      {/* Error */}
      {error && (
        <div className="pl-error">
          <span style={{ fontSize: 18 }}>⚠️</span>
          {error} —
          <button onClick={() => window.location.reload()} className="pl-error-retry">Retry</button>
        </div>
      )}

      {/* Filters */}
      {!loading && (
        <div className="pl-cats anim-up-d1">
          {categories.map(cat => (
            <button
              key={cat}
              className="pl-cat-btn"
              onClick={() => setActiveCategory(cat)}
              style={{
                background: activeCategory === cat ? "linear-gradient(135deg,#0b6630,#2d7a4f)" : "rgba(255,255,255,0.7)",
                color:      activeCategory === cat ? "#fff" : "#0b6630",
                border:     `1.5px solid ${activeCategory === cat ? "transparent" : "rgba(0,168,84,0.25)"}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="pl-count anim-up-d2">
          {filtered.length} plan{filtered.length !== 1 ? "s" : ""}
          {activeCategory !== "All" ? ` for ${activeCategory}` : " available"}
        </div>
      )}

      {/* Grid */}
      <div className="pl-grid">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="pl-shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
            ))
          : filtered.length === 0
            ? (
              <div className="pl-empty">
                <div style={{ fontSize: 40, marginBottom: 14 }}>🌿</div>
                <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 8 }}>No plans yet</div>
                <div style={{ fontSize: 14 }}>Check back soon — new plans are on the way.</div>
              </div>
            )
            : filtered.map((plan, i) => (
                <PlanCard key={plan.id} plan={plan} index={i} onBuy={handleBuy} buying={buying} />
              ))
        }
      </div>

      <Footer />
    </div>
  );
}