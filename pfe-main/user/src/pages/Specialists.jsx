import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../context/Authcontext";

/* ─────────────────── CSS ─────────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800&family=Inter:wght@400;500;600;700;800&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.anim-up    { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) both; }
.anim-up-d1 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.07s both; }
.anim-up-d2 { animation: slideUp 0.45s cubic-bezier(0.22,1,0.36,1) 0.14s both; }

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
  transform: translateY(-4px);
}

/* ── Overlay ── */
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

/* ── Modals ── */
.sp-modal, .book-modal {
  background: rgba(255,255,255,0.95);
  backdrop-filter: blur(24px);
  border-top:    1.5px solid rgba(168,224,44,0.85);
  border-left:   1.5px solid rgba(168,224,44,0.85);
  border-bottom: 1.5px solid rgba(0,168,84,0.75);
  border-right:  1.5px solid rgba(0,168,84,0.75);
  border-radius: 24px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(15,89,47,0.2);
  animation: slideUp 0.35s cubic-bezier(0.22,1,0.36,1) both;
}
.sp-modal {
  max-width: 500px;
  max-height: 92vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.sp-modal > div:last-child {
  overflow-y: auto;
  flex: 1;
}
.book-modal {
  max-width: 460px;
  max-height: 92vh;
  overflow-y: auto;
}
.sp-modal::-webkit-scrollbar,
.book-modal::-webkit-scrollbar { width: 4px; }
.sp-modal::-webkit-scrollbar-thumb,
.book-modal::-webkit-scrollbar-thumb { background: rgba(0,168,84,0.2); border-radius: 999px; }

/* ── Tags ── */
.sp-tag {
  display: inline-block;
  background: rgba(168,224,44,0.15);
  color: #0b6630;
  border: 1px solid rgba(168,224,44,0.4);
  padding: 3px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* ── Specialist card ── */
.sp-card {
  cursor: pointer;
  display: flex;
  flex-direction: column;
}
.sp-card-img-wrap {
  position: relative;
  height: 220px;
  overflow: hidden;
}
.sp-card-img-wrap::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(26,51,41,0.5) 100%);
}
.sp-card-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 15%;
  transition: transform 0.4s ease;
}
.sp-card:hover .sp-card-img-wrap img { transform: scale(1.05); }

.sp-card-body {
  padding: 16px 20px 12px;
  display: flex;
  flex-direction: column;
  gap: 9px;
  flex: 1;
}
.sp-card-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: #1a3329;
}
.sp-card-bio {
  font-size: 12.5px;
  color: #5a7a6e;
  line-height: 1.6;
}
.sp-card-footer {
  padding: 10px 20px 16px;
  border-top: 1px solid rgba(0,168,84,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.sp-card-price {
  font-size: 12.5px;
  font-weight: 700;
  color: #0b6630;
}
.sp-view-btn {
  background: #0b6630;
  color: #fff;
  border-radius: 999px;
  padding: 7px 16px;
  font-size: 12.5px;
  font-weight: 700;
  font-family: 'Inter', sans-serif;
  transition: background 0.2s;
}
.sp-view-btn:hover { background: #0d7a38; }

/* ── Date / Slot buttons ── */
.date-btn {
  background: rgba(255,255,255,0.45);
  border: 1.5px solid rgba(0,168,84,0.2);
  border-radius: 12px;
  padding: 8px 14px;
  font-size: 12.5px;
  font-weight: 600;
  color: #1a3329;
  cursor: pointer;
  white-space: nowrap;
  font-family: 'Inter', sans-serif;
  transition: all 0.18s;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}
.date-btn.active {
  background: #0b6630;
  color: #fff;
  border-color: #0b6630;
  box-shadow: 0 4px 12px rgba(11,102,48,0.25);
}
.date-btn:hover:not(.active) { border-color: rgba(168,224,44,0.6); background: rgba(255,255,255,0.7); }

.slot-btn {
  background: rgba(255,255,255,0.45);
  border: 1.5px solid rgba(0,168,84,0.15);
  border-radius: 12px;
  padding: 10px 8px;
  font-size: 13px;
  font-weight: 600;
  color: #1a3329;
  cursor: pointer;
  font-family: 'Inter', sans-serif;
  transition: all 0.18s;
  text-align: center;
  backdrop-filter: blur(8px);
}
.slot-btn.active {
  background: #0b6630;
  color: #fff;
  border-color: #0b6630;
  box-shadow: 0 4px 12px rgba(11,102,48,0.25);
}
.slot-btn.booked {
  background: rgba(0,0,0,0.04);
  color: #bbb;
  cursor: not-allowed;
  text-decoration: line-through;
  border-color: transparent;
}
.slot-btn:hover:not(.booked):not(.active) { border-color: rgba(168,224,44,0.5); }

/* ── Shimmer ── */
.shimmer {
  height: 320px;
  border-radius: 22px;
  background: linear-gradient(90deg,rgba(255,255,255,0.15) 25%,rgba(255,255,255,0.35) 50%,rgba(255,255,255,0.15) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

/* ── Buttons ── */
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
  border: none;
}
.pf-btn-primary {
  background: #0b6630;
  color: #fff;
  box-shadow: 0 4px 14px rgba(11,102,48,0.3);
}
.pf-btn-primary:hover { background: #0d7a38; }
.pf-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.pf-btn-ghost {
  background: rgba(255,255,255,0.45);
  color: #1a3329;
  border: 1.5px solid rgba(168,224,44,0.4) !important;
  backdrop-filter: blur(8px);
}
.pf-btn-ghost:hover { background: rgba(255,255,255,0.75); }

/* ── Section title ── */
.sec-title {
  font-size: 11px;
  font-weight: 700;
  color: #5a7a6e;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
}
.sec-title::before {
  content: '';
  display: inline-block;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #0b6630;
  flex-shrink: 0;
}

/* ── Info item ── */
.info-item {
  background: rgba(255,255,255,0.5);
  border: 1px solid rgba(0,168,84,0.12);
  border-radius: 14px;
  padding: 12px 14px;
  backdrop-filter: blur(8px);
}
.info-item-label {
  font-size: 10px;
  font-weight: 700;
  color: #5a7a6e;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 4px;
}
.info-item-val {
  font-size: 12.5px;
  font-weight: 700;
  color: #1a3329;
  line-height: 1.5;
}

/* ── Stars ── */
.stars { display: flex; gap: 3px; }
.star--on  { color: #c8a800; font-size: 14px; }
.star--off { color: rgba(0,0,0,0.12); font-size: 14px; }

/* ── Hero ── */
.sp-hero {
  padding: 56px 40px 48px;
  position: relative;
  background: linear-gradient(135deg, #1a3329 0%, #0b6630 60%, #1a5e3a 100%);
  overflow: hidden;
}
.sp-hero-dots {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle, rgba(168,224,44,0.1) 1.5px, transparent 1.5px);
  background-size: 28px 28px;
  pointer-events: none;
}
.sp-hero-content {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
  text-align: center;
}
.sp-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(168,224,44,0.15);
  border: 1px solid rgba(168,224,44,0.35);
  border-radius: 999px;
  padding: 6px 18px;
  font-size: 12px;
  font-weight: 700;
  color: #a8e02c;
  margin-bottom: 22px;
  letter-spacing: 0.5px;
}
.sp-hero-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(36px, 6vw, 58px);
  font-weight: 800;
  color: #fff;
  letter-spacing: -1.5px;
  line-height: 1.05;
  margin-bottom: 16px;
}
.sp-hero-title span { color: #a8e02c; }
.sp-hero-sub {
  font-size: 15px;
  color: rgba(255,255,255,0.65);
  line-height: 1.8;
  max-width: 480px;
  margin: 0 auto;
}
.sp-hero-stats {
  display: flex;
  justify-content: center;
  gap: 36px;
  margin-top: 32px;
}
.sp-hero-stat-num {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  font-weight: 800;
  color: #a8e02c;
  line-height: 1;
}
.sp-hero-stat-label {
  font-size: 11.5px;
  color: rgba(255,255,255,0.5);
  margin-top: 4px;
  font-weight: 500;
}
`;

/* ─────────────────── helpers ─────────────────── */
function buildImageUrl(sp) {
  const raw = sp.image || sp.resume?.images?.[0] || sp.resume?.image || null;
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://") || raw.startsWith("data:")) return raw;
  const rel = raw.startsWith("/") ? raw : `/${raw}`;
  return `/api${rel}`;
}

function getAvailableDates() {
  const dates = [];
  let d = new Date();
  d.setDate(d.getDate() + 1);
  while (dates.length < 14) {
    if (d.getDay() !== 5) dates.push(new Date(d).toISOString().split("T")[0]);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function generateSlots(dateStr, bookedKeys = []) {
  if (new Date(dateStr).getDay() === 5) return [];
  const slots = [];
  for (let h = 8; h < 18; h++) {
    const label = `${String(h).padStart(2,"0")}:00 – ${String(h+1).padStart(2,"0")}:00`;
    const key   = `${dateStr}_${h}`;
    slots.push({ label, key, booked: bookedKeys.includes(key) });
  }
  return slots;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function getInitials(sp) {
  return `${sp.firstName?.[0] ?? ""}${sp.lastName?.[0] ?? ""}`.toUpperCase();
}

/* ─────────────────── Stars ─────────────────── */
function Stars({ count }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={count >= i ? "star--on" : "star--off"}>★</span>
      ))}
    </div>
  );
}

/* ─────────────────── SpImage ─────────────────── */
function SpImage({ sp, mode = "cover", size = 64, style: extraStyle = {} }) {
  const [error, setError] = useState(false);
  const src = buildImageUrl(sp);

  const Fallback = () => (
    <div style={{
      width: "100%", height: "100%",
      background: "linear-gradient(135deg,#1a3329 0%,#0b6630 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      borderRadius: mode === "circle" ? "50%" : 0, ...extraStyle,
    }}>
      <span style={{
        fontFamily: "'Space Grotesk',sans-serif",
        fontSize: mode === "circle" ? size * 0.35 : 48,
        fontWeight: 800, color: "rgba(168,224,44,0.8)",
      }}>{getInitials(sp)}</span>
    </div>
  );

  if (!src || error) return <Fallback />;

  const imgStyle = mode === "circle"
    ? { width: size, height: size, borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%", display: "block", flexShrink: 0, ...extraStyle }
    : { width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%", display: "block", ...extraStyle };

  return <img src={src} alt={`${sp.firstName} ${sp.lastName}`} style={imgStyle} onError={() => setError(true)} />;
}

/* ─────────────────── BookingModal ─────────────────── */
function BookingModal({ sp, selectedOffer, onClose, onConfirm }) {
  const DATES = getAvailableDates();
  const [selDate,      setSelDate]      = useState(DATES[0]);
  const [selSlot,      setSelSlot]      = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookedKeys,   setBookedKeys]   = useState([]);

  const displayPrice = selectedOffer ? `$${Number(selectedOffer.price).toFixed(2)}` : "—";

  useEffect(() => {
    if (!sp?.id) return;
    setLoadingSlots(true);
    fetch(`http://localhost:5000/sessions/occupied/${sp.id}?date=${selDate}`, { credentials: "include" })
      .then(r => r.json())
      .then(data => setBookedKeys(data.occupiedSlots?.map(s => {
        const d = new Date(s);
        return `${selDate}_${d.getHours()}`;
      }) ?? []))
      .catch(() => {})
      .finally(() => setLoadingSlots(false));
  }, [sp?.id, selDate]);

  const slots = generateSlots(selDate, bookedKeys);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="book-modal" onClick={e => e.stopPropagation()}>

        {/* Header strip */}
        <div style={{ position: "relative", height: 100, overflow: "hidden", borderRadius: "22px 22px 0 0", flexShrink: 0 }}>
          <SpImage sp={sp} mode="cover" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right,rgba(26,51,41,0.88),rgba(26,51,41,0.45))" }} />
          <div style={{ position: "absolute", inset: 0, padding: "0 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff" }}>{sp.firstName} {sp.lastName}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 3 }}>{sp.resume?.bio?.slice(0,55)}…</div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.18)", border: "1.5px solid rgba(168,224,44,0.3)", cursor: "pointer", color: "#fff", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "22px" }}>

          {/* Package summary */}
          <div style={{
            background: "rgba(168,224,44,0.08)",
            border: "1.5px solid rgba(168,224,44,0.35)",
            borderRadius: 16, padding: "14px 16px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329" }}>
                {selectedOffer?.name ?? "Package"}
              </div>
              <div style={{ fontSize: 12, color: "#5a7a6e", marginTop: 2 }}>
                {selectedOffer?.sessionsCount ?? 1} session{(selectedOffer?.sessionsCount ?? 1) > 1 ? "s" : ""} · Plan + Chat included
              </div>
              <div style={{ fontSize: 11.5, color: "#0b6630", marginTop: 3, fontWeight: 600 }}>
                📅 Pick your first session date below
                {(selectedOffer?.sessionsCount ?? 1) > 1 && " — you'll book the rest after payment"}
              </div>
            </div>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 800, color: "#0b6630", flexShrink: 0 }}>{displayPrice}</div>
          </div>

          {/* Date picker */}
          <div style={{ marginBottom: 18 }}>
            <div className="sec-title">Select Date for Session 1</div>
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, scrollbarWidth: "none" }}>
              {DATES.map(d => (
                <button key={d} className={`date-btn${selDate === d ? " active" : ""}`}
                  onClick={() => { setSelDate(d); setSelSlot(null); }}>
                  {formatDate(d)}
                </button>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div className="sec-title" style={{ marginBottom: 0 }}>Select Time</div>
              <div style={{ fontSize: 11, color: "#5a7a6e", fontWeight: 600 }}>08:00 – 18:00 · No Fridays</div>
            </div>
            {loadingSlots ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#5a7a6e", fontSize: 13 }}>Loading availability…</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
                {slots.map(slot => (
                  <button key={slot.key}
                    className={`slot-btn${slot.booked ? " booked" : ""}${selSlot?.key === slot.key ? " active" : ""}`}
                    onClick={() => !slot.booked && setSelSlot(slot)}>
                    {slot.label}
                    {slot.booked && <span style={{ display: "block", fontSize: 10, marginTop: 2 }}>Booked</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected summary */}
          {selSlot && (
            <div style={{
              background: "rgba(168,224,44,0.1)",
              border: "1px solid rgba(168,224,44,0.35)",
              borderRadius: 14, padding: "12px 14px", marginBottom: 18,
              display: "flex", gap: 10, alignItems: "center",
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0b6630" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3329" }}>Session 1: {formatDate(selDate)} · {selSlot.label}</div>
                <div style={{ fontSize: 11.5, color: "#5a7a6e", marginTop: 1 }}>{displayPrice}</div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 10 }}>
            <button className="pf-btn pf-btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
            <button
              className="pf-btn pf-btn-primary"
              onClick={() => selSlot && onConfirm({ sp, date: selDate, slot: selSlot })}
              disabled={!selSlot}
              style={{ flex: 2, justifyContent: "center" }}
            >
              Proceed to Payment →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── SpecialistModal ─────────────────── */
function SpecialistModal({ sp, selectedOffer, onClose, onBook }) {
  const displayPrice = selectedOffer ? `$${Number(selectedOffer.price).toFixed(2)}` : "—";

  return (
    <div className="overlay" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>

        {/* Cover image */}
        <div style={{ position: "relative", height: 240, overflow: "hidden", flexShrink: 0, borderRadius: "22px 22px 0 0" }}>
          <SpImage sp={sp} mode="cover" />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 35%, rgba(26,51,41,0.85))" }} />
          <button onClick={onClose} style={{
            position: "absolute", top: 14, right: 14,
            width: 34, height: 34, borderRadius: 10,
            background: "rgba(255,255,255,0.85)", border: "1.5px solid rgba(168,224,44,0.4)",
            cursor: "pointer", fontSize: 13, color: "#1a3329",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
          <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
            <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff" }}>{sp.firstName} {sp.lastName}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 4 }}>{sp.resume?.bio?.slice(0,65)}</div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "22px 26px 28px", overflowY: "auto", flex: 1 }}>

          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
            <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329" }}>
              {sp.resume?.ratingAverage || "—"}
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 18 }}>
            {(sp.resume?.specializations || []).map(s => <span key={s} className="sp-tag">{s}</span>)}
          </div>

          {/* Info grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
            <div className="info-item" style={{ gridColumn: "1 / -1" }}>
              <div className="info-item-label">Education</div>
              <div className="info-item-val">{sp.resume?.education || "—"}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Workplace</div>
              <div className="info-item-val">{sp.resume?.workplace || "—"}</div>
            </div>
            <div className="info-item">
              <div className="info-item-label">Experience</div>
              <div className="info-item-val">{sp.resume?.experienceYears ? `${sp.resume.experienceYears} years` : "—"}</div>
            </div>
          </div>

          {/* Package + Book */}
          <div style={{
            background: "linear-gradient(135deg,#1a3329,#0b6630)",
            borderRadius: 18, padding: "18px 20px",
            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
          }}>
            <div>
              <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 15, fontWeight: 800, color: "#fff", marginBottom: 3 }}>
                {selectedOffer?.name ?? "Package"}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {displayPrice} · {selectedOffer?.sessionsCount ?? 1} session{(selectedOffer?.sessionsCount ?? 1) > 1 ? "s" : ""} + plan + chat
              </div>
            </div>
            <button onClick={() => onBook(sp)} style={{
              background: "#a8e02c", color: "#1a3329",
              border: "none", borderRadius: 12,
              padding: "10px 20px", fontSize: 13.5, fontWeight: 800,
              cursor: "pointer", fontFamily: "'Inter',sans-serif",
              display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
              boxShadow: "0 4px 14px rgba(168,224,44,0.35)",
            }}>
              📅 Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────── Main Page ─────────────────── */
export default function Specialists() {
  const navigate       = useNavigate();
  const location       = useLocation();
  const { isLoggedIn } = useAuth();

  const selectedOffer = location.state?.selectedOffer ?? null;

  const [specialists, setSpecialists] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [selected,    setSelected]    = useState(null);
  const [bookingSp,   setBookingSp]   = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/nutritionists/public?type=PACKAGE", { credentials: "include" })
      .then(r => r.json())
      .then(data => setSpecialists(Array.isArray(data) ? data : []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (sp) => { setSelected(null); setBookingSp(sp); };

  const handleConfirm = ({ sp, date, slot }) => {
    setBookingSp(null);
    const offerId = selectedOffer?.id ?? sp.offersAsNutrition?.find(o => o.type === "PACKAGE")?.id ?? null;
    if (!offerId) { alert("This specialist has no active package offer."); return; }
    const slotHour    = parseInt(slot.key.split("_")[1], 10);
    const sessionDate = new Date(`${date}T${String(slotHour).padStart(2,"0")}:00:00`).toISOString();
    const paymentState = {
      offerId, nutritionId: sp.id, sessionDate,
      offerName:     selectedOffer?.name ?? "Package",
      price:         selectedOffer?.price ? `$${Number(selectedOffer.price).toFixed(2)}` : "—",
      chatDays:      selectedOffer?.chatDays ?? 0,
      sessionsCount: selectedOffer?.sessionsCount ?? 1,
      nutritionName: `${sp.firstName} ${sp.lastName}`,
      nutritionImage: buildImageUrl(sp),
    };
    if (!isLoggedIn) { navigate("/login", { state: { redirect: "/payment", paymentState } }); return; }
    navigate("/payment", { state: paymentState });
  };

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Inter',sans-serif" }}>
      <style>{CSS}</style>
      <Header />

      {/* ── Hero ── */}
      <section className="sp-hero anim-up">
        <div className="sp-hero-dots" />
        <div className="sp-hero-content">
          <div className="sp-hero-badge">👥 Certified Nutrition Specialists</div>
          <h1 className="sp-hero-title">Meet our <span>experts.</span></h1>
          <p className="sp-hero-sub">
            Book your package with a certified nutritionist — sessions, plan, and chat all included.
          </p>

          {selectedOffer && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(168,224,44,0.12)",
              border: "1px solid rgba(168,224,44,0.3)",
              borderRadius: 14, padding: "10px 18px",
              marginTop: 20, fontSize: 13, fontWeight: 600, color: "#a8e02c",
            }}>
              📦 Selected: <strong>{selectedOffer.name}</strong> · ${Number(selectedOffer.price).toFixed(2)} · {selectedOffer.sessionsCount} session{selectedOffer.sessionsCount > 1 ? "s" : ""}
            </div>
          )}

          <div className="sp-hero-stats">
            {[[specialists.length || "—", "Specialists"], ["500+", "Patients helped"], ["4.85", "Avg. rating"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="sp-hero-stat-num">{num}</div>
                <div className="sp-hero-stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px 80px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="shimmer" style={{ animationDelay: `${i*0.1}s` }} />)}
          </div>
        ) : specialists.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#9ab5a5" }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>🩺</div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>No specialists available yet.</div>
          </div>
        ) : (
          <div className="anim-up-d1" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
            {specialists.map(sp => {
              const displayPrice = selectedOffer
                ? `$${Number(selectedOffer.price).toFixed(2)}`
                : "No package selected";

              return (
                <div key={sp.id} className="glass-card sp-card" onClick={() => setSelected(sp)}>
                  <div className="sp-card-img-wrap">
                    <SpImage sp={sp} mode="cover" />
                  </div>
                  <div className="sp-card-body">
                    <div className="sp-card-name">{sp.firstName} {sp.lastName}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Stars count={Math.round(sp.resume?.ratingAverage || 0)} />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: "#5a7a6e" }}>
                        {sp.resume?.ratingAverage || "—"}
                      </span>
                    </div>
                    <p className="sp-card-bio">{sp.resume?.bio?.slice(0,65)}…</p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                      {(sp.resume?.specializations || []).slice(0,3).map(s => (
                        <span key={s} className="sp-tag">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="sp-card-footer">
                    <span className="sp-card-price">{displayPrice}</span>
                    <span className="sp-view-btn">View Profile →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <SpecialistModal
          sp={selected}
          selectedOffer={selectedOffer}
          onClose={() => setSelected(null)}
          onBook={handleBook}
        />
      )}
      {bookingSp && (
        <BookingModal
          sp={bookingSp}
          selectedOffer={selectedOffer}
          onClose={() => setBookingSp(null)}
          onConfirm={handleConfirm}
        />
      )}

      <Footer />
    </div>
  );
}