import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes pulse   { 0%,100%{opacity:1} 50%{opacity:0.4} }
@keyframes spin    { to{transform:rotate(360deg)} }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both }

.ai-card {
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
.ai-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
  transform: translateY(-4px);
}
.ai-card.featured {
  border-top:    1.5px solid rgba(245,230,66,0.9);
  border-left:   1.5px solid rgba(245,230,66,0.9);
  border-bottom: 1.5px solid rgba(168,224,44,0.8);
  border-right:  1.5px solid rgba(168,224,44,0.8);
}

.ai-btn {
  width: 100%; padding: 13px 0; border-radius: 14px;
  font-size: 14px; font-weight: 700; cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.ai-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.05); }
.ai-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.ai-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  display: inline-block;
}

@media (max-width: 900px) {
  .ai-grid { grid-template-columns: 1fr !important; max-width: 420px; margin: 0 auto; }
}
`;

const PLANS = [
  {
    offerId: "11da6e89-07a3-4258-98cb-665c710b38aa",
    label: "Starter",
    badge: "Free Trial",
    price: "Free",
    period: "3 days · no card needed",
    desc: "Try the full power of our AI calorie tracker with no commitment.",
    features: ["AI food recognition", "Calorie & macro tracking", "3-day meal history", "Basic nutrition insights"],
    cta: "Start Free Trial",
    featured: false,
    isFree: true,
  },
  {
    offerId: "3b6e0518-95a5-4b5f-8442-fb68dfe6165f",
    label: "Pro",
    badge: "Most Popular",
    price: "$9.99",
    period: "per month",
    desc: "Unlimited AI scans, advanced analytics and personalised recommendations.",
    features: ["Unlimited AI food scans", "Advanced macro breakdown", "30-day history & trends", "Custom calorie goals", "Priority support"],
    cta: "Get Pro",
    featured: true,
    isFree: false,
  },
  {
    offerId: "d892a444-25d9-4c88-a5f8-463d5430b817",
    label: "Elite",
    badge: "Best Value",
    price: "$59.99",
    period: "per year · save 50%",
    desc: "Full year of elite AI nutrition with QR code meal sharing and team features.",
    features: ["Everything in Pro", "QR code meal sharing", "Yearly progress report", "Team & family mode", "Dedicated nutritionist chat"],
    cta: "Go Elite",
    featured: false,
    isFree: false,
  },
];

function Check() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function PlanCard({ plan, index, onSelect, trialUsed, loadingId }) {
  const isTrialDone = plan.isFree && trialUsed;
  const isLoading = loadingId === plan.offerId;

  return (
    <div className={`ai-card anim-up ${plan.featured ? "featured" : ""}`} style={{ animationDelay: `${index * 0.1}s` }}>

      {/* Top bar */}
      <div style={{ height: 4, background: plan.featured ? "linear-gradient(90deg,rgba(168,224,44,0.9),rgba(0,168,84,0.8))" : "rgba(168,224,44,0.3)" }} />

      {/* Featured ribbon */}
      {plan.featured && (
        <div style={{ background: "linear-gradient(135deg,#0b6630,#2d7a4f)", padding: "7px 20px", textAlign: "center", fontSize: 11.5, fontWeight: 800, color: "rgba(168,224,44,0.95)", letterSpacing: 0.5, textTransform: "uppercase" }}>
          ⭐ Most Popular
        </div>
      )}

      <div style={{ padding: "24px 22px 26px", display: "flex", flexDirection: "column", flex: 1, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(10px)" }}>

        {/* Badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(168,224,44,0.15)", border: "1px solid rgba(168,224,44,0.4)", borderRadius: 999, padding: "5px 12px", fontSize: 11, fontWeight: 700, color: "#0b6630", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 16, width: "fit-content" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0b6630", display: "inline-block", animation: "pulse 2s infinite" }} />
          {plan.badge}
        </div>

        {/* Name */}
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 24, fontWeight: 800, color: "#1a3329", marginBottom: 4 }}>
          {plan.label}
        </div>

        {/* Price */}
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 36, fontWeight: 800, color: plan.featured ? "#0b6630" : "#1a3329", lineHeight: 1, marginBottom: 4 }}>
          {plan.price}
        </div>
        <div style={{ fontSize: 12.5, color: "#5a7a6e", fontWeight: 500, marginBottom: 12 }}>{plan.period}</div>

        <p style={{ fontSize: 13, color: "#5a7a6e", lineHeight: 1.7, marginBottom: 16, minHeight: 40 }}>{plan.desc}</p>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(0,168,84,0.1)", marginBottom: 16 }} />

        {/* Features */}
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 22, flex: 1 }}>
          {plan.features.map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#2a4a3e" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(168,224,44,0.15)", border: "1.5px solid rgba(0,168,84,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Check />
              </div>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        {isTrialDone ? (
          <div style={{ width: "100%", padding: "13px 0", borderRadius: 14, background: "rgba(168,224,44,0.08)", border: "1px solid rgba(0,168,84,0.15)", textAlign: "center", fontSize: 14, color: "#9ab5a5", fontFamily: "'Inter',sans-serif", fontWeight: 700 }}>
            Trial Used ✓
          </div>
        ) : (
          <button
            className="ai-btn"
            onClick={() => onSelect(plan)}
            disabled={!!loadingId}
            style={plan.featured
              ? { background: "linear-gradient(135deg,#0b6630,#2d7a4f)", color: "#fff", border: "none", boxShadow: "0 6px 18px rgba(11,102,48,0.25)" }
              : { background: "rgba(168,224,44,0.15)", color: "#0b6630", border: "1.5px solid rgba(0,168,84,0.3)" }
            }
          >
            {isLoading
              ? <span className="ai-spinner" />
              : <>{plan.cta} <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg></>
            }
          </button>
        )}
      </div>
    </div>
  );
}

export default function AIPremiumPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [trialUsed, setTrialUsed] = useState(false);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [checking, setChecking] = useState(true);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) { setChecking(false); return; }
    (async () => {
      try {
        const res = await fetch("/api/subscriptions/mine", { credentials: "include" });
        const data = await res.json();
        const subs = data.subscriptions ?? [];
        const now = new Date();
        const active = subs.find(s => s.status === "ACTIVE" && new Date(s.endDate) > now && s.offer?.type === "AI_CALORIES");
        if (active) { setHasActiveSub(true); return; }
        setTrialUsed(subs.some(s => s.offer?.type === "AI_CALORIES" && s.offer?.hasFreeTrial === true));
      } catch { } finally { setChecking(false); }
    })();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!checking && hasActiveSub) navigate("/calories");
  }, [checking, hasActiveSub]);

  const handleSelect = async (plan) => {
    if (!isLoggedIn) { navigate("/login", { state: { redirect: "/premium" } }); return; }
    setError(null);
    setLoadingId(plan.offerId);
    try {
      const res = await fetch("/api/subscriptions", { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ offerId: plan.offerId }) });
      const data = await res.json();
      if (!res.ok) { if (res.status === 400 && data.message?.includes("already have")) { navigate("/calories"); return; } throw new Error(data.message ?? "Something went wrong"); }
      if (plan.isFree || data.isFree) { navigate("/calories"); }
      else { navigate("/payment", { state: { subscriptionId: data.subscription.id, offerId: plan.offerId, offerLabel: plan.label, price: plan.price } }); }
    } catch (err) { setError(err.message); }
    finally { setLoadingId(null); }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "100vh", background: "#f7faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(0,168,84,0.2)", borderTop: "3px solid #0b6630", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <div className="anim-up" style={{ padding: "52px 40px 40px", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
        <p style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, color: "#0b6630", textTransform: "uppercase", letterSpacing: 1.8, background: "rgba(168,224,44,0.15)", border: "1px solid rgba(168,224,44,0.45)", borderRadius: 999, padding: "5px 14px" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#0b6630", display: "inline-block" }} />
          AI · QR Code Scanner · Calorie Tracking
        </p>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 42, fontWeight: 800, color: "#1a3329", lineHeight: 1.1, letterSpacing: -0.5 }}>
          Know exactly what <span style={{ color: "#0b6630" }}>you're eating.</span>
        </h1>
        <p style={{ fontSize: 14.5, color: "#5a7a6e", maxWidth: 480, lineHeight: 1.8 }}>
          Scan any meal with AI or share your plate via QR code — get instant calorie breakdowns in under 3 seconds.
        </p>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px 80px" }}>

        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h2 className="anim-up-d1" style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 800, color: "#1a3329", marginBottom: 8, letterSpacing: -0.5 }}>Choose your plan</h2>
          <p style={{ fontSize: 14, color: "#5a7a6e" }}>Start free, upgrade anytime. No hidden fees.</p>
        </div>

        {error && (
          <div style={{ background: "rgba(255,255,255,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(0,168,84,0.2)", borderRadius: 14, padding: "14px 20px", marginBottom: 24, color: "#0b6630", fontSize: 13.5, display: "flex", alignItems: "center", gap: 12, maxWidth: 600, margin: "0 auto 24px" }}>
            <span style={{ fontSize: 18 }}>🌿</span>
            <span>{error}</span>
            <button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#0b6630", fontWeight: 700, fontSize: 18 }}>×</button>
          </div>
        )}

        <div className="ai-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22, alignItems: "start" }}>
          {PLANS.map((plan, i) => (
            <PlanCard key={plan.offerId} plan={plan} index={i} onSelect={handleSelect} trialUsed={trialUsed} loadingId={loadingId} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: 28, fontSize: 13, color: "#5a7a6e" }}>
          🔒 Secure payments · Cancel anytime · Free trial requires no credit card
        </div>
      </div>

      <Footer />
    </div>
  );
}