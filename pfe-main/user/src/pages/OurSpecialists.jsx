import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
.anim-up-d3 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.21s both; }

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
  transform: translateY(-3px);
}

/* ── Page layout ── */
.nt-page {
  font-family: 'Inter', sans-serif;
  min-height: 100vh;
}

.nt-hero {
  padding: 52px 40px 40px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
}
.nt-hero-sub {
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
.nt-hero-sub::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0b6630;
  display: inline-block;
  flex-shrink: 0;
}
.nt-hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 42px;
  font-weight: 800;
  color: #1a3329;
  line-height: 1.1;
  letter-spacing: -0.5px;
}
.nt-hero-title span {
  color: #0b6630;
}

/* ── Grid — دائماً 3 أعمدة ── */
.nt-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  padding: 0 40px 60px;
}

/* ── Doctor Card ── */
.nt-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.nt-card-img-wrap {
  position: relative;
  height: 200px;
  overflow: hidden;
}
.nt-card-img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(26,51,41,0.55) 100%);
}
.nt-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.nt-card:hover .nt-card-img { transform: scale(1.05); }

.nt-card-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 5px;
  z-index: 2;
}
.nt-badge {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  background: rgba(255,255,255,0.85);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(168,224,44,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nt-card-body {
  padding: 18px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.nt-card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1a3329;
}

.nt-card-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}
.nt-card-rating-val {
  font-size: 12px;
  font-weight: 700;
  color: #5a7a6e;
}

.nt-card-bio {
  font-size: 12.5px;
  color: #5a7a6e;
  line-height: 1.6;
}

.nt-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.nt-card-footer {
  margin-top: auto;
  padding-top: 10px;
  border-top: 1px solid rgba(0,168,84,0.1);
}
.nt-view-btn {
  font-size: 12.5px;
  font-weight: 700;
  color: #0b6630;
}

/* ── Stars ── */
.stars { display: flex; gap: 2px; }
.star { font-size: 13px; }
.star--on  { color: #c8a800; }
.star--off { color: rgba(0,0,0,0.12); }

/* ── Tags ── */
.tags { display: flex; flex-wrap: wrap; gap: 5px; }
.tag {
  font-size: 11px;
  font-weight: 700;
  color: #0b6630;
  background: rgba(168,224,44,0.15);
  border: 1px solid rgba(168,224,44,0.4);
  border-radius: 999px;
  padding: 3px 10px;
  letter-spacing: 0.3px;
}

/* ── Shimmer skeleton ── */
.shimmer {
  height: 320px;
  border-radius: 22px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.35) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

/* ── Overlay / Modal ── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15,30,22,0.55);
  backdrop-filter: blur(6px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.2s ease both;
}

.modal {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 24px;
  width: 100%;
  max-width: 560px;
  max-height: 88vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(15,89,47,0.2);
  animation: slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both;
}

.modal::-webkit-scrollbar { width: 5px; }
.modal::-webkit-scrollbar-track { background: transparent; }
.modal::-webkit-scrollbar-thumb { background: rgba(0,168,84,0.2); border-radius: 999px; }

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  border: 1.5px solid rgba(0,168,84,0.2);
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  cursor: pointer;
  font-size: 13px;
  color: #1a3329;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.9); }

/* Modal avatar strip */
.modal-avatar-wrap {
  height: 200px;
  overflow: hidden;
  position: relative;
}
.modal-avatar-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 40%, rgba(26,51,41,0.6) 100%);
}
.modal-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-content {
  padding: 22px 26px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 22px;
  font-weight: 800;
  color: #1a3329;
}

.modal-rating {
  display: flex;
  align-items: center;
  gap: 8px;
}
.modal-rating-val {
  font-size: 13px;
  font-weight: 700;
  color: #5a7a6e;
}

.modal-bio {
  font-size: 13px;
  color: #5a7a6e;
  line-height: 1.7;
}

/* Info grid inside modal */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(0,168,84,0.12);
  border-radius: 14px;
  backdrop-filter: blur(8px);
}
.info-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.info-label {
  font-size: 10px;
  font-weight: 700;
  color: #5a7a6e;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 3px;
}
.info-value { font-size: 12.5px; font-weight: 700; color: #1a3329; }

/* Section */
.section { display: flex; flex-direction: column; gap: 10px; }
.section-title {
  font-size: 11px;
  font-weight: 700;
  color: #5a7a6e;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.section-title::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0b6630;
  flex-shrink: 0;
}

/* Certs */
.cert-list { display: flex; flex-direction: column; gap: 6px; }
.cert-item {
  font-size: 12.5px;
  font-weight: 600;
  color: #1a3329;
  padding: 8px 12px;
  background: rgba(168,224,44,0.1);
  border: 1px solid rgba(168,224,44,0.3);
  border-radius: 10px;
}

/* Offers */
.offers-grid { display: flex; flex-wrap: wrap; gap: 8px; }
.offer-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: rgba(255,255,255,0.5);
  border: 1.5px solid rgba(0,168,84,0.2);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #1a3329;
  backdrop-filter: blur(8px);
}
.offer-icon { font-size: 14px; }

/* Reviews */
.reviews-list { display: flex; flex-direction: column; gap: 10px; }
.review {
  padding: 12px 14px;
  background: rgba(255,255,255,0.45);
  border: 1px solid rgba(0,168,84,0.12);
  border-radius: 14px;
}
.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.review-author { font-size: 12.5px; font-weight: 700; color: #1a3329; }
.review-text { font-size: 12px; color: #5a7a6e; line-height: 1.6; }

.no-data { font-size: 12.5px; color: #9ab5a5; font-style: italic; }

/* Buttons */
.pf-btn {
  border-radius: 20px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.pf-btn-primary {
  background: #0b6630;
  color: #fff;
  border: none;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.pf-btn-primary:hover { background: #0d7a38; }
`;

/* ─────────────────────────────── helpers ─────────────────────────────── */

const toArray = (val) => {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  return [val];
};

const getImage = (sp) => {
  const img = sp.image || sp.resume?.images?.[0];
  if (!img) return "https://placehold.co/300x300";
  return img.startsWith("http") ? img : `/api${img}`;
};

const OFFER_MAP = {
  CONSULTATION: { icon: "🎥", label: "Video Consultation" },
  PLAN:         { icon: "📋", label: "Diet Plan" },
  PACKAGE:      { icon: "📦", label: "Package" },
  FOLLOW_UP:    { icon: "🔄", label: "Follow-Up" },
  MESSAGE:      { icon: "💬", label: "Messaging" },
  HOME_VISIT:   { icon: "🏠", label: "Home Visit" },
  AI_CALORIES:  { icon: "🤖", label: "AI Calories" },
};

const getOffer = (type) =>
  OFFER_MAP[type] ?? { icon: "⚕️", label: type.replace(/_/g, " ") };

/* ─────────────────────────────── Stars ─────────────────────────────── */
function Stars({ count }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`star ${count >= i ? "star--on" : "star--off"}`}>★</span>
      ))}
    </div>
  );
}

/* ─────────────────────────────── Modal ─────────────────────────────── */
function DoctorModal({ sp, onClose }) {
  const offers = toArray(sp.resume?.offersTypes);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>

        <div className="modal-avatar-wrap">
          <img src={getImage(sp)} className="modal-avatar" alt={sp.firstName} />
        </div>

        <div className="modal-content">
          <h2 className="modal-name">{sp.firstName} {sp.lastName}</h2>

          <div className="modal-rating">
            <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
            <span className="modal-rating-val">
              {sp.resume?.ratingAverage ? sp.resume.ratingAverage.toFixed(1) : "No rating"}
            </span>
          </div>

          <p className="modal-bio">{sp.resume?.bio || "No bio available"}</p>

          {/* Info grid */}
          <div className="info-grid">
            <div className="info-item">
              <span className="info-icon">🎓</span>
              <div>
                <div className="info-label">Education</div>
                <div className="info-value">{sp.resume?.education || "—"}</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🏢</span>
              <div>
                <div className="info-label">Workplace</div>
                <div className="info-value">{sp.resume?.workplace || "—"}</div>
              </div>
            </div>
            <div className="info-item">
              <span className="info-icon">🏅</span>
              <div>
                <div className="info-label">Experience</div>
                <div className="info-value">{sp.resume?.experienceYears ?? "—"} yrs</div>
              </div>
            </div>
          </div>

          {/* Specializations */}
          {toArray(sp.resume?.specializations).length > 0 && (
            <div className="section">
              <h4 className="section-title">Specializations</h4>
              <div className="tags">
                {toArray(sp.resume?.specializations).map(s => (
                  <span key={s} className="tag">{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {toArray(sp.resume?.certifications).length > 0 && (
            <div className="section">
              <h4 className="section-title">Certifications</h4>
              <div className="cert-list">
                {toArray(sp.resume?.certifications).map((c, i) => (
                  <div key={i} className="cert-item">✓ {c}</div>
                ))}
              </div>
            </div>
          )}

          {/* Services */}
          <div className="section">
            <h4 className="section-title">Services</h4>
            {offers.length === 0
              ? <p className="no-data">No services listed</p>
              : (
                <div className="offers-grid">
                  {offers.map(t => {
                    const { icon, label } = getOffer(t);
                    return (
                      <div key={t} className="offer-pill">
                        <span className="offer-icon">{icon}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          {/* Reviews */}
          <div className="section">
            <h4 className="section-title">Reviews</h4>
            {(!sp.reviews || sp.reviews.length === 0) ? (
              <p className="no-data">No reviews yet</p>
            ) : (
              <div className="reviews-list">
                {sp.reviews.map(r => (
                  <div key={r.id} className="review">
                    <div className="review-header">
                      <b className="review-author">{r.client?.firstName}</b>
                      <Stars count={r.rating} />
                    </div>
                    <p className="review-text">"{r.comment}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Card ─────────────────────────────── */
function DoctorCard({ sp, onClick }) {
  const offers = toArray(sp.resume?.offersTypes);

  return (
    <div className="glass-card nt-card" onClick={onClick}>
      <div className="nt-card-img-wrap">
        <img src={getImage(sp)} className="nt-card-img" alt={sp.firstName} />
        <div className="nt-card-badges">
          {offers.map(t => (
            <span key={t} className="nt-badge" title={getOffer(t).label}>
              {getOffer(t).icon}
            </span>
          ))}
        </div>
      </div>

      <div className="nt-card-body">
        <h3 className="nt-card-name">{sp.firstName} {sp.lastName}</h3>

        <div className="nt-card-rating">
          <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
          {sp.resume?.ratingAverage
            ? <span className="nt-card-rating-val">{sp.resume.ratingAverage.toFixed(1)}</span>
            : null}
        </div>

        <p className="nt-card-bio">
          {sp.resume?.bio ? sp.resume.bio.slice(0, 80) + "…" : "No bio available"}
        </p>

        <div className="nt-card-tags">
          {toArray(sp.resume?.specializations).slice(0, 3).map(s => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>

        <div className="nt-card-footer">
          <span className="nt-view-btn">View Profile →</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────── Page ─────────────────────────────── */
export default function OurTeam() {
  const [doctors,  setDoctors]  = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/nutritionists/public?type=PLAN").then(async r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      }),
      fetch("/api/nutritionists/public?type=PACKAGE").then(async r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      }),
    ])
      .then(([p, pk]) => {
        const all = [
          ...(Array.isArray(p)  ? p  : p.data  || []),
          ...(Array.isArray(pk) ? pk : pk.data || []),
        ];
        const merged = {};
        all.forEach(doc => {
          if (!merged[doc.id]) {
            merged[doc.id] = doc;
          } else {
            merged[doc.id].resume.offersTypes = [
              ...new Set([
                ...toArray(merged[doc.id].resume.offersTypes),
                ...toArray(doc.resume?.offersTypes),
              ]),
            ];
          }
        });
        setDoctors(Object.values(merged));
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load specialists. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="nt-page">
      <style>{CSS}</style>
      <Header />

      {/* Hero */}
      <div className="nt-hero anim-up">
        <p className="nt-hero-sub">Meet the experts behind your health journey</p>
        <h1 className="nt-hero-title">Our <span>Specialists</span></h1>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="nt-grid">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          margin: "0 40px 40px",
          padding: "16px 20px",
          background: "rgba(254,232,232,0.7)",
          backdropFilter: "blur(10px)",
          borderRadius: 16,
          border: "1px solid rgba(192,57,43,0.2)",
          fontSize: 13.5,
          fontWeight: 600,
          color: "#8a3a2f",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{ fontSize: 18 }}>⚠️</span>
          {error}
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="nt-grid anim-up-d1">
          {doctors.length === 0
            ? (
              <div style={{
                gridColumn: "1/-1",
                textAlign: "center",
                padding: "60px 24px",
                color: "#9ab5a5",
                fontSize: 14,
                fontWeight: 600,
              }}>
                <div style={{ fontSize: 40, marginBottom: 14 }}>🩺</div>
                No specialists found.
              </div>
            )
            : doctors.map(sp => (
                <DoctorCard key={sp.id} sp={sp} onClick={() => setSelected(sp)} />
              ))
          }
        </div>
      )}

      {selected && <DoctorModal sp={selected} onClose={() => setSelected(null)} />}

      <Footer />
    </div>
  );
}