import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
const API_URL = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch(`${API_URL}/me`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) { setUser(null); return; }
      const data = await res.json();
      setUser(data);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser().finally(() => setLoading(false));
  }, []);

  const updateUser = (newData) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  async function signup(formData) {
    const res = await fetch(`${API_URL}/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Signup failed");
    await fetchUser();
  }

  async function login(email, password) {
    const res = await fetch(`${API_URL}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    await fetch(`${API_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    sessionStorage.removeItem("game_visited"); // ← اللعبة تظهر من جديد عند الدخول
    setUser(null);
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 36, height: 36, border: "3px solid rgba(45,122,79,0.2)", borderTop: "3px solid #2d7a4f", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, signup, login, logout, fetchUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}