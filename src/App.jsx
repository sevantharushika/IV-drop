import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const ivRef = ref(db, "IVDrop");

    const unsubscribe = onValue(ivRef, (snapshot) => {
      const val = snapshot.val();
      console.log("Firebase:", val);
      setData(val || {});
    });

    return () => unsubscribe();
  }, []);

  if (!data) {
    return (
      <div style={styles.loading}>
        <h2>Connecting IV Monitor...</h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <h1>💉 IV DRIP MONITOR</h1>

      <div style={styles.card}>
        <h3>Total Drops</h3>
        <h1>{data.totalDrops ?? 0}</h1>
      </div>

      <div style={styles.card}>
        <h3>Drop Rate</h3>
        <h1>{data.dropsPerMin?.toFixed(1) ?? 0} / min</h1>
      </div>

      <div style={styles.card}>
        <h3>Last Update</h3>
        <h1>
          {data.lastUpdate
            ? new Date(data.lastUpdate).toLocaleTimeString()
            : "N/A"}
        </h1>
      </div>

      <div style={styles.card}>
        <h3>Status</h3>
        <h1 style={{ color: "#4dff88" }}>LIVE SYSTEM ACTIVE</h1>
      </div>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial",
    backgroundColor: "#0b1220",
    color: "white",
    minHeight: "100vh",
    padding: 20,
  },
  card: {
    backgroundColor: "#121c33",
    padding: 20,
    marginTop: 10,
    borderRadius: 10,
    textAlign: "center",
  },
  loading: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0b1220",
    color: "white",
  },
};

export default App;