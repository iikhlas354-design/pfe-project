import Header from "../components/Header";

const SECTIONS = [
  {
    title: "What we collect",
    text: "We collect your name, email address, and basic health information you provide when signing up — such as your goals, weight, and dietary preferences. We also collect usage data to improve your experience.",
  },
  {
    title: "How we use it",
    text: "Your data is used solely to personalise your health plan, provide nutritionist sessions, and improve our AI recommendations. We never use your data for advertising purposes.",
  },
  {
    title: "Who we share it with",
    text: "We do not sell your data. We may share limited information with certified nutritionists assigned to your account, and with trusted service providers (hosting, analytics) who are bound by strict confidentiality agreements.",
  },
  {
    title: "How we protect it",
    text: "All data is encrypted in transit and at rest. We follow industry-standard security practices and conduct regular audits to ensure your information stays safe.",
  },
  {
    title: "Your rights",
    text: "You can request to view, edit, or permanently delete your data at any time by contacting us. You also have the right to export your data in a readable format.",
  },
  {
    title: "Cookies",
    text: "We use essential cookies to keep you logged in and remember your preferences. We do not use third-party tracking cookies.",
  },
  {
    title: "Contact us",
    text: "If you have any questions about this policy, reach us at privacy@chrisalis.com — we aim to respond within 48 hours.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

          *{
            box-sizing:border-box;
          }

          body{
            margin:0;
            font-family:'Space Grotesk',sans-serif;
            background:#f7f8f5;
          }

          .privacy-page{
            min-height:100vh;
            background:
              radial-gradient(circle at top left, rgba(132,204,22,0.08), transparent 30%),
              radial-gradient(circle at bottom right, rgba(34,197,94,0.08), transparent 30%),
              #f7f8f5;
            color:#111827;
          }

          .privacy-container{
            width:100%;
            max-width:920px;
            margin:0 auto;
            padding:140px 24px 100px;
          }

          .privacy-badge-wrap{
            display:flex;
            justify-content:center;
            margin-bottom:26px;
          }

          .privacy-badge{
            display:inline-flex;
            align-items:center;
            gap:10px;
            padding:10px 18px;
            border-radius:999px;
            background:rgba(255,255,255,0.75);
            backdrop-filter:blur(18px);
            border:1px solid rgba(132,204,22,0.25);
            font-size:13px;
            font-weight:600;
            color:#166534;
            box-shadow:0 8px 25px rgba(0,0,0,0.04);
          }

          .privacy-badge-icon{
            font-size:12px;
          }

          .privacy-title{
            text-align:center;
            font-size:clamp(42px,6vw,74px);
            line-height:1;
            letter-spacing:-2px;
            margin:0;
            font-weight:700;
            color:#0f172a;
          }

          .privacy-subtitle{
            text-align:center;
            margin-top:18px;
            color:#6b7280;
            font-size:15px;
            font-weight:500;
          }

          .privacy-intro{
            max-width:760px;
            margin:42px auto 0;
            text-align:center;
            font-size:18px;
            line-height:1.8;
            color:#374151;
          }

          .privacy-sections{
            margin-top:70px;
            display:flex;
            flex-direction:column;
            gap:26px;
          }

          .privacy-section{
            background:rgba(255,255,255,0.82);
            border:1px solid rgba(15,23,42,0.06);
            border-radius:30px;
            padding:34px;
            backdrop-filter:blur(18px);
            transition:0.3s ease;
            box-shadow:0 10px 30px rgba(0,0,0,0.03);
          }

          .privacy-section:hover{
            transform:translateY(-3px);
            box-shadow:0 18px 45px rgba(0,0,0,0.06);
          }

          .privacy-section-header{
            display:flex;
            align-items:center;
            gap:18px;
            margin-bottom:18px;
          }

          .privacy-section-num{
            width:44px;
            height:44px;
            border-radius:50%;
            display:grid;
            place-items:center;
            background:linear-gradient(135deg,#84cc16,#22c55e);
            color:white;
            font-size:14px;
            font-weight:700;
            flex-shrink:0;
          }

          .privacy-section-title{
            margin:0;
            font-size:24px;
            font-weight:700;
            letter-spacing:-0.5px;
            color:#111827;
          }

          .privacy-section-text{
            margin:0;
            color:#4b5563;
            line-height:1.9;
            font-size:16px;
          }

          @media (max-width:768px){

            .privacy-container{
              padding:120px 18px 70px;
            }

            .privacy-section{
              padding:26px;
              border-radius:24px;
            }

            .privacy-section-title{
              font-size:20px;
            }

            .privacy-intro{
              font-size:16px;
              line-height:1.7;
            }

          }
        `}
      </style>
      
      <div className="privacy-page">
   
       

        <Header />

        <div className="privacy-container">

          <div className="privacy-badge-wrap">
            <span className="privacy-badge">
              <span className="privacy-badge-icon">✦</span>
              Legal
            </span>
          </div>

          <h1 className="privacy-title">
            Privacy Policy
          </h1>

          <p className="privacy-subtitle">
            Last updated: March 2026 · Effective immediately
          </p>

          <p className="privacy-intro">
            At Chrisalis, your privacy is fundamental — not an
            afterthought. This page explains in plain language
            what data we collect, why we collect it, and how
            we protect it.
          </p>

          <div className="privacy-sections">

            {SECTIONS.map((s, i) => (
              <div
                key={s.title}
                className="privacy-section"
              >

                <div className="privacy-section-header">

                  <span className="privacy-section-num">
                    0{i + 1}
                  </span>

                  <h2 className="privacy-section-title">
                    {s.title}
                  </h2>

                </div>

                <p className="privacy-section-text">
                  {s.text}
                </p>

              </div>
            ))}

          </div>

        </div>
      </div>
    </>
  );
}