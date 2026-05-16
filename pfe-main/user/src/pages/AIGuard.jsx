import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import { useAuth } from "../context/Authcontext";

const API_URL = "http://localhost:5000";

export default function AIGuard({ children }) {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { state: { redirect: "/ai-premium" } });
      return;
    }

    (async () => {
      try {
        const res  = await fetch(`${API_URL}/subscriptions/mine`, { credentials: "include" });
        const data = await res.json();
        const subs = data.subscriptions ?? [];
        const now  = new Date();

        // ✅ Check for ANY active AI_CALORIES offer instead of specific names
        const active = subs.find(s =>
          (s.status === "ACTIVE" || s.status === "TRIAL") &&
          new Date(s.endDate) > now &&
          s.offer?.type === "AI_CALORIES"
        );

        if (active) {
          setStatus("allowed");
        } else {
          // Check if they have an expired AI trial
          const expiredTrial = subs.find(s =>
            s.offer?.type === "AI_CALORIES" &&
            new Date(s.endDate) <= now
          );
          setStatus(expiredTrial ? "trial-expired" : "denied");
        }
      } catch {
        setStatus("denied");
      }
    })();
  }, [isLoggedIn]);

  useEffect(() => {
    if (status === "denied") navigate("/ai-premium");
  }, [status, navigate]);

  if (status === "checking") return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 48, height: 48, border: "3px solid rgba(45,107,80,0.2)", borderTop: "3px solid #2d6b50", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
        <div style={{ color: "#5a7a6e", fontSize: 14 }}>Checking access…</div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (status === "trial-expired") return (
    <div style={{ minHeight: "100vh", background: "#f7faf8", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 440, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>⏱️</div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: 28, fontWeight: 800, color: "#1a3329", marginBottom: 12 }}>
          Your free trial has ended
        </h2>
        <p style={{ fontSize: 15, color: "#5a7a6e", lineHeight: 1.8, marginBottom: 32 }}>
          Upgrade to continue using AI calorie tracking.
        </p>
        <button onClick={() => navigate("/ai-premium")} style={{ background: "linear-gradient(135deg,#1a3329,#2d6b50)", color: "#f5e642", border: "none", borderRadius: 14, padding: "14px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
          View Plans →
        </button>
      </div>
    </div>
  );

  if (status === "denied") return null;

  return children;
}