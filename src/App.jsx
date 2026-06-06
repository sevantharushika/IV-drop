import { useEffect, useMemo, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const dripRef = ref(db, "DripMonitor");

    const unsubscribe = onValue(
      dripRef,
      (snapshot) => {
        console.log("Firebase Data:", snapshot.val());
        setData(snapshot.val());
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

  const status = useMemo(() => {
    if (!data) return null;

    if (data.noDripAlert) {
      return {
        label: "CRITICAL - NO DRIP",
        color: "#FF4B4B", // Modern Red
        icon: "🚨",
        bgGradient: "linear-gradient(135deg, #FF6B6B 0%, #FF4B4B 100%)",
        textColor: "#FFFFFF",
      };
    }

    if (data.alertActive) {
      return {
        label: "FLOW DEVIATION",
        color: "#F5A623", // Modern Orange
        icon: "⚠️",
        bgGradient: "linear-gradient(135deg, #FFC043 0%, #F5A623 100%)",
        textColor: "#FFFFFF",
      };
    }

    return {
      label: "NORMAL",
      color: "#4B7BFF", // App Primary Blue
      icon: "✅",
      bgGradient: "linear-gradient(135deg, #6FA0FF 0%, #4B7BFF 100%)",
      textColor: "#FFFFFF",
    };
  }, [data]);

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <h2 style={{ color: "#4B7BFF", margin: 0 }}>Loading...</h2>
          <p style={{ color: "#8A94A6", marginTop: "10px" }}>Connecting to Healthcare System</p>
        </div>
      </div>
    );
  }

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

  if (!data) {
    return (
      <div style={styles.loading}>
        <div style={styles.loadingCard}>
          <h2 style={{ color: "#F5A623", margin: 0 }}>No Data</h2>
          <p style={{ color: "#8A94A6", marginTop: "10px" }}>Check Firebase path: DripMonitor</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <main style={styles.mobileContainer}>
        
        {/* App Header mimicking the "Hello Lisa!" layout */}
        <header style={styles.header}>
          <div>
            <p style={styles.greetingText}>Hello, Doctor!</p>
            <h1 style={styles.mainTitle}>IV Drop Monitor</h1>
          </div>
          <div style={styles.notificationIcon}>
            <span style={{ fontSize: "1.2rem" }}>🔔</span>
          </div>
        </header>

        {/* Main Hero Status Card (mimicking the Heart Rate card) */}
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
          {/* Decorative wave line mimicking the ECG line in the reference */}
          <svg style={styles.decorativeWave} viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 20C20 20 25 5 40 5C55 5 60 35 75 35C90 35 95 15 110 15C125 15 130 25 150 25C170 25 180 20 200 20" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </section>

        {/* Section Title */}
        <div style={styles.sectionHeader}>
          <h3 style={styles.sectionTitle}>Live Metrics</h3>
          <span style={styles.seeAllText}>Real-time</span>
        </div>

        {/* Metrics Grid */}
        <section style={styles.grid}>
          <MetricCard
            title="Flow Rate"
            value={`${Number(data.flowRate_mLh || 0).toFixed(1)}`}
            unit="mL/h"
            iconColor="#e0e7ff"
            iconTextColor="#4B7BFF"
            icon="💧"
          />

          <MetricCard
            title="Drops/Min"
            value={`${Number(data.dropsPerMin || 0).toFixed(1)}`}
            unit="DPM"
            iconColor="#ffedd5"
            iconTextColor="#F5A623"
            icon="⏱️"
          />

          <MetricCard
            title="Total Drops"
            value={data.totalDrops ?? 0}
            unit="Drops"
            iconColor="#dcfce7"
            iconTextColor="#10b981"
            icon="📊"
          />

          <MetricCard
            title="Target Rate"
            value={`${Number(data.targetDropsPerMin || 0).toFixed(1)}`}
            unit="DPM"
            iconColor="#f3e8ff"
            iconTextColor="#a855f7"
            icon="🎯"
          />
        </section>

        {/* Bottom Alert/Message styled like a chat bubble */}
        <section style={styles.chatBubbleContainer}>
          <div style={styles.doctorAvatar}>👨‍⚕️</div>
          <div style={{
            ...styles.chatBubble,
            background: data.noDripAlert ? "#fee2e2" : data.alertActive ? "#fef3c7" : "#e0e7ff",
            color: data.noDripAlert ? "#FF4B4B" : data.alertActive ? "#F5A623" : "#4B7BFF"
          }}>
            {data.noDripAlert 
              ? "Critical Alert: No drip detected. Please check the patient immediately." 
              : data.alertActive 
              ? "Warning: The current flow rate is deviating from the target." 
              : "Everything looks good! The IV is flowing normally at the target rate."}
          </div>
        </section>

        {/* Floating Bottom Nav bar mimicking the reference */}
        <nav style={styles.bottomNav}>
          <div style={{...styles.navItem, ...styles.navItemActive}}>🏠</div>
          <div style={styles.navItem}>📅</div>
          <div style={styles.navItem}>💬</div>
          <div style={styles.navItem}>⚙️</div>
        </nav>

      </main>
    </div>
  );
}

function MetricCard({ title, value, unit, icon, iconColor }) {
  return (
    <article style={styles.card}>
      <div style={{...styles.cardIconBox, background: iconColor}}>
        {icon}
      </div>
      <h3 style={styles.metricTitle}>{title}</h3>
      <p style={styles.metricValue}>
        {value} <span style={styles.metricUnit}>{unit}</span>
      </p>
    </article>
  );
}

// MODERN HEALTHCARE APP STYLES
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: "#F5F8FF", // Soft light blue/grey app background
    display: "flex",
    justifyContent: "center",
    fontFamily: "'Nunito', 'Segoe UI', Roboto, sans-serif",
    color: "#1E293B",
  },

  mobileContainer: {
    width: "100%",
    maxWidth: "480px", // App-like mobile constrained width
    padding: "2rem 1.5rem 6rem 1.5rem", // Extra padding at bottom for nav
    position: "relative",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    boxSizing: "border-box",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "1rem",
  },

  greetingText: {
    color: "#4B7BFF",
    margin: "0 0 5px 0",
    fontWeight: "700",
    fontSize: "0.95rem",
    letterSpacing: "0.5px",
  },

  mainTitle: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#1A202C",
    margin: 0,
    lineHeight: "1.2",
  },

  notificationIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 10px 25px rgba(75, 123, 255, 0.1)",
    border: "1px solid #E2E8F0",
  },

  heroCard: {
    width: "100%",
    borderRadius: "28px",
    padding: "1.8rem",
    boxShadow: "0 15px 35px rgba(75, 123, 255, 0.25)", // Prominent soft shadow
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
  },

  heroTop: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "15px",
    position: "relative",
    zIndex: 2,
  },

  heroIconBox: {
    background: "rgba(255, 255, 255, 0.2)",
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(5px)",
  },

  heroSubtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    margin: 0,
    fontWeight: "600",
    fontSize: "0.9rem",
  },

  heroTitle: {
    fontSize: "2.5rem",
    fontWeight: "800",
    margin: 0,
    position: "relative",
    zIndex: 2,
    letterSpacing: "1px",
  },

  decorativeWave: {
    position: "absolute",
    bottom: "20px",
    right: "-20px",
    width: "200px",
    opacity: 0.8,
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "10px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#1A202C",
  },

  seeAllText: {
    fontSize: "0.85rem",
    color: "#8A94A6",
    fontWeight: "600",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
  },

  card: {
    background: "#FFFFFF",
    borderRadius: "24px",
    padding: "1.2rem",
    boxShadow: "0 10px 30px rgba(138, 148, 166, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    transition: "transform 0.2s ease",
  },

  cardIconBox: {
    width: "40px",
    height: "40px",
    borderRadius: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.2rem",
    marginBottom: "5px",
  },

  metricTitle: {
    margin: 0,
    fontSize: "0.85rem",
    color: "#8A94A6",
    fontWeight: "700",
  },

  metricValue: {
    margin: 0,
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#1A202C",
  },

  metricUnit: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "#8A94A6",
  },

  chatBubbleContainer: {
    display: "flex",
    alignItems: "flex-end",
    gap: "10px",
    marginTop: "10px",
  },

  doctorAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#FFFFFF",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    fontSize: "1.2rem",
  },

  chatBubble: {
    padding: "1rem 1.2rem",
    borderRadius: "20px 20px 20px 4px", // Chat bubble tail effect
    fontWeight: "600",
    fontSize: "0.9rem",
    lineHeight: "1.4",
    flex: 1,
    boxShadow: "0 5px 15px rgba(0,0,0,0.03)",
  },

  bottomNav: {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 40px)",
    maxWidth: "440px",
    background: "#FFFFFF",
    borderRadius: "100px",
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    boxShadow: "0 15px 40px rgba(75, 123, 255, 0.15)",
    boxSizing: "border-box",
    zIndex: 10,
  },

  navItem: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "1.3rem",
    cursor: "pointer",
    color: "#8A94A6",
  },

  navItemActive: {
    background: "#4B7BFF",
    color: "#FFFFFF",
    boxShadow: "0 5px 15px rgba(75, 123, 255, 0.4)",
  },

  loading: {
    display: "grid",
    placeItems: "center",
    height: "100vh",
    background: "#F5F8FF",
    fontFamily: "'Nunito', 'Segoe UI', sans-serif",
  },

  loadingCard: {
    background: "#FFFFFF",
    padding: "2.5rem",
    borderRadius: "24px",
    boxShadow: "0 15px 35px rgba(75, 123, 255, 0.15)",
    textAlign: "center",
  }
};

export default App;