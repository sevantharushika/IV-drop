import React, { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase/firebase";
import "./Dashboard.css";

export default function Dashboard() {
  const [data, setData] = useState({});

  useEffect(() => {
    const dataRef = ref(db, "ivData/current");

    onValue(dataRef, (snapshot) => {
      setData(snapshot.val() || {});
    });
  }, []);

  return (
    <div className="dashboard">
      <h1 className="title">📊 Dashboard</h1>

      <div className="card-container">
        <div className="card">
          <h2>Current Data</h2>
          <p>{JSON.stringify(data)}</p>
        </div>
      </div>
    </div>
  );
}