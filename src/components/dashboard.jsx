import { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, onValue } from "firebase/database";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(db, "ivData/current");

    const unsubscribe = onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "normal":
        return "#22c55e"; // green
      case "warning":
        return "#f59e0b"; // amber
      case "critical":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>Loading IV Data...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>IV Monitoring Dashboard</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3>Flow Rate</h3>
          <p style={styles.value}>{data?.flowRate ?? "--"} ml/hr</p>
        </div>

        <div style={styles.card}>
          <h3>Volume</h3>
          <p style={styles.value}>{data?.volume ?? "--"} ml</p>
        </div>

        <div style={styles.card}>
          <h3>Status</h3>
          <span
            style={{
              ...styles.badge,
              backgroundColor: getStatusColor(data?.status),
            }}
          >
            {data?.status ?? "Unknown"}
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    fontFamily: "Arial, sans-serif",
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
  },
  title: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "28px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  value: {
    fontSize: "24px",
    marginTop: "10px",
    fontWeight: "bold",
  },
  badge: {
    padding: "6px 12px",
    borderRadius: "20px",
    color: "white",
    fontWeight: "bold",
    display: "inline-block",
    marginTop: "10px",
  },
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "20px",
  },
};

export default Dashboard;