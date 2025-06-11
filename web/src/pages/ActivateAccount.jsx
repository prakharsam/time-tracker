import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ActivateAccount() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("pending");
  const [error, setError] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    async function activate() {
      try {
        const res = await fetch("http://localhost:8000/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const { detail } = await res.json();
          throw new Error(detail || "Activation failed");
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err.message);
      }
    }

    if (!token) {
      setStatus("error");
      setError("Missing activation token in URL.");
    } else {
      activate();
    }
  }, [token]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        {status === "pending" && <p>⏳ Activating your account...</p>}

        {status === "success" && (
          <>
            <h2 style={styles.heading}>✅ Account Activated</h2>
            <p>You can now download the desktop app and start working.</p>
            <a href="/downloads/desktop-app.dmg" download>
              <button style={styles.button}>⬇️ Download App</button>
            </a>
          </>
        )}

        {status === "error" && (
          <>
            <h2 style={{ ...styles.heading, color: "red" }}>❌ Activation Failed</h2>
            <p>{error}</p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f4f4f4",
  },
  card: {
    backgroundColor: "#fff",
    padding: "2rem",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center",
    maxWidth: "400px",
  },
  heading: {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginBottom: "1rem",
  },
  button: {
    marginTop: "1rem",
    padding: "0.5rem 1rem",
    fontSize: "1rem",
    borderRadius: "6px",
    backgroundColor: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};
