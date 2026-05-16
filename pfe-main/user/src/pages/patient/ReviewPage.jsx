import { useState, useEffect } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

@keyframes slideUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
@keyframes fadeIn  { from{opacity:0} to{opacity:1} }
@keyframes spin    { to{transform:rotate(360deg)} }
@keyframes pop     { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.08s both; }
.anim-fade  { animation: fadeIn 0.35s ease both; }

/* ── Glass card ── */
.glass-card {
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
.glass-card:hover {
  background: rgba(255,255,255,0.28);
  box-shadow: 0 10px 36px rgba(15,89,47,0.18), inset 0 0 16px rgba(255,255,255,0.75);
}

/* ── Nutritionist picker card ── */
.rv-nutri-card {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 15px; border-radius: 16px; cursor: pointer;
  background: rgba(255,255,255,0.25); backdrop-filter: blur(8px);
  border: 1.5px solid rgba(0,168,84,0.12);
  transition: all 0.2s ease; position: relative;
}
.rv-nutri-card:hover {
  background: rgba(255,255,255,0.45);
  border-color: rgba(168,224,44,0.5);
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(15,89,47,0.1);
}
.rv-nutri-card.selected {
  background: rgba(11,102,48,0.1);
  border-color: rgba(168,224,44,0.6);
  box-shadow: 0 4px 16px rgba(11,102,48,0.12);
}
.rv-nutri-card.reviewed {
  opacity: 0.6; cursor: default;
}

/* ── Star ── */
.rv-star { cursor:pointer; transition:transform 0.15s ease; user-select:none; }
.rv-star:hover { transform:scale(1.2); }
.rv-star.selected { animation: pop 0.25s ease; }

/* ── Skeleton ── */
.rv-skeleton {
  border-radius: 16px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.4) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%; animation: shimmer 1.4s infinite;
}

/* ── Textarea ── */
.rv-textarea {
  width: 100%; border: 1.5px solid rgba(0,168,84,0.22); border-radius: 14px;
  padding: 13px 15px; font-size: 13.5px; font-family:'Inter',sans-serif;
  color: #1a3329; background: rgba(255,255,255,0.35); backdrop-filter:blur(6px);
  outline: none; resize: vertical; min-height: 110px; transition: all 0.2s; line-height:1.6;
}
.rv-textarea:focus {
  border-color: rgba(168,224,44,0.7);
  background: rgba(255,255,255,0.6);
}
.rv-textarea::placeholder { color: #8a9a8e; }

/* ── Sec header ── */
.sec-header {
  padding: 16px 20px 13px;
  border-bottom: 1px solid rgba(0,168,84,0.1);
  background: rgba(255,255,255,0.15);
  display: flex; align-items: center; gap: 10px;
}
`;

function StarRating({ value, onChange, size = 40 }) {
  const [hover, setHover] = useState(0);
  const labels = ["","Poor","Fair","Good","Very Good","Excellent"];
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
      <div style={{ display:"flex", gap:8 }}>
        {[1,2,3,4,5].map(i => (
          <span
            key={i}
            className={`rv-star ${value >= i ? "selected" : ""}`}
            style={{ fontSize:size, lineHeight:1 }}
            onClick={() => onChange(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
          >
            <svg width={size} height={size} viewBox="0 0 24 24"
              fill={(hover || value) >= i ? "#f5a623" : "none"}
              stroke={(hover || value) >= i ? "#f5a623" : "rgba(0,168,84,0.25)"}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </span>
        ))}
      </div>
      {(hover || value) > 0 && (
        <div className="anim-fade" style={{
          fontSize:13, fontWeight:700, color:"#8a7200",
          background:"rgba(245,166,35,0.12)", border:"1px solid rgba(245,166,35,0.3)",
          borderRadius:999, padding:"4px 16px",
          fontFamily:"'Inter',sans-serif",
        }}>
          {labels[hover || value]}
        </div>
      )}
    </div>
  );
}

function Avatar({ user, size = 44, radius = 12 }) {
  const [err, setErr] = useState(false);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";
  if (!user?.image || err) return (
    <div style={{
      width:size, height:size, borderRadius:radius, flexShrink:0,
      background:"linear-gradient(135deg,#1a3329,#0b6630)",
      border:"1.5px solid rgba(168,224,44,0.4)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Space Grotesk',sans-serif", fontSize:size*0.32, fontWeight:800, color:"#a8e02c",
    }}>{initials}</div>
  );
  return (
    <img src={user.image} alt={initials} onError={() => setErr(true)}
      style={{ width:size, height:size, borderRadius:radius, objectFit:"cover", flexShrink:0,
        border:"1.5px solid rgba(168,224,44,0.4)" }} />
  );
}

const RATING_META = {
  1:{ label:"Poor",      color:"#c0392b", tagBg:"rgba(192,57,43,0.1)",  border:"rgba(192,57,43,0.2)"  },
  2:{ label:"Fair",      color:"#8a7200", tagBg:"rgba(184,162,0,0.1)",  border:"rgba(184,162,0,0.2)"  },
  3:{ label:"Good",      color:"#1a6fa0", tagBg:"rgba(26,111,160,0.1)", border:"rgba(26,111,160,0.2)" },
  4:{ label:"Very Good", color:"#0b6630", tagBg:"rgba(11,102,48,0.1)",  border:"rgba(168,224,44,0.3)" },
  5:{ label:"Excellent", color:"#0b6630", tagBg:"rgba(11,102,48,0.1)",  border:"rgba(168,224,44,0.3)" },
};

const RATING_DESC = {
  5:"Exceptional experience!",
  4:"Great experience overall.",
  3:"Experience was adequate.",
  2:"Some improvements needed.",
  1:"Significant issues encountered.",
};

export default function ReviewPage() {
  const { user } = useAuth();

  const [nutritionists, setNutritionists] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState(null);
  const [rating,        setRating]        = useState(0);
  const [comment,       setComment]       = useState("");
  const [submitting,    setSubmitting]    = useState(false);
  const [submitted,     setSubmitted]     = useState({});
  const [error,         setError]         = useState("");
  const [successMsg,    setSuccessMsg]    = useState("");

  useEffect(() => {
    fetch(`${API_URL}/subscriptions/mine`, { credentials: "include" })
      .then(r => r.json())
      .then(data => {
        const subs = data.subscriptions ?? [];
        const pkgSubs = subs.filter(s =>
          s.offer?.type === "PACKAGE" ||
          s.offer?.type === "package" ||
          s.offer?.type === "Package"
        );
        const map = new Map();
        pkgSubs.forEach(sub => {
          const nutritionist =
            sub.nutritionist ?? sub.nutrition ??
            sub.offer?.nutritionist ?? sub.offer?.nutrition ?? null;
          const nId =
            sub.nutritionistId ?? sub.nutritionId ??
            sub.nutrition?.id ?? nutritionist?.id ?? null;
          if (!nId || !nutritionist) return;
          if (!map.has(nId)) map.set(nId, { nutritionist, subscriptions: [], sessionCount: 0 });
          const entry = map.get(nId);
          entry.subscriptions.push(sub);
          entry.sessionCount += sub.offer?.sessionCount ?? sub.offer?.sessions ?? 0;
        });
        setNutritionists([...map.values()]);
      })
      .catch(() => setNutritionists([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (entry) => {
    if (submitted[entry.nutritionist.id]) return;
    setSelected(entry);
    setRating(0); setComment(""); setError(""); setSuccessMsg("");
  };

  const handleSubmit = async () => {
    if (!rating)   { setError("Please select a rating."); return; }
    if (!selected) { setError("Please select a nutritionist."); return; }
    setSubmitting(true); setError("");
    try {
      const res  = await fetch(`${API_URL}/nutritionists/${selected.nutritionist.id}/review`, {
        method:"POST", credentials:"include",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit review");
      setSubmitted(prev => ({ ...prev, [selected.nutritionist.id]:true }));
      setSuccessMsg(`Thank you! Your review for ${selected.nutritionist.firstName} has been submitted. 🎉`);
      setSelected(null); setRating(0); setComment("");
    } catch (err) { setError(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div style={{ fontFamily:"'Inter',sans-serif", minHeight:"100vh" }}>
      <style>{CSS}</style>

      {/* Page heading */}
      <div className="anim-up" style={{ marginBottom:22 }}>
        <div style={{ fontSize:10.5, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:1.2, marginBottom:5 }}>
          Feedback
        </div>
        <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:24, fontWeight:800, color:"#1a3329", letterSpacing:-0.5 }}>
          Rate Your Nutritionist
        </div>
        <div style={{ fontSize:13, color:"#5a7a6e", marginTop:5, lineHeight:1.6 }}>
          Share your experience from your package sessions.
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="anim-fade" style={{
          background:"rgba(11,102,48,0.1)", backdropFilter:"blur(10px)",
          border:"1px solid rgba(168,224,44,0.35)",
          borderRadius:16, padding:"13px 18px", fontSize:13.5, fontWeight:600, color:"#0b6630",
          display:"flex", alignItems:"center", gap:10, marginBottom:20,
          fontFamily:"'Inter',sans-serif",
        }}>
          <div style={{ width:24, height:24, borderRadius:"50%", background:"#0b6630", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          {successMsg}
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns: selected ? "1fr 1fr" : "1fr", gap:20, alignItems:"start" }}>

        {/* ── LEFT: Nutritionist picker ── */}
        <div className="glass-card anim-up">
          <div className="sec-header">
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#0b6630", flexShrink:0 }} />
            <div>
              <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13.5, fontWeight:800, color:"#1a3329" }}>Your Package Nutritionists</div>
              <div style={{ fontSize:11, color:"#5a7a6e", marginTop:2, fontFamily:"'Inter',sans-serif" }}>Select a nutritionist to rate</div>
            </div>
          </div>

          <div style={{ padding:"14px 16px", display:"flex", flexDirection:"column", gap:9 }}>
            {loading && [1,2,3].map(i => (
              <div key={i} className="rv-skeleton" style={{ height:72, animationDelay:`${i*0.1}s` }} />
            ))}

            {!loading && nutritionists.length === 0 && (
              <div style={{ textAlign:"center", padding:"44px 20px" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>🥗</div>
                <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:800, color:"#1a3329", marginBottom:5 }}>
                  No package subscriptions yet
                </div>
                <div style={{ fontSize:12.5, color:"#5a7a6e", lineHeight:1.6, fontFamily:"'Inter',sans-serif" }}>
                  Once you subscribe to a package, you can rate your nutritionist here.
                </div>
              </div>
            )}

            {!loading && nutritionists.map(entry => {
              const { nutritionist, subscriptions, sessionCount } = entry;
              const isSelected = selected?.nutritionist?.id === nutritionist.id;
              const isReviewed = submitted[nutritionist.id];
              const offerNames = [...new Set(subscriptions.map(s => s.offer?.name).filter(Boolean))].join(", ");

              return (
                <div
                  key={nutritionist.id}
                  className={`rv-nutri-card ${isSelected ? "selected" : ""} ${isReviewed ? "reviewed" : ""}`}
                  onClick={() => !isReviewed && handleSelect(entry)}
                >
                  <Avatar user={nutritionist} size={42} radius={10} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:13.5, fontWeight:800, color:"#1a3329", marginBottom:3 }}>
                      {nutritionist?.firstName} {nutritionist?.lastName}
                    </div>
                    <div style={{ fontSize:11.5, color:"#5a7a6e", fontFamily:"'Inter',sans-serif" }}>
                      {offerNames || "Package"}
                      {sessionCount > 0 && ` · ${sessionCount} sessions`}
                    </div>
                  </div>

                  {isReviewed ? (
                    <span style={{
                      background:"rgba(11,102,48,0.1)", color:"#0b6630",
                      border:"1px solid rgba(168,224,44,0.35)",
                      borderRadius:999, padding:"2px 9px", fontSize:10.5, fontWeight:700, flexShrink:0,
                      fontFamily:"'Inter',sans-serif",
                    }}>✓ Reviewed</span>
                  ) : isSelected ? (
                    <div style={{ width:20, height:20, borderRadius:"50%", background:"#0b6630", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a8e02c" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                  ) : (
                    <div style={{ width:20, height:20, borderRadius:"50%", border:"1.5px solid rgba(0,168,84,0.2)", flexShrink:0 }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Review form ── */}
        {selected && (
          <div className="anim-up-d1" style={{ display:"flex", flexDirection:"column", gap:14 }}>

            <div className="glass-card">
              {/* Dark hero strip */}
              <div style={{
                background:"linear-gradient(135deg,#1a3329 0%,#0b6630 55%,#1a5e3a 100%)",
                padding:"20px 22px", position:"relative", overflow:"hidden",
              }}>
                <div style={{ position:"absolute", right:-25, top:-25, width:160, height:160, borderRadius:"50%", background:"rgba(168,224,44,0.08)" }} />
                <div style={{ position:"absolute", right:40, bottom:-45, width:110, height:110, borderRadius:"50%", background:"rgba(168,224,44,0.05)" }} />
                <div style={{ position:"relative", display:"flex", alignItems:"center", gap:14 }}>
                  <Avatar user={selected.nutritionist} size={52} radius={14} />
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:16, fontWeight:800, color:"#fff", marginBottom:3 }}>
                      {selected.nutritionist?.firstName} {selected.nutritionist?.lastName}
                    </div>
                    <div style={{ fontSize:12, color:"rgba(255,255,255,0.55)", fontFamily:"'Inter',sans-serif" }}>
                      {[...new Set(selected.subscriptions.map(s => s.offer?.name).filter(Boolean))].join(", ") || "Package"}
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding:"22px" }}>
                {/* Stars */}
                <div style={{ textAlign:"center", marginBottom:20 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"#5a7a6e", textTransform:"uppercase", letterSpacing:0.8, marginBottom:14, fontFamily:"'Inter',sans-serif" }}>
                    How was your experience?
                  </div>
                  <StarRating value={rating} onChange={setRating} size={42} />
                </div>

                {/* Rating label */}
                {rating > 0 && (
                  <div className="anim-fade" style={{
                    background: RATING_META[rating].tagBg,
                    border:`1px solid ${RATING_META[rating].border}`,
                    backdropFilter:"blur(6px)",
                    borderRadius:14, padding:"11px 15px", marginBottom:18,
                    display:"flex", alignItems:"center", gap:12,
                  }}>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:26, fontWeight:800, color:RATING_META[rating].color }}>
                      {rating}/5
                    </div>
                    <div>
                      <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:14, fontWeight:800, color:RATING_META[rating].color }}>
                        {RATING_META[rating].label}
                      </div>
                      <div style={{ fontSize:11.5, color:"#5a7a6e", marginTop:2, fontFamily:"'Inter',sans-serif" }}>{RATING_DESC[rating]}</div>
                    </div>
                  </div>
                )}

                {/* Comment */}
                <div style={{ marginBottom:16 }}>
                  <label style={{ fontSize:10.5, fontWeight:700, color:"#5a7a6e", letterSpacing:0.7, textTransform:"uppercase", display:"block", marginBottom:8, fontFamily:"'Inter',sans-serif" }}>
                    Your Review <span style={{ color:"#8a9a8e", fontWeight:500, textTransform:"none" }}>(optional)</span>
                  </label>
                  <textarea
                    className="rv-textarea"
                    placeholder="Share your experience — what went well, what could be improved..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    maxLength={500}
                  />
                  <div style={{ fontSize:11, color:"#5a7a6e", textAlign:"right", marginTop:4, fontFamily:"'Inter',sans-serif" }}>
                    {comment.length}/500
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="anim-fade" style={{
                    background:"rgba(192,57,43,0.08)", border:"1px solid rgba(192,57,43,0.2)",
                    borderRadius:12, padding:"10px 14px", fontSize:13, color:"#c0392b",
                    fontWeight:600, marginBottom:14, fontFamily:"'Inter',sans-serif",
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !rating}
                  style={{
                    width:"100%", padding:"13px 0",
                    background: rating ? "#0b6630" : "rgba(255,255,255,0.3)",
                    color: rating ? "#a8e02c" : "#8a9a8e",
                    border: rating ? "none" : "1.5px solid rgba(0,168,84,0.2)",
                    borderRadius:20, fontSize:13.5, fontWeight:700,
                    cursor: rating && !submitting ? "pointer" : "not-allowed",
                    fontFamily:"'Inter',sans-serif",
                    display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                    transition:"all 0.2s",
                    boxShadow: rating ? "0 4px 14px rgba(11,102,48,0.3)" : "none",
                  }}
                >
                  {submitting ? (
                    <>
                      <span style={{ width:14, height:14, border:"2px solid rgba(168,224,44,0.3)", borderTopColor:"#a8e02c", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }} />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                      Submit Review
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelected(null)}
                  style={{
                    width:"100%", padding:"11px 0",
                    background:"rgba(255,255,255,0.25)", backdropFilter:"blur(6px)",
                    color:"#5a7a6e", border:"1.5px solid rgba(0,168,84,0.15)",
                    borderRadius:20, fontSize:13, fontWeight:600,
                    cursor:"pointer", fontFamily:"'Inter',sans-serif", marginTop:8,
                    transition:"all 0.2s",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Privacy note */}
            <div style={{
              background:"rgba(255,255,255,0.2)", backdropFilter:"blur(10px)",
              border:"1px solid rgba(0,168,84,0.15)",
              borderRadius:16, padding:"12px 16px",
              display:"flex", alignItems:"flex-start", gap:10,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <div style={{ fontSize:11.5, color:"#5a7a6e", lineHeight:1.6, fontFamily:"'Inter',sans-serif" }}>
                Your review will be visible to other patients and your nutritionist. Please keep it honest and respectful.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}