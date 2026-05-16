// StripeRedirect.jsx
import { useEffect } from "react";

const API_URL = "http://localhost:5000";

export default function StripeRedirect() {
  useEffect(() => {
    const goToStripe = async () => {
      try {
        // Step 1: Create the connected account first
        const accountRes = await fetch(`${API_URL}/stripe/create-account`, {
          method: "POST",
          credentials: "include",
        });

        // If account already exists (409), that's fine — continue
        if (!accountRes.ok && accountRes.status !== 409) {
          const text = await accountRes.text();
          throw new Error(`Create account failed: ${text}`);
        }

        // Step 2: Generate the onboarding link
        const res = await fetch(`${API_URL}/stripe/onboarding`, {
          method: "POST",
          credentials: "include",
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Onboarding failed: ${text}`);
        }

        const data = await res.json();

        if (data.onboardingUrl) {
          window.location.href = data.onboardingUrl;
        } else {
          console.error("Stripe onboarding URL missing:", data);
        }
      } catch (err) {
        console.error("Stripe error:", err);
      }
    };

    goToStripe();
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p>Redirecting to Stripe setup...</p>
    </div>
  );
}