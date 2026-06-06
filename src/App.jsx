import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function App() {
  const [data, setData] = useState(undefined); // IMPORTANT: undefined = not loaded yet
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const dripRef = ref(db, "DripMonitor"); // ⚠️ confirm this path in Firebase

    const unsubscribe = onValue(
      dripRef,
      (snapshot) => {
        console.log("📡 Firebase snapshot exists:", snapshot.exists());
        console.log("📡 Firebase data:", snapshot.val());

        if (snapshot.exists()) {
          setData(snapshot.val());
        } else {
          setData(null);
        }

        setLoading(false);
      },
      (err) => {
        console.error("🔥 Firebase Error:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const status = useMemo(() => {
    if (!data) return null;

    if (data.noDripAlert) {
      return {
        label: "CRITICAL - NO DRIP",
        color: "#FF4B4B",
        icon: "🚨",
        bgGradient: "linear-gradient(135deg, #FF6B6B 0%, #FF4B4B 100%)",
        textColor: "#FFFFFF",
      };
    }

    if (data.alertActive) {
      return {
        label: "FLOW DEVIATION",
        color: "#F5A623",
        icon: "⚠️",
        bgGradient: "linear-gradient(135deg, #FFC043 0%, #F5A623 100%)",
        textColor: "#FFFFFF",
      };
    }

    return {
      label: "NORMAL",
      color: "#4B7BFF",
      icon: "✅",
      bgGradient: "linear-gradient(135deg, #6FA0FF 0%, #4B7BFF 100%)",
      textColor: "#FFFFFF",
    };
  }, [data]);

  // 🔥 LOADING STATE
  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <h2 style={{ color: "#4B7BFF", margin: 0 }}>Loading...</h2>
          <p style={{ color: "#8A94A6", marginTop: "10px" }}>
            Connecting to Firebase
          </p>
        </div>
      </div>
    );
  }

  // ❌ ERROR STATE
  if (error) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <h2 style={{ color: "#FF4B4B", margin: 0 }}>Connection Error</h2>
          <p style={{ color: "#8A94A6", marginTop: "10px" }}>{error}</p>
        </div>
      </div>
    );
  }

  // ❌ NO DATA STATE
  if (data === null) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <h2 style={{ color: "#F5A623", margin: 0 }}>No Data Found</h2>
          <p style={{ color: "#8A94A6", marginTop: "10px" }}>
            Check Firebase path: <b>DripMonitor</b>
          </p>
        </div>
      </div>
    );
  }

  // ⏳ still waiting (extra safety)
  if (data === undefined) return null;

  return (
    <div style={styles.wrapper}>
      <main style={styles.mobileContainer}>
        
        <header style={styles.header}>
          <div>
            <p style={styles.greetingText}>Hello, Doctor!</p>
            <h1 style={styles.mainTitle}>IV Drop Monitor</h1>
          </div>
          <div style={styles.notificationIcon}>🔔</div>
        </header>

        <section
          style={{
            ...styles.heroCard,
            background: status?.bgGradient,
          }}
        >
          <div style={styles.heroTop}>
            <div style={styles.heroIconBox}>{status?.icon}</div>
            <p style={styles.heroSubtitle}>System Status</p>
          </div>

          <h2 style={{ ...styles.heroTitle, color: status?.textColor }}>
            {status?.label}
          </h2>
        </section>

        <section style={styles.grid}>
          <MetricCard
            title="Flow Rate"
            value={Number(data.flowRate_mLh || 0).toFixed(1)}
            unit="mL/h"
            icon="💧"
            iconColor="#e0e7ff"
          />

          <MetricCard
            title="Drops/Min"
            value={Number(data.dropsPerMin || 0).toFixed(1)}
            unit="DPM"
            icon="⏱️"
            iconColor="#ffedd5"
          />

          <MetricCard
            title="Total Drops"
            value={data.totalDrops ?? 0}
            unit="Drops"
            icon="📊"
            iconColor="#dcfce7"
          />

          <MetricCard
            title="Target Rate"
            value={Number(data.targetDropsPerMin || 0).toFixed(1)}
            unit="DPM"
            icon="🎯"
            iconColor="#f3e8ff"
          />
        </section>

        <section style={styles.chatBubbleContainer}>
          <div style={styles.doctorAvatar}>👨‍⚕️</div>

          <div
            style={{
              ...styles.chatBubble,
              background: data.noDripAlert
                ? "#fee2e2"
                : data.alertActive
                ? "#fef3c7"
                : "#e0e7ff",
              color: data.noDripAlert
                ? "#FF4B4B"
                : data.alertActive
                ? "#F5A623"
                : "#4B7BFF",
            }}
          >
            {data.noDripAlert
              ? "Critical Alert: No drip detected."
              : data.alertActive
              ? "Warning: Flow deviation detected."
              : "IV flow is normal."}
          </div>
        </section>
      </main>
    </div>
  );
}

function MetricCard({ title, value, unit, icon, iconColor }) {
  return (
    <div style={styles.card}>
      <div style={{ ...styles.cardIconBox, background: iconColor }}>
        {icon}
      </div>
      <h3 style={styles.metricTitle}>{title}</h3>
      <p style={styles.metricValue}>
        {value} <span style={styles.metricUnit}>{unit}</span>
      </p>
    </div>
  );
}

/* same styles (keep yours unchanged) */
const styles = {
  wrapper: { minHeight: "100vh", background: "#F5F8FF", display: "flex", justifyContent: "center" },
  mobileContainer: { width: "100%", maxWidth: "480px", padding: "2rem" },

  header: { display: "flex", justifyContent: "space-between" },
  greetingText: { color: "#4B7BFF" },
  mainTitle: { fontSize: "1.8rem", fontWeight: "800" },
  notificationIcon: { fontSize: "1.5rem" },

  heroCard: { borderRadius: "28px", padding: "1.8rem", color: "white" },
  heroTop: { display: "flex", gap: "10px" },
  heroIconBox: { padding: "8px", background: "rgba(255,255,255,0.2)" },
  heroSubtitle: {},

  heroTitle: { fontSize: "2rem", fontWeight: "800" },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" },

  card: { background: "#fff", padding: "1rem", borderRadius: "20px" },
  cardIconBox: { width: "40px", height: "40px", borderRadius: "12px" },

  metricTitle: { fontSize: "0.8rem", color: "#8A94A6" },
  metricValue: { fontSize: "1.4rem", fontWeight: "800" },
  metricUnit: { fontSize: "0.8rem" },

  chatBubbleContainer: { display: "flex", gap: "10px" },
  doctorAvatar: { fontSize: "1.5rem" },
  chatBubble: { padding: "1rem", borderRadius: "20px" },

  loading: { display: "grid", placeItems: "center", height: "100vh" },
  loadingCard: { padding: "2rem", background: "#fff", borderRadius: "20px" },
};

export default App;