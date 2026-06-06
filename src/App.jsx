import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "./firebase";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import "./App.css";

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const ivRef = ref(db, "IVDrop");

    const unsubscribe = onValue(ivRef, (snapshot) => {
      const val = snapshot.val();
      setData(val || {});

      // store history for graph
      if (val?.dropsPerMin !== undefined) {
        setHistory((prev) => [
          ...prev.slice(-19),
          {
            time: new Date().toLocaleTimeString(),
            rate: val.dropsPerMin,
          },
        ]);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!data) {
    return (
      <div className="loading">
        <h2>Connecting IV Monitor...</h2>
      </div>
    );
  }

  const isDanger = data.dropsPerMin > 20 || data.dropsPerMin < 5;

  return (
    <div className="page">
      <h1 className="title">💉 IV DRIP MONITOR</h1>

      {isDanger && (
        <div className="alert">
          ⚠ WARNING: Abnormal drip rate detected!
        </div>
      )}

      <div className="grid">
        <div className="card">
          <h3>Total Drops</h3>
          <h1>{data.totalDrops ?? 0}</h1>
        </div>

        <div className="card">
          <h3>Drop Rate</h3>
          <h1>{data.dropsPerMin?.toFixed(1) ?? 0} / min</h1>
        </div>

        <div className="card">
          <h3>Last Update</h3>
          <h1>
            {data.lastUpdate
              ? new Date(data.lastUpdate).toLocaleTimeString()
              : "N/A"}
          </h1>
        </div>

        <div className="card status">
          <h3>Status</h3>
          <h1>LIVE SYSTEM</h1>
        </div>
      </div>

      <div className="chartCard">
        <h2>Drop Rate Trend</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={history}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="rate" stroke="#00d9ff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;