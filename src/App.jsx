import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function App() {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // ✅ FIXED PATH (from your screenshot)
    const dripRef = ref(db, "IVDrop");

    const unsubscribe = onValue(
      dripRef,
      (snapshot) => {
        console.log("Firebase Data:", snapshot.val());

        if (snapshot.exists()) {
          setData(snapshot.val());
        } else {
          setData(null);
        }

        setLoading(false);
      },
      (err) => {
        console.error("Firebase Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ✅ STATUS LOGIC (based on REAL DATA)
  const status = useMemo(() => {
    if (!data) return null;

    if (data.dropsPerMin === 0) {
      return {
        label: "CRITICAL - NO FLOW",
        color: "#FF4B4B",
        icon: "🚨",
        bgGradient: "linear-gradient(135deg, #FF6B6B, #FF4B4B)",
        textColor: "#fff",
      };
    }

    if (data.dropsPerMin < 5) {
      return {
        label: "LOW FLOW",
        color: "#F5A623",
        icon: "⚠️",
        bgGradient: "linear-gradient(135deg, #FFC043, #F5A623)",
        textColor: "#fff",
      };
    }

    return {
      label: "NORMAL",
      color: "#4B7BFF",
      icon: "✅",
      bgGradient: "linear-gradient(135deg, #6FA0FF, #4B7BFF)",
      textColor: "#fff",
    };
  }, [data]);

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading Firebase...</h2>
      </div>
    );
  }

  // ---------------- ERROR ----------------
  if (error) {
    return (
      <div style={styles.center}>
        <h2 style={{ color: "red" }}>Error: {error}</h2>
      </div>
    );
  }

  // ---------------- NO DATA ----------------
  if (data === null) {
    return (
      <div style={styles.center}>
        <h2>No Data Found in IVDrop</h2>
      </div>
    );
  }

  // ---------------- MAIN UI ----------------
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>

        {/* HEADER */}
        <h1>IV Drop Monitor</h1>

        {/* STATUS CARD */}
        <div
          style={{
            ...styles.statusCard,
            background: status?.bgGradient,
          }}
        >
          <h2>{status?.icon} {status?.label}</h2>
        </div>

        {/* METRICS */}
        <div style={styles.grid}>

          <MetricCard
            title="Drops / Min"
            value={data.dropsPerMin?.toFixed(2) || 0}
            icon="💧"
          />

          <MetricCard
            title="Total Drops"
            value={data.totalDrops || 0}
            icon="📊"
          />

          <MetricCard
            title="Last Update"
            value={data.lastUpdate || "N/A"}
            icon="🕒"
          />

        </div>

      </div>
    </div>
  );
}

// ---------------- METRIC CARD ----------------
function MetricCard({ title, value, icon }) {
  return (
    <div style={styles.card}>
      <div style={{ fontSize: "24px" }}>{icon}</div>
      <h3>{title}</h3>
      <p style={{ fontSize: "20px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}

// ---------------- STYLES ----------------
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#f5f8ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },
  container: {
    width: "100%",
    maxWidth: "420px",
    padding: "20px",
  },
  center: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },
  statusCard: {
    padding: "20px",
    borderRadius: "16px",
    color: "white",
    textAlign: "center",
    marginBottom: "20px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  card: {
    background: "white",
    padding: "15px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
  },
};

export default App;