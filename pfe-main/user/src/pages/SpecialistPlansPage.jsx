import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes spin    { to{transform:rotate(360deg)} }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both }

/* ── Glass card ── */
.pr-card {
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
  transition: all 0.3s ease;
}
.pr-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
  transform: translateY(-4px);
}
.pr-card.featured {
  border-top:    1.5px solid rgba(245,230,66,0.9);
  border-left:   1.5px solid rgba(245,230,66,0.9);
  border-bottom: 1.5px solid rgba(168,224,44,0.8);
  border-right:  1.5px solid rgba(168,224,44,0.8);
  box-shadow: 0 12px 40px rgba(11,102,48,0.2), inset 0 0 16px rgba(255,255,255,0.6);
}

.pr-btn {
  width: 100%;
  padding: 13px 0;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.pr-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
.pr-btn:disabled { opacity: 0.5; cursor: not-allowed; }

@media (max-width: 900px) {
  .pr-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
}
`;

const FEATURED_INDEX = 1;

function Check() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlanCard({ offer, index, onSelect }) {
  const featured = index === FEATURED_INDEX;

  const features = [
    `${offer.sessionsCount} session${offer.sessionsCount > 1 ? "s" : ""} with your nutritionist`,
    "Personalized nutrition plan included",
    offer.chatDays > 0 ? `${offer.chatDays} days of chat access` : null,
    `${offer.durationDays} days subscription`,
    "Zoom video sessions",
    "Cancel anytime",
  ].filter(Boolean);

  const badge =
    offer.sessionsCount === 1 ? "Starter" :
    offer.sessionsCount === 2 ? "Most Popular" : "Best Value";

  return (
    <div className={`pr-card anim-up ${featured ? "featured" : ""}`} style={{ animationDelay: `${index * 0.1}s` }}>

      {/* Top bar */}
      <div style={{ height: 4, background: featured ? "linear-gradient(90deg,rgba(168,224,44,0.9),rgba(0,168,84,0.8))" : "rgba(168,224,44,0.3)" }} />

      {/* Featured ribbon */}
      {featured && (
        <div style={{ background: "linear-gradient(135deg,#0b6630,#2d7a4f)", padding: "7px 20px", textAlign: "center", fontSize: 11.5, fontWeight: 800, color: "rgba(168,224,44,0.95)", letterSpacing: 0.5, textTransform: "uppercase" }}>
          ⭐ Most Popular
        </div>
      )}

      <div style={{ padding: "24px 22px 26px", display: "flex", flexDirection: "column", flex: 1, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,224,44,0.15)", border: "1px solid rgba(168,224,44,0.4)", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#0b6630", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 16, width: "fit-content" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0b6630", display: "inline-block", animation: "pulse 2s infinite" }} />
          {badge}
        </div>

        {/* Name */}
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329", marginBottom: 10 }}>
          {offer.name}
        </div>

        {/* Sessions pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,224,44,0.12)", border: "1px solid rgba(0,168,84,0.2)", borderRadius: 999, padding: "4px 12px", fontSize: 12, fontWeight: 700, color: "#1a3329", marginBottom: 14, width: "fit-content" }}>
          📅 {offer.sessionsCount} Session{offer.sessionsCount > 1 ? "s" : ""}
          {offer.chatDays > 0 && ` · 💬 ${offer.chatDays}d Chat`}
        </div>

        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2 }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 800, color: featured ? "#0b6630" : "#1a3329", lineHeight: 1 }}>
            ${Number(offer.price).toFixed(2)}
          </span>
        </div>
        <div style={{ fontSize: 12.5, color: "#5a7a6e", fontWeight: 500, marginBottom: 16 }}>
          {offer.durationDays} days access
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(0,168,84,0.1)", marginBottom: 16 }} />

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22, flex: 1 }}>
          {features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#2a4a3e" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(168,224,44,0.15)", border: "1.5px solid rgba(0,168,84,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check />
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className="pr-btn"
          onClick={() => onSelect(offer)}
          style={featured
            ? { background: "linear-gradient(135deg,#0b6630,#2d7a4f)", color: "#fff", border: "none", boxShadow: "0 6px 18px rgba(11,102,48,0.25)" }
            : { background: "rgba(168,224,44,0.15)", color: "#0b6630", border: "1.5px solid rgba(0,168,84,0.3)" }
          }
        >
          Meet Your Expert
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </button>
      </div>
    </div>
  );
}

export default function SpecialistPlansPage() {
  const navigate = useNavigate();
  const [offers,  setOffers]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetch("/api/offers/packages", { credentials: "include" })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => setOffers(data.offers ?? []))
      .catch(() => setError("Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (offer) => {
    navigate("/specialists", {
      state: {
        selectedOffer: {
          id:            offer.id,
          name:          offer.name,
          price:         offer.price,
          durationDays:  offer.durationDays,
          sessionsCount: offer.sessionsCount,
          chatDays:      offer.chatDays,
        },
      },
    });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <div className="anim-up" style={{ padding: "52px 40px 40px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
        <p style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: "#0b6630", textTransform: "uppercase", letterSpacing: 1.8, background: "rgba(168,224,44,0.15)", border: "1px solid rgba(168,224,44,0.45)", borderRadius: 999, padding: "5px 14px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0b6630", display: "inline-block" }} />
          Specialist Nutrition Packages
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 800, color: "#1a3329", lineHeight: 1.1, letterSpacing: -0.5 }}>
          Real guidance from <span style={{ color: "#0b6630" }}>certified experts.</span>
        </h1>
        <p style={{ fontSize: 14.5, color: "#5a7a6e", maxWidth: 480, lineHeight: 1.8 }}>
          Work 1-on-1 with a certified nutritionist via video sessions, get a personalised plan, and chat access.
        </p>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 className="anim-up-d1" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 800, color: "#1a3329", marginBottom: 8, letterSpacing: -0.5 }}>Choose your package</h2>
          <p className="anim-up-d2" style={{ fontSize: 14, color: "#5a7a6e" }}>Every package includes sessions + a personalised plan + chat access.</p>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 60, color: "#5a7a6e", fontSize: 15 }}>Loading packages...</div>}
        {error   && <div style={{ textAlign: "center", padding: 60, color: "#8a3a2f", fontSize: 15 }}>{error}</div>}
        {!loading && !error && offers.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#9ab5a5" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>📦</div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 20, fontWeight: 800, color: "#1a3329" }}>No packages yet</div>
          </div>
        )}

        {!loading && !error && offers.length > 0 && (
          <div className="pr-grid" style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(offers.length, 3)},1fr)`, gap: 22, alignItems: "start" }}>
            {offers.map((offer, i) => (
              <PlanCard key={offer.id} offer={offer} index={i} onSelect={handleSelect} />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#5a7a6e" }}>
          🔒 Secure payments · Cancel anytime · All specialists are certified
        </div>
      </div>

      <Footer />
    </div>
  );
}