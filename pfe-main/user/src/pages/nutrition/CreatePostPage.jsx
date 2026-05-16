import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');

@keyframes fadeUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}

.cp-card{
  background:#fff;border-radius:20px;padding:24px;
  box-shadow:0 1px 3px rgba(0,0,0,0.04),0 4px 16px rgba(26,51,41,0.06);
  border:1px solid rgba(79,158,122,0.1);margin-bottom:16px;
  animation:fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
}
.cp-card:hover{box-shadow:0 4px 24px rgba(26,51,41,0.1);}

.cp-label{
  font-size:11px;font-weight:700;color:#9ab8ae;
  letter-spacing:0.8px;text-transform:uppercase;
  margin-bottom:6px;display:block;
}
.cp-input{
  width:100%;border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:11px 14px;font-size:14px;font-family:'DM Sans',sans-serif;
  color:#1a3329;background:#f7faf8;outline:none;
  transition:all 0.2s;box-sizing:border-box;
}
.cp-input:focus{border-color:#4f9e7a;background:#fff;box-shadow:0 0 0 3px rgba(79,158,122,0.1);}
.cp-input::placeholder{color:#9ab8ae;}

.cp-textarea{
  width:100%;border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:11px 14px;font-size:14px;font-family:'DM Sans',sans-serif;
  color:#1a3329;background:#f7faf8;outline:none;resize:vertical;
  min-height:220px;line-height:1.7;
  transition:all 0.2s;box-sizing:border-box;
}
.cp-textarea:focus{border-color:#4f9e7a;background:#fff;box-shadow:0 0 0 3px rgba(79,158,122,0.1);}
.cp-textarea::placeholder{color:#9ab8ae;}

.cp-field{margin-bottom:18px;}

.cp-save-btn{
  background:linear-gradient(135deg,#1a3329,#2d6b50);color:#f5e642;
  border:none;border-radius:10px;padding:11px 28px;font-size:14px;
  font-weight:700;cursor:pointer;font-family:'DM Sans',sans-serif;
  transition:all 0.22s;display:inline-flex;align-items:center;gap:8px;
}
.cp-save-btn:hover{transform:translateY(-1px);box-shadow:0 6px 18px rgba(26,51,41,0.28);}
.cp-save-btn:disabled{opacity:0.6;cursor:not-allowed;transform:none;}

.cp-ghost-btn{
  background:#f7faf8;color:#3d6b57;
  border:1.5px solid rgba(79,158,122,0.2);border-radius:10px;
  padding:11px 22px;font-size:14px;font-weight:700;
  cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.22s;
}
.cp-ghost-btn:hover{background:#eef7f2;}

.cp-post-row{
  display:flex;align-items:flex-start;justify-content:space-between;
  gap:14px;padding:16px;background:#f7faf8;border-radius:14px;
  border:1px solid rgba(79,158,122,0.08);margin-bottom:10px;
  transition:all 0.2s;
}
.cp-post-row:hover{background:#eef7f2;border-color:rgba(79,158,122,0.18);}

.cp-status{
  font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;
  display:inline-block;white-space:nowrap;
}
.cp-status.PENDING  {background:#fefce8;color:#854d0e;border:1px solid rgba(133,77,14,0.15);}
.cp-status.APPROVED {background:#e8f5ef;color:#2d6b50;border:1px solid rgba(45,107,80,0.15);}
.cp-status.REJECTED {background:#fff5f5;color:#c53030;border:1px solid rgba(197,48,48,0.15);}

.cp-del-btn{
  background:#fff5f5;color:#c53030;border:1px solid rgba(197,48,48,0.15);
  border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;
  cursor:pointer;font-family:'DM Sans',sans-serif;transition:all 0.2s;
  white-space:nowrap;
}
.cp-del-btn:hover{background:#fee2e2;}

.cp-char{font-size:11px;color:#9ab8ae;margin-top:5px;text-align:right;}
`;

export default function CreatePostPage() {
  const navigate = useNavigate();

  const [tab,     setTab]     = useState("create"); // "create" | "posts"
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({ title: "", content: "" });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // ── Fetch my posts ────────────────────────────────────────────────────
  const fetchMyPosts = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_URL}/blog/mine`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPosts(data.posts ?? []);
    } catch {
      // silently fail — posts list just stays empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "posts") fetchMyPosts();
  }, [tab]);

  // ── Submit new post ───────────────────────────────────────────────────
  const submit = async () => {
    if (!form.title.trim())   { setError("Title is required");   return; }
    if (!form.content.trim()) { setError("Content is required"); return; }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res  = await fetch(`${API_URL}/blog`, {
        method:      "POST",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body: JSON.stringify({ title: form.title, content: form.content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create post");

      setSuccess("Post submitted for review! It will appear once approved by an admin.");
      setForm({ title: "", content: "" });
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete post ───────────────────────────────────────────────────────
  const deletePost = async (id) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      const res = await fetch(`${API_URL}/blog/${id}`, {
        method:      "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      setPosts(p => p.filter(post => post.id !== id));
    } catch {
      alert("Could not delete post.");
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Page header */}
      <div style={{ marginBottom: 22, animation: "fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
        <div style={{ fontFamily: "Syne,sans-serif", fontSize: 22, fontWeight: 800, color: "#1a3329" }}>Blog Posts</div>
        <div style={{ fontSize: 13, color: "#9ab8ae", marginTop: 4 }}>Share your knowledge with the community</div>
      </div>

      {/* Tabs */}
      <div style={{
        display: "flex", gap: 8, marginBottom: 20,
        background: "#fff", borderRadius: 14, padding: 6,
        border: "1px solid rgba(79,158,122,0.1)",
        width: "fit-content",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        animation: "fadeUp 0.45s cubic-bezier(0.22,1,0.36,1) both",
      }}>
        {[
          { key: "create", label: "✍️ Write Post" },
          { key: "posts",  label: "📄 My Posts"   },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 18px", borderRadius: 10, border: "none",
              fontFamily: "'DM Sans',sans-serif", fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all 0.2s",
              background: tab === t.key ? "linear-gradient(135deg,#1a3329,#2d6b50)" : "transparent",
              color:      tab === t.key ? "#f5e642" : "#3d6b57",
              boxShadow:  tab === t.key ? "0 4px 14px rgba(26,51,41,0.18)" : "none",
            }}
          >{t.label}</button>
        ))}
      </div>

      {/* ── CREATE TAB ── */}
      {tab === "create" && (
        <>
          {success && (
            <div style={{ background: "#f0fdf7", border: "1px solid rgba(45,107,80,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, fontWeight: 600, color: "#2d6b50" }}>
              ✓ {success}
            </div>
          )}
          {error && (
            <div style={{ background: "#fff5f5", border: "1px solid rgba(229,62,62,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#c53030" }}>
              {error}
            </div>
          )}

          <div className="cp-card" style={{ animationDelay: "0.08s" }}>
            <div style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329", marginBottom: 20 }}>
              New Article
            </div>

            <div className="cp-field">
              <label className="cp-label">Title *</label>
              <input
                className="cp-input"
                placeholder="e.g. 5 Foods That Boost Your Metabolism"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                maxLength={120}
              />
              <div className="cp-char">{form.title.length}/120</div>
            </div>

            <div className="cp-field">
              <label className="cp-label">Content *</label>
              <textarea
                className="cp-textarea"
                placeholder="Write your article here. Share your expertise, tips, and nutritional advice…"
                value={form.content}
                onChange={e => set("content", e.target.value)}
              />
              <div className="cp-char">{form.content.length} characters</div>
            </div>

            {/* Pending notice */}
            <div style={{
              background: "#fefce8", border: "1px solid rgba(212,194,0,0.2)",
              borderRadius: 12, padding: "11px 16px", marginBottom: 20,
              fontSize: 12.5, color: "#854d0e", display: "flex", alignItems: "center", gap: 8,
            }}>
              ⏳ Posts are reviewed by an admin before being published to the blog.
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="cp-save-btn" onClick={submit} disabled={saving || !form.title.trim() || !form.content.trim()}>
                {saving ? "Submitting…" : "Submit for Review →"}
              </button>
              <button className="cp-ghost-btn" onClick={() => setForm({ title: "", content: "" })}>
                Clear
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── MY POSTS TAB ── */}
      {tab === "posts" && (
        <div className="cp-card" style={{ animationDelay: "0.08s" }}>
          <div style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329", marginBottom: 20 }}>
            My Posts
          </div>

          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120 }}>
              <div style={{ width: 28, height: 28, border: "3px solid rgba(79,158,122,0.2)", borderTop: "3px solid #2d6b50", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 12 }}>✍️</div>
              <div style={{ fontFamily: "Syne,sans-serif", fontSize: 15, fontWeight: 800, color: "#1a3329", marginBottom: 6 }}>No posts yet</div>
              <div style={{ fontSize: 13, color: "#9ab8ae", marginBottom: 16 }}>Write your first article to share with the community.</div>
              <button className="cp-save-btn" onClick={() => setTab("create")}>Write a Post →</button>
            </div>
          ) : (
            posts.map(p => (
              <div key={p.id} className="cp-post-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: "Syne,sans-serif", fontSize: 14, fontWeight: 800, color: "#1a3329", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ab8ae", marginBottom: 8 }}>
                    {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    {p.status === "APPROVED" && " · Published"}
                  </div>
                  <span className={`cp-status ${p.status}`}>{p.status}</span>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    className="cp-ghost-btn"
                    style={{ padding: "5px 12px", fontSize: 12 }}
                    onClick={() => navigate(`/resume/posts/${p.id}/edit`)}
                  >✏️ Edit</button>
                  <button className="cp-del-btn" onClick={() => deletePost(p.id)}>🗑 Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
}