// MobileScan.jsx — Phone side
// The page the phone lands on after scanning the QR code.
// Add this as a route in your app: <Route path="/scan" element={<MobileScan />} />
//
// Uses the same Firebase config as QRSession.jsx

import { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, set } from "firebase/database";

// ─── 🔧 SAME FIREBASE CONFIG AS QRSession.jsx ──────────────────────────────
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCE9as0vDARJwy_tAcQQHA2jsR5C6cHPpg",
  authDomain: "chrysalise-a4400.firebaseapp.com",
  databaseURL: "https://chrysalise-a4400-default-rtdb.firebaseio.com",
  projectId: "chrysalise-a4400",
  storageBucket: "chrysalise-a4400.firebasestorage.app",
  messagingSenderId: "524439373771",
  appId: "1:524439373771:web:eb8f202acfcbf33488d84e"
};
// ───────────────────────────────────────────────────────────────────────────

function initFirebase() {
  if (getApps().length === 0) initializeApp(FIREBASE_CONFIG);
  return getDatabase();
}

function getSessionId() {
  return new URLSearchParams(window.location.search).get("session");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function MobileScan() {
  const [status, setStatus] = useState("idle"); // idle | uploading | done | error
  const [preview, setPreview] = useState(null);
  const sessionId = getSessionId();

  if (!sessionId) {
    return (
      <div style={styles.page}>
        <p style={styles.error}>Invalid link. Please scan the QR code again.</p>
      </div>
    );
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("uploading");

    try {
      const base64 = await fileToBase64(file);
      setPreview(base64);

      const db = initFirebase();
      const sessionRef = ref(db, `sessions/${sessionId}`);
      await set(sessionRef, { photo: base64, timestamp: Date.now() });

      setStatus("done");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  }

  return (
    <div style={styles.page}>
      {status === "idle" && (
        <>
          <p style={styles.title}>Take a food photo</p>
          <p style={styles.sub}>It will appear on the laptop automatically</p>
          <label style={styles.btn}>
            📷 Open camera
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </label>
          <label style={styles.btnSecondary}>
            Choose from gallery
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </label>
        </>
      )}

      {status === "uploading" && (
        <>
          {preview && (
            <img src={preview} alt="preview" style={styles.preview} />
          )}
          <p style={styles.sub}>Sending to laptop…</p>
        </>
      )}

      {status === "done" && (
        <>
          {preview && (
            <img src={preview} alt="preview" style={styles.preview} />
          )}
          <p style={styles.success}>✓ Sent! Check your laptop.</p>

          {/* ─── 🔧 FUTURE: show calorie result here too ─────────────────
              When your AI is ready, the laptop can write the result back
              to Firebase and you can listen for it here:
                onValue(ref(db, `sessions/${sessionId}/result`), snap => {
                  if (snap.val()) setCalories(snap.val());
                });
          ──────────────────────────────────────────────────────────────── */}

          <button
            onClick={() => {
              setStatus("idle");
              setPreview(null);
            }}
            style={styles.btnSecondary}
          >
            Send another photo
          </button>
        </>
      )}

      {status === "error" && (
        <p style={styles.error}>Something went wrong. Please try again.</p>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100dvh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 24,
    fontFamily: "sans-serif",
    background: "#fff",
  },
  title: { margin: 0, fontSize: 22, fontWeight: 600, color: "#111" },
  sub: { margin: 0, fontSize: 15, color: "#666", textAlign: "center" },
  preview: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 14,
    objectFit: "cover",
    maxHeight: 300,
  },
  btn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "14px 32px",
    borderRadius: 12,
    background: "#111",
    color: "#fff",
    fontSize: 16,
    fontWeight: 500,
    cursor: "pointer",
    width: "100%",
    maxWidth: 320,
    boxSizing: "border-box",
  },
  btnSecondary: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 24px",
    borderRadius: 12,
    border: "1px solid #ddd",
    background: "#fff",
    color: "#333",
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    maxWidth: 320,
    boxSizing: "border-box",
  },
  success: { margin: 0, fontSize: 18, fontWeight: 600, color: "#16a34a" },
  error: { margin: 0, fontSize: 15, color: "#dc2626", textAlign: "center" },
};