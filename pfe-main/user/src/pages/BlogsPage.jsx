import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
@keyframes shimmer   { 0% { background-position:200% 0; } 100% { background-position:-200% 0; } }
@keyframes expandIn  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }

/* ── Glass card (same as ProfileProgress) ── */
.blog-glass-card {
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
.blog-glass-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 12px 40px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
  transform: translateY(-2px);
}
.blog-glass-card.is-open {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 12px 40px rgba(15,89,47,0.2), inset 0 0 16px rgba(255,255,255,0.75);
}

/* ── Image wrapper ── */
.blog-img-wrap {
  position: relative;
  height: 210px;
  overflow: hidden;
  flex-shrink: 0;
}
.blog-img-wrap img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s cubic-bezier(0.22,1,0.36,1);
  display: block;
}
.blog-glass-card:hover .blog-img-wrap img,
.blog-glass-card.is-open  .blog-img-wrap img {
  transform: scale(1.04);
}
.blog-img-gradient {
  position: absolute; inset: 0;
  background: linear-gradient(180deg, transparent 45%, rgba(15,40,28,0.55) 100%);
}
.blog-tag {
  position: absolute; top: 14px; left: 14px;
  background: rgba(11,102,48,0.85);
  backdrop-filter: blur(8px);
  color: #a8e02c;
  border: 1px solid rgba(168,224,44,0.35);
  border-radius: 999px;
  padding: 3px 11px;
  font-family: 'Inter', sans-serif;
  font-size: 10.5px; font-weight: 700;
  letter-spacing: 0.4px;
}

/* ── Body ── */
.blog-body {
  padding: 20px 22px 22px;
}

/* ── CTA row ── */
.blog-cta {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px; font-weight: 700;
  cursor: pointer;
  transition: gap 0.2s ease;
  border: none; background: transparent; padding: 0;
}
.blog-glass-card:hover .blog-cta,
.blog-glass-card.is-open  .blog-cta { gap: 9px; }

/* ── Expanded content ── */
.blog-expanded {
  padding: 0 22px 22px;
  border-top: 1px solid rgba(0,168,84,0.1);
  animation: expandIn 0.28s cubic-bezier(0.22,1,0.36,1) both;
}

/* ── Skeleton ── */
.blog-skeleton {
  border-radius: 22px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

/* ── Badge ── */
.blogs-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(79,158,122,0.25);
  border-radius: 999px;
  padding: 5px 16px 5px 8px;
  font-family: 'Inter', sans-serif;
  font-size: 12.5px; font-weight: 600; color: #2d6b50;
  box-shadow: 0 2px 10px rgba(45,107,80,0.08);
}
.blogs-badge-icon {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg,#4f9e7a,#2a6b4f);
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-size: 11px;
}
`;

export default function BlogsPage() {
    const [blogs,   setBlogs]   = useState([]);
    const [open,    setOpen]    = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:5000/blog")
            .then(res => res.json())
            .then(data => { setBlogs(data.posts || []); setLoading(false); })
            .catch(err => { console.error(err); setLoading(false); });
    }, []);

    const toggle = (id) => setOpen(prev => prev === id ? null : id);

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>
            <style>{CSS}</style>
            <Header />

            <div style={{ maxWidth: 860, margin: "0 auto", padding: "64px 24px 96px" }}>

                {/* ── Header ── */}
                <div className="anim-up" style={{ textAlign: "center", marginBottom: 52 }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                        <span className="blogs-badge">
                            <span className="blogs-badge-icon">✦</span>
                            Our Blog
                        </span>
                    </div>
                    <h1 style={{
                        fontFamily: "'Space Grotesk',sans-serif",
                        fontSize: "clamp(28px,5vw,48px)", fontWeight: 800,
                        color: "#1a3329", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 14,
                    }}>
                        Health tips &{" "}
                        <span style={{ position: "relative", display: "inline-block" }}>
                            <span style={{ background: "linear-gradient(135deg,#2d9e7a,#1a6fa0)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                expert insights
                            </span>
                            <span style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 3, borderRadius: 999, background: "linear-gradient(90deg,#f5e642,rgba(245,230,66,0.2))" }} />
                        </span>
                    </h1>
                    <p style={{ fontSize: 14, color: "#5a7a6e", lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}>
                        Evidence-based articles from our nutritionists — written to help you transform.
                    </p>
                </div>

                {/* ── States ── */}
                {loading && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        {[1,2,3].map(i => (
                            <div key={i} className="blog-skeleton" style={{ height: 260, animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                )}

                {!loading && blogs.length === 0 && (
                    <div style={{
                        textAlign: "center", padding: "64px 24px",
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(22px)",
                        border: "1.5px solid rgba(168,224,44,0.5)",
                        borderRadius: 22,
                    }}>
                        <div style={{ fontSize: 38, marginBottom: 14 }}>📰</div>
                        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>
                            No articles yet
                        </div>
                        <div style={{ fontSize: 13, color: "#5a7a6e", fontFamily: "'Inter',sans-serif" }}>
                            Check back soon — our nutritionists are writing for you.
                        </div>
                    </div>
                )}

                {/* ── Blog list ── */}
                {!loading && blogs.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                        {blogs.map((b, i) => (
                            <BlogCard
                                key={b.id}
                                blog={b}
                                open={open === b.id}
                                onToggle={() => toggle(b.id)}
                                delay={i * 0.07}
                            />
                        ))}
                    </div>
                )}

            </div>

            <Footer />
        </div>
    );
}

function BlogCard({ blog, open, onToggle, delay }) {
    return (
        <div
            className={`blog-glass-card anim-up ${open ? "is-open" : ""}`}
            style={{ animationDelay: `${delay}s` }}
        >
            {/* Image */}
            <div className="blog-img-wrap">
                <img
                    src={blog.images?.[0] || "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80"}
                    alt={blog.title}
                />
                <div className="blog-img-gradient" />
                <span className="blog-tag">Health</span>
            </div>

            {/* Body */}
            <div className="blog-body">

                {/* Section label */}
                <div style={{ fontSize: 10, fontWeight: 700, color: "#5a7a6e", textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 8, fontFamily: "'Inter',sans-serif" }}>
                    Article
                </div>

                {/* Title */}
                <h2 style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 18, fontWeight: 800, color: "#1a3329",
                    lineHeight: 1.3, marginBottom: 10,
                }}>
                    {blog.title}
                </h2>

                {/* Excerpt */}
                <p style={{ fontSize: 13.5, color: "#5a7a6e", lineHeight: 1.7, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>
                    {blog.content?.slice(0, 130)}…
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(0,168,84,0.1)", marginBottom: 16 }} />

                {/* CTA */}
                <button
                    className="blog-cta"
                    onClick={onToggle}
                    style={{ color: open ? "#b8a200" : "#0b6630" }}
                >
                    {open ? "Close article" : "Read article"}
                    <svg
                        width="13" height="13" viewBox="0 0 24 24"
                        fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{
                            transition: "transform 0.22s ease",
                            transform: open ? "rotate(90deg)" : "none",
                        }}
                    >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                    </svg>
                </button>
            </div>

            {/* Expanded content */}
            {open && (
                <div className="blog-expanded">
                    <div style={{ paddingTop: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                        {blog.content?.split("\n\n").map((para, i) => (
                            <p key={i} style={{
                                fontSize: 14, color: "#4a6a5e", lineHeight: 1.9,
                                fontFamily: "'Inter',sans-serif",
                                paddingLeft: 14,
                                borderLeft: "2px solid rgba(79,158,122,0.2)",
                            }}>
                                {para}
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}