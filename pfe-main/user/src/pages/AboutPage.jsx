import Header from "../components/Header";
import aboutImg from "../assets/aboutus.jpg";
import Footer from "../components/Footer";

export default function AboutPage() {
    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#e3f2fd 0%,#e8f5e9 100%)", fontFamily: "'Inter',sans-serif" }}>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
            `}</style>

            <Header />

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 96px" }}>

                {/* Badge */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
                    <span style={{
                        display: "inline-flex", alignItems: "center", gap: 7,
                        background: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(79,158,122,0.25)", borderRadius: 999,
                        padding: "5px 16px 5px 8px", fontSize: 12.5, fontWeight: 600,
                        color: "#2d6b50", boxShadow: "0 2px 10px rgba(45,107,80,0.08)",
                        fontFamily: "'Inter',sans-serif",
                    }}>
                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: "linear-gradient(135deg,#4f9e7a,#2a6b4f)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11 }}>✦</span>
                        About Us
                    </span>
                </div>

                {/* Title */}
                <h1 style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: "clamp(32px,5vw,54px)", fontWeight: 800,
                    color: "#1a3329", textAlign: "center",
                    letterSpacing: -2, lineHeight: 1.1, marginBottom: 48,
                }}>
                    We believe health is a{" "}
                    <span style={{ position: "relative", display: "inline-block" }}>
                        <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a6fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>transformation</span>
                        <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 3, borderRadius: 999, background: "linear-gradient(90deg,#f5e642,rgba(245,230,66,0.2))" }} />
                    </span>
                    ,<br />not a diet.
                </h1>

                {/* Image */}
                <div style={{ borderRadius: 24, overflow: "hidden", marginBottom: 56, boxShadow: "0 12px 40px rgba(26,51,41,0.12)" }}>
                    <img
                        src={aboutImg}
                        alt="About us"
                        style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
                    />
                </div>

                {/* Quote */}
                <div style={{ textAlign: "center", margin: "0 auto 56px", maxWidth: 600 }}>
                    <p style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: "clamp(17px,2.5vw,22px)", fontWeight: 700,
                        color: "#1a5e3a", lineHeight: 1.65, fontStyle: "italic",
                    }}>
                        "Just like a caterpillar surrenders to transformation inside its chrysalis — emerging as something entirely new — we help you become the{" "}
                        <span style={{ color: "#f5e642" }}>healthiest version</span>
                        {" "}of yourself."
                    </p>
                </div>

                {/* Story */}
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                    <StoryBlock title="Where it all started">
                        Chrisalis was founded by a team of nutritionists, doctors, and technologists united by the same frustration: most health apps treat everyone the same. Generic calorie targets. One-size-fits-all meal plans. No real human guidance behind the screen.
                        {"\n\n"}
                        We chose the chrysalis as our symbol deliberately. Inside that small, unassuming shell, something extraordinary is happening — a complete biological transformation, invisible to the outside world. That quiet, profound change is exactly what we help our members experience.
                    </StoryBlock>

                    <StoryBlock title="What we actually do">
                        Chrisalis combines artificial intelligence with real human expertise to build a health experience that is genuinely personal. Our AI analyses your body metrics, lifestyle, and goals to generate a nutrition plan that evolves with you — not one that stays static for months while your needs change.
                        {"\n\n"}
                        But we don't stop at technology. Every Chrisalis member gets access to certified nutritionists for 1-on-1 sessions, a custom health plan built specifically for their body type and condition, and ongoing follow-up care. We call it the full metamorphosis: the science, the support, and the system — all in one place.
                    </StoryBlock>

                    <StoryBlock title="Our promise to you">
                        We promise you will never feel alone on your health journey. Whether you want to lose weight, manage a chronic condition, build strength, or simply understand your body better — Chrisalis walks with you at every stage.
                        {"\n\n"}
                        No crash diets. No generic advice. No empty promises. Just honest, evidence-based guidance built around who you are — and who you are becoming. Because the most powerful transformation begins not in the gym or the kitchen, but in the decision to finally put your health first.
                    </StoryBlock>
                </div>

            </div>

        </div>
    );
}

function StoryBlock({ title, children }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "linear-gradient(135deg,#3d9b73,#1a6fa0)" }} />
                <h2 style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 20, fontWeight: 800, color: "#1a3329",
                    borderBottom: "2px solid rgba(245,230,66,0.5)", paddingBottom: 2,
                }}>
                    {title}
                </h2>
            </div>

            <div style={{ paddingLeft: 18, borderLeft: "2px solid rgba(79,158,122,0.2)" }}>
                {String(children).split("\n\n").map((p, i) => (
                    <p key={i} style={{ fontSize: 15, color: "#4a6a5e", lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
                        {p}
                    </p>
                ))}
            </div>
        </div>
    );
}