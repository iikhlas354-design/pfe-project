import { useState, useRef, useEffect } from "react";

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  .cb-wrapper { position: fixed; bottom: 24px; left: 24px; z-index: 1000; font-family: 'DM Sans', sans-serif; }

  .cb-btn {
    width: auto;
    height: 44px;
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-top: 1.5px solid rgba(168, 224, 44, 0.9);
    border-left: 1.5px solid rgba(168, 224, 44, 0.9);
    border-bottom: 1.5px solid rgba(0, 168, 84, 0.8);
    border-right: 1.5px solid rgba(0, 168, 84, 0.8);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 32px rgba(15, 89, 47, 0.15), inset 0 0 12px rgba(255, 255, 255, 0.6);
    padding: 0 16px;
    gap: 8px;
    animation: cbFloat 3s ease-in-out infinite;
    transition: all 0.3s ease;
  }
  .cb-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    box-shadow: 0 10px 34px rgba(15, 89, 47, 0.20), inset 0 0 16px rgba(255, 255, 255, 0.8);
    transform: translateY(-2px);
  }
  @keyframes cbFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }

  .cb-label { font-size: 13px; font-weight: 600; color: #000000; white-space: nowrap; }

  .cb-btn svg { width: 26px; height: 26px; flex-shrink: 0; }
  .wl { transform-origin: 50% 52%; animation: flapL 0.8s ease-in-out infinite alternate; }
  .wr { transform-origin: 50% 52%; animation: flapR 0.8s ease-in-out infinite alternate; }
  @keyframes flapL { from{transform:scaleX(1)} to{transform:scaleX(0.5)} }
  @keyframes flapR { from{transform:scaleX(1)} to{transform:scaleX(0.5)} }

  /* ── FULL-PAGE GLASS OVERLAY ── */
  .cb-overlay {
    position: fixed;
    inset: 0;
    z-index: 998;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(26, 51, 41, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.25s ease;
  }
  .cb-overlay.open {
    opacity: 1;
    pointer-events: all;
  }

  .cb-popup {
    position: relative;
    width: min(560px, 92vw);
    height: min(600px, 85vh);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-top: 1.5px solid rgba(168, 224, 44, 0.9);
    border-left: 1.5px solid rgba(168, 224, 44, 0.9);
    border-bottom: 1.5px solid rgba(0, 168, 84, 0.8);
    border-right: 1.5px solid rgba(0, 168, 84, 0.8);
    border-radius: 22px;
    box-shadow: 0 16px 48px rgba(15, 89, 47, 0.2), inset 0 0 16px rgba(255, 255, 255, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transform: scale(0.95);
    opacity: 0;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
  .cb-overlay.open .cb-popup {
    transform: scale(1);
    opacity: 1;
  }

  .cb-close-x {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: 1.5px solid rgba(168, 224, 44, 0.4);
    background: rgba(255, 255, 255, 0.5);
    color: #000000;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }
  .cb-close-x:hover {
    background: rgba(255, 255, 255, 0.8);
  }

  .cb-header {
    background: linear-gradient(135deg, #3d9b73, #2a6b4f);
    color: #ffffff;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    border-radius: 22px 22px 0 0;
  }
  .cb-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
  }
  .cb-header h3 { font-size: 15px; font-weight: 700; margin: 0; color: #ffffff; }
  .cb-header p { font-size: 11px; opacity: 0.85; margin: 0; color: #ffffff; }
  .cb-dot { width: 7px; height: 7px; border-radius: 50%; background: #69f0ae; display: inline-block; margin-right: 4px; }

  .cb-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: rgba(248, 249, 250, 0.3);
  }
  .cb-msg {
    padding: 10px 14px;
    border-radius: 14px;
    max-width: 80%;
    font-size: 13px;
    line-height: 1.5;
    word-wrap: break-word;
    color: #000000;
  }
  .cb-msg.user {
    background: linear-gradient(135deg, #3d9b73, #2a6b4f);
    color: #ffffff;
    align-self: flex-end;
    border-bottom-right-radius: 4px;
  }
  .cb-msg.bot {
    background: rgba(255, 255, 255, 0.6);
    color: #000000;
    align-self: flex-start;
    border-bottom-left-radius: 4px;
    border: 1.5px solid rgba(168, 224, 44, 0.3);
  }
  .cb-typing span {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #000000;
    margin: 0 2px;
    animation: cbBounce 1s infinite;
  }
  .cb-typing span:nth-child(2) { animation-delay: 0.15s; }
  .cb-typing span:nth-child(3) { animation-delay: 0.3s; }
  @keyframes cbBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }

  .cb-input-row {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    gap: 10px;
    border-top: 1.5px solid rgba(168, 224, 44, 0.3);
    background: rgba(255, 255, 255, 0.2);
  }
  .cb-input-row input {
    flex: 1;
    border: 1.5px solid rgba(168, 224, 44, 0.4);
    border-radius: 20px;
    padding: 9px 16px;
    font-size: 13px;
    background: rgba(255, 255, 255, 0.5);
    color: #000000;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border 0.2s ease;
  }
  .cb-input-row input::placeholder { color: #666666; }
  .cb-input-row input:focus { border-color: rgba(0, 168, 84, 0.8); }
  .cb-send {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3d9b73, #2a6b4f);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 14px rgba(11, 102, 48, 0.3);
    transition: all 0.2s ease;
  }
  .cb-send:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 18px rgba(11, 102, 48, 0.4);
  }
`;

export default function ChatBot() {
  const [open, setOpen]         = useState(false);
  const [opened, setOpened]     = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput]       = useState("");
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function toggle() {
    setOpen(o => !o);
    if (!opened) {
      setOpened(true);
      setTimeout(() => {
        setMessages([{ role: "bot", text: "Hi there! I'm Chrysalis, your nutrition companion. How can I help you today? 🌱" }]);
      }, 400);
    }
  }

  async function sendMessage() {
    const msg = input.trim();
    if (!msg || loading) return;
    setMessages(prev => [...prev, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.reply || "Sorry, I couldn't respond." }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "Can't connect to the server. Make sure it's running." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      {/* Full-page glass overlay */}
      <div className={`cb-overlay ${open ? "open" : ""}`} onClick={toggle}>
        <div className="cb-popup" onClick={e => e.stopPropagation()}>
          <button className="cb-close-x" onClick={toggle}>✕</button>

          <div className="cb-header">
            <div className="cb-avatar">🦋</div>
            <div>
              <h3>Chrysalis</h3>
              <p><span className="cb-dot"/>Online · Nutrition assistant</p>
            </div>
          </div>

          <div className="cb-messages">
            {messages.map((m, i) => (
              <div key={i} className={`cb-msg ${m.role}`}>{m.text}</div>
            ))}
            {loading && (
              <div className="cb-msg bot cb-typing">
                <span/><span/><span/>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          <div className="cb-input-row">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
              placeholder="Ask about nutrition..."
            />
            <button className="cb-send" onClick={sendMessage}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="cb-wrapper">
        <button className="cb-btn" onClick={toggle}>
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g className="wl">
              <path d="M50 48 C44 30, 18 22, 12 36 C6 50, 20 66, 38 58 C44 55, 49 51, 50 48Z" fill="#388e3c"/>
              <path d="M50 48 C44 32, 20 25, 14 38 C8 51, 22 64, 39 57 C45 54, 49 51, 50 48Z" fill="#4caf50"/>
              <path d="M50 48 C44 34, 22 28, 16 40 C10 52, 24 62, 40 56 C45 54, 49 51, 50 48Z" fill="#66bb6a"/>
              <circle cx="28" cy="38" r="7" fill="#2e7d32" opacity="0.35"/>
              <circle cx="28" cy="38" r="4.5" fill="#a5d6a7" opacity="0.7"/>
              <circle cx="28" cy="38" r="2" fill="white" opacity="0.6"/>
              <circle cx="38" cy="52" r="4" fill="#a5d6a7" opacity="0.5"/>
            </g>
            <g className="wl">
              <path d="M50 54 C44 60, 28 68, 20 76 C13 83, 20 92, 34 86 C44 81, 49 66, 50 58Z" fill="#2e7d32"/>
              <path d="M50 54 C44 61, 30 68, 22 75 C15 82, 22 90, 35 85 C44 80, 49 65, 50 58Z" fill="#43a047"/>
              <path d="M50 54 C44 62, 31 69, 24 75 C17 81, 24 89, 36 84 C45 79, 49 65, 50 58Z" fill="#66bb6a"/>
              <circle cx="32" cy="74" r="4.5" fill="#a5d6a7" opacity="0.6"/>
              <circle cx="24" cy="82" r="3" fill="#a5d6a7" opacity="0.4"/>
            </g>
            <g className="wr">
              <path d="M50 48 C56 30, 82 22, 88 36 C94 50, 80 66, 62 58 C56 55, 51 51, 50 48Z" fill="#388e3c"/>
              <path d="M50 48 C56 32, 80 25, 86 38 C92 51, 78 64, 61 57 C55 54, 51 51, 50 48Z" fill="#4caf50"/>
              <path d="M50 48 C56 34, 78 28, 84 40 C90 52, 76 62, 60 56 C55 54, 51 51, 50 48Z" fill="#66bb6a"/>
              <circle cx="72" cy="38" r="7" fill="#2e7d32" opacity="0.35"/>
              <circle cx="72" cy="38" r="4.5" fill="#a5d6a7" opacity="0.7"/>
              <circle cx="72" cy="38" r="2" fill="white" opacity="0.6"/>
              <circle cx="62" cy="52" r="4" fill="#a5d6a7" opacity="0.5"/>
            </g>
            <g className="wr">
              <path d="M50 54 C56 60, 72 68, 80 76 C87 83, 80 92, 66 86 C56 81, 51 66, 50 58Z" fill="#2e7d32"/>
              <path d="M50 54 C56 61, 70 68, 78 75 C85 82, 78 90, 65 85 C56 80, 51 65, 50 58Z" fill="#43a047"/>
              <path d="M50 54 C56 62, 69 69, 76 75 C83 81, 76 89, 64 84 C55 79, 51 65, 50 58Z" fill="#66bb6a"/>
              <circle cx="68" cy="74" r="4.5" fill="#a5d6a7" opacity="0.6"/>
              <circle cx="76" cy="82" r="3" fill="#a5d6a7" opacity="0.4"/>
            </g>
            <ellipse cx="50" cy="57" rx="3" ry="14" fill="#1b5e20"/>
            <ellipse cx="50" cy="57" rx="2" ry="13" fill="#2e7d32"/>
            <circle cx="50" cy="38" r="9" fill="#1b5e20"/>
            <circle cx="50" cy="38" r="7.5" fill="#2e7d32"/>
            <circle cx="50" cy="38" r="6" fill="#388e3c"/>
            <circle cx="46" cy="36" r="3" fill="white"/>
            <circle cx="54" cy="36" r="3" fill="white"/>
            <circle cx="46.5" cy="36.5" r="1.8" fill="#1a237e"/>
            <circle cx="54.5" cy="36.5" r="1.8" fill="#1a237e"/>
            <circle cx="46" cy="35.8" r="0.9" fill="white"/>
            <circle cx="54" cy="35.8" r="0.9" fill="white"/>
            <path d="M46 41 Q50 44.5 54 41" stroke="white" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
            <ellipse cx="43.5" cy="40" rx="2.5" ry="1.8" fill="#f48fb1" opacity="0.55"/>
            <ellipse cx="56.5" cy="40" rx="2.5" ry="1.8" fill="#f48fb1" opacity="0.55"/>
            <path d="M47.5 30 C45 23, 39 18, 36 13" stroke="#1b5e20" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <circle cx="36" cy="13" r="3" fill="#4caf50"/>
            <circle cx="36" cy="13" r="1.8" fill="#a5d6a7"/>
            <circle cx="36" cy="13" r="0.8" fill="white"/>
            <path d="M52.5 30 C55 23, 61 18, 64 13" stroke="#1b5e20" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            <circle cx="64" cy="13" r="3" fill="#4caf50"/>
            <circle cx="64" cy="13" r="1.8" fill="#a5d6a7"/>
            <circle cx="64" cy="13" r="0.8" fill="white"/>
          </svg>
          <span className="cb-label">Chat with us</span>
        </button>
      </div>
    </>
  );
}