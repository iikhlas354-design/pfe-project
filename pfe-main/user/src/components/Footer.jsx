import { useState } from "react";
import { Link } from "react-router-dom";

const LINKS = [
    { label: "About Us", href: "/about" },
    { label: "Blogs", href: "/blogs" },
    { label: "Our Specialists", href: "/our-sprcs" },
    
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Our Game", href: "/SnakeGameOverlay" },
];

const STATS = [
    { num: "5K+", label: "Members" },
    { num: "98%", label: "Satisfaction" },
    { num: "10+", label: "Specialists" },
];

export default function Footer() {
    return (
        <footer style={{
            background: "linear-gradient(160deg, #1a3329 0%, #0b6630 60%, #1a3329 100%)",
            fontFamily: "'Inter', sans-serif",
            position: "relative",
            overflow: "hidden",
        }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');`}</style>

            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle,rgba(168,224,44,0.07) 1.5px,transparent 1.5px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "rgba(168,224,44,0.2)", pointerEvents: "none" }} />

            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 32px 0", position: "relative", zIndex: 1 }}>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 56, justifyContent: "space-between", marginBottom: 48 }}>

                    {/* Brand */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 280 }}>
                        <span style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 26,
                            fontWeight: 700,
                            color: "#a8e02c",
                            letterSpacing: -1,
                        }}>Chrysalis</span>

                        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.85, margin: 0 }}>
                            Your complete health metamorphosis — AI nutrition, specialist plans, and expert follow-up care in one place.
                        </p>

                        {/* Stats */}
                        <div style={{ display: "flex", gap: 0, background: "rgba(0,0,0,0.18)", borderRadius: 14, overflow: "hidden" }}>
                            {STATS.map((s, i) => (
                                <div key={s.label} style={{ flex: 1, textAlign: "center", padding: "12px 8px", borderRight: i < 2 ? "1px solid rgba(168,224,44,0.1)" : "none" }}>
                                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.num}</div>
                                    <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.45)", marginTop: 3, fontWeight: 500 }}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 11, fontWeight: 700,
                            color: "rgba(255,255,255,0.4)",
                            letterSpacing: 1.5,
                            textTransform: "uppercase",
                            marginBottom: 10,
                        }}>Quick Links</div>
                        {LINKS.map(l => <FooterLink key={l.label} label={l.label} href={l.href} />)}
                    </div>

                    {/* Quote */}
                    <div style={{ maxWidth: 250, display: "flex", flexDirection: "column", gap: 16, justifyContent: "center" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                            <div style={{ width: 28, height: 3, borderRadius: 999, background: "rgba(255,255,255,0.5)" }} />
                            <div style={{ width: 8, height: 3, borderRadius: 999, background: "#a8e02c" }} />
                        </div>
                        <p style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontSize: 15, fontWeight: 700,
                            color: "rgba(255,255,255,0.9)",
                            lineHeight: 1.7,
                            fontStyle: "italic",
                            margin: 0,
                        }}>
                            "Prevention is better than cure."
                        </p>
                    </div>

                </div>

                {/* Bottom bar */}
                <div style={{ borderTop: "1px solid rgba(168,224,44,0.12)", padding: "18px 0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", margin: 0 }}>© 2026 Chrysalis. All rights reserved.</p>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a8e02c", display: "inline-block" }} />
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>All systems operational</span>
                    </div>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.35)", margin: 0 }}>Made with ♥ for your health journey</p>
                </div>

            </div>
        </footer>
    );
}

function FooterLink({ label, href }) {
    const [hov, setHov] = useState(false);
    return (
        <Link to={href}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
                fontSize: 14,
                color: hov ? "#ffffff" : "rgba(255,255,255,0.62)",
                textDecoration: "none",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                gap: 9,
                fontWeight: hov ? 700 : 400,
                padding: "6px 0",
                fontFamily: "'Inter', sans-serif",
            }}>
            <span style={{
                width: 4, height: 4, borderRadius: "50%",
                background: hov ? "#a8e02c" : "rgba(255,255,255,0.25)",
                display: "inline-block", flexShrink: 0,
                transition: "background 0.2s ease",
                boxShadow: hov ? "0 0 5px rgba(168,224,44,0.5)" : "none",
            }} />
            {label}
        </Link>
    );
}