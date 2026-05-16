import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import heroImg from "../assets/hs1.jpg";
import B1 from "../assets/B1.jpg";
import A1 from "../assets/A1.jpg";
import B2 from "../assets/B2.jpg";
import A2 from "../assets/A2.jpg";
import B3 from "../assets/B3.jpg";
import A3 from "../assets/A3.jpg";
import D1 from "../assets/D1.jpg";
import mindsetImg from "../assets/mindsetImg.jpg";
import hydrationImg from "../assets/hydrationImg.jpg";
import feat1 from "../assets/1.png";
import feat2 from "../assets/2.png";
import feat3 from "../assets/3.png";
import feat4 from "../assets/4.png";

/* ══════════════════════════════════════════════
   GLOBAL CSS — injected once
   Font changed: Sora → Space Grotesk everywhere
══════════════════════════════════════════════ */
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

/* ── Hero entrance ── */
@keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeDown { from{opacity:0;transform:translateY(-18px)} to{opacity:1;transform:translateY(0)} }
@keyframes scaleIn  { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
@keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
@keyframes pulseRing{ 0%{transform:scale(1);opacity:0.6} 70%{transform:scale(1.45);opacity:0} 100%{transform:scale(1.45);opacity:0} }
@keyframes shimmer  { from{background-position:200% center} to{background-position:-200% center} }

.h-badge { animation: fadeDown 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both }
.h-title { animation: fadeUp  0.65s cubic-bezier(0.22,1,0.36,1) 0.18s both }
.h-sub   { animation: fadeUp  0.65s cubic-bezier(0.22,1,0.36,1) 0.30s both }
.h-btns  { animation: fadeUp  0.65s cubic-bezier(0.22,1,0.36,1) 0.42s both }
.h-stats { animation: fadeUp  0.65s cubic-bezier(0.22,1,0.36,1) 0.54s both }
.h-img   { animation: scaleIn 0.80s cubic-bezier(0.22,1,0.36,1) 0.20s both }

.h-cta-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.26s ease;
}
.h-cta-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}
.h-cta-btn:hover::after { transform: translateX(100%); }
.h-cta-btn:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(45,107,80,0.42) !important; }

.h-stat-item {
  position: relative;
  transition: transform 0.22s ease;
}
.h-stat-item:hover { transform: translateY(-3px); }

/* ── Feature Slider ── */
@keyframes fsBarFill {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
@keyframes fsContentIn {
  from { opacity:0; transform:translateY(20px); }
  to   { opacity:1; transform:translateY(0); }
}
@keyframes fsImageIn {
  from { opacity:0; transform:scale(0.95) translateY(12px); }
  to   { opacity:1; transform:scale(1) translateY(0); }
}

.fs-tab-bar {
  height: 2px;
  border-radius: 999px;
  transform-origin: left;
  transform: scaleX(0);
}
.fs-tab-bar.fs-running {
  animation: fsBarFill linear forwards;
}
.fs-content { opacity:0; }
.fs-content.fs-in { animation: fsContentIn 0.55s cubic-bezier(0.22,1,0.36,1) forwards; }
.fs-image { opacity:0; }
.fs-image.fs-in { animation: fsImageIn 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s forwards; }

.fs-tab-btn {
  cursor: pointer;
  border: none;
  background: transparent;
  text-align: left;
  padding: 0;
  width: 100%;
  transition: none;
}
.fs-pill {
  transition: background 0.22s ease, border-color 0.22s ease, transform 0.18s ease;
}
.fs-pill:hover {
  transform: translateX(4px);
  background: rgba(255,255,255,0.95) !important;
}

/* ── Tool Cards ── */
.tool-card {
  transition: all 0.26s cubic-bezier(0.22,1,0.36,1);
}
.tool-card:hover { transform: translateY(-8px); }

/* ── Blog Cards ── */
.blog-card {
  transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
}
.blog-card:hover { transform: translateY(-6px); }
.blog-card:hover .blog-img { transform: scale(1.06); }
.blog-card:hover .blog-overlay { opacity: 1 !important; }

/* ── Testimonial / Review Cards ── */
.testi-card { transition: all 0.28s cubic-bezier(0.22,1,0.36,1); }
.testi-card:hover { transform: translateY(-6px); }
.review-card { transition: all 0.30s cubic-bezier(0.22,1,0.36,1); }
.review-card:hover { transform: translateY(-5px); }
.review-card:hover .review-img { transform: scale(1.05); }

/* ── Contact button ── */
.contact-fab {
  transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
}
.contact-fab:hover { transform: translateY(-3px) scale(1.04); }

/* ── Scrollbar hide ── */
.no-scroll::-webkit-scrollbar { display: none; }
.no-scroll { scrollbar-width: none; }

/* ══════════════════════════════════════════════
   PRICING SECTION — Glassmorphism Masterpiece
══════════════════════════════════════════════ */

/* Floating orbs animation */
@keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(40px,-30px) scale(1.08)} 66%{transform:translate(-20px,20px) scale(0.95)} }
@keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-35px,25px) scale(1.05)} 66%{transform:translate(28px,-18px) scale(0.97)} }
@keyframes orbFloat3 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(20px,30px) scale(1.06)} }
@keyframes orbPulse  { 0%,100%{opacity:0.35} 50%{opacity:0.55} }

/* Grid beam lines */
@keyframes beamSlide { from{opacity:0;transform:scaleX(0)} to{opacity:1;transform:scaleX(1)} }

/* Card entrance */
@keyframes cardRise {
  from { opacity:0; transform:translateY(60px) scale(0.94); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes cardRiseDelay1 { 0%,15%{opacity:0;transform:translateY(60px) scale(0.94)} 100%{opacity:1;transform:translateY(0) scale(1)} }
@keyframes cardRiseDelay2 { 0%,30%{opacity:0;transform:translateY(60px) scale(0.94)} 100%{opacity:1;transform:translateY(0) scale(1)} }

/* Card highlight sweep */
@keyframes highlightSweep {
  0%   { transform: translateX(-100%) skewX(-12deg); opacity:0; }
  20%  { opacity:1; }
  100% { transform: translateX(300%) skewX(-12deg); opacity:0; }
}

/* Rotating ring */
@keyframes ringRotate { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
@keyframes ringRotateReverse { from{transform:rotate(0deg)} to{transform:rotate(-360deg)} }

/* Badge pulse */
@keyframes badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(245,230,66,0.5)} 50%{box-shadow:0 0 0 10px rgba(245,230,66,0)} }

/* Feature row fade in */
@keyframes featureIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }

/* Price counter tick */
@keyframes priceTick { from{transform:translateY(6px);opacity:0} to{transform:translateY(0);opacity:1} }

/* Glow breathe */
@keyframes glowBreathe {
  0%,100% { opacity:0.4; filter:blur(60px); }
  50%     { opacity:0.7; filter:blur(80px); }
}

/* Particle drift */
@keyframes particleDrift {
  0%   { transform:translate(0,0) scale(1); opacity:0.6; }
  50%  { transform:translate(var(--dx),var(--dy)) scale(1.2); opacity:1; }
  100% { transform:translate(0,0) scale(1); opacity:0.6; }
}

/* CTA hover shimmer */
@keyframes ctaShimmer {
  from { background-position: 200% center; }
  to   { background-position: -200% center; }
}

.pricing-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.38s cubic-bezier(0.22,1,0.36,1), box-shadow 0.38s ease;
  cursor: default;
}
.pricing-card:hover {
  transform: translateY(-12px) scale(1.015);
}
.pricing-card .sweep {
  position: absolute;
  top: 0; left: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
  pointer-events: none;
  opacity: 0;
}
.pricing-card:hover .sweep {
  animation: highlightSweep 0.9s ease forwards;
}

.pricing-cta {
  transition: all 0.28s cubic-bezier(0.22,1,0.36,1);
  position: relative;
  overflow: hidden;
}
.pricing-cta:hover {
  transform: translateY(-3px) scale(1.03);
}
.pricing-cta::after {
  content:'';
  position:absolute; inset:0;
  background: linear-gradient(120deg,transparent,rgba(255,255,255,0.2),transparent);
  background-size: 200% 100%;
  transform: translateX(-100%);
  transition: transform 0.5s ease;
}
.pricing-cta:hover::after { transform: translateX(100%); }

.feat-row {
  opacity: 0;
  animation: featureIn 0.4s ease forwards;
}

.price-num {
  animation: priceTick 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
`;

/* ══════════════════════════════════════════════
   DATA
══════════════════════════════════════════════ */
const STATS_HERO = [
  { num: "5K+", label: "Members transformed" },
  { num: "98%", label: "Success rate" },
  { num: "10+", label: "Specialists" },
];

const FEATURE_SLIDES = [
  {
    num: "01", img: feat1,
    accent: "#2d7a4f", accentBg: "rgba(45,122,79,0.06)",
    badge: "Meal Planning",
    title: "Easy Meal Planning\nand Templates",
    desc: "Effortlessly plan and send meal plans to clients with our simple meal planner. No more Word, Excel, or WhatsApp scrolling required. Whatever you sent is recorded for your future reference.",
    pills: ["Meal Planning", "Ready Templates", "One Click Send"],
    icons: ["ti-file-text", "ti-layout-grid", "ti-send"],
  },
  {
    num: "02", img: feat2,
    accent: "#1a6fa0", accentBg: "rgba(26,111,160,0.06)",
    badge: "Communication",
    title: "Effective Chat\nand Video Calls",
    desc: "No more scattered client information — our platform keeps everything tidy and in one place. Communicate seamlessly through integrated chat and video.",
    pills: ["Chat & Video", "Send Files", "Like WhatsApp"],
    icons: ["ti-video", "ti-paperclip", "ti-brand-whatsapp"],
  },
  {
    num: "03", img: feat3,
    accent: "#a07000", accentBg: "rgba(160,112,0,0.06)",
    badge: "Scheduling",
    title: "Auto Appointments,\nFollow-ups & ToDo",
    desc: "Effortlessly manage appointments & follow-ups and never miss a beat with automatic tracking at the tap of a button — no more manual tracking or chasing down clients.",
    pills: ["Easy Follow-ups", "Manage ToDo List", "Reminders"],
    icons: ["ti-users", "ti-list-check", "ti-bell"],
  },
  {
    num: "04", img: feat4,
    accent: "#7a3fa0", accentBg: "rgba(122,63,160,0.06)",
    badge: "Payments",
    title: "Payment Tracking\nand Reminders",
    desc: "Eliminate the hassle of manually tracking payment timelines and reminding clients with our automated system. No more missed payments or awkward follow-ups.",
    pills: ["Payment Management", "No Missed Payment", "Payment Simplified"],
    icons: ["ti-receipt", "ti-circle-check", "ti-currency-dollar"],
  },
];

const BLOGS = [
  { tag: "Nutrition",   title: "10 Foods That Naturally Boost Your Metabolism",       img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80" },
  { tag: "Weight Loss", title: "Why Crash Diets Always Fail — And What Works Instead", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80" },
  { tag: "Mindset",     title: "Building Habits That Actually Stick Long-Term",         img: mindsetImg },
  { tag: "Recipes",     title: "High-Protein Breakfast Ideas Under 400 Calories",       img: "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?w=800&q=80" },
  { tag: "Hydration",   title: "How Much Water Do You Really Need Each Day?",           img: hydrationImg },
  { tag: "Gut Health",  title: "The Gut-Brain Connection: Eat Your Way to Better Mood", img: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80" },
];

const TESTIMONIALS = [
  { name: "Sarah M.", goal: "Lost 18kg",             quote: "Chrysalis completely changed how I think about food. In 4 months I lost 18kg without ever feeling deprived.", before: B1, after: A1, tag: "Weight Loss", accent: "#2d7a4f", color: "#e8f5e9" },
  { name: "Karim A.", goal: "Gained muscle & energy", quote: "The personalised plan and nutritionist sessions gave me the structure I needed. I feel stronger than ever at 42.", before: B2, after: A2, tag: "Muscle Gain", accent: "#1a6fa0", color: "#e3f2fd" },
  { name: "Lina R.",  goal: "Managed diabetes",       quote: "My blood sugar is finally under control. The AI meal planner takes all the guesswork out of eating healthy.", before: B3, after: A3, tag: "Health",      accent: "#7a3fa0", color: "#f3e8fd" },
];

const REVIEWS = [
  { name: "Sarah M.", role: "Lost 18kg in 4 months",           quote: "Chrysalis completely changed my relationship with food. The AI meal planner felt like having a personal nutritionist in my pocket. I finally understood what my body actually needed.", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=200&q=80", img: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=700&q=80", stars: 5 },
  { name: "Karim B.", role: "Gained muscle & improved energy",  quote: "I was skeptical at first, but after just two weeks on my custom plan I had more energy than I've had in years. The specialist sessions made all the difference — real advice, real results.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=700&q=80", stars: 5 },
  { name: "Amira L.", role: "Managing diabetes through nutrition", quote: "My doctor was amazed at my last check-up. The chronic disease plan on Chrysalis taught me exactly how to eat for my condition. I feel in control for the first time in years.", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80", img: D1, stars: 5 },
];

/* ══════════════════════════════════════════════
   PRICING DATA
══════════════════════════════════════════════ */
const PLANS = [
  {
    id: "ai",
    badge: "AI Powered",
    name: "AI Plan",
    tagline: "Smart nutrition, no specialist needed",
    price: { monthly: 9, yearly: 7 },
    currency: "USD",
    accentFrom: "#194253",
    accentTo: "#babbf5",
    glowColor: "rgba(99,102,241,0.35)",
    borderColor: "rgba(99,102,241,0.3)",
    bgStart: "rgba(99,102,241,0.12)",
    bgEnd: "rgba(56,189,248,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z"/>
        <circle cx="7.5" cy="14.5" r="1.5"/>
        <circle cx="16.5" cy="14.5" r="1.5"/>
      </svg>
    ),
    features: [
      { icon: "ti-brain", label: "Unlimited AI food scans" },
      { icon: "ti-barcode", label: "Custom calorie goals" },
      { icon: "ti-activity", label: "QR code meal sharing" },
      { icon: "ti-chart-line", label: "Team & family mode" },
      
    ],
    notIncluded: ["Specialist sessions", "Video calls"],
    popular: false,
  },
  {
    id: "standard",
    badge: "Most Popular",
    name: "Premiem Plan",
    tagline: "AI + real specialist, Complete health transformation suite",
    price: { monthly: 29, yearly: 22 },
    currency: "USD",
    accentFrom: "#9fd606",
    accentTo: "#3d8658",
    glowColor: "rgba(245,230,66,0.3)",
    borderColor: "rgba(245,230,66,0.45)",
    bgStart: "rgba(245,230,66,0.1)",
    bgEnd: "rgba(74,222,128,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    features: [
      { icon: "ti-brain", label: "Everything in AI Plan" },
      { icon: "ti-user-check", label: "Personalised plans by specialists" },
      { icon: "ti-messages", label: "24/7 AI + specialist chat" },
      { icon: "ti-calendar-event", label: "Monthly follow-up sessions" },
      { icon: "ti-clipboard-check", label: "Custom health protocol" },
    ],
    notIncluded: ["Video call sessions"],
    popular: true,
  },
  {
    id: "back",
    badge: "Full Access",
    name: "Standard Plan",
    tagline: "Healthy plans prepared by specialists. ",
    price: { monthly: 59, yearly: 45 },
    currency: "USD",
    accentFrom: "#be5407",
    accentTo: "#ec9248",
    glowColor: "rgba(249,115,22,0.3)",
    borderColor: "rgba(249,115,22,0.35)",
    bgStart: "rgba(249,115,22,0.1)",
    bgEnd: "rgba(236,72,153,0.08)",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
    features: [
      { icon: "ti-brain", label: "Personalized healthy meal plans" },
      { icon: "ti-video", label: "Prepared by certified nutrition specialists" },
      { icon: "ti-message-chatbot", label: "Healthy recipes and meal suggestions" },
      { icon: "ti-heart-rate-monitor", label: "Easy-to-follow daily schedules" },
      
    ],
    notIncluded: ["Specialist sessions", "Video calls"],
    popular: false,
  },
];

/* ══════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════ */
export default function HeroSection() {
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  /* inject CSS once */
  useEffect(() => {
    if (!document.getElementById("chrysalis-css")) {
      const s = document.createElement("style");
      s.id = "chrysalis-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
    const onResize = () => setW(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const mob = w < 768;

  return (
    <>
      <HeroSection1 mob={mob} navigate={navigate} />
      <ToolsSection mob={mob} />
      <FeatureSliderSection mob={mob} />
      <PricingSection mob={mob} navigate={navigate} />
      <BlogsSection mob={mob} navigate={navigate} />
      <ReviewsSection mob={mob} />
      <ContactFAB onClick={() => setContactOpen(true)} />
      {contactOpen && <ContactModal onClose={() => setContactOpen(false)} mob={mob} />}
    </>
  );
}

/* ══════════════════════════════════════════════
   SECTION 1 — Hero
══════════════════════════════════════════════ */
function HeroSection1({ mob, navigate }) {
  const [btnH, setBtnH] = useState(false);

  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(145deg, #e6f2ec 0%, #eaf4f0 40%, #e3eef8 100%)",
        fontFamily: "'DM Sans', sans-serif",
        minHeight: mob ? "auto" : "92vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(45,107,80,0.07) 1.5px, transparent 1.5px)", backgroundSize: "28px 28px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(190,230,205,0.5) 0%, transparent 70%)", top: "-220px", right: "-160px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(180,215,245,0.45) 0%, transparent 70%)", bottom: "-160px", left: "-100px", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(45,107,80,0.12)", top: 60, left: "38%", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "absolute", width: 100, height: 100, borderRadius: "50%", border: "1px solid rgba(45,107,80,0.08)", top: 100, left: "calc(38% + 40px)", pointerEvents: "none", zIndex: 0 }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1180, margin: "0 auto", width: "100%", padding: mob ? "64px 24px 56px" : "0 56px", display: "flex", flexDirection: mob ? "column" : "row", alignItems: "center", gap: mob ? 40 : 32 }}>
        <div style={{ flex: "0 0 47%", width: mob ? "100%" : "47%" }}>
          <div className="h-badge" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", border: "1px solid rgba(79,158,122,0.22)", borderRadius: 999, padding: "6px 18px 6px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 22, boxShadow: "0 2px 12px rgba(45,107,80,0.1)" }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#f5e642,#e8d020)", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
            AI-Powered Nutrition Platform
          </div>

          <h1 className="h-title" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: mob ? "clamp(36px,9vw,52px)" : "clamp(44px,4.5vw,66px)", fontWeight: 800, color: "#1a3329", lineHeight: 1.06, letterSpacing: -2, marginBottom: 24 }}>
            Good health<br />starts with<br />
            <span style={{ position: "relative", display: "inline-block", color: "#2d6b50" }}>
              good nutrition
              <svg viewBox="0 0 260 14" style={{ position: "absolute", bottom: -10, left: 0, width: "100%", height: 13, overflow: "visible" }}>
                <path d="M4 9 Q130 1 256 9" fill="none" stroke="#f5e642" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </span>.
          </h1>

          <p className="h-sub" style={{ fontSize: 16, color: "#4a6a5e", lineHeight: 1.8, maxWidth: 430, marginBottom: 38, fontFamily: "'DM Sans', sans-serif" }}>
            Like a chrysalis transforms into something beautiful —{" "}
            <strong style={{ color: "#2d6b50", fontWeight: 600 }}>Chrysalis</strong>{" "}
            guides your complete health metamorphosis with AI nutrition, specialist plans, and expert follow-up care.
          </p>

          <div className="h-btns" style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 48 }}>
            <button className="h-cta-btn" onMouseEnter={() => setBtnH(true)} onMouseLeave={() => setBtnH(false)} onClick={() => navigate("/about")}
              style={{ background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", border: "none", borderLeft: "3px solid #f5e642", borderRadius: 10, padding: "14px 28px", fontSize: 14, fontWeight: 700, letterSpacing: 0.6, textTransform: "uppercase", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 6px 20px rgba(45,107,80,0.32)", display: "inline-flex", alignItems: "center", gap: 10 }}>
              More About Chrysalis
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
            </button>
          </div>

          <div className="h-stats" style={{ display: "flex", gap: 32, flexWrap: "wrap", paddingTop: 28, borderTop: "1px solid rgba(79,158,122,0.15)" }}>
            {STATS_HERO.map((s, i) => (
              <div key={s.label} className="h-stat-item">
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 800, color: "#1a3329", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: 12, color: "#6a8a7e", marginTop: 4, fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: "0 0 53%", width: mob ? "100%" : "53%", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="h-img" style={{ position: "relative", width: "100%", maxWidth: mob ? 440 : 570 }}>
            <div style={{ position: "absolute", inset: "8% 5%", borderRadius: 36, background: "linear-gradient(135deg,rgba(160,214,167,0.55),rgba(140,200,248,0.45))", filter: "blur(32px)", zIndex: 0 }} />
            <img src={heroImg} alt="Health transformation" style={{ position: "relative", zIndex: 1, width: "100%", borderRadius: 32, display: "block", objectFit: "cover", boxShadow: "0 24px 64px rgba(26,51,41,0.18)", animation: "floatY 7s ease-in-out infinite" }} />
            <div style={{ position: "absolute", top: "12%", left: "-5%", zIndex: 2, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(79,158,122,0.2)", borderRadius: 16, padding: "12px 18px", boxShadow: "0 8px 28px rgba(45,107,80,0.14)", display: "flex", alignItems: "center", gap: 10, animation: "floatY 6s ease-in-out 1s infinite" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: "#1a3329" }}>AI Nutrition</div>
                <div style={{ fontSize: 11, color: "#6a8a7e", fontFamily: "'DM Sans', sans-serif" }}>Personalised plans</div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: "10%", right: "-4%", zIndex: 2, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(79,158,122,0.2)", borderRadius: 16, padding: "12px 18px", boxShadow: "0 8px 28px rgba(45,107,80,0.14)", display: "flex", alignItems: "center", gap: 10, animation: "floatY 5.5s ease-in-out 0.5s infinite" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#f5e642,#e0c800)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1a3329" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, fontWeight: 700, color: "#1a3329" }}>5K+ Members</div>
                <div style={{ fontSize: 11, color: "#6a8a7e", fontFamily: "'DM Sans', sans-serif" }}>Transformed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 2 — Tools
══════════════════════════════════════════════ */
const TOOLS = [
  {
    icon: (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>),
    color: "#e8f5e9", accent: "#2d7a4f",
    title: "Track. Learn. Progress.",
    desc: "A smart food diary helps you understand your habits and gives you insights to reach your goals faster.",
  },
  {
    icon: (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M15 3v18M3 9h6M3 15h6M15 9h6M15 15h6" /></svg>),
    color: "#e3f2fd", accent: "#1a6fa0",
    title: "Log meals effortlessly.",
    desc: "Scan barcodes, save favourite recipes, and use quick-add tools to track your nutrition in seconds.",
  },
  {
    icon: (<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>),
    color: "#fff8e1", accent: "#c4a800",
    title: "Stay motivated. Always.",
    desc: "Join a thriving community, get expert tips, and enjoy 24/7 support to keep you on track every day.",
  },
];

function ToolsSection({ mob }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ background: "#ffffff", padding: mob ? "64px 24px 72px" : "88px 24px 100px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mob ? 48 : 64, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease" }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(28px,4.5vw,50px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08, marginBottom: 16 }}>
            Tools built for{" "}
            <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your goals</span>
          </h2>
          <p style={{ fontSize: 16.5, color: "#5a7a6e", maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
            Whether you want to lose weight, eat better, or simply feel great — Chrysalis gives you the right tools to get there.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 24 : 32 }}>
          {TOOLS.map((item, i) => <ToolCard key={item.title} item={item} delay={0.12 + i * 0.12} vis={vis} />)}
        </div>
      </div>
    </section>
  );
}

function ToolCard({ item, delay, vis }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="tool-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "36px 28px 32px", borderRadius: 22, background: hov ? item.color : "#fafafa", border: `1.5px solid ${hov ? item.accent + "30" : "rgba(0,0,0,0.06)"}`, boxShadow: hov ? `0 16px 44px ${item.accent}1a` : "0 2px 8px rgba(0,0,0,0.04)", opacity: vis ? 1 : 0, transitionDelay: `${delay}s`, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 76, height: 76, borderRadius: "50%", background: hov ? item.accent : item.color, display: "flex", alignItems: "center", justifyContent: "center", color: hov ? "#fff" : item.accent, marginBottom: 22, boxShadow: hov ? `0 10px 26px ${item.accent}44` : "none", transition: "all 0.26s ease" }}>
        {item.icon}
      </div>
      <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: "#1a3329", marginBottom: 10, lineHeight: 1.25 }}>{item.title}</div>
      <div style={{ fontSize: 14.5, color: "#5a7a6e", lineHeight: 1.8 }}>{item.desc}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION 3 — Feature Slider
══════════════════════════════════════════════ */
const FS_DURATION = 9000;

function FeatureSliderSection({ mob }) {
  const [current, setCurrent] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.05 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const next = (current + 1) % FEATURE_SLIDES.length;
      setCurrent(next);
      setAnimKey(k => k + 1);
    }, FS_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [current, animKey]);

  const goTo = (idx) => { if (idx === current) return; setCurrent(idx); setAnimKey(k => k + 1); };
  const slide = FEATURE_SLIDES[current];

  return (
    <section ref={ref} style={{ fontFamily: "'DM Sans', sans-serif", background: "#f7faf8", padding: mob ? "56px 0 0" : "80px 0 0", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(28px)", transition: "opacity 0.7s ease, transform 0.7s ease" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: mob ? "0 24px 40px" : "0 56px 48px", display: "flex", flexDirection: mob ? "column" : "row", alignItems: mob ? "flex-start" : "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(79,158,122,0.22)", borderRadius: 999, padding: "5px 18px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 16, boxShadow: "0 2px 10px rgba(45,107,80,0.08)" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
            Platform Features
          </div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: mob ? "clamp(24px,6vw,34px)" : "clamp(28px,3vw,42px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.1, margin: 0 }}>
            Everything you need,{" "}
            <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>nothing you don't</span>
          </h2>
        </div>
        {!mob && <div style={{ fontSize: 12, fontWeight: 600, color: "#8aab9a", letterSpacing: 1.2, textTransform: "uppercase", paddingBottom: 6 }}>{String(current + 1).padStart(2, "0")} / {String(FEATURE_SLIDES.length).padStart(2, "0")}</div>}
      </div>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: mob ? "0" : "0 56px", display: "flex", flexDirection: mob ? "column" : "row", minHeight: mob ? "auto" : 520 }}>
        {!mob && (
          <div style={{ flex: "0 0 210px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, paddingRight: 28, borderRight: "1px solid rgba(45,107,80,0.1)" }}>
            {FEATURE_SLIDES.map((s, i) => {
              const isActive = i === current;
              return (
                <button key={s.num} className="fs-tab-btn" onClick={() => goTo(i)} style={{ outline: "none" }}>
                  <div style={{ padding: "15px 16px", borderRadius: 14, background: isActive ? "rgba(255,255,255,0.95)" : "transparent", boxShadow: isActive ? "0 2px 18px rgba(45,107,80,0.10)" : "none", transition: "background 0.3s ease, box-shadow 0.3s ease", borderLeft: isActive ? `3px solid ${s.accent}` : "3px solid transparent" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isActive ? 10 : 0 }}>
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: isActive ? s.accent : "#8aab9a", transition: "color 0.3s ease" }}>{s.num}</span>
                      <span style={{ fontSize: 13.5, fontWeight: isActive ? 700 : 500, color: isActive ? "#1a3329" : "#6a8a7e", transition: "color 0.3s ease", fontFamily: "'DM Sans', sans-serif" }}>{s.badge}</span>
                    </div>
                    {isActive && (
                      <div style={{ height: 2, background: "rgba(45,107,80,0.1)", borderRadius: 999, overflow: "hidden" }}>
                        <div key={animKey} className="fs-tab-bar fs-running" style={{ height: "100%", background: `linear-gradient(90deg, ${s.accent}, #f5e642)`, animationDuration: `${FS_DURATION}ms` }} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ flex: 1, display: "flex", flexDirection: mob ? "column" : "row", alignItems: "stretch", paddingLeft: mob ? 0 : 44 }}>
          <div style={{ flex: mob ? "none" : "0 0 48%", height: mob ? 240 : "auto", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", borderRadius: mob ? 0 : 20, overflow: "hidden", background: "#ffffff" }}>
            <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 55% 50%, ${slide.accentBg} 0%, transparent 70%)`, pointerEvents: "none" }} />
            <img key={`img-${current}-${animKey}`} src={slide.img} alt={slide.badge} className="fs-image fs-in" style={{ position: "relative", width: mob ? "70%" : "82%", maxHeight: mob ? 210 : 360, objectFit: "contain", objectPosition: "center", padding: mob ? 16 : 28, display: "block" }} />
            {!mob && <span style={{ position: "absolute", bottom: 18, left: 22, fontFamily: "'Space Grotesk', sans-serif", fontSize: 9.5, fontWeight: 800, letterSpacing: 2.5, textTransform: "uppercase", color: slide.accent, opacity: 0.3 }}>{slide.num} — {slide.badge}</span>}
          </div>

          <div key={`content-${current}-${animKey}`} className="fs-content fs-in" style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: mob ? "32px 24px 20px" : "48px 8px 48px 44px", gap: 20, borderLeft: mob ? "none" : `1px solid rgba(45,107,80,0.08)` }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "fit-content" }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: slide.accent + "18", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: slide.accent }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase", color: slide.accent }}>{slide.badge}</span>
            </div>
            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: mob ? "clamp(21px,5.5vw,27px)" : "clamp(24px,2.3vw,33px)", fontWeight: 800, color: "#1a3329", lineHeight: 1.2, letterSpacing: -1, margin: 0, whiteSpace: "pre-line" }}>{slide.title}</h3>
            <p style={{ fontSize: 15, color: "#4a6a5e", lineHeight: 1.85, margin: 0, maxWidth: 390, fontFamily: "'DM Sans', sans-serif" }}>{slide.desc}</p>
            <div style={{ width: 42, height: 2.5, borderRadius: 999, background: `linear-gradient(90deg, ${slide.accent}, transparent)` }} />
            <div style={{ display: "flex", flexDirection: mob ? "row" : "column", flexWrap: mob ? "wrap" : "nowrap", gap: 8 }}>
              {slide.pills.map((label, i) => (
                <div key={label} className="fs-pill" style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "9px 15px", borderRadius: 12, border: `1px solid ${slide.accent}22`, background: slide.accent + "07", fontSize: 13, fontWeight: 600, color: "#2a3d35", width: mob ? "auto" : "fit-content" }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: slide.accent + "15", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <i className={`ti ${slide.icons[i]}`} style={{ fontSize: 14, color: slide.accent }} aria-hidden="true" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {mob && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, padding: "24px 0 40px" }}>
          {FEATURE_SLIDES.map((s, i) => (
            <button key={i} onClick={() => goTo(i)} style={{ width: i === current ? 28 : 8, height: 8, borderRadius: 999, border: "none", padding: 0, cursor: "pointer", background: i === current ? slide.accent : "rgba(45,107,80,0.2)", transition: "all 0.35s ease" }} />
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1180, margin: "40px auto 0", padding: "0 56px", borderTop: "1px solid rgba(45,107,80,0.08)" }} />
    </section>
  );
}

/* ══════════════════════════════════════════════
   SECTION 3.5 — PRICING (MASTERPIECE)
   Glass cards over image background
══════════════════════════════════════════════ */
function PricingSection({ mob, navigate }) {
  const [billing, setBilling] = useState("monthly");
  const [vis, setVis] = useState(false);
  const [hovCard, setHovCard] = useState(null);
  const ref = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.05 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  /* Particle canvas animation */
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        /* background image — deep forest/nature photo from unsplash */
        backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80')`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
        backgroundAttachment: "fixed",
        padding: mob ? "80px 20px 80px" : "100px 24px 100px",
      }}
    >
      {/* Particle canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 1 }} />

      {/* Light blue glass overlay */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, rgba(220,240,255,0.72) 0%, rgba(200,230,255,0.78) 40%, rgba(215,240,250,0.75) 100%)", backdropFilter: "blur(2px)", zIndex: 2 }} />

      {/* Animated orbs */}
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)", top: "-100px", right: "5%", animation: "orbFloat1 18s ease-in-out infinite, orbPulse 6s ease-in-out infinite", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,230,66,0.2) 0%, transparent 70%)", bottom: "-80px", left: "8%", animation: "orbFloat2 22s ease-in-out infinite, orbPulse 8s ease-in-out 2s infinite", pointerEvents: "none", zIndex: 3 }} />
      <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)", top: "30%", left: "40%", animation: "orbFloat3 16s ease-in-out infinite", pointerEvents: "none", zIndex: 3 }} />

      {/* Grid lines decoration */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none", zIndex: 3 }} />

      <div style={{ position: "relative", zIndex: 5, maxWidth: 1160, margin: "0 auto" }}>

        {/* ── Header ── */}
        <div style={{ textAlign: "center", marginBottom: mob ? 40 : 56, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s cubic-bezier(0.22,1,0.36,1)" }}>
          {/* Super badge */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.35)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.55)", borderRadius: 999, padding: "6px 20px 6px 10px", fontSize: 12.5, fontWeight: 700, color: "#1a3329", marginBottom: 20, boxShadow: "0 4px 20px rgba(45,107,80,0.15), inset 0 1px 0 rgba(255,255,255,0.6)", animation: vis ? "badgePulse 3s ease-in-out 1s infinite" : "none" }}>
            <span style={{ width: 24, height: 24, borderRadius: "50%", background: "linear-gradient(135deg,#f5e642,#ffb800)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>✦</span>
            Transform Your Health Today
          </div>

          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: mob ? "clamp(30px,7vw,44px)" : "clamp(36px,4vw,58px)", fontWeight: 800, color: "#0f2a1e", letterSpacing: -2, lineHeight: 1.05, marginBottom: 14 }}>
            Choose the plan that fits{" "}
            <span style={{ background: "linear-gradient(135deg,#1a7a50,#0d5235)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>your journey</span>
          </h2>

          <p style={{ fontSize: 16, color: "rgba(26,51,41,0.72)", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.8 }}>
            From intelligent AI guidance to full specialist care — every path leads to your best self.
          </p>

          {/* Billing toggle */}
          <div style={{ display: "inline-flex", background: "rgba(255,255,255,0.3)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 999, padding: 4, gap: 4, boxShadow: "0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.7)" }}>
            {["monthly", "yearly"].map(b => (
              <button key={b} onClick={() => setBilling(b)}
                style={{ padding: "9px 24px", borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontSize: 13.5, fontWeight: 700, transition: "all 0.3s ease", background: billing === b ? "linear-gradient(135deg,#2d7a4f,#1a5e44)" : "transparent", color: billing === b ? "#fff" : "#2a4a3e", boxShadow: billing === b ? "0 4px 14px rgba(45,107,80,0.4)" : "none" }}>
                {b === "monthly" ? "Monthly" : "Yearly"}
                {b === "yearly" && <span style={{ marginLeft: 6, background: billing === "yearly" ? "rgba(245,230,66,0.3)" : "rgba(45,107,80,0.12)", color: billing === "yearly" ? "#f5e642" : "#2d7a4f", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999 }}>−20%</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 24 : 24, alignItems: "start" }}>
          {PLANS.map((plan, idx) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billing={billing}
              vis={vis}
              delay={0.15 + idx * 0.15}
              isHov={hovCard === plan.id}
              onHov={setHovCard}
              mob={mob}
              navigate={navigate}
            />
          ))}
        </div>

        {/* ── Bottom note ── */}
        <div style={{ textAlign: "center", marginTop: mob ? 36 : 48, opacity: vis ? 1 : 0, transition: "opacity 0.8s ease 0.7s" }}>
          <p style={{ fontSize: 13, color: "rgba(26,51,41,0.6)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, flexWrap: "wrap" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Secure payments &nbsp;·&nbsp;
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Cancel anytime &nbsp;·&nbsp;
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            14-day free trial on all plans
          </p>
        </div>
      </div>
    </section>
  );
}

function PricingCard({ plan, billing, vis, delay, isHov, onHov, mob, navigate }) {
  const price = billing === "monthly" ? plan.price.monthly : plan.price.yearly;
  const ringRef = useRef(null);

  return (
    <div
      className="pricing-card"
      onMouseEnter={() => onHov(plan.id)}
      onMouseLeave={() => onHov(null)}
      style={{
        borderRadius: 28,
        background: `linear-gradient(145deg, ${plan.bgStart}, ${plan.bgEnd})`,
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        border: `1px solid ${isHov ? plan.borderColor : "rgba(255,255,255,0.45)"}`,
        boxShadow: isHov
          ? `0 32px 80px ${plan.glowColor}, 0 0 0 1px ${plan.borderColor}, inset 0 1px 0 rgba(255,255,255,0.7)`
          : "0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        padding: mob ? "28px 24px 32px" : plan.popular ? "36px 28px 40px" : "28px 24px 32px",
        marginTop: !mob && plan.popular ? -16 : 0,
        marginBottom: !mob && plan.popular ? -16 : 0,
        opacity: vis ? 1 : 0,
        animation: vis ? `cardRise 0.7s cubic-bezier(0.22,1,0.36,1) ${delay}s both` : "none",
        position: "relative",
        zIndex: plan.popular ? 2 : 1,
      }}
    >
      {/* Sweep shimmer */}
      <div className="sweep" />

      {/* Popular ring decoration */}
      {plan.popular && (
        <>
          <div ref={ringRef} style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", border: `1px dashed ${plan.borderColor}`, animation: "ringRotate 20s linear infinite", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: -15, right: -15, width: 80, height: 80, borderRadius: "50%", border: `1px solid ${plan.accentFrom}30`, animation: "ringRotateReverse 14s linear infinite", pointerEvents: "none" }} />
        </>
      )}

      {/* Badge row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        {/* Plan badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: `linear-gradient(135deg, ${plan.accentFrom}22, ${plan.accentTo}15)`, border: `1px solid ${plan.accentFrom}40`, borderRadius: 999, padding: "5px 14px 5px 8px", fontSize: 11.5, fontWeight: 700, color: "#1a3329" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", background: `linear-gradient(135deg,${plan.accentFrom},${plan.accentTo})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: `0 2px 8px ${plan.glowColor}` }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
          </div>
          {plan.badge}
        </div>

        {/* Icon */}
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `linear-gradient(135deg,${plan.accentFrom}22,${plan.accentTo}18)`, border: `1px solid ${plan.accentFrom}35`, display: "flex", alignItems: "center", justifyContent: "center", color: plan.accentFrom, flexShrink: 0, boxShadow: isHov ? `0 6px 20px ${plan.glowColor}` : "none", transition: "box-shadow 0.3s ease" }}>
          {plan.icon}
        </div>
      </div>

      {/* Name + tagline */}
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 800, color: "#0f2a1e", letterSpacing: -0.8, margin: "0 0 6px" }}>{plan.name}</h3>
      <p style={{ fontSize: 13, color: "rgba(26,51,41,0.6)", margin: "0 0 24px", lineHeight: 1.5 }}>{plan.tagline}</p>

      {/* Price */}
      <div style={{ marginBottom: 24, display: "flex", alignItems: "flex-end", gap: 6 }}>
        <div style={{ position: "relative" }}>
          {/* Glow behind price */}
          <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: `radial-gradient(circle,${plan.glowColor} 0%,transparent 70%)`, animation: "glowBreathe 4s ease-in-out infinite", pointerEvents: "none" }} />
          <span key={`${billing}-${plan.id}`} className="price-num" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: mob ? 44 : 52, fontWeight: 800, color: "#0f2a1e", letterSpacing: -2, lineHeight: 1, position: "relative" }}>
            <span style={{ fontSize: 22, fontWeight: 600, verticalAlign: "top", marginTop: 10, display: "inline-block" }}>$</span>
            {price}
          </span>
        </div>
        <div style={{ paddingBottom: 8, color: "rgba(26,51,41,0.5)", fontSize: 13, fontWeight: 500 }}>
          / mo{billing === "yearly" && <span style={{ display: "block", fontSize: 11, color: plan.accentFrom, fontWeight: 700 }}>billed yearly</span>}
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg,transparent,${plan.accentFrom}50,transparent)`, marginBottom: 22 }} />

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 28 }}>
        {plan.features.map((f, i) => (
          <div key={f.label} className="feat-row" style={{ display: "flex", alignItems: "center", gap: 12, animationDelay: vis ? `${delay + 0.05 * i}s` : "0s" }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${plan.accentFrom}20,${plan.accentTo}15)`, border: `1px solid ${plan.accentFrom}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className={`ti ${f.icon}`} style={{ fontSize: 14, color: plan.accentFrom }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: 13.5, color: "#1a3329", fontWeight: 500, lineHeight: 1.4 }}>{f.label}</span>
          </div>
        ))}
        {plan.notIncluded.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 12, opacity: 0.4 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <i className="ti ti-x" style={{ fontSize: 13, color: "#8a9a94" }} aria-hidden="true" />
            </div>
            <span style={{ fontSize: 13.5, color: "#6a8a7e", textDecoration: "line-through", lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <button
        className="pricing-cta"
        onClick={() => navigate("/signup")}
        style={{
          width: "100%",
          padding: "14px 0",
          borderRadius: 14,
          border: plan.popular ? "none" : `1.5px solid ${plan.accentFrom}60`,
          background: plan.popular
            ? `linear-gradient(135deg,${plan.accentFrom},${plan.accentTo})`
            : `linear-gradient(135deg,${plan.accentFrom}18,${plan.accentTo}12)`,
          color: plan.popular ? (plan.id === "standard" ? "#0f2a1e" : "#fff") : plan.accentFrom,
          fontSize: 14, fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: 0.3,
          boxShadow: plan.popular ? `0 8px 28px ${plan.glowColor}` : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        Get Started
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION 4 — Blogs + Testimonials
══════════════════════════════════════════════ */
function BlogsSection({ mob, navigate }) {
  const [idx, setIdx] = useState(0);
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  const visible = mob ? 1 : 3;
  const max = BLOGS.length - visible;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.08 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i >= max ? 0 : i + 1)), 8000);
    return () => clearInterval(t);
  }, [max]);

  const sectionBadge = (label) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.9)", border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999, padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 14, boxShadow: "0 2px 10px rgba(45,107,80,0.08)" }}>
      <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
      {label}
    </span>
  );

  return (
    <section ref={ref} style={{ background: "#f7faf8", padding: mob ? "64px 24px" : "88px 56px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: mob ? 36 : 52, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease" }}>
          <div>
            {sectionBadge("Blogs")}
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(26px,3.8vw,44px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08 }}>
              Health tips &{" "}
              <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>expert insights</span>
            </h2>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[
              { fn: () => setIdx(i => Math.max(0, i - 1)), dis: idx === 0, d: "M15 18l-6-6 6-6" },
              { fn: () => setIdx(i => Math.min(max, i + 1)), dis: idx >= max, d: "M9 18l6-6-6-6" },
            ].map((btn, i) => (
              <button key={i} onClick={btn.fn} disabled={btn.dis}
                style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(45,107,80,0.2)", background: btn.dis ? "#f0f0f0" : "#fff", color: btn.dis ? "#ccc" : "#2d6b50", cursor: btn.dis ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><path d={btn.d} /></svg>
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 24, transform: `translateX(calc(-${idx * (100 / visible)}% - ${idx * 24 / visible}px))`, transition: "transform 0.55s cubic-bezier(0.4,0,0.2,1)" }}>
            {BLOGS.map((b, i) => <BlogCard key={b.title} blog={b} visible={visible} vis={vis} delay={i * 0.07} navigate={navigate} />)}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 28 }}>
          {Array.from({ length: max + 1 }).map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              style={{ width: i === idx ? 24 : 8, height: 8, borderRadius: 999, border: "none", background: i === idx ? "#f5e642" : "rgba(45,107,80,0.2)", cursor: "pointer", transition: "all 0.3s ease", padding: 0 }} />
          ))}
        </div>

        <div style={{ marginTop: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 52, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease 0.3s" }}>
            {sectionBadge("Real stories")}
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(24px,3.5vw,40px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08 }}>
              Before &{" "}
              <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>after Chrysalis</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 20 : 24 }}>
            {TESTIMONIALS.map((t, i) => <TestiCard key={t.name} t={t} vis={vis} delay={0.4 + i * 0.12} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

function BlogCard({ blog, visible, vis, delay, navigate }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="blog-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: `0 0 calc(${100 / visible}% - ${24 * (visible - 1) / visible}px)`, borderRadius: 20, overflow: "hidden", background: "#fff", boxShadow: hov ? "0 18px 44px rgba(26,51,41,0.14)" : "0 2px 10px rgba(0,0,0,0.06)", opacity: vis ? 1 : 0, transitionDelay: `${delay}s`, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ position: "relative", overflow: "hidden", height: 210 }}>
        <img className="blog-img" src={blog.img} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.45s ease", display: "block" }} />
        <div className="blog-overlay" style={{ position: "absolute", inset: 0, background: "rgba(26,51,41,0.4)", opacity: 0, transition: "opacity 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => navigate("/blogs")} style={{ background: "#fff", color: "#1a5e44", border: "none", borderRadius: 999, padding: "9px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            More Blogs
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
          </button>
        </div>
        <span style={{ position: "absolute", top: 14, left: 14, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, padding: "4px 12px", borderRadius: 999 }}>{blog.tag}</span>
      </div>
      <div style={{ padding: "18px 20px 22px", fontFamily: "'Space Grotesk', sans-serif", fontSize: 15.5, fontWeight: 700, color: "#1a3329", lineHeight: 1.45 }}>{blog.title}</div>
    </div>
  );
}

function TestiCard({ t, vis, delay }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="testi-card" onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ borderRadius: 22, overflow: "hidden", background: "#fff", border: `1.5px solid ${hov ? t.accent + "40" : "rgba(0,0,0,0.06)"}`, boxShadow: hov ? `0 18px 44px ${t.accent}18` : "0 2px 10px rgba(0,0,0,0.05)", opacity: vis ? 1 : 0, transitionDelay: `${delay}s`, display: "flex", flexDirection: "column", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: 200 }}>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={t.before} alt="before" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: "grayscale(60%)", display: "block" }} />
          <span style={{ position: "absolute", bottom: 8, left: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>Before</span>
        </div>
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img src={t.after} alt="after" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
          <span style={{ position: "absolute", bottom: 8, right: 8, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>After</span>
        </div>
      </div>
      <div style={{ height: 3, background: `linear-gradient(90deg,${t.accent},${t.color})` }} />
      <div style={{ padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 10, flexGrow: 1 }}>
        <span style={{ alignSelf: "flex-start", background: t.color, color: t.accent, fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, padding: "3px 10px", borderRadius: 999, textTransform: "uppercase" }}>{t.tag}</span>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: "#1a3329" }}>{t.name}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.accent }}>{t.goal}</div>
        <p style={{ fontSize: 13.5, color: "#5a7a6e", lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>"{t.quote}"</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   SECTION 5 — Reviews
══════════════════════════════════════════════ */
function ReviewsSection({ mob }) {
  const [vis, setVis] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.1 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} style={{ background: "#ffffff", padding: mob ? "64px 24px 72px" : "88px 48px 100px", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: mob ? 44 : 64, opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(20px)", transition: "all 0.65s ease" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(232,245,233,0.9)", border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999, padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600, color: "#2d6b50", marginBottom: 16, boxShadow: "0 2px 10px rgba(45,107,80,0.08)" }}>
            <span style={{ width: 22, height: 22, borderRadius: "50%", background: "#f5e642", display: "flex", alignItems: "center", justifyContent: "center", color: "#1a3329", fontSize: 11, fontWeight: 800 }}>✦</span>
            Real stories
          </span>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: "clamp(26px,3.8vw,46px)", fontWeight: 800, color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.08, marginBottom: 14 }}>
            Transformations that{" "}
            <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a5e44)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>speak for themselves</span>
          </h2>
          <p style={{ fontSize: 16, color: "#5a7a6e", maxWidth: 460, margin: "0 auto", lineHeight: 1.8 }}>
            Real members, real results. Here's what the Chrysalis community has to say.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: mob ? 32 : 44 }}>
          {REVIEWS.map((r, i) => <ReviewCard key={r.name} review={r} flip={i % 2 !== 0} mob={mob} vis={vis} delay={0.1 + i * 0.15} />)}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review, flip, mob, vis, delay }) {
  return (
    <div className="review-card"
      style={{ display: "flex", flexDirection: mob ? "column" : flip ? "row-reverse" : "row", borderRadius: 24, overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.07)", opacity: vis ? 1 : 0, transitionDelay: `${delay}s`, background: "#fff", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ flex: "0 0 42%", minHeight: mob ? 220 : 300, overflow: "hidden", position: "relative" }}>
        <img className="review-img" src={review.img} alt={review.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, background: flip ? "linear-gradient(to left, rgba(26,51,41,0.22), transparent)" : "linear-gradient(to right, rgba(26,51,41,0.22), transparent)" }} />
      </div>
      <div style={{ flex: 1, padding: mob ? "28px 24px" : "40px 44px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 18, background: "#fff" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {Array.from({ length: review.stars }).map((_, i) => (
            <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill="#f5a623" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          ))}
        </div>
        <p style={{ fontSize: mob ? 15 : 16.5, color: "#2a4a3e", lineHeight: 1.85, fontStyle: "italic", margin: 0, borderLeft: "3px solid #4f9e7a", paddingLeft: 18 }}>"{review.quote}"</p>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <img src={review.avatar} alt={review.name} style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", border: "2px solid #e8f5e9", flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: "#1a3329" }}>{review.name}</div>
            <div style={{ fontSize: 12.5, color: "#4f9e7a", fontWeight: 600 }}>{review.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════
   CONTACT FAB + MODAL
══════════════════════════════════════════════ */
function ContactFAB({ onClick }) {
  return (
    <button
  className="contact-fab"
  onClick={onClick}
  style={{
    position: "fixed",
    right: 24,
    bottom: 32,
    zIndex: 999,
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    color: "#000",
    borderTop: "1.5px solid rgba(168,224,44,0.9)",
    borderLeft: "1.5px solid rgba(168,224,44,0.9)",
    borderBottom: "1.5px solid rgba(0,168,84,0.8)",
    borderRight: "1.5px solid rgba(0,168,84,0.8)",
    borderRadius: 999,
    padding: "13px 22px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    boxShadow:
      "0 8px 32px rgba(15,89,47,0.16), inset 0 0 12px rgba(255,255,255,0.6)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
  Text Us
</button>
  );
}

function ContactModal({ onClose, mob }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const handle = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    if (!form.name || !form.email || !form.message) return;
    setSending(true);
    try {
      await fetch("http://localhost:5000/inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      setSent(true);
    } catch (err) { console.error(err); }
    finally { setSending(false); }
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", border: "1.5px solid rgba(168,224,44,0.4)", borderRadius: 12, padding: "10px 14px", fontSize: 13.5, fontFamily: "'DM Sans', sans-serif", color: "#000", background: "rgba(255,255,255,0.5)", outline: "none", transition: "border 0.2s ease" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(26,51,41,0.45)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="no-scroll"
        style={{ position: "relative", width: "min(560px,92vw)", maxHeight: "90vh", overflowY: "auto", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", borderTop: "1.5px solid rgba(168,224,44,0.9)", borderLeft: "1.5px solid rgba(168,224,44,0.9)", borderBottom: "1.5px solid rgba(0,168,84,0.8)", borderRight: "1.5px solid rgba(0,168,84,0.8)", borderRadius: 22, padding: "36px", boxShadow: "0 16px 52px rgba(15,89,47,0.22), inset 0 0 18px rgba(255,255,255,0.65)", fontFamily: "'DM Sans', sans-serif" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid rgba(168,224,44,0.4)", background: "rgba(255,255,255,0.5)", color: "#000", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

        {sent ? (
          <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 16px rgba(11,102,48,0.4)" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 700, color: "#000", marginBottom: 10 }}>Message sent!</div>
            <div style={{ fontSize: 14, color: "#000", lineHeight: 1.7 }}>Thanks for reaching out. Our team will get back to you shortly.</div>
            <button onClick={onClose} style={{ marginTop: 28, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", border: "none", borderRadius: 999, padding: "11px 32px", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 14px rgba(11,102,48,0.3)" }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#3d9b73,#2a6b4f)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, boxShadow: "0 4px 16px rgba(11,102,48,0.4)" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, fontWeight: 700, color: "#000", marginBottom: 6 }}>Get in touch</div>
              <div style={{ fontSize: 13.5, color: "#000", lineHeight: 1.65 }}>We'd love to hear from you. Send us a message and we'll respond within 24h.</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[{ key: "name", label: "YOUR NAME", type: "text", placeholder: "e.g. Sarah Johnson" }, { key: "email", label: "EMAIL ADDRESS", type: "email", placeholder: "you@example.com" }].map(f => (
                <div key={f.key}>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#000", display: "block", marginBottom: 5, letterSpacing: "0.5px" }}>{f.label}</label>
                  <input value={form[f.key]} onChange={handle(f.key)} type={f.type} placeholder={f.placeholder} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#000", display: "block", marginBottom: 5, letterSpacing: "0.5px" }}>MESSAGE</label>
                <textarea value={form.message} onChange={handle("message")} placeholder="How can we help you?" rows={4} style={{ ...inputStyle, resize: "none" }} />
              </div>
              <button onClick={submit} disabled={sending}
                style={{ background: sending ? "#a0c4b4" : "linear-gradient(135deg,#3d9b73,#2a6b4f)", color: "#fff", border: "none", borderRadius: 999, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: sending ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: "0 4px 18px rgba(45,107,80,0.3)", transition: "all 0.22s ease", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 }}>
                {sending ? "Sending…" : (<>Send Message <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg></>)}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}