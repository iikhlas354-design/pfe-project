import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../../context/Authcontext";

const API_URL = "http://localhost:5000";

let _sio = null;
const getSio = async (userId) => {
  if (_sio) return _sio;
  try {
    const { io } = await import("socket.io-client");
    _sio = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
      query: { userId },
      withCredentials: true,
    });
    return _sio;
  } catch {
    return null;
  }
};

const fmt = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const avatar = (u) =>
  u?.image ||
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    `${u?.firstName ?? "?"} ${u?.lastName ?? ""}`
  )}&background=2d6b50&color=f5e642&bold=true&size=80`;

export default function ChatPage() {
  const { user } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [activeConv,    setActiveConv]    = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(true);
  const [msgLoading,    setMsgLoading]    = useState(false);
  const [search,        setSearch]        = useState("");
  const [onlineUsers,   setOnlineUsers]   = useState(new Set());
  const [showSidebar,   setShowSidebar]   = useState(true);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const sock      = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res  = await fetch(`${API_URL}/conversations`, { credentials: "include" });
      const data = await res.json();
      const sorted = (data.conversations || []).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      const seen = new Set();
      const deduped = sorted.filter((c) => {
        const otherId = user?.role === "CLIENT" ? c.nutrition?.id : c.patient?.id;
        if (!otherId || seen.has(otherId)) return false;
        seen.add(otherId);
        return true;
      });
      setConversations(deduped);
    } catch { /* noop */ }
    finally { setLoading(false); }
  }, [user?.role]);

  const fetchMessages = useCallback(async (convId) => {
    setMsgLoading(true);
    try {
      const res  = await fetch(`${API_URL}/conversations/${convId}/messages`, { credentials: "include" });
      const data = await res.json();
      setMessages(data.messages ?? []);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    } catch { /* noop */ }
    finally { setMsgLoading(false); }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchConversations();

    getSio(user.id).then((s) => {
      if (!s) return;
      sock.current = s;

      s.on("new_message", (msg) => {
        if (msg.senderId === user.id) return;
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setConversations((prev) =>
          prev
            .map((c) => c.id === msg.conversationId ? { ...c, messages: [msg], updatedAt: msg.createdAt } : c)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
      });

      s.on("user_online",  (id) => setOnlineUsers((prev) => new Set([...prev, id])));
      s.on("user_offline", (id) => setOnlineUsers((prev) => { const n = new Set(prev); n.delete(id); return n; }));
    });

    return () => {
      sock.current?.off("new_message");
      sock.current?.off("user_online");
      sock.current?.off("user_offline");
    };
  }, [user?.id, fetchConversations]);

  // Auto-hide sidebar on mobile when a conversation is selected
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowSidebar(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const openConv = (conv) => {
    const other = otherUser(conv);
    if (!other?.id) return;
    setActiveConv(conv);
    fetchMessages(conv.id);
    if (window.innerWidth <= 768) {
      setShowSidebar(false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const backToList = () => {
    setShowSidebar(true);
    setActiveConv(null);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !activeConv) return;
    setInput("");

    const optimisticId = `opt-${Date.now()}`;
    const optimistic = {
      id:             optimisticId,
      conversationId: activeConv.id,
      content:        text,
      createdAt:      new Date().toISOString(),
      sender:         { id: user.id, firstName: user.firstName, lastName: user.lastName, image: user.image },
      senderId:       user.id,
      _optimistic:    true,
    };
    setMessages((p) => [...p, optimistic]);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 40);

    try {
      const res  = await fetch(`${API_URL}/conversations/${activeConv.id}/messages`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      setMessages((p) => p.map((m) => (m.id === optimisticId ? data.message : m)));
    } catch {
      setMessages((p) => p.filter((m) => m.id !== optimisticId));
      setInput(text);
    }
  };

  const otherUser = (conv) => user?.role === "CLIENT" ? conv.nutrition : conv.patient;

  const filtered = conversations.filter((c) => {
    const other = otherUser(c);
    const name  = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const activeOther = activeConv ? otherUser(activeConv) : null;
  const isOnline    = activeOther && onlineUsers.has(activeOther.id);

  return (
    <>
      <style>{CSS}</style>
      <div className="ch-root">
        {/* Sidebar */}
        <aside className={`ch-sidebar ${showSidebar ? "visible" : "hidden"}`}>
          <div className="ch-sidebar-top">
            <h2 className="ch-sidebar-title">Messages</h2>
            <div className="ch-search-wrap">
              <svg className="ch-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input className="ch-search" placeholder="Search conversations…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>

          <div className="ch-conv-list">
            {loading && [1,2,3].map(i => (
              <div key={i} className="ch-skeleton" style={{ animationDelay: `${i*0.1}s` }} />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="ch-empty-state">
                <div className="ch-empty-icon">💬</div>
                <p>No conversations yet</p>
              </div>
            )}
            {filtered.map((conv) => {
              const other   = otherUser(conv);
              const lastMsg = conv.messages?.[0];
              const online  = onlineUsers.has(other?.id);
              const isMe    = lastMsg?.senderId === user?.id;
              const active  = activeConv?.id === conv.id;
              return (
                <button key={conv.id} className={`ch-conv-item ${active ? "active" : ""}`} onClick={() => openConv(conv)}>
                  <div className="ch-avatar-wrap">
                    <img src={avatar(other)} alt="" className="ch-avatar" />
                    {online && <span className="ch-online-dot" />}
                  </div>
                  <div className="ch-conv-info">
                    <div className="ch-conv-row">
                      <span className="ch-conv-name">{other?.firstName} {other?.lastName}</span>
                      <span className="ch-conv-time">{fmt(conv.updatedAt)}</span>
                    </div>
                    <div className="ch-conv-preview">
                      {isMe && <span className="ch-you">You: </span>}
                      {lastMsg?.content ?? <em>No messages yet</em>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className={`ch-main ${showSidebar ? "" : "full"}`}>
          {!activeConv ? (
            <div className="ch-placeholder">
              <div className="ch-placeholder-icon">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" width="56" height="56">
                  <rect width="64" height="64" rx="20" fill="url(#pg)"/>
                  <path d="M16 20h32a4 4 0 014 4v18a4 4 0 01-4 4H20l-8 6V24a4 4 0 014-4z" fill="rgba(245,230,66,0.25)" stroke="#f5e642" strokeWidth="1.5"/>
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse"><stop stopColor="#1a3329"/><stop offset="1" stopColor="#2d6b50"/></linearGradient></defs>
                </svg>
              </div>
              <h3 className="ch-placeholder-title">Select a conversation</h3>
              <p className="ch-placeholder-sub">Choose from your patient conversations on the left</p>
            </div>
          ) : (
            <>
              <div className="ch-header">
                <button className="ch-back-btn" onClick={backToList} aria-label="Back to conversations">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                  </svg>
                </button>
                <div className="ch-header-avatar-wrap">
                  <img src={avatar(activeOther)} alt="" className="ch-header-avatar" />
                  {isOnline && <span className="ch-online-dot" />}
                </div>
                <div className="ch-header-info">
                  <span className="ch-header-name">{activeOther?.firstName} {activeOther?.lastName}</span>
                  <span className={`ch-header-status ${isOnline ? "online" : ""}`}>{isOnline ? "Online now" : "Offline"}</span>
                </div>
              </div>

              <div className="ch-messages">
                {msgLoading && [1,2,3,4].map(i => (
                  <div key={i} className={`ch-msg-skeleton ${i%2===0 ? "right" : ""}`} />
                ))}
                {!msgLoading && messages.length === 0 && (
                  <div className="ch-no-msgs"><span>No messages yet — say hello 👋</span></div>
                )}
                {!msgLoading && messages.map((msg, idx) => {
                  const mine       = msg.senderId === user?.id;
                  const prevMine   = idx > 0 && messages[idx-1].senderId === msg.senderId;
                  const showAvatar = !mine && !prevMine;
                  return (
                    <div key={msg.id} className={`ch-msg-row ${mine ? "mine" : "theirs"}`}>
                      {!mine && (
                        <div className="ch-msg-avatar-slot">
                          {showAvatar
                            ? <img src={avatar(msg.sender)} alt="" className="ch-msg-avatar" />
                            : <span className="ch-msg-avatar-placeholder" />
                          }
                        </div>
                      )}
                      <div className={`ch-bubble ${mine ? "mine" : "theirs"} ${msg._optimistic ? "optimistic" : ""}`}>
                        {msg.content}
                        <span className="ch-bubble-time">{fmt(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {activeConv?.expiresAt && new Date(activeConv.expiresAt) < new Date() ? (
                <div className="ch-expired-bar">
                  <span>💬 Chat access for this package has expired</span>
                </div>
              ) : (
                <div className="ch-input-bar">
                  <input
                    ref={inputRef}
                    className="ch-input"
                    placeholder="Write a message…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
                  />
                  <button className={`ch-send-btn ${input.trim() ? "active" : ""}`} onClick={send} disabled={!input.trim()}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </>
  );
}

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');

/* ═══════════════════════════════════════════
   ROOT & LAYOUT
   ═══════════════════════════════════════════ */
.ch-root{
  display:flex;
  height:calc(100vh - 80px);
  background:#e8f5ef;
  font-family:Syne,sans-serif;
  overflow:hidden;
  border-radius:20px;
  box-shadow:0 4px 32px rgba(26,51,41,0.08);
}

/* ═══════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════ */
.ch-sidebar{
  width:300px;
  flex-shrink:0;
  background:#fff;
  display:flex;
  flex-direction:column;
  border-right:1px solid rgba(26,51,41,0.07);
  transition: transform 0.3s ease;
}

.ch-sidebar-top{
  padding:24px 18px 12px;
  border-bottom:1px solid rgba(26,51,41,0.06);
}

.ch-sidebar-title{
  font-size:20px;
  font-weight:800;
  color:rgb(26,51,41);
  margin-bottom:14px;
  letter-spacing:-0.3px;
}

.ch-search-wrap{
  position:relative;
}

.ch-search-icon{
  position:absolute;
  left:11px;
  top:50%;
  transform:translateY(-50%);
  width:15px;
  height:15px;
  color:rgba(26,51,41,0.35);
}

.ch-search{
  width:100%;
  padding:9px 12px 9px 34px;
  border:1.5px solid #daeee5;
  border-radius:12px;
  background:#f4fbf7;
  font-family:Syne,sans-serif;
  font-size:13px;
  color:rgb(26,51,41);
  outline:none;
  transition:border-color 0.2s,box-shadow 0.2s;
  box-sizing:border-box;
}

.ch-search:focus{
  border-color:rgb(45,107,80);
  box-shadow:0 0 0 3px rgba(45,107,80,0.1);
}

.ch-search::placeholder{
  color:rgba(26,51,41,0.35);
}

.ch-conv-list{
  flex:1;
  overflow-y:auto;
  padding:8px 0;
}

.ch-conv-list::-webkit-scrollbar{
  width:3px;
}

.ch-conv-list::-webkit-scrollbar-thumb{
  background:#daeee5;
  border-radius:10px;
}

.ch-conv-item{
  display:flex;
  align-items:center;
  gap:12px;
  padding:12px 18px;
  border:none;
  background:transparent;
  cursor:pointer;
  width:100%;
  text-align:left;
  transition:background 0.18s;
  font-family:Syne,sans-serif;
}

.ch-conv-item:hover{
  background:#f4fbf7;
}

.ch-conv-item.active{
  background:#e8f5ef;
}

.ch-avatar-wrap{
  position:relative;
  flex-shrink:0;
}

.ch-avatar{
  width:46px;
  height:46px;
  border-radius:50%;
  object-fit:cover;
  border:2px solid #e8f5ef;
}

.ch-online-dot{
  position:absolute;
  bottom:1px;
  right:1px;
  width:11px;
  height:11px;
  border-radius:50%;
  background:#22c55e;
  border:2px solid #fff;
}

.ch-conv-info{
  flex:1;
  min-width:0;
}

.ch-conv-row{
  display:flex;
  justify-content:space-between;
  align-items:baseline;
  margin-bottom:3px;
}

.ch-conv-name{
  font-size:13.5px;
  font-weight:700;
  color:rgb(26,51,41);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  max-width:140px;
}

.ch-conv-time{
  font-size:11px;
  color:rgba(26,51,41,0.4);
  flex-shrink:0;
}

.ch-conv-preview{
  font-size:12.5px;
  color:rgba(26,51,41,0.5);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
}

.ch-you{
  color:rgb(45,107,80);
  font-weight:600;
}

.ch-skeleton{
  height:62px;
  margin:6px 18px;
  border-radius:14px;
  background:linear-gradient(90deg,#f0f7f3 25%,#e0ede8 50%,#f0f7f3 75%);
  background-size:200% 100%;
  animation:shimmer 1.4s infinite;
}

@keyframes shimmer{
  0%{background-position:200% 0}
  100%{background-position:-200% 0}
}

.ch-empty-state{
  display:flex;
  flex-direction:column;
  align-items:center;
  padding:48px 24px;
  gap:10px;
}

.ch-empty-icon{
  font-size:36px;
}

.ch-empty-state p{
  font-size:13px;
  color:rgba(26,51,41,0.45);
  text-align:center;
}

/* ═══════════════════════════════════════════
   MAIN CHAT AREA
   ═══════════════════════════════════════════ */
.ch-main{
  flex:1;
  display:flex;
  flex-direction:column;
  background:#f7fdf9;
  min-width:0;
}

.ch-placeholder{
  flex:1;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:14px;
  padding:40px;
}

.ch-placeholder-icon{
  width:80px;
  height:80px;
  border-radius:24px;
  background:linear-gradient(135deg,rgb(26,51,41),rgb(45,107,80));
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 8px 28px rgba(26,51,41,0.25);
}

.ch-placeholder-title{
  font-size:20px;
  font-weight:800;
  color:rgb(26,51,41);
}

.ch-placeholder-sub{
  font-size:13.5px;
  color:rgba(26,51,41,0.45);
  text-align:center;
  max-width:260px;
}

/* ═══════════════════════════════════════════
   CHAT HEADER
   ═══════════════════════════════════════════ */
.ch-header{
  display:flex;
  align-items:center;
  gap:12px;
  padding:16px 22px;
  background:#fff;
  border-bottom:1px solid rgba(26,51,41,0.07);
  flex-shrink:0;
}

.ch-back-btn{
  display:none;
  background:none;
  border:none;
  padding:6px;
  cursor:pointer;
  color:rgb(26,51,41);
  border-radius:10px;
  transition:background 0.15s;
  flex-shrink:0;
}

.ch-back-btn:hover{
  background:#f4fbf7;
}

.ch-header-avatar-wrap{
  position:relative;
}

.ch-header-avatar{
  width:42px;
  height:42px;
  border-radius:50%;
  object-fit:cover;
  border:2px solid #e8f5ef;
}

.ch-header-info{
  display:flex;
  flex-direction:column;
  gap:2px;
}

.ch-header-name{
  font-size:15px;
  font-weight:700;
  color:rgb(26,51,41);
}

.ch-header-status{
  font-size:12px;
  color:rgba(26,51,41,0.4);
}

.ch-header-status.online{
  color:#22c55e;
}

/* ═══════════════════════════════════════════
   MESSAGES
   ═══════════════════════════════════════════ */
.ch-messages{
  flex:1;
  overflow-y:auto;
  padding:20px 22px;
  display:flex;
  flex-direction:column;
  gap:6px;
}

.ch-messages::-webkit-scrollbar{
  width:3px;
}

.ch-messages::-webkit-scrollbar-thumb{
  background:#daeee5;
  border-radius:10px;
}

.ch-no-msgs{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:13px;
  color:rgba(26,51,41,0.4);
}

.ch-msg-row{
  display:flex;
  align-items:flex-end;
  gap:8px;
}

.ch-msg-row.mine{
  flex-direction:row-reverse;
}

.ch-msg-avatar-slot{
  width:30px;
  flex-shrink:0;
}

.ch-msg-avatar{
  width:30px;
  height:30px;
  border-radius:50%;
  object-fit:cover;
}

.ch-msg-avatar-placeholder{
  display:block;
  width:30px;
  height:30px;
}

.ch-bubble{
  max-width:62%;
  padding:10px 14px;
  border-radius:18px;
  font-size:13.5px;
  line-height:1.5;
  position:relative;
  word-break:break-word;
}

.ch-bubble.theirs{
  background:#fff;
  color:rgb(26,51,41);
  border-bottom-left-radius:4px;
  box-shadow:0 1px 6px rgba(26,51,41,0.07);
}

.ch-bubble.mine{
  background:linear-gradient(135deg,rgb(26,51,41),rgb(45,107,80));
  color:rgb(245,230,66);
  border-bottom-right-radius:4px;
  box-shadow:0 3px 14px rgba(26,51,41,0.22);
}

.ch-bubble.optimistic{
  opacity:0.7;
}

.ch-bubble-time{
  display:block;
  font-size:10px;
  margin-top:4px;
  opacity:0.55;
  text-align:right;
}

.ch-msg-loading{
  display:flex;
  flex-direction:column;
  gap:12px;
}

.ch-msg-skeleton{
  height:40px;
  width:52%;
  border-radius:16px;
  background:linear-gradient(90deg,#edf7f2 25%,#dbeee6 50%,#edf7f2 75%);
  background-size:200% 100%;
  animation:shimmer 1.4s infinite;
}

.ch-msg-skeleton.right{
  align-self:flex-end;
}

/* ═══════════════════════════════════════════
   INPUT BAR
   ═══════════════════════════════════════════ */
.ch-input-bar{
  display:flex;
  align-items:center;
  gap:10px;
  padding:14px 18px;
  background:#fff;
  border-top:1px solid rgba(26,51,41,0.07);
  flex-shrink:0;
}

.ch-input{
  flex:1;
  padding:11px 16px;
  border:1.5px solid #daeee5;
  border-radius:14px;
  background:#f4fbf7;
  font-family:Syne,sans-serif;
  font-size:13.5px;
  color:rgb(26,51,41);
  outline:none;
  transition:border-color 0.2s,box-shadow 0.2s;
}

.ch-input:focus{
  border-color:rgb(45,107,80);
  box-shadow:0 0 0 3px rgba(45,107,80,0.1);
  background:#fff;
}

.ch-input::placeholder{
  color:rgba(26,51,41,0.35);
}

.ch-send-btn{
  width:44px;
  height:44px;
  border-radius:14px;
  border:none;
  background:#e8f5ef;
  color:rgba(26,51,41,0.3);
  cursor:not-allowed;
  display:flex;
  align-items:center;
  justify-content:center;
  flex-shrink:0;
  transition:all 0.2s;
}

.ch-send-btn.active{
  background:linear-gradient(135deg,rgb(26,51,41),rgb(45,107,80));
  color:rgb(245,230,66);
  cursor:pointer;
  box-shadow:0 4px 14px rgba(26,51,41,0.28);
}

.ch-send-btn.active:hover{
  transform:scale(1.07);
}

.ch-send-btn.active:active{
  transform:scale(0.96);
}

.ch-expired-bar{
  padding:16px 22px;
  background:#fff;
  border-top:1px solid rgba(26,51,41,0.07);
  text-align:center;
  font-size:13px;
  color:rgba(26,51,41,0.45);
  flex-shrink:0;
}

/* ═══════════════════════════════════════════
   RESPONSIVE — MOBILE
   ═══════════════════════════════════════════ */
@media (max-width: 768px) {
  .ch-root {
    border-radius: 0;
    height: calc(100vh - 70px);
  }

  .ch-sidebar {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10;
    border-right: none;
    border-radius: 0;
  }

  .ch-sidebar.hidden {
    transform: translateX(-100%);
    pointer-events: none;
  }

  .ch-sidebar.visible {
    transform: translateX(0);
    pointer-events: auto;
  }

  .ch-main {
    width: 100%;
  }

  .ch-main.full {
    z-index: 5;
  }

  .ch-back-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ch-header {
    padding: 12px 14px;
    gap: 10px;
  }

  .ch-header-avatar {
    width: 38px;
    height: 38px;
  }

  .ch-messages {
    padding: 14px 12px;
  }

  .ch-bubble {
    max-width: 78%;
    padding: 9px 12px;
    font-size: 13px;
  }

  .ch-input-bar {
    padding: 10px 12px;
    gap: 8px;
  }

  .ch-input {
    padding: 10px 14px;
    font-size: 13px;
  }

  .ch-send-btn {
    width: 42px;
    height: 42px;
  }

  .ch-placeholder {
    padding: 24px;
  }

  .ch-placeholder-icon {
    width: 64px;
    height: 64px;
    border-radius: 18px;
  }

  .ch-placeholder-title {
    font-size: 17px;
  }

  .ch-placeholder-sub {
    font-size: 12.5px;
  }
}
`;